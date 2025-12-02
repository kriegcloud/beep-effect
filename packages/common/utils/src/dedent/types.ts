export interface DedentOptions {
  readonly alignValues?: undefined | boolean;
  readonly escapeSpecialCharacters?: undefined | boolean;
  readonly trimWhitespace?: undefined | boolean;
}

export type CreateDedent = (options: DedentOptions) => Dedent;

export interface Dedent {
  (literals: string): string;
  (strings: TemplateStringsArray, ...values: unknown[]): string;
  readonly withOptions: CreateDedent;
}
