import type { Auth } from "better-auth";
import type { BuiltInLocales } from "better-auth-localization";
import type { Prettify } from "better-call";
export type ErrorCodesType = Auth["$ERROR_CODES"];

/**
 * Partial better-auth error codes type for translations
 */
export type PartialErrorCodesType = Partial<ErrorCodesType>;

/**
 * Built-in locales supported by the plugin.
 */

/**
 * Extract custom locales from a translations object
 */
export type ExtractCustomLocales<T> = T extends Record<infer K, any> ? Exclude<K, BuiltInLocales> : never;

export type AvailableLocales<TCustomTranslations> = BuiltInLocales | ExtractCustomLocales<TCustomTranslations>;
export type PrettifiedAvailableLocales<TCustomTranslations> = Prettify<
  BuiltInLocales | ExtractCustomLocales<TCustomTranslations>
>;

export type Translations<TCustomTranslations extends Record<string, PartialErrorCodesType> = {}> = {
  [K in BuiltInLocales | keyof TCustomTranslations]?: PartialErrorCodesType;
} & TCustomTranslations;
/**
 * Options for the localization plugin
 */
export type LocalizationOptions<TCustomTranslations extends Record<string, PartialErrorCodesType> = {}> = {
  /**
   * Optional translation mappings
   * Can override built-in translations or add custom locales
   *
   * @example Override built-in translations
   * ```typescript
   * translations: {
   *   "pt-BR": { USER_NOT_FOUND: "Mensagem customizada" }
   * }
   * ```
   */
  translations?: Translations<TCustomTranslations>;
  /**
   * The default locale to use for translations
   * When using a built-in locale, translations are optional since defaults exist
   */
  defaultLocale: Prettify<PrettifiedAvailableLocales<TCustomTranslations>>;
  /**
   * Fallback locale when translation is not found
   * @default "default"
   */
  fallbackLocale?: Prettify<PrettifiedAvailableLocales<TCustomTranslations>>;
  /**
   * Function to determine locale from request
   * Can be async and should return a valid locale string
   * For server side calls, request is undefined
   *
   * @param request - The incoming request object
   * @returns Locale string or Promise resolving to locale string
   *
   * @example
   * ```typescript
   * getLocale: (request) => request.headers.get('accept-language')?.split(',')[0] || 'en'
   * ```
   */
  getLocale?: (
    request: Request | undefined
  ) =>
    | Prettify<PrettifiedAvailableLocales<TCustomTranslations>>
    | Promise<Prettify<PrettifiedAvailableLocales<TCustomTranslations>>>;
};
