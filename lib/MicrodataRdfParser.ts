import type * as RDF from '@rdfjs/types';
import type { DomHandler } from 'domhandler';
import { Parser as HtmlParser } from 'htmlparser2';
import { PassThrough, Transform } from 'readable-stream';
import type { BufferedTagEvent } from './BufferedTagEvent';
import type { IHtmlParseListener } from './IHtmlParseListener';
import type { IItemScope } from './IItemScope';
import type { IVocabRegistry } from './IVocabRegistry';
import type { IItemPropertyHandler } from './propertyhandler/IItemPropertyHandler';
import { ItemPropertyHandlerContent } from './propertyhandler/ItemPropertyHandlerContent';
import { ItemPropertyHandlerNumber } from './propertyhandler/ItemPropertyHandlerNumber';
import { ItemPropertyHandlerTime } from './propertyhandler/ItemPropertyHandlerTime';
import { ItemPropertyHandlerUrl } from './propertyhandler/ItemPropertyHandlerUrl';
import { Util } from './Util';
import * as VOCAB_REGISTRY_DEFAULT from './vocab-registry-default.json';
import EventEmitter = NodeJS.EventEmitter;

/**
 * A stream transformer that parses Microdata (text) streams to an {@link RDF.Stream}.
 */
export class MicrodataRdfParser extends Transform implements RDF.Sink<EventEmitter, RDF.Stream> {
  private static readonly ITEM_PROPERTY_HANDLERS: IItemPropertyHandler[] = [
    new ItemPropertyHandlerContent(),
    new ItemPropertyHandlerUrl('a', 'href'),
    new ItemPropertyHandlerUrl('area', 'href'),
    new ItemPropertyHandlerUrl('audio', 'src'),
    new ItemPropertyHandlerUrl('embed', 'src'),
    new ItemPropertyHandlerUrl('iframe', 'src'),
    new ItemPropertyHandlerUrl('img', 'src'),
    new ItemPropertyHandlerUrl('link', 'href'),
    new ItemPropertyHandlerUrl('object', 'data'),
    new ItemPropertyHandlerUrl('source', 'src'),
    new ItemPropertyHandlerUrl('track', 'src'),
    new ItemPropertyHandlerUrl('video', 'src'),
    new ItemPropertyHandlerNumber('data', 'value'),
    new ItemPropertyHandlerNumber('meter', 'value'),
    new ItemPropertyHandlerTime(),
  ];

  private readonly options: IMicrodataRdfParserOptions;
  private readonly util: Util;
  private readonly defaultGraph?: RDF.Quad_Graph;
  private readonly parser: HtmlParser;
  private readonly htmlParseListener?: IHtmlParseListener;
  private readonly vocabRegistry: IVocabRegistry;

  // Stacks, where the key is the current depth.
  private itemScopeStack: (IItemScope | undefined)[] = [];
  private textBufferStack: (string[] | undefined)[] = [];

  // Variables for managing itemrefs.
  private isEmittingReferences = false;
  private readonly pendingItemRefsDomain: Record<string, IItemScope[]> = {};
  private readonly pendingItemRefsRangeFinalized: Record<string, {
    events: BufferedTagEvent[];
    ids: RDF.Quad_Subject[];
  }> = {};
  // eslint-disable-next-line lines-between-class-members
  private readonly pendingItemRefsRangeCollecting: Record<string, {
    events: BufferedTagEvent[];
    counter: number;
    ids: RDF.Quad_Subject[];
  }> = {};
  // eslint-disable-next-line lines-between-class-members
  private emittingReferencesItemScopeIdGenerator: (() => (RDF.NamedNode | RDF.BlankNode)) | undefined;

  public constructor(options?: IMicrodataRdfParserOptions) {
    super({ readableObjectMode: true });
    options = options || {};
    this.options = options;

    this.util = new Util(options.dataFactory, options.baseIRI);
    this.defaultGraph = options.defaultGraph || this.util.dataFactory.defaultGraph();
    this.htmlParseListener = options.htmlParseListener;
    this.vocabRegistry = options.vocabRegistry || VOCAB_REGISTRY_DEFAULT;

    this.parser = this.initializeParser(!!options.xmlMode);
  }

  /**
   * Parses the given text stream into a quad stream.
   * @param {NodeJS.EventEmitter} stream A text stream.
   * @return {RDF.Stream} A quad stream.
   */
  public import(stream: EventEmitter): RDF.Stream {
    const output = new PassThrough({ readableObjectMode: true });
    stream.on('error', (error: Error) => parsed.emit('error', error));
    stream.on('data', (data: RDF.Quad) => output.push(data));
    stream.on('end', () => output.push(null));
    const parsed = output.pipe(new MicrodataRdfParser(this.options));
    return parsed;
  }

  public _transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
    this.parser.write(chunk.toString());
    callback();
  }

  public _flush(callback: (error?: Error | null, data?: any) => void): void {
    this.parser.end();
    callback();
  }

  /**
   * Get the current item scope for the current depth.
   * This will skip all undefined item scopes.
   * @param parent If we should start looking one level higher in the stack.
   */
  protected getItemScope(parent?: boolean): IItemScope | undefined {
    let parentTagI: number = this.itemScopeStack.length - (parent ? 2 : 1);
    while (parentTagI > 0 && !this.itemScopeStack[parentTagI]) {
      parentTagI--;
    }
    return this.itemScopeStack[parentTagI];
  }

  /**
   * Get the current stack depth.
   */
  protected getDepth(): number {
    return this.itemScopeStack.length;
  }

  public onTagOpen(name: string, attributes: Record<string, string>): void {
    if (!this.isEmittingReferences) {
      // If the tag has an 'id', start collecting the whole stack in the item reference buffer
      if ('id' in attributes) {
        const id = attributes.id;
        this.pendingItemRefsRangeCollecting[id] = {
          events: [],
          counter: 0,
          ids: [],
        };
      }

      // Store this event in all collecting item reference buffers
      for (const buffer of Object.values(this.pendingItemRefsRangeCollecting)) {
        buffer.counter++;
        buffer.events.push({ type: 'open', name, attributes });
      }
    }

    // Ensure the text buffer stack is in line with the stack depth
    this.textBufferStack.push(undefined);
    // Processing steps based on https://w3c.github.io/microdata-rdf/#rdf-conversion-algorithm

    // 1. Determine the current item scope
    let itemScope: IItemScope | undefined;
    if ('itemscope' in attributes) {
      // Create a new item scope
      let subject: RDF.NamedNode | RDF.BlankNode;
      if (this.emittingReferencesItemScopeIdGenerator) {
        subject = this.emittingReferencesItemScopeIdGenerator();
      } else {
        subject = 'itemid' in attributes && this.util.createSubject(attributes.itemid) ||
          this.util.dataFactory.blankNode();

        // Store the genererated id in all collecting item reference buffers
        for (const buffer of Object.values(this.pendingItemRefsRangeCollecting)) {
          buffer.ids.push(subject);
        }
      }
      itemScope = { subject };

      // If the id was reused from a reference, block any new triples to be generated from it
      if (this.isEmittingReferences) {
        itemScope.blockEmission = true;
      }

      // Inherit vocab from parent item scope
      const parentItemScope = this.getItemScope();
      if (parentItemScope && parentItemScope.vocab) {
        itemScope.vocab = parentItemScope.vocab;
      }

      // 2. Push any changes to the item scope to the stack
      this.itemScopeStack.push(itemScope);
    } else {
      // Determine the parent item scope
      itemScope = this.getItemScope();
      // 2. Push any changes to the item scope to the stack
      this.itemScopeStack.push(undefined);
    }

    // If we have a valid item scope, process the current node
    if (itemScope) {
      // 3. Handle item types
      if ('itemtype' in attributes) {
        for (const type of this.util.createVocabIris(attributes.itemtype, itemScope, false)) {
          // 4. Vocab identifier is the first valid item
          if (!itemScope.vocab) {
            // 5. Modify vocab based on registry
            itemScope.vocab = this.util.deriveVocab(type.value, this.vocabRegistry);
          }

          // Emit item type
          if (!itemScope.blockEmission) {
            this.emitTriple(
              itemScope.subject,
              this.util.dataFactory.namedNode(`${Util.RDF}type`),
              type,
            );
          }
        }
      }

      // Save language in item scope
      if ('lang' in attributes) {
        itemScope.language = attributes.lang;
      }
      if ('xml:lang' in attributes) {
        itemScope.language = attributes['xml:lang'];
      }

      // Handle itemrefs (only if we also had an itemscope)
      // If we have an itemref, store it in our domain buffer.
      if ('itemscope' in attributes &&
        !this.isEmittingReferences && 'itemref' in attributes) {
        for (const reference of attributes.itemref.split(/\s+/u)) {
          if (!(reference in this.pendingItemRefsDomain)) {
            this.pendingItemRefsDomain[reference] = [];
          }
          this.pendingItemRefsDomain[reference].push(itemScope);
          this.tryToEmitReferences(reference, itemScope);
        }
      }
    }

    // 6. Handle item properties
    if ('itemprop' in attributes) {
      this.handleItemProperties(attributes.itemprop, false, itemScope, name, attributes);
    }
    // Handle reverse item properties
    // https://w3c.github.io/microdata-rdf/#reverse-itemprop
    if ('itemprop-reverse' in attributes) {
      this.handleItemProperties(attributes['itemprop-reverse'], true, itemScope, name, attributes);
    }
  }

  public onText(data: string): void {
    // Store this event in all collecting item reference buffers
    if (!this.isEmittingReferences) {
      for (const buffer of Object.values(this.pendingItemRefsRangeCollecting)) {
        buffer.events.push({ type: 'text', data });
      }
    }

    // Save the text inside all item scopes that need to collect text
    for (const textBuffer of this.textBufferStack) {
      if (textBuffer) {
        textBuffer.push(data);
      }
    }
  }

  public onTagClose(): void {
    // Store this event in all collecting item reference buffers
    if (!this.isEmittingReferences) {
      for (const [ reference, buffer ] of Object.entries(this.pendingItemRefsRangeCollecting)) {
        buffer.counter--;
        buffer.events.push({ type: 'close' });

        // Once the counter becomes zero, the tag is fully buffered, so we finalize it.
        if (buffer.counter === 0) {
          this.pendingItemRefsRangeFinalized[reference] = buffer;
          delete this.pendingItemRefsRangeCollecting[reference];

          // Try to emit this reference with buffered domain items
          this.tryToEmitReferences(reference);
        }
      }
    }

    // Emit all triples that were determined in the active tag
    const itemScope = this.getItemScope(true);
    if (itemScope) {
      const depth = this.getDepth();
      if (itemScope.predicates && depth in itemScope.predicates) {
        for (const [ predicateKey, predicates ] of Object.entries(itemScope.predicates[depth])) {
          // First check if we have a child item scope, otherwise get the text content
          // Safely cast textBufferStack, as it is always defined when itemScope.predicates is defined.
          const object = this.util.createLiteral(this.textBufferStack[depth]!.join(''), itemScope);
          this.emitPredicateTriples(itemScope, predicates, object, predicateKey === 'reverse');
          delete itemScope.predicates[depth][<'forward' | 'reverse'> predicateKey];
        }
      }
    }

    // Remove the active tag from the stack
    this.itemScopeStack.pop();
    this.textBufferStack.pop();
  }

  public onEnd(): void {
    // Nothing important should happen here.
  }

  /**
   * Initialize a new HtmlParser.
   * @param xmlMode If the parser should be setup in strict mode.
   */
  protected initializeParser(xmlMode: boolean): HtmlParser {
    return new HtmlParser(
      <DomHandler> <any> {
        onclosetag: () => {
          try {
            this.onTagClose();
            if (this.htmlParseListener) {
              this.htmlParseListener.onTagClose();
            }
          } catch (error: unknown) {
            this.emit('error', error);
          }
        },
        onend: () => {
          try {
            this.onEnd();
            if (this.htmlParseListener) {
              this.htmlParseListener.onEnd();
            }
          } catch (error: unknown) {
            this.emit('error', error);
          }
        },
        onopentag: (name: string, attributes: Record<string, string>) => {
          try {
            this.onTagOpen(name, attributes);
            if (this.htmlParseListener) {
              this.htmlParseListener.onTagOpen(name, attributes);
            }
          } catch (error: unknown) {
            this.emit('error', error);
          }
        },
        ontext: (data: string) => {
          try {
            this.onText(data);
            if (this.htmlParseListener) {
              this.htmlParseListener.onText(data);
            }
          } catch (error: unknown) {
            this.emit('error', error);
          }
        },
      },
      {
        decodeEntities: true,
        recognizeSelfClosing: true,
        xmlMode,
      },
    );
  }

  /**
   * Handle the given item properties.
   * @param itempropValue The value of itemprop or itemprop-reverse.
   * @param reverse If the item properties are reversed (itemprop-reverse).
   * @param itemScope The current item scope.
   * @param tagName The current tag name.
   * @param tagAttributes The current tag attributes.
   */
  protected handleItemProperties(
    itempropValue: string,
    reverse: boolean,
    itemScope: IItemScope | undefined,
    tagName: string,
    tagAttributes: Record<string, string>,
  ): void {
    const parentItemScope = this.getItemScope(true);
    if (parentItemScope) {
      // Set predicates in the scope, and handle them on tag close.
      const depth = this.getDepth();
      const predicates = this.util.createVocabIris(itempropValue, parentItemScope, true);
      if (!parentItemScope.predicates) {
        parentItemScope.predicates = {};
      }
      if (!parentItemScope.predicates[depth]) {
        parentItemScope.predicates[depth] = {};
      }
      const predicatesKey = reverse ? 'reverse' : 'forward';
      parentItemScope.predicates[depth][predicatesKey] = predicates;

      // Append rdf:type predicate if vocabulary expansion applies
      for (const vocabularyExpansionType of this.util.getVocabularyExpansionType(
        itempropValue,
        parentItemScope,
        this.vocabRegistry,
      )) {
        predicates.push(vocabularyExpansionType);
      }

      // Check if a property handler that applies, forcefully use that as predicate value.
      // But DON'T call handlers in this prop is a direct (nested) itemscope.
      if (itemScope && 'itemscope' in tagAttributes) {
        this.emitPredicateTriples(parentItemScope, predicates, itemScope.subject, reverse);

        // Finalize the predicates, so text values do not apply to them.
        delete parentItemScope.predicates[depth][predicatesKey];
      } else {
        for (const handler of MicrodataRdfParser.ITEM_PROPERTY_HANDLERS) {
          if (handler.canHandle(tagName, tagAttributes)) {
            const object = handler.getObject(tagAttributes, this.util, parentItemScope);
            this.emitPredicateTriples(parentItemScope, predicates, object, reverse);

            // Finalize the predicates, so text values do not apply to them.
            delete parentItemScope.predicates[depth][predicatesKey];
          }
        }
      }

      // If no valid handler was found, indicate that we should collect text at this depth.
      if (parentItemScope.predicates[depth][predicatesKey]) {
        this.textBufferStack[depth] = [];
      }
    }
  }

  /**
   * Emit the given object for the given predicates.
   * @param itemScope The current item scope.
   * @param predicates An array of predicates.
   * @param object An object.
   * @param reverse If the triples should be reversed.
   */
  protected emitPredicateTriples(
    itemScope: IItemScope,
    predicates: RDF.NamedNode[],
    object: RDF.Quad_Object,
    reverse: boolean,
  ): void {
    if (!itemScope.blockEmission) {
      for (const predicate of predicates) {
        if (reverse) {
          // Literals can not exist in subject position, so they must be ignored.
          if (object.termType !== 'Literal') {
            this.emitTriple(object, predicate, itemScope.subject);
          }
        } else {
          this.emitTriple(itemScope.subject, predicate, object);
        }
      }
    }
  }

  /**
   * Emit the given triple to the stream.
   * @param {Quad_Subject} subject A subject term.
   * @param {Quad_Predicate} predicate A predicate term.
   * @param {Quad_Object} object An object term.
   */
  protected emitTriple(subject: RDF.Quad_Subject, predicate: RDF.Quad_Predicate, object: RDF.Quad_Object): void {
    this.push(this.util.dataFactory.quad(subject, predicate, object, this.defaultGraph));
  }

  /**
   * Attempt to emit all pending itemrefs for the given reference.
   * @param reference An item reference id.
   * @param itemScopeDomain An optional item scope. If defined, only refs from this scope will be emitted.
   */
  protected tryToEmitReferences(reference: string, itemScopeDomain?: IItemScope): void {
    const range = this.pendingItemRefsRangeFinalized[reference];
    if (range) {
      // Determine the item scope domains to emit
      let applicableItemScopes: IItemScope[] | undefined;
      if (itemScopeDomain) {
        applicableItemScopes = [ itemScopeDomain ];

        // Remove the item from the pending array
        // Element is guaranteed to exist in buffer
        const itemScopeDomainIndex = this.pendingItemRefsDomain[reference].indexOf(itemScopeDomain);
        this.pendingItemRefsDomain[reference].splice(itemScopeDomainIndex, 1);
      } else {
        applicableItemScopes = this.pendingItemRefsDomain[reference];

        // Remove all items from the pending array
        delete this.pendingItemRefsDomain[reference];
      }

      if (applicableItemScopes) {
        // Save the stack state
        const itemScopeStackOld = this.itemScopeStack;
        const textBufferStackOld = this.textBufferStack;
        this.isEmittingReferences = true;

        // For all applicable item scopes, emit the buffered events.
        for (const itemScope of applicableItemScopes) {
          this.itemScopeStack = [ itemScope ];
          this.textBufferStack = [ undefined ];
          const pendingIds = [ ...range.ids ];
          this.emittingReferencesItemScopeIdGenerator = () => <RDF.NamedNode | RDF.BlankNode> pendingIds.shift();
          for (const event of range.events) {
            switch (event.type) {
              case 'open':
                this.onTagOpen(event.name, event.attributes);
                break;
              case 'text':
                this.onText(event.data);
                break;
              case 'close':
                this.onTagClose();
                break;
            }
          }
        }

        // Restore the stack state
        this.emittingReferencesItemScopeIdGenerator = undefined;
        this.itemScopeStack = itemScopeStackOld;
        this.textBufferStack = textBufferStackOld;
        this.isEmittingReferences = false;
      }
    }
  }
}

export interface IMicrodataRdfParserOptions {
  /**
   * A custom RDFJS DataFactory to construct terms and triples.
   */
  dataFactory?: RDF.DataFactory;
  /**
   * An initital default base IRI.
   */
  baseIRI?: string;
  /**
   * The default graph for constructing quads.
   */
  defaultGraph?: RDF.Quad_Graph;
  /**
   * An optional listener for the internal HTML parse events.
   */
  htmlParseListener?: IHtmlParseListener;
  /**
   * If the parser should assume strict X(HT)ML documents.
   */
  xmlMode?: boolean;
  /**
   * A vocabulary registry to define specific behaviour for given URI prefixes.
   */
  vocabRegistry?: IVocabRegistry;
}
