/**
 * Type declarations for the doctrine JSDoc parser library.
 * Provides minimal type coverage for the parse function and its result types.
 * @since 0.0.0
 */
declare module "doctrine" {
  export interface Tag {
    readonly title: string;
    readonly name: string | null;
    readonly description: string | null;
    readonly type: Type | null;
  }

  export interface Type {
    readonly type: string;
    readonly name?: undefined |  string;
    readonly expression?: undefined |  Type;
    readonly elements?: undefined |  ReadonlyArray<Type>;
    readonly applications?: undefined |  ReadonlyArray<Type>;
  }

  export interface Annotation {
    readonly description: string;
    readonly tags: ReadonlyArray<Tag>;
  }

  export interface ParseOptions {
    readonly unwrap?: undefined |  boolean;
    readonly tags?: undefined |  ReadonlyArray<string>;
    readonly recoverable?: undefined |  boolean;
    readonly sloppy?: undefined |  boolean;
    readonly lineNumbers?: undefined |  boolean;
    readonly range?: undefined |  boolean;
  }

  export function parse(comment: string, options?: undefined |  ParseOptions): Annotation;

  const doctrine: {
    parse: typeof parse;
  };

  export default doctrine;
}
