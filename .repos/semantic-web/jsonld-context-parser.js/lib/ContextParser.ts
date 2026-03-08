import {resolve} from "relative-to-absolute-iri";
import {ERROR_CODES, ErrorCoded} from "./ErrorCoded";
import {FetchDocumentLoader} from "./FetchDocumentLoader";
import {IDocumentLoader} from "./IDocumentLoader";
import {IJsonLdContext, IJsonLdContextNormalizedRaw, IPrefixValue, JsonLdContext} from "./JsonLdContext";
import {JsonLdContextNormalized, defaultExpandOptions, IExpandOptions} from "./JsonLdContextNormalized";
import {Util} from "./Util";

/**
 * Parses JSON-LD contexts.
 */
export class ContextParser {

  public static readonly DEFAULT_PROCESSING_MODE: number = 1.1;

  private readonly documentLoader: IDocumentLoader;
  private readonly documentCache: {[url: string]: JsonLdContext};
  private readonly validateContext: boolean;
  private readonly expandContentTypeToBase: boolean;
  private readonly remoteContextsDepthLimit: number;
  private readonly redirectSchemaOrgHttps: boolean;

  constructor(options?: IContextParserOptions) {
    options = options || {};
    this.documentLoader = options.documentLoader || new FetchDocumentLoader();
    this.documentCache = {};
    this.validateContext = !options.skipValidation;
    this.expandContentTypeToBase = !!options.expandContentTypeToBase;
    this.remoteContextsDepthLimit = options.remoteContextsDepthLimit || 32;
    this.redirectSchemaOrgHttps = 'redirectSchemaOrgHttps' in options ? !!options.redirectSchemaOrgHttps : true;
  }

  /**
   * Validate the given @language value.
   * An error will be thrown if it is invalid.
   * @param value An @language value.
   * @param {boolean} strictRange If the string value should be strictly checked against a regex.
   * @param {string} errorCode The error code to emit on errors.
   * @return {boolean} If validation passed.
   *                   Can only be false if strictRange is false and the string value did not pass the regex.
   */
  public static validateLanguage(value: any, strictRange: boolean, errorCode: string): boolean {
    if (typeof value !== 'string') {
      throw new ErrorCoded(`The value of an '@language' must be a string, got '${JSON.stringify(value)}'`, errorCode);
    }

    if (!Util.REGEX_LANGUAGE_TAG.test(value)) {
      if (strictRange) {
        throw new ErrorCoded(`The value of an '@language' must be a valid language tag, got '${
          JSON.stringify(value)}'`, errorCode);
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate the given @direction value.
   * An error will be thrown if it is invalid.
   * @param value An @direction value.
   * @param {boolean} strictValues If the string value should be strictly checked against a regex.
   * @return {boolean} If validation passed.
   *                   Can only be false if strictRange is false and the string value did not pass the regex.
   */
  public static validateDirection(value: any, strictValues: boolean) {
    if (typeof value !== 'string') {
      throw new ErrorCoded(`The value of an '@direction' must be a string, got '${JSON.stringify(value)}'`,
        ERROR_CODES.INVALID_BASE_DIRECTION);
    }

    if (!Util.REGEX_DIRECTION_TAG.test(value)) {
      if (strictValues) {
        throw new ErrorCoded(`The value of an '@direction' must be 'ltr' or 'rtl', got '${
          JSON.stringify(value)}'`, ERROR_CODES.INVALID_BASE_DIRECTION);
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Add an @id term for all @reverse terms.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @return {IJsonLdContextNormalizedRaw} The mutated input context.
   */
  public idifyReverseTerms(context: IJsonLdContextNormalizedRaw): IJsonLdContextNormalizedRaw {
    for (const key of Object.keys(context)) {
      let value = context[key];
      if (value && typeof value === 'object') {
        if (value['@reverse'] && !value['@id']) {
          if (typeof value['@reverse'] !== 'string' || Util.isValidKeyword(value['@reverse'])) {
            throw new ErrorCoded(`Invalid @reverse value, must be absolute IRI or blank node: '${value['@reverse']}'`,
              ERROR_CODES.INVALID_IRI_MAPPING);
          }
          value = context[key] = {...value, '@id': value['@reverse']};
          value['@id'] = <string> value['@reverse'];
          if (Util.isPotentialKeyword(value['@reverse'])) {
            delete value['@reverse'];
          } else {
            value['@reverse'] = <any> true;
          }
        }
      }
    }

    return context;
  }

  /**
   * Expand all prefixed terms in the given context.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @param {boolean} expandContentTypeToBase If @type inside the context may be expanded
   *                                          via @base if @vocab is set to null.
   * @param {string[]} keys Optional set of keys from the context to expand. If left undefined, all
   * keys in the context will be expanded.
   */
  public expandPrefixedTerms(context: JsonLdContextNormalized, expandContentTypeToBase: boolean, keys?: string[]) {
    const contextRaw = context.getContextRaw();
    for (const key of (keys || Object.keys(contextRaw))) {
      // Only expand allowed keys
      if (Util.EXPAND_KEYS_BLACKLIST.indexOf(key) < 0 && !Util.isReservedInternalKeyword(key)) {
        // Error if we try to alias a keyword to something else.
        const keyValue = contextRaw[key];
        if (Util.isPotentialKeyword(key) && Util.ALIAS_DOMAIN_BLACKLIST.indexOf(key) >= 0) {
          if (key !== '@type' || typeof contextRaw[key] === 'object'
            && !(contextRaw[key]['@protected'] || contextRaw[key]['@container'] === '@set')) {
            throw new ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping ${key} to ${JSON.stringify(keyValue)}`, ERROR_CODES.KEYWORD_REDEFINITION);
          }
        }

        // Error if we try to alias to an illegal keyword
        if (Util.ALIAS_RANGE_BLACKLIST.indexOf(Util.getContextValueId(keyValue)) >= 0) {
          throw new ErrorCoded(`Aliasing to certain keywords is not allowed.
Tried mapping ${key} to ${JSON.stringify(keyValue)}`, ERROR_CODES.INVALID_KEYWORD_ALIAS);
        }

        // Error if this term was marked as prefix as well
        if (keyValue && Util.isPotentialKeyword(Util.getContextValueId(keyValue))
          && keyValue['@prefix'] === true) {
          throw new ErrorCoded(`Tried to use keyword aliases as prefix: '${key}': '${JSON.stringify(keyValue)}'`,
            ERROR_CODES.INVALID_TERM_DEFINITION);
        }

        // Loop because prefixes might be nested
        while (Util.isPrefixValue(contextRaw[key])) {
          const value: IPrefixValue = contextRaw[key];
          let changed: boolean = false;
          if (typeof value === 'string') {
            contextRaw[key] = context.expandTerm(value, true);
            changed = changed || value !== contextRaw[key];
          } else {
            const id = value['@id'];
            const type = value['@type'];
            // If @id is missing, don't allow @id to be added if @prefix: true and key not being a valid IRI.
            const canAddIdEntry = !('@prefix' in value) || Util.isValidIri(key);
            if ('@id' in value) {
              // Use @id value for expansion
              if (id !== undefined && id !== null && typeof id === 'string') {
                contextRaw[key] = { ...contextRaw[key], '@id': context.expandTerm(id, true) };
                changed = changed || id !== contextRaw[key]['@id'];
              }
            } else if (!Util.isPotentialKeyword(key) && canAddIdEntry) {
              // Add an explicit @id value based on the expanded key value
              const newId = context.expandTerm(key, true);
              if (newId !== key) {
                // Don't set @id if expansion failed
                contextRaw[key] = { ...contextRaw[key], '@id': newId };
                changed = true;
              }
            }
            if (type && typeof type === 'string' && type !== '@vocab'
              && (!value['@container'] || !(<any> value['@container'])['@type'])
              && canAddIdEntry) {
              // First check @vocab, then fallback to @base
              let expandedType = context.expandTerm(type, true);
              if (expandContentTypeToBase && type === expandedType) {
                expandedType = context.expandTerm(type, false);
              }
              if (expandedType !== type) {
                changed = true;
                contextRaw[key] = { ...contextRaw[key], '@type': expandedType };
              }
            }
          }
          if (!changed) {
            break;
          }
        }
      }
    }
  }

  /**
   * Normalize the @language entries in the given context to lowercase.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @param {IParseOptions} parseOptions The parsing options.
   */
  public normalize(context: IJsonLdContextNormalizedRaw,
                   { processingMode, normalizeLanguageTags }: IParseOptions) {
    // Lowercase language keys in 1.0
    if (normalizeLanguageTags || processingMode === 1.0) {
      for (const key of Object.keys(context)) {
        if (key === '@language' && typeof context[key] === 'string') {
          context[key] = (<string> context[key]).toLowerCase();
        } else {
          const value = context[key];
          if (value && typeof value === 'object') {
            if (typeof value['@language'] === 'string') {
              const lowercase = value['@language'].toLowerCase();
              if (lowercase !== value['@language']) {
                context[key] = {...value, '@language': lowercase};
              }
            }
          }
        }
      }
    }
  }

  /**
   * Convert all @container strings and array values to hash-based values.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   */
  public containersToHash(context: IJsonLdContextNormalizedRaw) {
    for (const key of Object.keys(context)) {
      const value = context[key];
      if (value && typeof value === 'object') {
        if (typeof value['@container'] === 'string') {
          context[key] = { ...value, '@container': { [value['@container']]: true } };
        } else if (Array.isArray(value['@container'])) {
          const newValue: {[key: string]: boolean} = {};
          for (const containerValue of value['@container']) {
            newValue[containerValue] = true;
          }
          context[key] = { ...value, '@container': newValue };
        }
      }
    }
  }

  /**
   * Normalize and apply context-level @protected terms onto each term separately.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @param {number} processingMode The processing mode.
   */
  public applyScopedProtected(context: IJsonLdContextNormalizedRaw, { processingMode }: IParseOptions, expandOptions: IExpandOptions) {
    if (processingMode && processingMode >= 1.1) {
      if (context['@protected']) {
        for (const key of Object.keys(context)) {
          if (Util.isReservedInternalKeyword(key)) {
            continue;
          }

          if (!Util.isPotentialKeyword(key) && !Util.isTermProtected(context, key)) {
            const value: unknown = context[key];
            if (value && typeof value === 'object') {
              if (!('@protected' in context[key])) {
                // Mark terms with object values as protected if they don't have an @protected: false annotation
                context[key] = {...context[key], '@protected': true};
              }
            } else {
              // Convert string-based term values to object-based values with @protected: true
              context[key] = {
                '@id': value,
                '@protected': true,
              };
              if (Util.isSimpleTermDefinitionPrefix(value, expandOptions)) {
                context[key] = {...context[key], '@prefix': true};
              }
            }
          }
        }
        delete context['@protected'];
      }
    }
  }

  /**
   * Check if the given context inheritance does not contain any overrides of protected terms.
   * @param {IJsonLdContextNormalizedRaw} contextBefore The context that may contain some protected terms.
   * @param {IJsonLdContextNormalizedRaw} contextAfter A new context that is being applied on the first one.
   * @param {IExpandOptions} expandOptions Options that are needed for any expansions during this validation.
   * @param {string[]} keys Optional set of keys from the context to validate. If left undefined, all
   * keys defined in contextAfter will be checked.
   */
  public validateKeywordRedefinitions(contextBefore: IJsonLdContextNormalizedRaw,
                                      contextAfter: IJsonLdContextNormalizedRaw,
                                      expandOptions?: IExpandOptions,
                                      keys?: string[]) {
    for (const key of (keys ?? Object.keys(contextAfter) )) {
      if (Util.isTermProtected(contextBefore, key)) {
        // The entry in the context before will always be in object-mode
        // If the new entry is in string-mode, convert it to object-mode
        // before checking if it is identical.
        if (typeof contextAfter[key] === 'string') {
          contextAfter[key] = { '@id': contextAfter[key], '@protected': true };
        } else {
        // We modify this deliberately,
        // as we need it for the value comparison (they must be identical modulo '@protected')),
        // and for the fact that this new value will override the first one.
          contextAfter[key] = {...contextAfter[key], '@protected': true};
        }

        // Error if they are not identical
        if (!Util.deepEqual(contextBefore[key], contextAfter[key])) {
          throw new ErrorCoded(`Attempted to override the protected keyword ${key} from ${
            JSON.stringify(Util.getContextValueId(contextBefore[key]))} to ${
            JSON.stringify(Util.getContextValueId(contextAfter[key]))}`,
            ERROR_CODES.PROTECTED_TERM_REDEFINITION);
        }
      }
    }
  }

  /**
   * Validate the entries of the given context.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @param {IParseOptions} options The parse options.
   */
  public validate(context: IJsonLdContextNormalizedRaw, { processingMode }: IParseOptions) {
    for (const key of Object.keys(context)) {
      // Ignore reserved internal keywords.
      if (Util.isReservedInternalKeyword(key)) {
        continue;
      }

      // Do not allow empty term
      if (key === '') {
        throw new ErrorCoded(`The empty term is not allowed, got: '${key}': '${JSON.stringify(context[key])}'`,
          ERROR_CODES.INVALID_TERM_DEFINITION);
      }

      const value = context[key];
      const valueType = typeof value;
      // First check if the key is a keyword
      if (Util.isPotentialKeyword(key)) {
        switch (key.substr(1)) {
        case 'vocab':
          if (value !== null && valueType !== 'string') {
            throw new ErrorCoded(`Found an invalid @vocab IRI: ${value}`, ERROR_CODES.INVALID_VOCAB_MAPPING);
          }
          break;
        case 'base':
          if (value !== null && valueType !== 'string') {
            throw new ErrorCoded(`Found an invalid @base IRI: ${context[key]}`, ERROR_CODES.INVALID_BASE_IRI);
          }
          break;
        case 'language':
          if (value !== null) {
            ContextParser.validateLanguage(value, true, ERROR_CODES.INVALID_DEFAULT_LANGUAGE);
          }
          break;
        case 'version':
          if (value !== null && valueType !== 'number') {
            throw new ErrorCoded(`Found an invalid @version number: ${value}`, ERROR_CODES.INVALID_VERSION_VALUE);
          }
          break;
        case 'direction':
          if (value !== null) {
            ContextParser.validateDirection(value, true);
          }
          break;
        case 'propagate':
          if (processingMode === 1.0) {
            throw new ErrorCoded(`Found an illegal @propagate keyword: ${value}`, ERROR_CODES.INVALID_CONTEXT_ENTRY);
          }
          if (value !== null && valueType !== 'boolean') {
            throw new ErrorCoded(`Found an invalid @propagate value: ${value}`, ERROR_CODES.INVALID_PROPAGATE_VALUE);
          }
          break;
        }

        // Don't allow keywords to be overridden
        if (Util.isValidKeyword(key) && Util.isValidKeyword(Util.getContextValueId(value))) {
          throw new ErrorCoded(`Illegal keyword alias in term value, found: '${key}': '${Util
              .getContextValueId(value)}'`,
            ERROR_CODES.KEYWORD_REDEFINITION);
        }

        continue;
      }

      // Otherwise, consider the key a term
      if (value !== null) {
        switch (valueType) {
        case 'string':
          if (Util.getPrefix(value, context) === key) {
            throw new ErrorCoded(`Detected cyclical IRI mapping in context entry: '${key}': '${JSON
              .stringify(value)}'`, ERROR_CODES.CYCLIC_IRI_MAPPING);
          }
          if (Util.isValidIriWeak(key)) {
            if (value === '@type') {
              throw new ErrorCoded(`IRIs can not be mapped to @type, found: '${key}': '${value}'`,
                ERROR_CODES.INVALID_IRI_MAPPING);
            } else if (Util.isValidIri(value) && value !== new JsonLdContextNormalized(context).expandTerm(key)) {
              throw new ErrorCoded(
                `IRIs can not be mapped to other IRIs, found: '${key}': '${value}'`,
                ERROR_CODES.INVALID_IRI_MAPPING);
            }
          }
          break;
        case 'object':
          if (!Util.isCompactIri(key) && !('@id' in value)
            && (value['@type'] === '@id' ? !context['@base'] : !context['@vocab'])) {
            throw new ErrorCoded(`Missing @id in context entry: '${key}': '${JSON.stringify(value)}'`,
              ERROR_CODES.INVALID_IRI_MAPPING);
          }

          for (const objectKey of Object.keys(value)) {
            const objectValue = value[objectKey];
            if (!objectValue) {
              continue;
            }

            switch (objectKey) {
            case '@id':
              if (Util.isValidKeyword(objectValue)
                && objectValue !== '@type' && objectValue !== '@id' && objectValue !== '@graph' && objectValue !== '@nest') {
                throw new ErrorCoded(`Illegal keyword alias in term value, found: '${key}': '${JSON.stringify(value)}'`,
                  ERROR_CODES.INVALID_IRI_MAPPING);
              }
              if (Util.isValidIriWeak(key)) {
                if (objectValue === '@type') {
                  throw new ErrorCoded(`IRIs can not be mapped to @type, found: '${key}': '${JSON.stringify(value)}'`,
                    ERROR_CODES.INVALID_IRI_MAPPING);
                } else if (Util.isValidIri(objectValue)
                  && objectValue !== new JsonLdContextNormalized(context).expandTerm(key)) {
                  throw new ErrorCoded(
                    `IRIs can not be mapped to other IRIs, found: '${key}': '${JSON.stringify(value)}'`,
                    ERROR_CODES.INVALID_IRI_MAPPING);
                }
              }
              if (typeof objectValue !== 'string') {
                throw new ErrorCoded(`Detected non-string @id in context entry: '${key}': '${JSON.stringify(value)}'`,
                  ERROR_CODES.INVALID_IRI_MAPPING);
              }

              if (Util.getPrefix(objectValue, context) === key) {
                throw new ErrorCoded(`Detected cyclical IRI mapping in context entry: '${key}': '${JSON
                  .stringify(value)}'`, ERROR_CODES.CYCLIC_IRI_MAPPING);
              }

              break;
            case '@type':
              if (value['@container'] === '@type' && objectValue !== '@id' && objectValue !== '@vocab') {
                throw new ErrorCoded(`@container: @type only allows @type: @id or @vocab, but got: '${
                    key}': '${objectValue}'`,
                  ERROR_CODES.INVALID_TYPE_MAPPING);
              }
              if (typeof objectValue !== 'string') {
                throw new ErrorCoded(`The value of an '@type' must be a string, got '${JSON.stringify(valueType)}'`,
                  ERROR_CODES.INVALID_TYPE_MAPPING);
              }
              if (objectValue !== '@id' && objectValue !== '@vocab'
                && (processingMode === 1.0 || objectValue !== '@json')
                && (processingMode === 1.0 || objectValue !== '@none')
                && (objectValue[0] === '_' || !Util.isValidIri(objectValue))) {
                throw new ErrorCoded(`A context @type must be an absolute IRI, found: '${key}': '${objectValue}'`,
                  ERROR_CODES.INVALID_TYPE_MAPPING);
              }
              break;
            case '@reverse':
              if (typeof objectValue === 'string' && value['@id'] && value['@id'] !== objectValue) {
                throw new ErrorCoded(`Found non-matching @id and @reverse term values in '${key}':\
'${objectValue}' and '${value['@id']}'`, ERROR_CODES.INVALID_REVERSE_PROPERTY);
              }
              if ('@nest' in value) {
                throw new ErrorCoded(`@nest is not allowed in the reverse property '${key}'`,
                  ERROR_CODES.INVALID_REVERSE_PROPERTY);
              }
              break;
            case '@container':
              if (processingMode === 1.0) {
                if (Object.keys(objectValue).length > 1
                  || Util.CONTAINERS_1_0.indexOf(Object.keys(objectValue)[0]) < 0) {
                  throw new ErrorCoded(`Invalid term @container for '${key}' ('${Object.keys(objectValue)}') in 1.0, \
must be only one of ${Util.CONTAINERS_1_0.join(', ')}`, ERROR_CODES.INVALID_CONTAINER_MAPPING);
                }
              }
              for (const containerValue of Object.keys(objectValue)) {
                if (containerValue === '@list' && value['@reverse']) {
                  throw new ErrorCoded(`Term value can not be @container: @list and @reverse at the same time on '${
                    key}'`, ERROR_CODES.INVALID_REVERSE_PROPERTY);
                }
                if (Util.CONTAINERS.indexOf(containerValue) < 0) {
                  throw new ErrorCoded(`Invalid term @container for '${key}' ('${containerValue}'), \
must be one of ${Util.CONTAINERS.join(', ')}`, ERROR_CODES.INVALID_CONTAINER_MAPPING);
                }
              }
              break;
            case '@language':
              ContextParser.validateLanguage(objectValue, true, ERROR_CODES.INVALID_LANGUAGE_MAPPING);
              break;
            case '@direction':
              ContextParser.validateDirection(objectValue, true);
              break;
            case '@prefix':
              if (objectValue !== null && typeof objectValue !== 'boolean') {
                throw new ErrorCoded(`Found an invalid term @prefix boolean in: '${key}': '${JSON.stringify(value)}'`,
                  ERROR_CODES.INVALID_PREFIX_VALUE);
              }
              if (!('@id' in value) && !Util.isValidIri(key)) {
                throw new ErrorCoded(`Invalid @prefix definition for '${key}' ('${JSON.stringify(value)}'`,
                  ERROR_CODES.INVALID_TERM_DEFINITION);
              }
              break;
            case '@index':
              if (processingMode === 1.0 || !value['@container'] || !value['@container']['@index']) {
                throw new ErrorCoded(`Attempt to add illegal key to value object: '${
                  key}': '${JSON.stringify(value)}'`, ERROR_CODES.INVALID_TERM_DEFINITION);
              }
              break;
            case '@nest':
              if (Util.isPotentialKeyword(objectValue) && objectValue !== '@nest') {
                throw new ErrorCoded(`Found an invalid term @nest value in: '${key}': '${JSON.stringify(value)}'`,
                  ERROR_CODES.INVALID_NEST_VALUE);
              }
            }
          }
          break;
        default:
          throw new ErrorCoded(`Found an invalid term value: '${key}': '${value}'`,
            ERROR_CODES.INVALID_TERM_DEFINITION);
        }
      }
    }
  }

  /**
   * Apply the @base context entry to the given context under certain circumstances.
   * @param context A context.
   * @param options Parsing options.
   * @param inheritFromParent If the @base value from the parent context can be inherited.
   * @return The given context.
   */
  public applyBaseEntry(context: IJsonLdContextNormalizedRaw, options: IParseOptions,
                        inheritFromParent: boolean): IJsonLdContextNormalizedRaw {
    // In some special cases, this can be a string, so ignore those.
    if (typeof context === 'string') {
      return context;
    }

    // Give priority to @base in the parent context
    if (inheritFromParent && !('@base' in context) && options.parentContext
      && typeof options.parentContext === 'object' && '@base' in options.parentContext) {
      context['@base'] = options.parentContext['@base'];
      if (options.parentContext['@__baseDocument']) {
        context['@__baseDocument'] = true;
      }
    }

    // Override the base IRI if provided.
    if (options.baseIRI && !options.external) {
      if (!('@base' in context)) {
        // The context base is the document base
        context['@base'] = options.baseIRI;
        context['@__baseDocument'] = true;
      } else if (context['@base'] !== null && typeof context['@base'] === 'string'
        && !Util.isValidIri(<string> context['@base'])) {
        // The context base is relative to the document base
        context['@base'] = resolve(<string> context['@base'],
          options.parentContext && options.parentContext['@base'] || options.baseIRI);
      }
    }
    return context;
  }

  /**
   * Resolve relative context IRIs, or return full IRIs as-is.
   * @param {string} contextIri A context IRI.
   * @param {string} baseIRI A base IRI.
   * @return {string} The normalized context IRI.
   */
  public normalizeContextIri(contextIri: string, baseIRI?: string) {
    if (!Util.isValidIri(contextIri)) {
      try {
        contextIri = resolve(contextIri, baseIRI);
      } catch {
        throw new Error(`Invalid context IRI: ${contextIri}`);
      }
    }

    // TODO: Temporary workaround for fixing schema.org CORS issues (https://github.com/schemaorg/schemaorg/issues/2578#issuecomment-652324465)
    if (this.redirectSchemaOrgHttps && contextIri.startsWith('http://schema.org')) {
      contextIri = 'https://schema.org/';
    }

    return contextIri;
  }

  /**
   * Parse scoped contexts in the given context.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @param {IParseOptions} options Parsing options.
   * @return {IJsonLdContextNormalizedRaw} The mutated input context.
   * @param {string[]} keys Optional set of keys from the context to parseInnerContexts of. If left undefined, all
   * keys in the context will be iterated over.
   */
  public async parseInnerContexts(context: IJsonLdContextNormalizedRaw, options: IParseOptions, keys?: string[]): Promise<IJsonLdContextNormalizedRaw> {
    for (const key of (keys ?? Object.keys(context))) {
      const value = context[key];
      if (value && typeof value === 'object') {
        if ('@context' in value && value['@context'] !== null && !options.ignoreScopedContexts) {
          // Simulate a processing based on the parent context to check if there are any (potential errors).
          // Honestly, I find it a bit weird to do this here, as the context may be unused,
          // and the final effective context may differ based on any other embedded/scoped contexts.
          // But hey, it's part of the spec, so we have no choice...
          // https://w3c.github.io/json-ld-api/#h-note-10
          if (this.validateContext) {
            try {
              const parentContext = {...context, [key]: {...context[key]}};
              delete parentContext[key]['@context'];
              await this.parse(value['@context'],
                { ...options, external: false, parentContext, ignoreProtection: true, ignoreRemoteScopedContexts: true, ignoreScopedContexts: true });
            } catch (e) {
              throw new ErrorCoded(e.message, ERROR_CODES.INVALID_SCOPED_CONTEXT);
            }
          }
          context[key] = {...value, '@context': (await this.parse(value['@context'],
          { ...options, external: false, minimalProcessing: true, ignoreRemoteScopedContexts: true, parentContext: context }))
          .getContextRaw()}
        }
      }
    }
    return context;
  }

  /**
   * Parse a JSON-LD context in any form.
   * @param {JsonLdContext} context A context, URL to a context, or an array of contexts/URLs.
   * @param {IParseOptions} options Optional parsing options.
   * @return {Promise<JsonLdContextNormalized>} A promise resolving to the context.
   */
  public async parse(context: JsonLdContext, options?: IParseOptions): Promise<JsonLdContextNormalized>
  public async parse(context: JsonLdContext,
                     options: IParseOptions = {},
                     // These options are only for internal use on recursive calls and should not be used by
                     // libraries consuming this function
                     internalOptions: { skipValidation?: boolean } = {}): Promise<JsonLdContextNormalized> {
    const {
      baseIRI,
      parentContext,
      external,
      processingMode = ContextParser.DEFAULT_PROCESSING_MODE,
      normalizeLanguageTags,
      ignoreProtection,
      minimalProcessing,
    } = options;
    const remoteContexts = options.remoteContexts || {};

    // Avoid remote context overflows
    if (Object.keys(remoteContexts).length >= this.remoteContextsDepthLimit) {
      throw new ErrorCoded('Detected an overflow in remote context inclusions: ' + Object.keys(remoteContexts),
        ERROR_CODES.CONTEXT_OVERFLOW);
    }

    if (context === null || context === undefined) {
      // Don't allow context nullification and there are protected terms
      if (!ignoreProtection && parentContext && Util.hasProtectedTerms(parentContext)) {
        throw new ErrorCoded('Illegal context nullification when terms are protected',
          ERROR_CODES.INVALID_CONTEXT_NULLIFICATION);
      }

      // Context that are explicitly set to null are empty.
      return new JsonLdContextNormalized(this.applyBaseEntry({}, options, false));
    } else if (typeof context === 'string') {
      const contextIri = this.normalizeContextIri(context, baseIRI);
      const overriddenLoad = this.getOverriddenLoad(contextIri, options);
      if (overriddenLoad) {
        return new JsonLdContextNormalized(overriddenLoad);
      }
      const parsedStringContext = await this.parse(await this.load(contextIri),
        {
          ...options,
          baseIRI: contextIri,
          external: true,
          remoteContexts: { ...remoteContexts, [contextIri]: true },
        });
      this.applyBaseEntry(parsedStringContext.getContextRaw(), options, true);
      return parsedStringContext;
    } else if (Array.isArray(context)) {
      // As a performance consideration, first load all external contexts in parallel.
      const contextIris: string[] = [];
      const contexts = await Promise.all(context.map((subContext, i) => {
        if (typeof subContext === 'string') {
          const contextIri = this.normalizeContextIri(subContext, baseIRI);
          contextIris[i] = contextIri;
          const overriddenLoad = this.getOverriddenLoad(contextIri, options);
          if (overriddenLoad) {
            return overriddenLoad;
          }
          return this.load(contextIri);
        } else {
          return subContext;
        }
      }));

      // Don't apply inheritance logic on minimal processing
      if (minimalProcessing) {
        return new JsonLdContextNormalized(contexts);
      }

      const reducedContexts = await contexts.reduce((accContextPromise, contextEntry, i) => accContextPromise
          .then((accContext) => this.parse(contextEntry, {
            ...options,
            baseIRI: contextIris[i] || options.baseIRI,
            external: !!contextIris[i] || options.external,
            parentContext: accContext.getContextRaw(),
            remoteContexts: contextIris[i] ? { ...remoteContexts, [contextIris[i]]: true } : remoteContexts,
          },
          // @ts-expect-error: This third argument causes a type error because we have hidden it from consumers
            {
              skipValidation: i < contexts.length - 1,
            })),
        Promise.resolve(new JsonLdContextNormalized(parentContext || {})));

      // Override the base IRI if provided.
      this.applyBaseEntry(reducedContexts.getContextRaw(), options, true);

      return reducedContexts;
    } else if (typeof context === 'object') {
      if ('@context' in context) {
        if (options?.disallowDirectlyNestedContext) {
          throw new ErrorCoded(`Keywords can not be aliased to something else.
Tried mapping @context to ${JSON.stringify(context['@context'])}`, ERROR_CODES.KEYWORD_REDEFINITION);
        }
        return await this.parse(context['@context'], options);
      }

      // Make a deep clone of the given context, to avoid modifying it.
      context = <IJsonLdContextNormalizedRaw> {...context};

      // According to the JSON-LD spec, @base must be ignored from external contexts.
      if (external) {
        delete context['@base'];
      }

      // Override the base IRI if provided.
      this.applyBaseEntry(context, options, true);

      // Hashify container entries
      // Do this before protected term validation as that influences term format
      this.containersToHash(context);

      // Don't perform any other modifications if only minimal processing is needed.
      if (minimalProcessing) {
        return new JsonLdContextNormalized(context);
      }

      // In JSON-LD 1.1, load @import'ed context prior to processing.
      let importContext = {};
      if ('@import' in context) {
        if (processingMode >= 1.1) {
          // Only accept string values
          if (typeof context['@import'] !== 'string') {
            throw new ErrorCoded('An @import value must be a string, but got ' + typeof context['@import'],
              ERROR_CODES.INVALID_IMPORT_VALUE);
          }

          // Load context
          importContext = await this.loadImportContext(this.normalizeContextIri(context['@import'], baseIRI));
          delete context['@import'];
        } else {
          throw new ErrorCoded('Context importing is not supported in JSON-LD 1.0',
            ERROR_CODES.INVALID_CONTEXT_ENTRY);
        }
      }

      this.applyScopedProtected(importContext, { processingMode }, defaultExpandOptions);

      const newContext: IJsonLdContextNormalizedRaw = Object.assign(importContext, context);

      // Handle terms (before protection checks)
      this.idifyReverseTerms(newContext);
      this.normalize(newContext, { processingMode, normalizeLanguageTags });
      this.applyScopedProtected(newContext, { processingMode }, defaultExpandOptions);

      const keys = Object.keys(newContext);

      const overlappingKeys: string[] = [];
      if (typeof parentContext === 'object') {
        // Merge different parts of the final context in order
        for (const key in parentContext) {
          if (key in newContext) {
            overlappingKeys.push(key);
          } else {
            newContext[key] = parentContext[key];
          }
        }
      }

      // Parse inner contexts with minimal processing
      await this.parseInnerContexts(newContext, options, keys);

      const newContextWrapped = new JsonLdContextNormalized(newContext);

      // In JSON-LD 1.1, @vocab can be relative to @vocab in the parent context, or a compact IRI.
      if ((newContext && newContext['@version'] || ContextParser.DEFAULT_PROCESSING_MODE) >= 1.1
        && ((context['@vocab'] && typeof context['@vocab'] === 'string') || context['@vocab'] === '')) {
        if (parentContext && '@vocab' in parentContext && context['@vocab'].indexOf(':') < 0) {
          newContext['@vocab'] = parentContext['@vocab'] + context['@vocab'];
        } else if (Util.isCompactIri(context['@vocab']) || context['@vocab'] in newContext) {
            // @vocab is a compact IRI or refers exactly to a prefix
          newContext['@vocab'] = newContextWrapped.expandTerm(context['@vocab'], true);

        }
      }

      this.expandPrefixedTerms(newContextWrapped, this.expandContentTypeToBase, keys);

      // In JSON-LD 1.1, check if we are not redefining any protected keywords
      if (!ignoreProtection && parentContext && processingMode >= 1.1) {
        this.validateKeywordRedefinitions(parentContext, newContext, defaultExpandOptions, overlappingKeys);
      }

      if (this.validateContext && !internalOptions.skipValidation) {
        this.validate(newContext, { processingMode });
      }
      return newContextWrapped;
    } else {
      throw new ErrorCoded(`Tried parsing a context that is not a string, array or object, but got ${context}`,
        ERROR_CODES.INVALID_LOCAL_CONTEXT);
    }
  }

  /**
   * Fetch the given URL as a raw JSON-LD context.
   * @param url An URL.
   * @return A promise resolving to a raw JSON-LD context.
   */
  public async load(url: string): Promise<JsonLdContext> {
    // First try to retrieve the context from cache
    const cached = this.documentCache[url];
    if (cached) {
      return cached;
    }

    // If not in cache, load it
    let document: IJsonLdContext;
    try {
      document = await this.documentLoader.load(url);
    } catch (e) {
      throw new ErrorCoded(`Failed to load remote context ${url}: ${e.message}`,
        ERROR_CODES.LOADING_REMOTE_CONTEXT_FAILED);
    }

    // Validate the context
    if (!('@context' in document)) {
      throw new ErrorCoded(`Missing @context in remote context at ${url}`,
        ERROR_CODES.INVALID_REMOTE_CONTEXT);
    }

    return this.documentCache[url] = document['@context'];
  }

  /**
   * Override the given context that may be loaded.
   *
   * This will check whether or not the url is recursively being loaded.
   * @param url An URL.
   * @param options Parsing options.
   * @return An overridden context, or null.
   *         Optionally an error can be thrown if a cyclic context is detected.
   */
  public getOverriddenLoad(url: string, options: IParseOptions): IJsonLdContextNormalizedRaw | null {
    if (url in (options.remoteContexts || {})) {
      if (options.ignoreRemoteScopedContexts) {
        return <IJsonLdContextNormalizedRaw> <any> url;
      } else {
        throw new ErrorCoded('Detected a cyclic context inclusion of ' + url,
          ERROR_CODES.RECURSIVE_CONTEXT_INCLUSION);
      }
    }
    return null;
  }

  /**
   * Load an @import'ed context.
   * @param importContextIri The full URI of an @import value.
   */
  public async loadImportContext(importContextIri: string): Promise<IJsonLdContextNormalizedRaw> {
    // Load the context - and do a deep clone since we are about to mutate it
    let importContext = await this.load(importContextIri);

    // Require the context to be a non-array object
    if (typeof importContext !== 'object' || Array.isArray(importContext)) {
      throw new ErrorCoded('An imported context must be a single object: ' + importContextIri,
        ERROR_CODES.INVALID_REMOTE_CONTEXT);
    }

    // Error if the context contains another @import
    if ('@import' in importContext) {
      throw new ErrorCoded('An imported context can not import another context: ' + importContextIri,
        ERROR_CODES.INVALID_CONTEXT_ENTRY);
    }
    importContext = {...importContext};

    // Containers have to be converted into hash values the same way as for the importing context
    // Otherwise context validation will fail for container values
    this.containersToHash(importContext);
    return importContext;
  }

}

export interface IContextParserOptions {
  /**
   * An optional loader that should be used for fetching external JSON-LD contexts.
   */
  documentLoader?: IDocumentLoader;
  /**
   * By default, JSON-LD contexts will be validated.
   * This can be disabled by setting this option to true.
   * This will achieve slightly better performance for large contexts,
   * and may be useful if contexts are known to be valid.
   */
  skipValidation?: boolean;
  /**
   * If @type inside the context may be expanded via @base is @vocab is set to null.
   */
  expandContentTypeToBase?: boolean;
  /**
   * The maximum number of remote contexts that can be fetched recursively.
   *
   * Defaults to 32.
   */
  remoteContextsDepthLimit?: number;
  /**
   * If http-based schema.org contexts should internally be redirected to https.
   * WARNING: this option is a temporary workaround for https://github.com/schemaorg/schemaorg/issues/2578#issuecomment-652324465
   * and will be removed once that issue is fixed.
   * Defaults to true.
   */
  redirectSchemaOrgHttps?: boolean;
}

export interface IParseOptions {
  /**
   * An optional fallback base IRI to set.
   */
  baseIRI?: string;
  /**
   * The parent context.
   */
  parentContext?: IJsonLdContextNormalizedRaw;
  /**
   * If the parsing context is an external context.
   */
  external?: boolean;
  /**
   * The default JSON-LD version that the context should be parsed with.
   */
  processingMode?: number;
  /**
   * If language tags should be normalized to lowercase.
   * This is always true for JSON-LD 1.0,
   * but false by default for all following versions.
   */
  normalizeLanguageTags?: boolean;
  /**
   * If checks for validating term protection should be skipped.
   */
  ignoreProtection?: boolean;
  /**
   * If the context should only be parsed and validated,
   * without performing normalizations and other modifications.
   *
   * If true, this *will* dereference external contexts.
   *
   * This option is used internally when handling type-scoped and property-scoped contexts.
   */
  minimalProcessing?: boolean;
  /**
   * If true, a remote context that will be looked up,
   * and is already contained in `remoteContexts`,
   * will not emit an error but will produce an empty context.
   */
  ignoreRemoteScopedContexts?: boolean;
  /**
   * A hash containing all remote contexts that have been looked up before.
   *
   * This is used to avoid stack overflows on cyclic context references.
   */
  remoteContexts?: {[url: string]: boolean};
  /**
   * If further processing of scoped contexts should be skipped.
   *
   * This is done to avoid combinatorial explosions when handling a scoped context if there are many scoped contexts.
   */
  ignoreScopedContexts?: boolean;
  /**
   * If directly nested contexts in the form of `{ @context: { @context: ... }}` should be disallowed.
   */
  disallowDirectlyNestedContext?: boolean; // TODO: consider removing this and defaulting to true in next major.
}
