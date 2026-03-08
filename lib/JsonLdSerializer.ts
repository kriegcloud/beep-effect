import EventEmitter = NodeJS.EventEmitter;
import {ContextParser, JsonLdContextNormalized, JsonLdContext} from "jsonld-context-parser";
import * as RDF from "@rdfjs/types";
import {SeparatorType} from "./SeparatorType";
import {ITermToValueOptions, Util} from "./Util";
import {PassThrough, Transform} from "readable-stream";

/**
 * A stream transformer that transforms an {@link RDF.Stream} into a JSON-LD (text) stream.
 */
export class JsonLdSerializer extends Transform {

  private readonly options: IJsonLdSerializerOptions;
  private readonly originalContext: JsonLdContext;
  private readonly context: Promise<JsonLdContextNormalized>;

  private indentation: number;
  private opened: boolean;
  private lastSubject: RDF.Term;
  private lastPredicate: RDF.Term;
  private hadObjectForPredicate: boolean;
  private objectOptions: ITermToValueOptions;
  private lastGraph: RDF.Term;

  constructor(options: IJsonLdSerializerOptions = {}) {
    super({ objectMode: true });

    this.indentation = 0;
    this.options = options;

    // Parse the context
    if (this.options.baseIRI && !this.options.context) {
      this.options.context = { '@base': this.options.baseIRI };
    }
    if (this.options.context) {
      this.originalContext = this.options.context;
      this.context = new ContextParser().parse(this.options.context, { baseIRI: this.options.baseIRI });
    } else {
      this.context = Promise.resolve(new JsonLdContextNormalized({}));
    }
  }

  /**
   * Parses the given text stream into a quad stream.
   * @param {NodeJS.EventEmitter} stream A text stream.
   * @return {NodeJS.EventEmitter} A quad stream.
   */
  public import(stream: EventEmitter): EventEmitter {
    const output = new PassThrough({ objectMode: true });
    stream.on('error', (error) => parsed.emit('error', error));
    stream.on('data', (data) => output.push(data));
    stream.on('end', () => output.push(null));
    const parsed = output.pipe(new JsonLdSerializer(this.options));
    return parsed;
  }

  /**
   * Transforms a quad into the text stream.
   * @param {Quad} quad An RDF quad.
   * @param {string} encoding An (ignored) encoding.
   * @param {module:stream.internal.TransformCallback} callback Callback that is invoked when the transformation is done
   * @private
   */
  public _transform(quad: RDF.Quad, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
    this.context.then((context) => {
      this.transformQuad(quad, context);
      callback();
    }).catch(callback);
  }

  /**
   * Construct a list in an RDF.Term object that can be used
   * inside a quad's object to write into the serializer
   * as a list using the @list keyword.
   * @param {RDF.Quad_Object[]} values A list of values, can be empty.
   * @return {RDF.Quad_Object} A term that should be used in the object position of the quad that is written to the serializer.
   */
  public async list(values: RDF.Term[]): Promise<RDF.Quad_Object> {
    const context = await this.context;
    return <RDF.Quad_Object> <any> {
      '@list': values.map((value) => Util.termToValue(value, context, this.options)),
    };
  }

  /**
   * Called when the incoming stream is closed.
   * @param {module:stream.internal.TransformCallback} callback Callback that is invoked when the flushing is done.
   * @private
   */
  public _flush(callback: (error?: Error | null, data?: any) => void): void {
    // If the stream was empty, ensure that we push the opening array
    if (!this.opened) {
      this.pushDocumentStart();
    }

    if (this.lastPredicate) {
      this.endPredicate();
    }
    if (this.lastSubject) {
      this.endSubject();
    }
    if (this.lastGraph && this.lastGraph.termType !== 'DefaultGraph') {
      this.endGraph();
    }

    this.endDocument();
    return callback(null, null);
  }

  /**
   * Transforms a quad into the text stream.
   * @param {Quad} quad An RDF quad.
   * @param {JsonLdContextNormalized} context A context for compacting.
   */
  protected transformQuad(quad: RDF.Quad, context: JsonLdContextNormalized): void {
    // Open the array before the first quad
    if (!this.opened) {
      this.pushDocumentStart();
    }

    // Check if the subject equals the last named graph
    // In that case, we can reuse the already-existing @id node
    const lastGraphMatchesSubject = this.lastGraph && this.lastGraph.termType !== 'DefaultGraph'
      && this.lastGraph.equals(quad.subject);

    // Write graph
    if (!lastGraphMatchesSubject && (!this.lastGraph || !quad.graph.equals(this.lastGraph))) {
      // Check if the named graph equals the last subject
      // In that case, we can reuse the already-existing @id node
      let lastSubjectMatchesGraph = quad.graph.termType !== 'DefaultGraph'
        && this.lastSubject && this.lastSubject.equals(quad.graph);

      if (this.lastGraph) {
        if (this.lastGraph.termType !== 'DefaultGraph') {
          // The last graph was named
          this.endPredicate();
          this.endSubject();
          this.endGraph(true);

          lastSubjectMatchesGraph = false; // Special-case to avoid deeper nesting
        } else {
          // The last graph was default
          if (!lastSubjectMatchesGraph) {
            this.endPredicate();
            this.endSubject(true);
          } else {
            this.endPredicate(true);
            this.lastSubject = null;
          }
        }
      }

      // Push the graph
      if (quad.graph.termType !== 'DefaultGraph') {
        if (!lastSubjectMatchesGraph) {
          this.pushId(quad.graph, true, context);
        }
        this.pushSeparator(this.options.space
          ? SeparatorType.GRAPH_FIELD_NONCOMPACT : SeparatorType.GRAPH_FIELD_COMPACT);
        this.indentation++;
      }

      this.lastGraph = quad.graph;
    }

    // Write subject
    if (!this.lastSubject || !quad.subject.equals(this.lastSubject)) {
      if (lastGraphMatchesSubject) {
        this.endPredicate();
        this.endSubject();
        this.indentation--;
        this.pushSeparator(SeparatorType.ARRAY_END_COMMA);
        this.lastGraph = quad.graph;
      } else {
        if (this.lastSubject) {
          this.endPredicate();
          this.endSubject(true);
        }

        // Open a new node for the new subject
        this.pushId(quad.subject, true, context);
      }
      this.lastSubject = quad.subject;
    }

    // Write predicate
    if (!this.lastPredicate || !quad.predicate.equals(this.lastPredicate)) {
      if (this.lastPredicate) {
        this.endPredicate(true);
      }

      // Open a new array for the new predicate
      this.pushPredicate(quad.predicate, context);
    }

    // Write the object value
    this.pushObject(quad.object, context);
  }

  protected pushDocumentStart() {
    this.opened = true;

    if (this.originalContext && !this.options.excludeContext) {
      this.pushSeparator(SeparatorType.OBJECT_START);
      this.indentation++;
      this.pushSeparator(SeparatorType.CONTEXT_FIELD);
      this.pushIndented(JSON.stringify(this.originalContext, null, this.options.space) + ',');
      this.pushSeparator(this.options.space
        ? SeparatorType.GRAPH_FIELD_NONCOMPACT : SeparatorType.GRAPH_FIELD_COMPACT);
      this.indentation++;
    } else {
      this.pushSeparator(SeparatorType.ARRAY_START);
      this.indentation++;
    }
  }

  /**
   * Push the given term as an @id field.
   * @param {Term} term An RDF term.
   * @param startOnNewLine If `{` should start on a new line
   * @param {JsonLdContextNormalized} context The context.
   */
  protected pushId(term: RDF.Term, startOnNewLine: boolean, context: JsonLdContextNormalized) {
    if (term.termType === 'Quad') {
      this.pushNestedQuad(term, true, context);
    } else {
      const subjectValue = term.termType === 'BlankNode'
        ? '_:' + term.value : context.compactIri(term.value, false);
      if (startOnNewLine) {
        this.pushSeparator(SeparatorType.OBJECT_START);
      } else {
        this.push(SeparatorType.OBJECT_START.label);
        if (this.options.space) {
          this.push('\n');
        }
      }
      this.indentation++;
      this.pushIndented(this.options.space ? `"@id": "${subjectValue}",` : `"@id":"${subjectValue}",`);
    }
  }

  /**
   * Push the given predicate field.
   * @param {Term} predicate An RDF term.
   * @param {JsonLdContextNormalized} context The context.
   */
  protected pushPredicate(predicate: RDF.Term, context: JsonLdContextNormalized) {
    let property = predicate.value;

    // Convert rdf:type into @type if not disabled.
    if (!this.options.useRdfType && property === Util.RDF_TYPE) {
      property = '@type';
      this.objectOptions = { ...this.options, compactIds: true, vocab: true };
    }

    // Open array for following objects
    const compactedProperty = context.compactIri(property, true);
    this.pushIndented(this.options.space ? `"${compactedProperty}": [` : `"${compactedProperty}":[`);
    this.indentation++;

    this.lastPredicate = predicate;
  }

  /**
   * Push the given object value.
   * @param {Term} object An RDF term.
   * @param {JsonLdContextNormalized} context The context.
   */
  protected pushObject(object: RDF.Term, context: JsonLdContextNormalized) {
    // Add a comma if we already had an object for this predicate
    if (!this.hadObjectForPredicate) {
      this.hadObjectForPredicate = true;
    } else {
      this.pushSeparator(SeparatorType.COMMA);
    }

    // Handle nested quad
    if (object.termType === 'Quad') {
      const lastLastSubject = this.lastSubject;
      const lastLastPredicate = this.lastPredicate;
      this.hadObjectForPredicate = false;

      this.pushNestedQuad(object, false, context);
      this.endSubject(false); // Terminate identifier node of nested quad again, since we won't attach additional information to it.

      this.hadObjectForPredicate = true;
      this.lastPredicate = lastLastPredicate;
      this.lastSubject = lastLastSubject;
      return;
    }

    // Convert the object into a value and push it
    let value;
    try {
      if ((<any> object)['@list']) {
        value = object;
      } else {
        value = Util.termToValue(object, context, this.objectOptions || this.options);
      }
    } catch (e) {
      return this.emit('error', e);
    }
    this.pushIndented(JSON.stringify(value, null, this.options.space));
  }

  protected pushNestedQuad(nestedQuad: RDF.BaseQuad, commaAfterSubject: boolean, context: JsonLdContextNormalized) {
    // Start a nested quad
    this.pushSeparator(SeparatorType.OBJECT_START);
    this.indentation++;
    this.pushIndented(this.options.space ? `"@id": ` : `"@id":`, false);

    // Print the nested quad
    if (nestedQuad.graph.termType !== 'DefaultGraph') {
      this.emit('error', new Error(`Found a nested quad with the non-default graph: ${nestedQuad.graph.value}`));
    }
    this.pushId(nestedQuad.subject, false, context);
    this.pushPredicate(nestedQuad.predicate, context);
    this.pushObject(nestedQuad.object, context);
    this.endPredicate(false);
    this.endSubject(commaAfterSubject);
  }

  protected endDocument() {
    this.opened = false;
    if (this.originalContext && !this.options.excludeContext) {
      this.indentation--;
      this.pushSeparator(SeparatorType.ARRAY_END);
      this.indentation--;
      this.pushSeparator(SeparatorType.OBJECT_END);
    } else {
      this.indentation--;
      this.pushSeparator(SeparatorType.ARRAY_END);
    }
  }

  /**
   * Push the end of a predicate and reset the buffers.
   * @param {boolean} comma If a comma should be appended.
   */
  protected endPredicate(comma?: boolean) {
    // Close the predicate array
    this.indentation--;
    this.pushSeparator(comma ? SeparatorType.ARRAY_END_COMMA : SeparatorType.ARRAY_END);

    // Reset object buffer
    this.hadObjectForPredicate = false;
    this.objectOptions = null;

    // Reset predicate buffer
    this.lastPredicate = null;
  }

  /**
   * Push the end of a subject and reset the buffers.
   * @param {boolean} comma If a comma should be appended.
   */
  protected endSubject(comma?: boolean) {
    // Close the last subject's node;
    this.indentation--;
    this.pushSeparator(comma ? SeparatorType.OBJECT_END_COMMA : SeparatorType.OBJECT_END);

    // Reset subject buffer
    this.lastSubject = null;
  }

  /**
   * Push the end of a graph and reset the buffers.
   * @param {boolean} comma If a comma should be appended.
   */
  protected endGraph(comma?: boolean) {
    // Close the graph array
    this.indentation--;
    this.pushSeparator(SeparatorType.ARRAY_END);
    // Close the graph id node
    this.indentation--;
    this.pushSeparator(comma ? SeparatorType.OBJECT_END_COMMA : SeparatorType.OBJECT_END);

    // Reset graph buffer
    this.lastGraph = null;
  }

  /**
   * Puh the given separator.
   * @param {SeparatorType} type A type of separator.
   */
  protected pushSeparator(type: SeparatorType) {
    this.pushIndented(type.label);
  }

  /**
   * An indentation-aware variant of {@link #push}.
   * All strings that are pushed here will be prefixed by {@link #indentation} amount of spaces.
   * @param {string} data A string.
   * @param pushNewLine If a newline should be pushed afterwards.
   */
  protected pushIndented(data: string, pushNewLine: boolean = true) {
    const prefix = this.getIndentPrefix();
    const lines = data.split('\n').map((line) => prefix + line).join('\n');
    this.push(lines);
    if (this.options.space && pushNewLine) {
      this.push('\n');
    }
  }

  /**
   * @return {string} Get the current indentation prefix based on {@link #indentation}.
   */
  protected getIndentPrefix(): string {
    return this.options.space ? this.options.space.repeat(this.indentation) : '';
  }

}

/**
 * Constructor arguments for {@link JsonLdSerializer}
 */
export interface IJsonLdSerializerOptions {
  /**
   * The indentation string that should be used when stringifying JSON.
   * Defaults to undefined.
   */
  space?: string;
  /**
   * If '@id' objects without other entries should be compacted.
   * Defaults to false.
   */
  compactIds?: boolean;
  /**
   * If rdf:type predicates should be emitted directly, instead of @type.
   * Defaults to false.
   */
  useRdfType?: boolean;
  /**
   * If literals should be converted to primitive types, such as booleans and integers.
   * Defaults to false.
   */
  useNativeTypes?: boolean;
  /**
   * An optional base IRI for compacting terms.
   * Defaults to null.
   */
  baseIRI?: string;
  /**
   * An optional JSON-LD context for compacting terms.
   * Defaults to null.
   */
  context?: JsonLdContext;
  /**
   * If the context should not be serialized, even if one was supplied.
   * This can be used if the context will be attached to the document through alternative means.
   * Defaults to false.
   */
  excludeContext?: boolean;
  /**
   * The mode by which the values with a certain base direction should be transformed from RDF.
   * * 'i18n-datatype': objects have a https://www.w3.org/ns/i18n# datatype.
   * * 'compound-literal': reified values using rdf:value, rdf:direction and rdf:language.
   */
  rdfDirection?: 'i18n-datatype' | 'compound-literal';
}
