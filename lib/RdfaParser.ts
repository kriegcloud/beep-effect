import {DomHandler} from "domhandler";
import EventEmitter = NodeJS.EventEmitter;
import {Parser as HtmlParser} from "htmlparser2";
import * as RDF from "@rdfjs/types";
import {PassThrough, Transform} from "readable-stream";
import {IActiveTag} from "./IActiveTag";
import {IHtmlParseListener} from "./IHtmlParseListener";
import * as INITIAL_CONTEXT_XHTML from "./initial-context-xhtml.json";
import * as INITIAL_CONTEXT from "./initial-context.json";
import {IRdfaPattern} from "./IRdfaPattern";
import {IRdfaFeatures, RDFA_FEATURES, RdfaProfile} from "./RdfaProfile";
import {Util} from "./Util";

/**
 * A stream transformer that parses RDFa (text) streams to an {@link RDF.Stream}.
 */
export class RdfaParser extends Transform implements RDF.Sink<EventEmitter, RDF.Stream> {

  private readonly options: IRdfaParserOptions;
  private readonly util: Util;
  private readonly defaultGraph?: RDF.Quad_Graph;
  private readonly parser: HtmlParser;
  private readonly features: IRdfaFeatures;
  private readonly htmlParseListener?: IHtmlParseListener;
  private readonly rdfaPatterns: {[patternId: string]: IRdfaPattern};
  private readonly pendingRdfaPatternCopies: {[copyTargetPatternId: string]: IActiveTag[]};

  private readonly activeTagStack: IActiveTag[] = [];

  constructor(options?: IRdfaParserOptions) {
    super({ readableObjectMode: true });
    options = options || {};
    this.options = options;

    this.util = new Util(options.dataFactory, options.baseIRI);
    this.defaultGraph = options.defaultGraph || this.util.dataFactory.defaultGraph();
    const profile = options.contentType ? Util.contentTypeToProfile(options.contentType) : options.profile || '';
    this.features = options.features || RDFA_FEATURES[profile];
    this.htmlParseListener = options.htmlParseListener;
    this.rdfaPatterns = this.features.copyRdfaPatterns ? {} : null;
    this.pendingRdfaPatternCopies = this.features.copyRdfaPatterns ? {} : null;

    this.parser = this.initializeParser(profile === 'xml');

    this.activeTagStack.push({
      incompleteTriples: [],
      inlist: false,
      language: options.language,
      listMapping: {},
      listMappingLocal: {},
      name: '',
      prefixesAll: {
        ...INITIAL_CONTEXT['@context'],
        ...this.features.xhtmlInitialContext ? INITIAL_CONTEXT_XHTML['@context'] : {},
      },
      prefixesCustom : {},
      skipElement: false,
      vocab: options.vocab,
    });
  }

  /**
   * Parses the given text stream into a quad stream.
   * @param {NodeJS.EventEmitter} stream A text stream.
   * @return {RDF.Stream} A quad stream.
   */
  public import(stream: EventEmitter): RDF.Stream {
    const output = new PassThrough({ readableObjectMode: true });
    stream.on('error', (error) => parsed.emit('error', error));
    stream.on('data', (data) => output.push(data));
    stream.on('end', () => output.push(null));
    const parsed = output.pipe(new RdfaParser(this.options));
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

  public onTagOpen(name: string, attributes: {[s: string]: string}) {
    // Determine the parent tag (ignore skipped tags)
    let parentTagI: number = this.activeTagStack.length - 1;
    while (parentTagI > 0 && this.activeTagStack[parentTagI].skipElement) {
      parentTagI--;
    }
    let parentTag: IActiveTag = this.activeTagStack[parentTagI];
    // If we skipped a tag, make sure we DO use the lang, prefixes and vocab of the skipped tag
    if (parentTagI !== this.activeTagStack.length - 1) {
      parentTag = {
        ...parentTag,
        language: this.activeTagStack[this.activeTagStack.length - 1].language,
        prefixesAll: this.activeTagStack[this.activeTagStack.length - 1].prefixesAll,
        prefixesCustom: this.activeTagStack[this.activeTagStack.length - 1].prefixesCustom,
        vocab: this.activeTagStack[this.activeTagStack.length - 1].vocab,
      };
    }

    // Create a new active tag and inherit language scope and baseIRI from parent
    const activeTag: IActiveTag = {
      collectChildTags: parentTag.collectChildTags,
      collectChildTagsForCurrentTag: parentTag.collectChildTagsForCurrentTag,
      incompleteTriples: [],
      inlist: 'inlist' in attributes,
      listMapping: <{[predicate: string]: (RDF.Term|boolean)[]}> <any> [],
      listMappingLocal: parentTag.listMapping,
      localBaseIRI: parentTag.localBaseIRI,
      name,
      prefixesAll: null,
      prefixesCustom: null,
      skipElement: false,
    };
    this.activeTagStack.push(activeTag);

    // Save the tag contents if needed
    if (activeTag.collectChildTags) {
      // Add explicitly defined xmlns, xmlns:* and prefixes to attributes, as required by the spec (Step 11, note)
      // Sort prefixes alphabetically for deterministic namespace declaration order
      for (const prefix of Object.keys(parentTag.prefixesCustom).sort()) {
        const suffix = parentTag.prefixesCustom[prefix];
        const attributeKey = prefix === '' ? 'xmlns' : 'xmlns:' + prefix;
        if (!(attributeKey in attributes)) {
          attributes[attributeKey] = suffix;
        }
      }

      const attributesSerialized = Object.keys(attributes).map((key) => `${key}="${attributes[key]}"`).join(' ');
      activeTag.textWithTags = [`<${name}${attributesSerialized ? ' ' + attributesSerialized : ''}>`];
      if (this.features.skipHandlingXmlLiteralChildren) {
        return;
      }
    }

    let allowTermsInRelPredicates: boolean = true;
    let allowTermsInRevPredicates: boolean = true;
    if (this.features.onlyAllowUriRelRevIfProperty) {
      // Ignore illegal rel/rev values when property is present
      if ('property' in attributes && 'rel' in attributes) {
        allowTermsInRelPredicates = false;
        if (attributes.rel.indexOf(':') < 0) {
          delete attributes.rel;
        }
      }
      if ('property' in attributes && 'rev' in attributes) {
        allowTermsInRevPredicates = false;
        if (attributes.rev.indexOf(':') < 0) {
          delete attributes.rev;
        }
      }
    }

    if (this.features.copyRdfaPatterns) {
      // Save the tag if needed
      if (parentTag.collectedPatternTag) {
        const patternTag: IRdfaPattern = {
          attributes,
          children: [],
          name,
          referenced: false,
          rootPattern: false,
          text: [],
        };
        parentTag.collectedPatternTag.children.push(patternTag);
        activeTag.collectedPatternTag = patternTag;
        return;
      }

      // Store tags with type rdfa:Pattern as patterns
      if (attributes.typeof === 'rdfa:Pattern') {
        activeTag.collectedPatternTag = {
          attributes,
          children: [],
          name,
          parentTag,
          referenced: false,
          rootPattern: true,
          text: [],
        };
        return;
      }

      // Instantiate patterns on rdfa:copy
      if (attributes.property === 'rdfa:copy') {
        const copyTargetPatternId: string = attributes.resource || attributes.href || attributes.src;
        if (this.rdfaPatterns[copyTargetPatternId]) {
          this.emitPatternCopy(parentTag, this.rdfaPatterns[copyTargetPatternId], copyTargetPatternId);
        } else {
          if (!this.pendingRdfaPatternCopies[copyTargetPatternId]) {
            this.pendingRdfaPatternCopies[copyTargetPatternId] = [];
          }
          this.pendingRdfaPatternCopies[copyTargetPatternId].push(parentTag);
        }
        return;
      }
    }

    // <base> tags override the baseIRI of the whole document
    if (this.features.baseTag && name === 'base' && attributes.href) {
      this.util.baseIRI = this.util.getBaseIRI(attributes.href);
    }
    // xml:base attributes override the baseIRI of the current tag and children
    if (this.features.xmlBase && attributes['xml:base']) {
      activeTag.localBaseIRI = this.util.getBaseIRI(attributes['xml:base']);
    }

    // <time> tags set an initial datatype
    if (this.features.timeTag && name === 'time' && !attributes.datatype) {
      activeTag.interpretObjectAsTime = true;
    }

    // Processing based on https://www.w3.org/TR/rdfa-core/#s_rdfaindetail
    // 1: initialize values
    let newSubject: RDF.NamedNode | RDF.BlankNode | boolean;
    let currentObjectResource: RDF.NamedNode | RDF.BlankNode | boolean;
    let typedResource: RDF.NamedNode | RDF.BlankNode | boolean;

    // 2: handle vocab attribute to set active vocabulary
    // Vocab sets the active vocabulary
    if ('vocab' in attributes) {
      if (attributes.vocab) {
        activeTag.vocab = attributes.vocab;
        this.emitTriple(
          this.util.getBaseIriTerm(activeTag),
          this.util.dataFactory.namedNode(Util.RDFA + 'usesVocabulary'),
          this.util.dataFactory.namedNode(activeTag.vocab),
        );
      } else {
        // If vocab is set to '', then we fallback to the root vocab as defined via the parser constructor
        activeTag.vocab = this.activeTagStack[0].vocab;
      }
    } else {
      activeTag.vocab = parentTag.vocab;
    }

    // 3: handle prefixes
    activeTag.prefixesCustom = Util.parsePrefixes(attributes, parentTag.prefixesCustom,
      this.features.xmlnsPrefixMappings);
    activeTag.prefixesAll = Object.keys(activeTag.prefixesCustom).length > 0
      ? { ...parentTag.prefixesAll, ...activeTag.prefixesCustom } : parentTag.prefixesAll;

    // Handle role attribute
    if (this.features.roleAttribute && attributes.role) {
      const roleSubject = attributes.id
        ? this.util.createIri('#' + attributes.id, activeTag, false, false, false)
        : this.util.createBlankNode();
      // Temporarily override vocab
      const vocabOld = activeTag.vocab;
      activeTag.vocab = 'http://www.w3.org/1999/xhtml/vocab#';
      for (const role of this.util.createVocabIris(attributes.role, activeTag, true, false)) {
        this.emitTriple(
          roleSubject,
          this.util.dataFactory.namedNode('http://www.w3.org/1999/xhtml/vocab#role'),
          role,
        );
      }
      activeTag.vocab = vocabOld;
    }

    // 4: handle language
    // Save language attribute value in active tag
    if ('xml:lang' in attributes || (this.features.langAttribute && 'lang' in attributes)) {
      activeTag.language = attributes['xml:lang'] || attributes.lang;
    } else {
      activeTag.language = parentTag.language;
    }

    const isRootTag: boolean = this.activeTagStack.length === 2;
    if (!('rel' in attributes) && !('rev' in attributes)) {
      // 5: Determine the new subject when rel and rev are not present
      if ('property' in attributes && !('content' in attributes) && !('datatype' in attributes)) {
        // 5.1: property is present, but not content and datatype
        // Determine new subject
        if ('about' in attributes) {
          newSubject = this.util.createIri(attributes.about, activeTag, false, true, true);
          activeTag.explicitNewSubject = !!newSubject;
        } else if (isRootTag) {
          newSubject = true;
        } else if (parentTag.object) {
          newSubject = parentTag.object;
        }

        // Determine type
        if ('typeof' in attributes) {
          if ('about' in attributes) {
            typedResource = this.util.createIri(attributes.about, activeTag, false, true, true);
          }
          if (!typedResource && isRootTag) {
            typedResource = true;
          }
          if (!typedResource && 'resource' in attributes) {
            typedResource = this.util.createIri(attributes.resource, activeTag, false, true, true);
          }
          if (!typedResource && ('href' in attributes || 'src' in attributes)) {
            typedResource = this.util.createIri(attributes.href || attributes.src, activeTag, false, false, true);
          }
          if (!typedResource && this.isInheritSubjectInHeadBody(name)) {
            typedResource = newSubject;
          }
          if (!typedResource) {
            typedResource = this.util.createBlankNode();
          }

          currentObjectResource = typedResource;
        }
      } else {
        // 5.2
        if ('about' in attributes || 'resource' in attributes) {
          newSubject = this.util.createIri(attributes.about || attributes.resource, activeTag, false, true, true);
          activeTag.explicitNewSubject = !!newSubject;
        }
        if (!newSubject && ('href' in attributes || 'src' in attributes)) {
          newSubject = this.util.createIri(attributes.href || attributes.src,
            activeTag, false, false, true);
          activeTag.explicitNewSubject = !!newSubject;
        }
        if (!newSubject) {
          if (isRootTag) {
            newSubject = true;
          } else if (this.isInheritSubjectInHeadBody(name)) {
            newSubject = parentTag.object;
          } else if ('typeof' in attributes) {
            newSubject = this.util.createBlankNode();
            activeTag.explicitNewSubject = true;
          } else if (parentTag.object) {
            newSubject = parentTag.object;
            if (!('property' in attributes)) {
              activeTag.skipElement = true;
            }
          }
        }

        // Determine type
        if ('typeof' in attributes) {
          typedResource = newSubject;
        }
      }
    } else { // either rel or rev is present
      // 6: Determine the new subject when rel or rev are present

      // Define new subject
      if ('about' in attributes) {
        newSubject = this.util.createIri(attributes.about, activeTag, false, true, true);
        activeTag.explicitNewSubject = !!newSubject;
        if ('typeof' in attributes) {
          typedResource = newSubject;
        }
      } else if (isRootTag) {
        newSubject = true;
      } else if (parentTag.object) {
        newSubject = parentTag.object;
      }

      // Define object
      if ('resource' in attributes) {
        currentObjectResource = this.util.createIri(attributes.resource, activeTag, false, true, true);
      }
      if (!currentObjectResource) {
        if ('href' in attributes || 'src' in attributes) {
          currentObjectResource = this.util.createIri(attributes.href || attributes.src, activeTag, false, false, true);
        } else if ('typeof' in attributes && !('about' in attributes) && !this.isInheritSubjectInHeadBody(name)) {
          currentObjectResource = this.util.createBlankNode();
        }
      }

      // Set typed resource
      if ('typeof' in attributes && !('about' in attributes)) {
        if (this.isInheritSubjectInHeadBody(name)) {
          typedResource = newSubject;
        } else {
          typedResource = currentObjectResource;
        }
      }
    }

    // 7: If a typed resource was defined, emit it as a triple
    if (typedResource) {
      for (const type of this.util.createVocabIris(attributes.typeof, activeTag, true, true)) {
        this.emitTriple(
          this.util.getResourceOrBaseIri(typedResource, activeTag),
          this.util.dataFactory.namedNode(Util.RDF + 'type'),
          type,
        );
      }
    }

    // 8: Reset list mapping if we have a new subject
    if (newSubject) {
      activeTag.listMapping = {};
    }

    // 9: If an object was defined, emit triples for it
    if (currentObjectResource) {
      // Handle list mapping
      if ('rel' in attributes && 'inlist' in attributes) {
        for (const predicate of this.util.createVocabIris(attributes.rel, activeTag, allowTermsInRelPredicates,
          false)) {
          this.addListMapping(activeTag, newSubject, predicate, currentObjectResource);
        }
      }

      // Determine predicates using rel or rev (unless rel and inlist are present)
      if (!('rel' in attributes && 'inlist' in attributes)) {
        if ('rel' in attributes) {
          for (const predicate of this.util.createVocabIris(attributes.rel, activeTag, allowTermsInRelPredicates,
            false)) {
            this.emitTriple(
              this.util.getResourceOrBaseIri(newSubject, activeTag),
              predicate,
              this.util.getResourceOrBaseIri(currentObjectResource, activeTag),
            );
          }
        }
        if ('rev' in attributes) {
          for (const predicate of this.util.createVocabIris(attributes.rev, activeTag, allowTermsInRevPredicates,
            false)) {
            this.emitTriple(
              this.util.getResourceOrBaseIri(currentObjectResource, activeTag),
              predicate,
              this.util.getResourceOrBaseIri(newSubject, activeTag),
            );
          }
        }
      }
    }

    // 10: Store incomplete triples if we don't have an object, but we do have predicates
    if (!currentObjectResource) {
      if ('rel' in attributes) {
        if ('inlist' in attributes) {
          for (const predicate of this.util.createVocabIris(attributes.rel, activeTag, allowTermsInRelPredicates,
            false)) {
            this.addListMapping(activeTag, newSubject, predicate, null);
            activeTag.incompleteTriples.push({ predicate, reverse: false, list: true });
          }
        } else {
          for (const predicate of this.util.createVocabIris(attributes.rel, activeTag, allowTermsInRelPredicates,
            false)) {
            activeTag.incompleteTriples.push({ predicate, reverse: false });
          }
        }
      }
      if ('rev' in attributes) {
        for (const predicate of this.util.createVocabIris(attributes.rev, activeTag, allowTermsInRevPredicates,
          false)) {
          activeTag.incompleteTriples.push({ predicate, reverse: true });
        }
      }

      // Set a blank node object, so the children can make use of this when completing the triples
      if (activeTag.incompleteTriples.length > 0) {
        currentObjectResource = this.util.createBlankNode();
      }
    }

    // 11: Determine current property value
    if ('property' in attributes) {
      // Create predicates
      activeTag.predicates = this.util.createVocabIris(attributes.property, activeTag, true, false);

      // Save datatype attribute value in active tag
      let localObjectResource: RDF.Term | boolean;
      if ('datatype' in attributes) {
        activeTag.datatype = <RDF.NamedNode> this.util.createIri(attributes.datatype, activeTag, true, true, false);
        if (activeTag.datatype
          && (activeTag.datatype.value === Util.RDF + 'XMLLiteral'
            || (this.features.htmlDatatype && activeTag.datatype.value === Util.RDF + 'HTML'))) {
          activeTag.collectChildTags = true;
          activeTag.collectChildTagsForCurrentTag = true;
        }
      } else {
        // Try to determine resource
        if (!('rev' in attributes) && !('rel' in attributes) && !('content' in attributes)) {
          if ('resource' in attributes) {
            localObjectResource = this.util.createIri(attributes.resource, activeTag, false, true, true);
          }
          if (!localObjectResource && 'href' in attributes) {
            localObjectResource = this.util.createIri(attributes.href, activeTag, false, false, true);
          }
          if (!localObjectResource && 'src' in attributes) {
            localObjectResource = this.util.createIri(attributes.src, activeTag, false, false, true);
          }
        }
        if ('typeof' in attributes && !('about' in attributes)) {
          localObjectResource = typedResource;
        }
      }

      // If we're in a parent tag that collects child tags,
      // and we find a tag that does NOT preserve tags,
      // we mark this tag (and children) to not preserve it.
      if (!('datatype' in attributes) || attributes.datatype === '') {
        activeTag.collectChildTagsForCurrentTag = false;
      }

      if ('content' in attributes) {
        // Emit triples based on content attribute has preference over text content
        const object = this.util.createLiteral(attributes.content, activeTag);
        if ('inlist' in attributes) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, newSubject, predicate, object);
          }
        } else {
          const subject = this.util.getResourceOrBaseIri(newSubject, activeTag);
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Unset predicate to avoid text contents to produce new triples
        activeTag.predicates = null;
      } else if (this.features.datetimeAttribute && 'datetime' in attributes) {
        activeTag.interpretObjectAsTime = true;
        // Datetime attribute on time tag has preference over text content
        const object = this.util.createLiteral(attributes.datetime, activeTag);
        if ('inlist' in attributes) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, newSubject, predicate, object);
          }
        } else {
          const subject = this.util.getResourceOrBaseIri(newSubject, activeTag);
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Unset predicate to avoid text contents to produce new triples
        activeTag.predicates = null;
      } else if (localObjectResource) {
        // Emit triples for all resource objects
        const object = this.util.getResourceOrBaseIri(localObjectResource, activeTag);
        if ('inlist' in attributes) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, newSubject, predicate, object);
          }
        } else {
          const subject = this.util.getResourceOrBaseIri(newSubject, activeTag);
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Unset predicate to avoid text contents to produce new triples
        activeTag.predicates = null;
      }
    }

    // 12: Complete incomplete triples
    let incompleteTriplesCompleted = false;
    if (!activeTag.skipElement && newSubject && parentTag.incompleteTriples.length > 0) {
      incompleteTriplesCompleted = true;
      const subject = this.util.getResourceOrBaseIri(parentTag.subject, activeTag);
      const object = this.util.getResourceOrBaseIri(newSubject, activeTag);
      for (const incompleteTriple of parentTag.incompleteTriples) {
        if (!incompleteTriple.reverse) {
          if (incompleteTriple.list) {
            // Find the active tag that defined the list by going up the stack
            let firstInListTag = null;
            for (let i = this.activeTagStack.length - 1; i >= 0; i--) {
              if (this.activeTagStack[i].inlist) {
                firstInListTag = this.activeTagStack[i];
                break;
              }
            }
            // firstInListTag is guaranteed to be non-null
            this.addListMapping(firstInListTag, newSubject, incompleteTriple.predicate, object);
          } else {
            this.emitTriple(subject, incompleteTriple.predicate, object);
          }
        } else {
          this.emitTriple(object, incompleteTriple.predicate, subject);
        }
      }
    }
    if (!incompleteTriplesCompleted && parentTag.incompleteTriples.length > 0) {
      activeTag.incompleteTriples = activeTag.incompleteTriples.concat(parentTag.incompleteTriples);
    }

    // 13: Save evaluation context into active tag
    activeTag.subject = newSubject || parentTag.subject;
    activeTag.object = currentObjectResource || newSubject;
  }

  public onText(data: string) {
    const activeTag: IActiveTag = this.activeTagStack[this.activeTagStack.length - 1];

    // Collect text in pattern tag if needed
    if (this.features.copyRdfaPatterns && activeTag.collectedPatternTag) {
      activeTag.collectedPatternTag.text.push(data);
      return;
    }

    // Save the text inside the active tag
    if (!activeTag.textWithTags) {
      activeTag.textWithTags = [];
    }
    if (!activeTag.textWithoutTags) {
      activeTag.textWithoutTags = [];
    }
    activeTag.textWithTags.push(data);
    activeTag.textWithoutTags.push(data);
  }

  public onTagClose() {
    // Get the active tag
    const activeTag: IActiveTag = this.activeTagStack[this.activeTagStack.length - 1];
    const parentTag: IActiveTag = this.activeTagStack[this.activeTagStack.length - 2];

    if (!(activeTag.collectChildTags && parentTag.collectChildTags && this.features.skipHandlingXmlLiteralChildren)) {

      // If we detect a finalized rdfa:Pattern tag, store it
      if (this.features.copyRdfaPatterns && activeTag.collectedPatternTag
        && activeTag.collectedPatternTag.rootPattern) {
        const patternId = activeTag.collectedPatternTag.attributes.resource;

        // Remove resource and typeof attributes to avoid it being seen as a new pattern
        delete activeTag.collectedPatternTag.attributes.resource;
        delete activeTag.collectedPatternTag.attributes.typeof;

        // Store the pattern
        this.rdfaPatterns[patternId] = activeTag.collectedPatternTag;

        // Apply all pending copies for this pattern
        if (this.pendingRdfaPatternCopies[patternId]) {
          for (const tag of this.pendingRdfaPatternCopies[patternId]) {
            this.emitPatternCopy(tag, activeTag.collectedPatternTag, patternId);
          }
          delete this.pendingRdfaPatternCopies[patternId];
        }

        // Remove the active tag from the stack
        this.activeTagStack.pop();

        return;
      }

      // Emit all triples that were determined in the active tag
      if (activeTag.predicates) {
        const subject = this.util.getResourceOrBaseIri(activeTag.subject, activeTag);
        let textSegments: string[];
        if (!activeTag.collectChildTagsForCurrentTag) {
          textSegments = activeTag.textWithoutTags || [];
        } else {
          textSegments = activeTag.textWithTags || [];
          if (activeTag.collectChildTags && parentTag.collectChildTags) {
            // If we are inside an XMLLiteral child that also has RDFa content, ignore the tag name that was collected.
            textSegments = textSegments.slice(1);
          }
        }
        const object = this.util.createLiteral(textSegments.join(''), activeTag);
        if (activeTag.inlist) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, subject, predicate, object);
          }
        } else {
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Reset text, unless the parent is also collecting text
        if (!parentTag.predicates) {
          activeTag.textWithoutTags = null;
          activeTag.textWithTags = null;
        }
      }

      // 14: Handle local list mapping
      if (activeTag.object && Object.keys(activeTag.listMapping).length > 0) {
        const subject = this.util.getResourceOrBaseIri(activeTag.object, activeTag);
        for (const predicateValue in activeTag.listMapping) {
          const predicate = this.util.dataFactory.namedNode(predicateValue);
          const values = activeTag.listMapping[predicateValue];

          if (values.length > 0) {
            // Non-empty list, emit linked list of rdf:first and rdf:rest chains
            const bnodes = values.map(() => this.util.createBlankNode());
            for (let i = 0; i < values.length; i++) {
              const object = this.util.getResourceOrBaseIri(values[i], activeTag);
              this.emitTriple(bnodes[i], this.util.dataFactory.namedNode(Util.RDF + 'first'),
                object);
              this.emitTriple(bnodes[i], this.util.dataFactory.namedNode(Util.RDF + 'rest'),
                (i < values.length - 1) ? bnodes[i + 1] : this.util.dataFactory.namedNode(Util.RDF + 'nil'));
            }

            // Emit triple for the first linked list chain
            this.emitTriple(subject, predicate, bnodes[0]);
          } else {
            // Empty list, just emit rdf:nil
            this.emitTriple(subject, predicate, this.util.dataFactory.namedNode(Util.RDF + 'nil'));
          }
        }
      }

    }

    // Remove the active tag from the stack
    this.activeTagStack.pop();

    // Save the tag contents if needed
    if (activeTag.collectChildTags && activeTag.textWithTags) {
      activeTag.textWithTags.push(`</${activeTag.name}>`);
    }

    // If we still have text contents, try to append it to the parent tag
    if (activeTag.textWithTags && parentTag) {
      if (!parentTag.textWithTags) {
        parentTag.textWithTags = activeTag.textWithTags;
      } else {
        parentTag.textWithTags = parentTag.textWithTags.concat(activeTag.textWithTags);
      }
    }
    if (activeTag.textWithoutTags && parentTag) {
      if (!parentTag.textWithoutTags) {
        parentTag.textWithoutTags = activeTag.textWithoutTags;
      } else {
        parentTag.textWithoutTags = parentTag.textWithoutTags.concat(activeTag.textWithoutTags);
      }
    }
  }

  public onEnd() {
    if (this.features.copyRdfaPatterns) {
      this.features.copyRdfaPatterns = false;

      // Emit all unreferenced patterns
      for (const patternId in this.rdfaPatterns) {
        const pattern = this.rdfaPatterns[patternId];
        if (!pattern.referenced) {
          pattern.attributes.typeof = 'rdfa:Pattern';
          pattern.attributes.resource = patternId;
          this.emitPatternCopy(pattern.parentTag, pattern, patternId);
          pattern.referenced = false;
          delete pattern.attributes.typeof;
          delete pattern.attributes.resource;
        }
      }

      // Emit all unreferenced copy links
      for (const patternId in this.pendingRdfaPatternCopies) {
        for (const parentTag of this.pendingRdfaPatternCopies[patternId]) {
          this.activeTagStack.push(parentTag);
          this.onTagOpen('link', { property: 'rdfa:copy', href: patternId });
          this.onTagClose();
          this.activeTagStack.pop();
        }
      }

      this.features.copyRdfaPatterns = true;
    }
  }

  /**
   * If the new subject can be inherited from the parent object
   * if the resource defines no new subject.
   * @param {string} name The current tag name.
   * @returns {boolean} If the subject can be inherited.
   */
  protected isInheritSubjectInHeadBody(name: string) {
    return this.features.inheritSubjectInHeadBody && (name === 'head' || name === 'body');
  }

  /**
   * Add a list mapping for the given predicate and object in the active tag.
   * @param {IActiveTag} activeTag The active tag.
   * @param {Term | boolean} subject A subject term, this will only be used to create a separate list
   *                                 if activeTag.explicitNewSubject is true.
   * @param {Term} predicate A predicate term.
   * @param {Term | boolean} currentObjectResource The current object resource.
   */
  protected addListMapping(activeTag: IActiveTag, subject: RDF.Quad_Subject | boolean, predicate: RDF.Quad_Predicate,
                           currentObjectResource: RDF.Quad_Object | boolean) {
    if (activeTag.explicitNewSubject) {
      const bNode = this.util.createBlankNode();
      this.emitTriple(this.util.getResourceOrBaseIri(subject, activeTag), predicate, bNode);
      this.emitTriple(bNode, this.util.dataFactory.namedNode(Util.RDF + 'first'),
        this.util.getResourceOrBaseIri(currentObjectResource, activeTag));
      this.emitTriple(bNode, this.util.dataFactory.namedNode(Util.RDF + 'rest'),
        this.util.dataFactory.namedNode(Util.RDF + 'nil'));
    } else {
      let predicateList = activeTag.listMappingLocal[predicate.value];
      if (!predicateList) {
        activeTag.listMappingLocal[predicate.value] = predicateList = [];
      }
      if (currentObjectResource) {
        predicateList.push(currentObjectResource);
      }
    }
  }

  /**
   * Emit the given triple to the stream.
   * @param {Term} subject A subject term.
   * @param {Term} predicate A predicate term.
   * @param {Term} object An object term.
   */
  protected emitTriple(subject: RDF.Quad_Subject, predicate: RDF.Quad_Predicate, object: RDF.Quad_Object) {
    // Validate IRIs
    if ((subject.termType === 'NamedNode' && subject.value.indexOf(':') < 0)
      || (predicate.termType === 'NamedNode' && predicate.value.indexOf(':') < 0)
      || (object.termType === 'NamedNode' && object.value.indexOf(':') < 0)) {
      return;
    }
    this.push(this.util.dataFactory.quad(subject, predicate, object, this.defaultGraph));
  }

  /**
   * Emit an instantiation of the given pattern with the given parent tag.
   * @param {IActiveTag} parentTag The parent tag to instantiate in.
   * @param {IRdfaPattern} pattern The pattern to instantiate.
   * @param {string} rootPatternId The pattern id.
   */
  protected emitPatternCopy(parentTag: IActiveTag, pattern: IRdfaPattern, rootPatternId: string) {
    this.activeTagStack.push(parentTag);
    pattern.referenced = true;

    // Ensure that blank nodes within patterns are instantiated only once.
    // All next pattern copies will reuse the instantiated blank nodes from the first pattern.
    if (!pattern.constructedBlankNodes) {
      pattern.constructedBlankNodes = [];
      this.util.blankNodeFactory = () => {
        const bNode = this.util.dataFactory.blankNode();
        pattern.constructedBlankNodes.push(bNode);
        return bNode;
      };
    } else {
      let blankNodeIndex = 0;
      this.util.blankNodeFactory = () => pattern.constructedBlankNodes[blankNodeIndex++];
    }

    // Apply everything within the pattern
    this.emitPatternCopyAbsolute(pattern, true, rootPatternId);

    this.util.blankNodeFactory = null;
    this.activeTagStack.pop();
  }

  /**
   * Emit an instantiation of the given pattern with the given parent tag.
   *
   * This should probably not be called directly,
   * call {@link emitPatternCopy} instead.
   *
   * @param {IRdfaPattern} pattern The pattern to instantiate.
   * @param {boolean} root If this is the root call for the given pattern.
   * @param {string} rootPatternId The pattern id.
   */
  protected emitPatternCopyAbsolute(pattern: IRdfaPattern, root: boolean, rootPatternId: string) {
    // Stop on detection of cyclic patterns
    if (!root && pattern.attributes.property === 'rdfa:copy' && pattern.attributes.href === rootPatternId) {
      return;
    }

    this.onTagOpen(pattern.name, pattern.attributes);
    for (const text of pattern.text) {
      this.onText(text);
    }
    for (const child of pattern.children) {
      this.emitPatternCopyAbsolute(child, false, rootPatternId);
    }
    this.onTagClose();
  }

  protected initializeParser(xmlMode: boolean): HtmlParser {
    return new HtmlParser(
      <DomHandler> <any> {
        onclosetag: () => {
          try {
            this.onTagClose();
            if (this.htmlParseListener) {
              this.htmlParseListener.onTagClose();
            }
          } catch (e) {
            this.emit('error', e);
          }
        },
        onend: () => {
          try {
            this.onEnd();
            if (this.htmlParseListener) {
              this.htmlParseListener.onEnd();
            }
          } catch (e) {
            this.emit('error', e);
          }
        },
        onopentag: (name: string, attributes: {[s: string]: string}) => {
          try {
            this.onTagOpen(name, attributes);
            if (this.htmlParseListener) {
              this.htmlParseListener.onTagOpen(name, attributes);
            }
          } catch (e) {
            this.emit('error', e);
          }
        },
        ontext: (data: string) => {
          try {
            this.onText(data);
            if (this.htmlParseListener) {
              this.htmlParseListener.onText(data);
            }
          } catch (e) {
            this.emit('error', e);
          }
        },
      },
      {
        decodeEntities: true,
        recognizeSelfClosing: true,
        xmlMode,
      });
  }

}

export interface IRdfaParserOptions {
  /**
   * A custom RDFJS DataFactory to construct terms and triples.
   */
  dataFactory?: RDF.DataFactory;
  /**
   * An initital default base IRI.
   */
  baseIRI?: string;
  /**
   * A default language for string literals.
   */
  language?: string;
  /**
   * The initial vocabulary.
   */
  vocab?: string;
  /**
   * The default graph for constructing quads.
   */
  defaultGraph?: RDF.Quad_Graph;
  /**
   * A hash of features that should be enabled.
   * Defaults to the features defined by the profile.
   */
  features?: IRdfaFeatures;
  /**
   * The RDFa profile to use.
   * Defaults to a profile with all possible features enabled.
   */
  profile?: RdfaProfile;
  /**
   * The content type of the document that should be parsed.
   * This can be used as an alternative to the 'profile' option.
   */
  contentType?: string;
  /**
   * An optional listener for the internal HTML parse events.
   */
  htmlParseListener?: IHtmlParseListener;
}
