import * as RDF from "@rdfjs/types";
import {resolve} from "relative-to-absolute-iri";
import {SaxesParser, SaxesTagNS} from "@rubensworks/saxes";
import {PassThrough, Transform} from "readable-stream";
import {ParseError} from "./ParseError";
import {DataFactory} from "rdf-data-factory";
import {IriValidationStrategy, validateIri} from "validate-iri";
import EventEmitter = NodeJS.EventEmitter;

export class RdfXmlParser extends Transform implements RDF.Sink<EventEmitter, RDF.Stream> {
  public static readonly MIME_TYPE = 'application/rdf+xml';

  public static readonly RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  public static readonly XML = 'http://www.w3.org/XML/1998/namespace';
  public static readonly ITS = 'http://www.w3.org/2005/11/its';
  public static readonly FORBIDDEN_NODE_ELEMENTS = [
    'RDF',
    'ID',
    'about',
    'bagID',
    'parseType',
    'resource',
    'nodeID',
    'li',
    'aboutEach',
    'aboutEachPrefix',
  ];
  public static readonly FORBIDDEN_PROPERTY_ELEMENTS = [
    'Description',
    'RDF',
    'ID',
    'about',
    'bagID',
    'parseType',
    'resource',
    'nodeID',
    'aboutEach',
    'aboutEachPrefix',
  ];
  // tslint:disable-next-line:max-line-length
  public static readonly NCNAME_MATCHER = /^([A-Za-z\xC0-\xD6\xD8-\xF6\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}_])([A-Za-z\xC0-\xD6\xD8-\xF6\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}_\-.0-9#xB7\u{0300}-\u{036F}\u{203F}-\u{2040}])*$/u;
  public static SUPPORTED_VERSIONS: string[] = [
    '1.2',
    '1.2-basic',
    '1.1',
  ];

  public readonly trackPosition?: boolean;

  private readonly options: IRdfXmlParserArgs;
  private readonly dataFactory: RDF.DataFactory;
  private readonly baseIRI: string;
  private readonly defaultGraph?: RDF.Quad_Graph;
  private readonly allowDuplicateRdfIds?: boolean;
  private readonly saxParser: SaxesParser;
  private readonly validateUri: boolean;
  private readonly iriValidationStrategy: IriValidationStrategy;
  private readonly parseUnsupportedVersions: boolean;
  private version: string | undefined;

  private readonly activeTagStack: IActiveTag[] = [];
  private readonly nodeIds: {[id: string]: boolean} = {};

  constructor(args?: IRdfXmlParserArgs) {
    super({ readableObjectMode: true });

    if (args) {
      Object.assign(this, args);
      this.options = args;
    }
    if (!this.dataFactory) {
      this.dataFactory = new DataFactory();
    }
    if (!this.baseIRI) {
      this.baseIRI = '';
    }
    if (!this.defaultGraph) {
      this.defaultGraph = this.dataFactory.defaultGraph();
    }
    if (this.validateUri !== false) {
      this.validateUri = true;
    }
    if (!this.iriValidationStrategy) {
      this.iriValidationStrategy = this.validateUri ? IriValidationStrategy.Pragmatic : IriValidationStrategy.None;
    }
    this.parseUnsupportedVersions = !!args?.parseUnsupportedVersions;
    this.version = args?.version;

    this.saxParser = new SaxesParser({ xmlns: true, position: this.trackPosition });

    this.attachSaxListeners();
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
    const parsed = output.pipe(new RdfXmlParser(this.options));
    return parsed;
  }

  public _transform(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void) {
    if (this.version) {
      const version = this.version;
      this.version = undefined;
      if (!this.isValidVersion(version)) {
        return callback(this.newParseError(`Detected unsupported version as media type parameter: ${version}`));
      }
    }

    try {
      this.saxParser.write(chunk);
    } catch (e) {
      return callback(e);
    }
    callback();
  }

  /**
   * Create a new parse error instance.
   * @param {string} message An error message.
   * @return {Error} An error instance.
   */
  public newParseError(message: string): Error {
    return new ParseError(this, message);
  }

  /**
   * Convert the given value to a IRI by taking into account the baseIRI.
   *
   * This will follow the RDF/XML spec for converting values with baseIRIs to a IRI.
   *
   * @param {string} value The value to convert to an IRI.
   * @param {IActiveTag} activeTag The active tag.
   * @return {NamedNode} an IRI.
   */
  public valueToUri(value: string, activeTag: IActiveTag): RDF.NamedNode {
    return this.uriToNamedNode(resolve(value, activeTag.baseIRI));
  }

  /**
   * Convert the given value URI string to a named node.
   *
   * This throw an error if the URI is invalid.
   *
   * @param {string} uri A URI string.
   * @return {NamedNode} a named node.
   */
  public uriToNamedNode(uri: string): RDF.NamedNode {
    // Validate URI
    const uriValidationResult = validateIri(uri, this.iriValidationStrategy);
    if (uriValidationResult instanceof Error) {
      throw this.newParseError(uriValidationResult.message);
    }
    return this.dataFactory.namedNode(uri);
  }

  /**
   * Validate the given value as an NCName: https://www.w3.org/TR/xml-names/#NT-NCName
   * If it is invalid, an error will thrown emitted.
   * @param {string} value A value.
   */
  public validateNcname(value: string) {
    // Validate term as an NCName: https://www.w3.org/TR/xml-names/#NT-NCName
    if (!RdfXmlParser.NCNAME_MATCHER.test(value)) {
      throw this.newParseError(`Not a valid NCName: ${value}`);
    }
  }

  /**
   * Create a new literal term.
   * @param value The literal value.
   * @param activeTag The active tag.
   */
  public createLiteral(value: string, activeTag: IActiveTag): RDF.Literal {
    return this.dataFactory.literal(value, activeTag.datatype ? activeTag.datatype : activeTag.language ? { language: activeTag.language, direction: activeTag.rdfVersion ? activeTag.direction : undefined } : undefined)
  }

  /**
   * If the given version is valid for this parser to handle.
   * @param version A version string.
   */
  public isValidVersion(version: string): boolean {
    return this.parseUnsupportedVersions || RdfXmlParser.SUPPORTED_VERSIONS.includes(version);
  }

  protected attachSaxListeners() {
    this.saxParser.on('error', (error) => this.emit('error', error));
    this.saxParser.on('opentag', this.onTag.bind(this));
    this.saxParser.on('text', this.onText.bind(this));
    this.saxParser.on('cdata', this.onText.bind(this));
    this.saxParser.on('closetag', this.onCloseTag.bind(this));
    this.saxParser.on('doctype', this.onDoctype.bind(this));
  }

  /**
   * Handle the given tag.
   * @param {SaxesTagNS} tag A SAX tag.
   */
  protected onTag(tag: SaxesTagNS) {
    // Get parent tag
    const parentTag: IActiveTag = this.activeTagStack.length
      ? this.activeTagStack[this.activeTagStack.length - 1] : null;
    let currentParseType = ParseType.RESOURCE;
    if (parentTag) {
      parentTag.hadChildren = true;
      currentParseType = parentTag.childrenParseType;
    }

    // Check if this tag needs to be converted to a string
    if (parentTag && parentTag.childrenStringTags) {
      // Convert this tag to a string
      const tagName: string = tag.name;
      let attributes: string = '';
      for (const { key, value } of parentTag.namespaces || []) {
        attributes += ` ${key}="${value}"`;
      }
      for (const attributeKey in tag.attributes) {
        attributes += ` ${attributeKey}="${tag.attributes[attributeKey].value}"`;
      }
      const tagContents: string = `${tagName}${attributes}`;
      const tagString: string = `<${tagContents}>`;
      parentTag.childrenStringTags.push(tagString);

      // Inherit the array, so that deeper tags are appended to this same array
      const stringActiveTag: IActiveTag = {childrenStringTags: parentTag.childrenStringTags};
      stringActiveTag.childrenStringEmitClosingTag = `</${tagName}>`;
      this.activeTagStack.push(stringActiveTag);

      // Halt any further processing
      return;
    }

    const activeTag: IActiveTag = {};
    if (parentTag) {
      // Inherit properties from parent
      activeTag.language = parentTag.language;
      activeTag.direction = parentTag.direction;
      activeTag.baseIRI = parentTag.baseIRI;
      activeTag.childrenTripleTerms = parentTag.childrenTripleTerms;
      activeTag.rdfVersion = parentTag.rdfVersion;
    } else {
      activeTag.baseIRI = this.baseIRI;
    }
    this.activeTagStack.push(activeTag);

    if (currentParseType === ParseType.RESOURCE) {
      this.onTagResource(tag, activeTag, parentTag, !parentTag);
    } else { // currentParseType === ParseType.PROPERTY
      this.onTagProperty(tag, activeTag, parentTag);
    }

    for (const attributeKey in tag.attributes) {
      const attribute = tag.attributes[attributeKey];
      if (attribute.prefix === 'xmlns') {
        if (!activeTag.namespaces) {
          activeTag.namespaces = [];
        }
        activeTag.namespaces.push({ key: `${attribute.prefix}:${attribute.local}`, value: attribute.value });
      }
    }
    if (parentTag && parentTag.namespaces) {
      activeTag.namespaces = [ ...activeTag.namespaces || [], ...parentTag.namespaces ];
    }
  }

  /**
   * Handle the given node element in resource-mode.
   * @param {SaxesTagNS} tag A SAX tag.
   * @param {IActiveTag} activeTag The currently active tag.
   * @param {IActiveTag} parentTag The parent tag or null.
   * @param {boolean} rootTag If we are currently processing the root tag.
   */
  protected onTagResource(tag: SaxesTagNS, activeTag: IActiveTag, parentTag: IActiveTag, rootTag: boolean) {
    activeTag.childrenParseType = ParseType.PROPERTY;
    // Assume that the current node is a _typed_ node (2.13), unless we find an rdf:Description as node name
    let typedNode: boolean = true;
    if (tag.uri === RdfXmlParser.RDF) {
      // Check forbidden property element names
      if (!rootTag && RdfXmlParser.FORBIDDEN_NODE_ELEMENTS.indexOf(tag.local) >= 0) {
        throw this.newParseError(`Illegal node element name: ${tag.local}`);
      }

      switch (tag.local) {
      case 'RDF':
        // Tags under <rdf:RDF> must always be resources
        activeTag.childrenParseType = ParseType.RESOURCE;
      case 'Description':
        typedNode = false;
      }
    }

    const predicates: RDF.NamedNode[] = [];
    const objects: string[] = [];

    // Collect all attributes as triples
    // Assign subject value only after all attributes have been processed, because baseIRI may change the final val
    let activeSubjectValue: string = null;
    let claimSubjectNodeId: boolean = false;
    let subjectValueBlank: boolean = false;
    let explicitType: string = null;
    for (const attributeKey in tag.attributes) {
      const attribute = tag.attributes[attributeKey];
      if (attribute.uri === RdfXmlParser.RDF && attribute.local === 'version') {
        this.setVersion(activeTag, attribute.value);
        continue;
      } else if (parentTag && attribute.uri === RdfXmlParser.RDF) {
        switch (attribute.local) {
        case 'about':
          if (activeSubjectValue) {
            throw this.newParseError(`Only one of rdf:about, rdf:nodeID and rdf:ID can be present, \
while ${attribute.value} and ${activeSubjectValue} where found.`);
          }
          activeSubjectValue = attribute.value;
          continue;
        case 'ID':
          if (activeSubjectValue) {
            throw this.newParseError(`Only one of rdf:about, rdf:nodeID and rdf:ID can be present, \
while ${attribute.value} and ${activeSubjectValue} where found.`);
          }
          this.validateNcname(attribute.value);
          activeSubjectValue = '#' + attribute.value;
          claimSubjectNodeId = true;
          continue;
        case 'nodeID':
          if (activeSubjectValue) {
            throw this.newParseError(`Only one of rdf:about, rdf:nodeID and rdf:ID can be present, \
while ${attribute.value} and ${activeSubjectValue} where found.`);
          }
          this.validateNcname(attribute.value);
          activeSubjectValue = attribute.value;
          subjectValueBlank = true;
          continue;
        case 'bagID':
          throw this.newParseError(`rdf:bagID is not supported.`);
        case 'type':
          // Emit the rdf:type later as named node instead of the default literal
          explicitType = attribute.value;
          continue;
        case 'aboutEach':
          throw this.newParseError(`rdf:aboutEach is not supported.`);
        case 'aboutEachPrefix':
          throw this.newParseError(`rdf:aboutEachPrefix is not supported.`);
        case 'li':
          throw this.newParseError(`rdf:li on node elements are not supported.`);
        }
      } else if (attribute.uri === RdfXmlParser.XML) {
        if (attribute.local === 'lang') {
          activeTag.language = attribute.value === '' ? null : attribute.value.toLowerCase();
          continue;
        } else if (attribute.local === 'base') {
          // SAX Parser does not expand xml:base, based on DOCTYPE, so we have to do it manually
          activeTag.baseIRI = resolve(attribute.value, activeTag.baseIRI);
          continue;
        }
      } else if (attribute.uri === RdfXmlParser.ITS && attribute.local === 'dir') {
        this.setDirection(activeTag, attribute.value);
        continue;
      }

      // Interpret attributes at this point as properties on this node,
      // but we ignore attributes that have no prefix or known expanded URI
      if (attribute.prefix !== 'xml' && attribute.prefix !== 'xmlns'
          && (attribute.prefix !== '' || attribute.local !== 'xmlns')
        && attribute.uri) {
        predicates.push(this.uriToNamedNode(attribute.uri + attribute.local));
        objects.push(attribute.value);
      }
    }

    // Create the subject value _after_ all attributes have been processed
    if (activeSubjectValue !== null) {
      activeTag.subject = subjectValueBlank
        ? this.dataFactory.blankNode(activeSubjectValue) : this.valueToUri(activeSubjectValue, activeTag);
      if (claimSubjectNodeId) {
        this.claimNodeId(activeTag.subject);
      }
    }

    // Force the creation of a subject if it doesn't exist yet
    if (!activeTag.subject) {
      activeTag.subject = this.dataFactory.blankNode();
    }

    // Emit the type if we're at a typed node
    if (typedNode) {
      const type: RDF.NamedNode = this.uriToNamedNode(tag.uri + tag.local);
      this.emitTriple(activeTag.subject, this.dataFactory.namedNode(RdfXmlParser.RDF + 'type'),
        type, parentTag ? parentTag.reifiedStatementId : null, activeTag.childrenTripleTerms, activeTag.reifier);
    }

    if (parentTag) {
      // If the parent tag defined a predicate, add the current tag as property value
      if (parentTag.predicate) {
        if (parentTag.childrenCollectionSubject) {
          // RDF:List-based properties
          const linkTerm: RDF.BlankNode = this.dataFactory.blankNode();
          const restTerm = this.dataFactory.namedNode(RdfXmlParser.RDF + 'rest');

          // Emit <x> <p> <current-chain> OR <previous-chain> <rdf:rest> <current-chain>
          const isRestTerm = parentTag.childrenCollectionPredicate.equals(restTerm);
          this.emitTriple(parentTag.childrenCollectionSubject,
            parentTag.childrenCollectionPredicate, linkTerm, isRestTerm ? null : parentTag.reifiedStatementId, parentTag.childrenTripleTerms, isRestTerm ? null : parentTag.reifier);

          // Emit <current-chain> <rdf:first> value
          this.emitTriple(linkTerm, this.dataFactory.namedNode(RdfXmlParser.RDF + 'first'),
            activeTag.subject, null, activeTag.childrenTripleTerms);

          // Store <current-chain> in the parent node
          parentTag.childrenCollectionSubject = linkTerm;
          parentTag.childrenCollectionPredicate = restTerm;
        } else { // !parentTag.predicateEmitted
          // Set-based properties
          if (!parentTag.childrenTagsToTripleTerms) {
            this.emitTriple(parentTag.subject, parentTag.predicate, activeTag.subject, parentTag.reifiedStatementId, parentTag.childrenTripleTerms, parentTag.reifier);
            parentTag.predicateEmitted = true;
          }

          // Emit pending properties on the parent tag that had no defined subject yet.
          for (let i = 0; i < parentTag.predicateSubPredicates.length; i++) {
            this.emitTriple(activeTag.subject, parentTag.predicateSubPredicates[i],
              parentTag.predicateSubObjects[i], null, parentTag.childrenTripleTerms, parentTag.reifier);
          }

          // Cleanup so we don't emit them again when the parent tag is closed
          parentTag.predicateSubPredicates = [];
          parentTag.predicateSubObjects = [];
        }
      }

      // Emit all collected triples
      for (let i = 0; i < predicates.length; i++) {
        const object: RDF.Term = this.createLiteral(objects[i], activeTag);
        this.emitTriple(activeTag.subject, predicates[i], object, parentTag.reifiedStatementId, parentTag.childrenTripleTerms, parentTag.reifier);
      }
      // Emit the rdf:type as named node instead of literal
      if (explicitType) {
        this.emitTriple(activeTag.subject, this.dataFactory.namedNode(RdfXmlParser.RDF + 'type'),
          this.uriToNamedNode(explicitType), null, activeTag.childrenTripleTerms, activeTag.reifier);
      }
    }
  }

  /**
   * Handle the given property element in property-mode.
   * @param {SaxesTagNS} tag A SAX tag.
   * @param {IActiveTag} activeTag The currently active tag.
   * @param {IActiveTag} parentTag The parent tag or null.
   */
  protected onTagProperty(tag: SaxesTagNS, activeTag: IActiveTag, parentTag: IActiveTag) {
    activeTag.childrenParseType = ParseType.RESOURCE;
    activeTag.subject = parentTag.subject; // Inherit parent subject
    if (tag.uri === RdfXmlParser.RDF && tag.local === 'li') {
      // Convert rdf:li to rdf:_x
      if (!parentTag.listItemCounter) {
        parentTag.listItemCounter = 1;
      }
      activeTag.predicate = this.uriToNamedNode(tag.uri + '_' + parentTag.listItemCounter++);
    } else {
      activeTag.predicate = this.uriToNamedNode(tag.uri + tag.local);
    }

    // Check forbidden property element names
    if (tag.uri === RdfXmlParser.RDF
      && RdfXmlParser.FORBIDDEN_PROPERTY_ELEMENTS.indexOf(tag.local) >= 0) {
      throw this.newParseError(`Illegal property element name: ${tag.local}`);
    }

    activeTag.predicateSubPredicates = [];
    activeTag.predicateSubObjects = [];
    let parseType: boolean = false;
    let attributedProperty: boolean = false;

    // Collect all attributes as triples
    // Assign subject value only after all attributes have been processed, because baseIRI may change the final val
    let activeSubSubjectValue: string = null;
    let subSubjectValueBlank = true;
    const predicates: RDF.NamedNode[] = [];
    const objects: (RDF.NamedNode | RDF.BlankNode | RDF.Literal)[] = [];
    for (const propertyAttributeKey in tag.attributes) {
      const propertyAttribute = tag.attributes[propertyAttributeKey];
      if (propertyAttribute.uri === RdfXmlParser.RDF && propertyAttribute.local === 'version') {
        this.setVersion(activeTag, propertyAttribute.value);
        continue;
      } else if (propertyAttribute.uri === RdfXmlParser.RDF) {
        switch (propertyAttribute.local) {
        case 'resource':
          if (activeSubSubjectValue) {
            throw this.newParseError(`Found both rdf:resource (${propertyAttribute.value
              }) and rdf:nodeID (${activeSubSubjectValue}).`);
          }
          if (parseType) {
            throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:resource (${
                propertyAttribute.value})`);
          }
          activeTag.hadChildren = true;
          activeSubSubjectValue = propertyAttribute.value;
          subSubjectValueBlank = false;
          continue;
        case 'datatype':
          if (attributedProperty) {
            throw this.newParseError(
              `Found both non-rdf:* property attributes and rdf:datatype (${propertyAttribute.value}).`);
          }
          if (parseType) {
            throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:datatype (${
              propertyAttribute.value})`);
          }
          activeTag.datatype = this.valueToUri(propertyAttribute.value, activeTag);
          continue;
        case 'nodeID':
          if (attributedProperty) {
            throw this.newParseError(
              `Found both non-rdf:* property attributes and rdf:nodeID (${propertyAttribute.value}).`);
          }
          if (activeTag.hadChildren) {
            throw this.newParseError(`Found both rdf:resource and rdf:nodeID (${propertyAttribute.value}).`);
          }
          if (parseType) {
            throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:nodeID (${
              propertyAttribute.value})`);
          }
          this.validateNcname(propertyAttribute.value);
          activeTag.hadChildren = true;
          activeSubSubjectValue = propertyAttribute.value;
          subSubjectValueBlank = true;
          continue;
        case 'bagID':
          throw this.newParseError(`rdf:bagID is not supported.`);
        case 'parseType':
          // Validation
          if (attributedProperty) {
            throw this.newParseError(`rdf:parseType is not allowed when non-rdf:* property attributes are present`);
          }
          if (activeTag.datatype) {
            throw this.newParseError(`rdf:parseType is not allowed on property elements with rdf:datatype (${
              activeTag.datatype.value})`);
          }
          if (activeSubSubjectValue) {
            throw this.newParseError(
              `rdf:parseType is not allowed on property elements with rdf:nodeID or rdf:resource (${
                activeSubSubjectValue})`);
          }

          if (propertyAttribute.value === 'Resource') {
            parseType = true;
            activeTag.childrenParseType = ParseType.PROPERTY;

            // Turn this property element into a node element
            const nestedBNode: RDF.BlankNode = this.dataFactory.blankNode();
            this.emitTriple(activeTag.subject, activeTag.predicate, nestedBNode, activeTag.reifiedStatementId, activeTag.childrenTripleTerms, activeTag.reifier);
            activeTag.subject = nestedBNode;
            activeTag.predicate = null;
          } else if (propertyAttribute.value === 'Collection') {
            parseType = true;
            // Interpret children as being part of an rdf:List
            activeTag.hadChildren = true;
            activeTag.childrenCollectionSubject = activeTag.subject;
            activeTag.childrenCollectionPredicate = activeTag.predicate;
            subSubjectValueBlank = false;
          } else if (propertyAttribute.value === 'Literal') {
            parseType = true;
            // Interpret children as being part of a literal string
            activeTag.childrenTagsToString = true;
            activeTag.childrenStringTags = [];
          } else if (propertyAttribute.value === 'Triple') {
            parseType = true;
            // Collect children as triple terms
            activeTag.childrenTagsToTripleTerms = true;
            activeTag.childrenTripleTerms = [];
          }
          continue;
        case 'ID':
          this.validateNcname(propertyAttribute.value);
          activeTag.reifiedStatementId = this.valueToUri('#' + propertyAttribute.value, activeTag);
          this.claimNodeId(activeTag.reifiedStatementId);
          continue;
        case 'annotation':
          activeTag.reifier = this.dataFactory.namedNode(propertyAttribute.value);
          continue;
        case 'annotationNodeID':
          activeTag.reifier = this.dataFactory.blankNode(propertyAttribute.value);
          continue;
        }
      } else if (propertyAttribute.uri === RdfXmlParser.XML && propertyAttribute.local === 'lang') {
        activeTag.language = propertyAttribute.value === ''
          ? null : propertyAttribute.value.toLowerCase();
        continue;
      } else if (propertyAttribute.uri === RdfXmlParser.ITS && propertyAttribute.local === 'dir') {
        this.setDirection(activeTag, propertyAttribute.value);
        continue;
      } else if (propertyAttribute.uri === RdfXmlParser.ITS && propertyAttribute.local === 'version') {
        // Ignore its:version
        continue;
      }

      // Interpret attributes at this point as properties via implicit blank nodes on the property,
      // but we ignore attributes that have no prefix or known expanded URI
      if (propertyAttribute.prefix !== 'xml' && propertyAttribute.prefix !== 'xmlns'
          && (propertyAttribute.prefix !== '' || propertyAttribute.local !== 'xmlns')
        && propertyAttribute.uri) {
        if (parseType || activeTag.datatype) {
          throw this.newParseError(`Found illegal rdf:* properties on property element with attribute: ${
            propertyAttribute.value}`);
        }
        activeTag.hadChildren = true;
        attributedProperty = true;
        predicates.push(this.uriToNamedNode(propertyAttribute.uri + propertyAttribute.local));
        objects.push(this.createLiteral(propertyAttribute.value, activeTag));
      }
    }

    // Create the subject value _after_ all attributes have been processed
    if (activeSubSubjectValue !== null) {
      const subjectParent: RDF.Term = activeTag.subject;
      activeTag.subject = subSubjectValueBlank
        ? this.dataFactory.blankNode(activeSubSubjectValue) : this.valueToUri(activeSubSubjectValue, activeTag);
      this.emitTriple(subjectParent, activeTag.predicate, activeTag.subject, activeTag.reifiedStatementId, activeTag.childrenTripleTerms, activeTag.reifier);

      // Emit our buffered triples
      for (let i = 0; i < predicates.length; i++) {
        this.emitTriple(activeTag.subject, predicates[i], objects[i], null, activeTag.childrenTripleTerms, activeTag.reifier);
      }
      activeTag.predicateEmitted = true;
    } else if (subSubjectValueBlank) {
      // The current property element has no defined subject
      // Let's buffer the properties until the child node defines a subject,
      // or if the tag closes.
      activeTag.predicateSubPredicates = predicates;
      activeTag.predicateSubObjects = objects;
      activeTag.predicateEmitted = false;
    }
  }

  /**
   * Emit the given triple to the stream.
   * @param {Term} subject A subject term.
   * @param {Term} predicate A predicate term.
   * @param {Term} object An object term.
   * @param {Term} statementId An optional resource that identifies the triple.
   *                           If truthy, then the given triple will also be emitted reified.
   * @param childrenTripleTerms An optional array to push quads into instead of emitting them.
   * @param reifier The reifier to emit this triple under.
   */
  protected emitTriple(subject: RDF.Quad_Subject, predicate: RDF.Quad_Predicate, object: RDF.Quad_Object,
                       statementId?: RDF.NamedNode,
                       childrenTripleTerms?: RDF.Quad[],
                       reifier?: RDF.NamedNode | RDF.BlankNode) {
    const quad = this.dataFactory.quad(subject, predicate, object, this.defaultGraph);
    if (childrenTripleTerms) {
      childrenTripleTerms.push(quad);
    } else {
      this.push(quad);
    }
    if (reifier) {
      this.push(this.dataFactory.quad(reifier, this.dataFactory.namedNode(RdfXmlParser.RDF + 'reifies'), quad));
    }

    // Reify triple
    if (statementId) {
      this.push(this.dataFactory.quad(statementId,
        this.dataFactory.namedNode(RdfXmlParser.RDF + 'type'),
        this.dataFactory.namedNode(RdfXmlParser.RDF + 'Statement'),
        this.defaultGraph));
      this.push(this.dataFactory.quad(statementId,
        this.dataFactory.namedNode(RdfXmlParser.RDF + 'subject'), subject, this.defaultGraph));
      this.push(this.dataFactory.quad(statementId,
        this.dataFactory.namedNode(RdfXmlParser.RDF + 'predicate'), predicate, this.defaultGraph));
      this.push(this.dataFactory.quad(statementId,
        this.dataFactory.namedNode(RdfXmlParser.RDF + 'object'), object, this.defaultGraph));
    }
  }

  /**
   * Register the given term as a node ID.
   * If one was already registered, this will emit an error.
   *
   * This is used to check duplicate occurrences of rdf:ID in scope of the baseIRI.
   * @param {Term} term An RDF term.
   */
  protected claimNodeId(term: RDF.Term) {
    if (!this.allowDuplicateRdfIds) {
      if (this.nodeIds[term.value]) {
        throw this.newParseError(`Found multiple occurrences of rdf:ID='${term.value}'.`);
      }
      this.nodeIds[term.value] = true;
    }
  }

  /**
   * Handle the given text string.
   * @param {string} text A parsed text string.
   */
  protected onText(text: string) {
    const activeTag: IActiveTag = this.activeTagStack.length
      ? this.activeTagStack[this.activeTagStack.length - 1] : null;

    if (activeTag) {
      if (activeTag.childrenStringTags) {
        activeTag.childrenStringTags.push(text);
      } else if (activeTag.predicate) {
        activeTag.text = text;
      }
    }
  }

  /**
   * Handle the closing of the last tag.
   */
  protected onCloseTag() {
    const poppedTag: IActiveTag = this.activeTagStack.pop();
    const parentTag: IActiveTag = this.activeTagStack.length
        ? this.activeTagStack[this.activeTagStack.length - 1] : null;

    // If we were converting a tag to a string, and the tag was not self-closing, close it here.
    if (poppedTag.childrenStringEmitClosingTag) {
      poppedTag.childrenStringTags.push(poppedTag.childrenStringEmitClosingTag);
    }

    // Set the literal value if we were collecting XML tags to string
    if (poppedTag.childrenTagsToString) {
      poppedTag.datatype = this.dataFactory.namedNode(RdfXmlParser.RDF + 'XMLLiteral');
      poppedTag.text = poppedTag.childrenStringTags.join('');
      poppedTag.hadChildren = false; // Force a literal triple to be emitted hereafter
    }

    // Set the triple term value if we were collecting triple terms
    if (poppedTag.childrenTagsToTripleTerms && poppedTag.predicate && poppedTag.rdfVersion) {
      if (poppedTag.childrenTripleTerms.length !== 1) {
        throw this.newParseError(`Expected exactly one triple term in rdf:parseType="Triple" but got ${poppedTag.childrenTripleTerms.length}`);
      }
      for (const tripleTerm of poppedTag.childrenTripleTerms) {
        this.emitTriple(poppedTag.subject, poppedTag.predicate, tripleTerm, null, parentTag.childrenTripleTerms, parentTag.reifier);
      }
      poppedTag.predicateEmitted = true;
    }

    if (poppedTag.childrenCollectionSubject) {
      // Terminate the rdf:List
      this.emitTriple(poppedTag.childrenCollectionSubject, poppedTag.childrenCollectionPredicate,
        this.dataFactory.namedNode(RdfXmlParser.RDF + 'nil'), null, poppedTag.childrenTripleTerms);
    } else if (poppedTag.predicate) {
      if (!poppedTag.hadChildren && poppedTag.childrenParseType !== ParseType.PROPERTY) {
        // Property element contains text
        this.emitTriple(poppedTag.subject, poppedTag.predicate, this.createLiteral(poppedTag.text || '', poppedTag),
          poppedTag.reifiedStatementId, poppedTag.childrenTripleTerms, poppedTag.reifier);
      } else if (!poppedTag.predicateEmitted) {
        // Emit remaining properties on an anonymous property element
        const subject: RDF.Term = this.dataFactory.blankNode();
        this.emitTriple(poppedTag.subject, poppedTag.predicate, subject, poppedTag.reifiedStatementId, poppedTag.childrenTripleTerms, poppedTag.reifier);
        for (let i = 0; i < poppedTag.predicateSubPredicates.length; i++) {
          this.emitTriple(subject, poppedTag.predicateSubPredicates[i], poppedTag.predicateSubObjects[i], null, poppedTag.childrenTripleTerms);
        }
      }
    }
  }

  /**
   * Fetch local DOCTYPE ENTITY's and make the parser recognise them.
   * @param {string} doctype The read doctype.
   */
  protected onDoctype(doctype: string) {
    doctype.replace(/<!ENTITY\s+([^\s]+)\s+["']([^"']+)["']\s*>/g, (match, prefix, uri) => {
      this.saxParser.ENTITIES[prefix] = uri;
      return '';
    });
  }

  private setDirection(activeTag: IActiveTag, value?: string) {
    if (value) {
      if (value !== 'ltr' && value !== 'rtl') {
        throw this.newParseError(`Base directions must either be 'ltr' or 'rtl', while '${value}' was found.`);
      }
      activeTag.direction = value;
    } else {
      delete activeTag.direction;
    }
  }

  private setVersion(activeTag: IActiveTag, version: string) {
    activeTag.rdfVersion = version;
    this.emit('version', version);
    if (!this.isValidVersion(version)) {
      throw this.newParseError(`Detected unsupported version: ${version}`);
    }
  }
}

export interface IRdfXmlParserArgs {
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
  defaultGraph?: RDF.Term;
  /**
   * If the internal position (line, column) should be tracked an emitted in error messages.
   */
  trackPosition?: boolean;
  /**
   * By default multiple occurrences of the same `rdf:ID` value are not allowed.
   * By setting this option to `true`, this uniqueness check can be disabled.
   */
  allowDuplicateRdfIds?: boolean;
  /**
   * Enables validation of all URIs. Will throw an Error in case of an invalid URI.
   * By default, it is equal to true.
   */
  validateUri?: boolean;
  /**
   * Allows to customize the used IRI validation strategy using the `IriValidationStrategy` enumeration.
   * By default, the "pragmatic" strategy is used.
   */
  iriValidationStrategy?: IriValidationStrategy;
  /**
   * If no error should be emitted on unsupported versions.
   */
  parseUnsupportedVersions?: boolean;
  /**
   * The version that was supplied as a media type parameter.
   */
  version?: string;
}

export interface IActiveTag {
  subject?: RDF.NamedNode | RDF.BlankNode;
  predicate?: RDF.NamedNode;
  predicateEmitted?: boolean;
  predicateSubPredicates?: RDF.NamedNode[];
  predicateSubObjects?: (RDF.NamedNode | RDF.BlankNode | RDF.Literal)[];
  hadChildren?: boolean;
  text?: string;
  language?: string;
  direction?: 'ltr' | 'rtl';
  datatype?: RDF.NamedNode;
  nodeId?: RDF.BlankNode;
  childrenParseType?: ParseType;
  baseIRI?: string;
  listItemCounter?: number;
  reifiedStatementId?: RDF.NamedNode;
  childrenTagsToString?: boolean;
  childrenStringTags?: string[];
  childrenStringEmitClosingTag?: string;
  // for creating rdf:Lists
  childrenCollectionSubject?: RDF.NamedNode | RDF.BlankNode;
  childrenCollectionPredicate?: RDF.NamedNode;
  childrenTagsToTripleTerms?: boolean;
  childrenTripleTerms?: RDF.Quad[];
  reifier?: RDF.NamedNode | RDF.BlankNode;
  rdfVersion?: string;
  namespaces?: { key: string; value: string }[];
}

export enum ParseType {
  RESOURCE,
  PROPERTY,
}
