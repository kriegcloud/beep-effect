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
    readonly name?: string;
    readonly expression?: Type;
    readonly elements?: ReadonlyArray<Type>;
    readonly applications?: ReadonlyArray<Type>;
  }

  export interface Annotation {
    readonly description: string;
    readonly tags: ReadonlyArray<Tag>;
  }

  export interface ParseOptions {
    readonly unwrap?: boolean;
    readonly tags?: ReadonlyArray<string>;
    readonly recoverable?: boolean;
    readonly sloppy?: boolean;
    readonly lineNumbers?: boolean;
    readonly range?: boolean;
  }

  export function parse(comment: string, options?: ParseOptions): Annotation;

  const doctrine: {
    parse: typeof parse;
  };

  export default doctrine;
}
