import {resolve} from "relative-to-absolute-iri";
import {ERROR_CODES, ErrorCoded} from "./ErrorCoded";
import {IJsonLdContextNormalizedRaw} from "./JsonLdContext";
import {Util} from "./Util";

/**
 * A class exposing operations over a normalized JSON-LD context.
 */
export class JsonLdContextNormalized {

  private readonly contextRaw: IJsonLdContextNormalizedRaw;

  constructor(contextRaw: IJsonLdContextNormalizedRaw) {
    this.contextRaw = contextRaw;
  }

  /**
   * @return The raw inner context.
   */
  public getContextRaw(): IJsonLdContextNormalizedRaw {
    return this.contextRaw;
  }

  /**
   * Expand the term or prefix of the given term if it has one,
   * otherwise return the term as-is.
   *
   * This will try to expand the IRI as much as possible.
   *
   * Iff in vocab-mode, then other references to other terms in the context can be used,
   * such as to `myTerm`:
   * ```
   * {
   *   "myTerm": "http://example.org/myLongTerm"
   * }
   * ```
   *
   * @param {string} term A term that is an URL or a prefixed URL.
   * @param {boolean} expandVocab If the term is a predicate or type and should be expanded based on @vocab,
   *                              otherwise it is considered a regular term that is expanded based on @base.
   * @param {IExpandOptions} options Options that define the way how expansion must be done.
   * @return {string} The expanded term, the term as-is, or null if it was explicitly disabled in the context.
   * @throws If the term is aliased to an invalid value (not a string, IRI or keyword).
   */
  public expandTerm(term: string, expandVocab?: boolean,
                    options: IExpandOptions = defaultExpandOptions): string | null {
    const contextValue = this.contextRaw[term];

    // Immediately return if the term was disabled in the context
    if (contextValue === null || (contextValue && contextValue['@id'] === null)) {
      return null;
    }

    // Check the @id
    let validIriMapping = true;
    if (contextValue && expandVocab) {
      const value = Util.getContextValueId(contextValue);
      if (value && value !== term) {
        if (typeof value !== 'string' || (!Util.isValidIri(value) && !Util.isValidKeyword(value))) {
          // Don't mark this mapping as invalid if we have an unknown keyword, but of the correct form.
          if (!Util.isPotentialKeyword(value)) {
            validIriMapping = false;
          }
        } else {
          return value;
        }
      }
    }

    // Check if the term is prefixed
    const prefix: string | null = Util.getPrefix(term, this.contextRaw);
    const vocab: string | undefined | null = this.contextRaw['@vocab'];
    const vocabRelative: boolean = (!!vocab || vocab === '') && vocab.indexOf(':') < 0;
    const base: string | undefined | null = this.contextRaw['@base'];
    const potentialKeyword = Util.isPotentialKeyword(term);
    if (prefix) {
      const contextPrefixValue = this.contextRaw[prefix];
      const value = Util.getContextValueId(contextPrefixValue);

      if (value) {
        if (typeof contextPrefixValue === 'string' || !options.allowPrefixForcing) {
          // If we have a simple term definition,
          // check the last character of the prefix to determine whether or not it is a prefix.
          // Validate that prefix ends with gen-delim character, unless @prefix is true
          if (!Util.isSimpleTermDefinitionPrefix(value, options)) {
            // Treat the term as an absolute IRI
            return term;
          }
        } else {
          // If we have an expanded term definition, default to @prefix: false
          if (value[0] !== '_' && !potentialKeyword && !contextPrefixValue['@prefix'] && !(term in this.contextRaw)) {
            // Treat the term as an absolute IRI
            return term;
          }
        }

        return value + term.substr(prefix.length + 1);
      }
    } else if (expandVocab && ((vocab || vocab === '') || (options.allowVocabRelativeToBase && (base && vocabRelative)))
      && !potentialKeyword && !Util.isCompactIri(term)) {
      if (vocabRelative) {
        if (options.allowVocabRelativeToBase) {
          return ((vocab || base) ? resolve(<string> vocab, <any> base) : '') + term;
        } else {
          throw new ErrorCoded(`Relative vocab expansion for term '${term}' with vocab '${
            vocab}' is not allowed.`, ERROR_CODES.INVALID_VOCAB_MAPPING);
        }
      } else {
        return vocab + term;
      }
    } else if (!expandVocab && base && !potentialKeyword && !Util.isCompactIri(term)) {
      return resolve(term, base);
    }

    // Return the term as-is, unless we discovered an invalid IRI mapping for this term in the context earlier.
    if (validIriMapping) {
      return term;
    } else {
      throw new ErrorCoded(`Invalid IRI mapping found for context entry '${term}': '${
        JSON.stringify(contextValue)}'`, ERROR_CODES.INVALID_IRI_MAPPING);
    }
  }

  /**
   * Compact the given term using @base, @vocab, an aliased term, or a prefixed term.
   *
   * This will try to compact the IRI as much as possible.
   *
   * @param {string} iri An IRI to compact.
   * @param {boolean} vocab If the term is a predicate or type and should be compacted based on @vocab,
   *                        otherwise it is considered a regular term that is compacted based on @base.
   * @return {string} The compacted term or the IRI as-is.
   */
  public compactIri(iri: string, vocab?: boolean): string {
    // Try @vocab compacting
    if (vocab && this.contextRaw['@vocab'] && iri.startsWith(this.contextRaw['@vocab'])) {
      return iri.substr(this.contextRaw['@vocab'].length);
    }

    // Try @base compacting
    if (!vocab && this.contextRaw['@base'] && iri.startsWith(this.contextRaw['@base'])) {
      return iri.substr(this.contextRaw['@base'].length);
    }

    // Loop over all terms in the context
    // This will try to prefix as short as possible.
    // Once a fully compacted alias is found, return immediately, as we can not go any shorter.
    const shortestPrefixing: { prefix: string, suffix: string } = { prefix: '', suffix: iri };
    for (const key in this.contextRaw) {
      const value = this.contextRaw[key];
      if (value && !Util.isPotentialKeyword(key)) {
        const contextIri = Util.getContextValueId(value);
        if (iri.startsWith(contextIri)) {
          const suffix = iri.substr(contextIri.length);
          if (!suffix) {
            if (vocab) {
              // Immediately return on compacted alias
              return key;
            }
          } else if (suffix.length < shortestPrefixing.suffix.length) {
            // Overwrite the shortest prefix
            shortestPrefixing.prefix = key;
            shortestPrefixing.suffix = suffix;
          }
        }
      }
    }

    // Return the shortest prefix
    if (shortestPrefixing.prefix) {
      return shortestPrefixing.prefix + ':' + shortestPrefixing.suffix;
    }

    return iri;
  }

}

export interface IExpandOptions {
  /**
   * If compact IRI prefixes can end with any kind of character in simple term definitions,
   * instead of only the default gen-delim characters (:,/,?,#,[,],@).
   */
  allowPrefixNonGenDelims: boolean;
  /**
   * If compact IRI prefixes ending with a non-gen-delim character
   * can be forced as a prefix using @prefix: true.
   */
  allowPrefixForcing: boolean;
  /**
   * If @vocab values are allowed contain IRIs relative to @base.
   */
  allowVocabRelativeToBase: boolean;
}
export const defaultExpandOptions: IExpandOptions = {
  allowPrefixForcing: true,
  allowPrefixNonGenDelims: false,
  allowVocabRelativeToBase: true,
};