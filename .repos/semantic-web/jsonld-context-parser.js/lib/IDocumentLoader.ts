import {IJsonLdContext} from "./JsonLdContext";

/**
 * Loads JSON documents from an URL.
 */
export interface IDocumentLoader {
  /**
   * Loads the JSON-LD context at the given URL.
   * @param {string} url An URL.
   * @return {Promise<IJsonLdContext>} A promise resolving to a JSON-LD context.
   */
  load(url: string): Promise<IJsonLdContext>;
}
