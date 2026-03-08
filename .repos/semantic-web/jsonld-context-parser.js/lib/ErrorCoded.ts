/**
 * An error that has a certain error code.
 *
 * The error code can be any string.
 * All standardized error codes are listed in {@link ERROR_CODES}.
 */
export class ErrorCoded extends Error {

  /**
   * An error code using which the type of error can be identified.
   */
  public readonly code: string;

  /* istanbul ignore next */
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }

}

/**
 * All standardized JSON-LD error codes.
 * @see https://w3c.github.io/json-ld-api/#dom-jsonlderrorcode
 */
// tslint:disable:object-literal-sort-keys
export enum ERROR_CODES {
  COLLIDING_KEYWORDS = 'colliding keywords',
  CONFLICTING_INDEXES = 'conflicting indexes',
  CYCLIC_IRI_MAPPING = 'cyclic IRI mapping',
  INVALID_ID_VALUE = 'invalid @id value',
  INVALID_INDEX_VALUE = 'invalid @index value',
  INVALID_NEST_VALUE = 'invalid @nest value',
  INVALID_PREFIX_VALUE = 'invalid @prefix value',
  INVALID_PROPAGATE_VALUE = 'invalid @propagate value',
  INVALID_REVERSE_VALUE = 'invalid @reverse value',
  INVALID_IMPORT_VALUE = 'invalid @import value',
  INVALID_VERSION_VALUE = 'invalid @version value',
  INVALID_BASE_IRI = 'invalid base IRI',
  INVALID_CONTAINER_MAPPING = 'invalid container mapping',
  INVALID_CONTEXT_ENTRY = 'invalid context entry',
  INVALID_CONTEXT_NULLIFICATION = 'invalid context nullification',
  INVALID_DEFAULT_LANGUAGE = 'invalid default language',
  INVALID_INCLUDED_VALUE = 'invalid @included value',
  INVALID_IRI_MAPPING = 'invalid IRI mapping',
  INVALID_JSON_LITERAL = 'invalid JSON literal',
  INVALID_KEYWORD_ALIAS = 'invalid keyword alias',
  INVALID_LANGUAGE_MAP_VALUE = 'invalid language map value',
  INVALID_LANGUAGE_MAPPING = 'invalid language mapping',
  INVALID_LANGUAGE_TAGGED_STRING = 'invalid language-tagged string',
  INVALID_LANGUAGE_TAGGED_VALUE = 'invalid language-tagged value',
  INVALID_LOCAL_CONTEXT = 'invalid local context',
  INVALID_REMOTE_CONTEXT = 'invalid remote context',
  INVALID_REVERSE_PROPERTY = 'invalid reverse property',
  INVALID_REVERSE_PROPERTY_MAP = 'invalid reverse property map',
  INVALID_REVERSE_PROPERTY_VALUE = 'invalid reverse property value',
  INVALID_SCOPED_CONTEXT = 'invalid scoped context',
  INVALID_SCRIPT_ELEMENT = 'invalid script element',
  INVALID_SET_OR_LIST_OBJECT = 'invalid set or list object',
  INVALID_TERM_DEFINITION = 'invalid term definition',
  INVALID_TYPE_MAPPING = 'invalid type mapping',
  INVALID_TYPE_VALUE = 'invalid type value',
  INVALID_TYPED_VALUE = 'invalid typed value',
  INVALID_VALUE_OBJECT = 'invalid value object',
  INVALID_VALUE_OBJECT_VALUE = 'invalid value object value',
  INVALID_VOCAB_MAPPING = 'invalid vocab mapping',
  IRI_CONFUSED_WITH_PREFIX = 'IRI confused with prefix',
  KEYWORD_REDEFINITION = 'keyword redefinition',
  LOADING_DOCUMENT_FAILED = 'loading document failed',
  LOADING_REMOTE_CONTEXT_FAILED = 'loading remote context failed',
  MULTIPLE_CONTEXT_LINK_HEADERS = 'multiple context link headers',
  PROCESSING_MODE_CONFLICT = 'processing mode conflict',
  PROTECTED_TERM_REDEFINITION = 'protected term redefinition',
  CONTEXT_OVERFLOW = 'context overflow',
  INVALID_BASE_DIRECTION = 'invalid base direction',
  RECURSIVE_CONTEXT_INCLUSION = 'recursive context inclusion',
  INVALID_STREAMING_KEY_ORDER = 'invalid streaming key order',

  /**
   * JSON-LD-star
   */
  INVALID_EMBEDDED_NODE = "invalid embedded node",
  INVALID_ANNOTATION = "invalid annotation",
}
