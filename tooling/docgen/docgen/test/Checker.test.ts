import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as P from "effect/Predicate";
import * as ast from "ts-morph";
import * as Checker from "../src/Checker.js";
import * as Configuration from "../src/Configuration.js";
import * as Parser from "../src/Parser.js";

const defaultConfig: Configuration.ConfigurationShape = {
  projectName: "docgen",
  projectHomepage: "https://github.com/effect-ts/docgen",
  srcLink: "https://github.com/effect-ts/docgen/blob/main/src/",
  srcDir: "src",
  outDir: "docs",
  theme: "mikearnaldi/just-the-docs",
  enableSearch: true,
  enforceDescriptions: false,
  enforceExamples: false,
  enforceVersion: true,
  runExamples: false,
  tscExecutable: "tsc",
  exclude: [],
  parseCompilerOptions: {},
  examplesCompilerOptions: {},
};

const makeSourcefile = (source: string | ast.SourceFile) => {
  if (P.isString(source)) {
    const project = new ast.Project({
      compilerOptions: { strict: true },
      useInMemoryFileSystem: true,
    });
    const filename = "test.ts";
    return project.createSourceFile(filename, source);
  }
  return source;
};

const makeSource = (source: string | ast.SourceFile) => {
  const sourceFile = makeSourcefile(source);
  return Parser.SourceShape.new([sourceFile.getBaseName()], sourceFile);
};

const makeTestLayer = (source: string | ast.SourceFile, config: Partial<Configuration.ConfigurationShape>) =>
  Layer.mergeAll(
    Parser.Source.layer(makeSource(source)),
    Configuration.Configuration.layer({
      ...defaultConfig,
      ...config,
    })
  );

const expectEqual = <A>(actual: A, expected: A) =>
  Effect.sync(() => {
    expect(actual).toEqual(expected);
  });

const failureTest = <A>(
  name: string,
  config: Partial<Configuration.ConfigurationShape>,
  sourceText: string,
  parser: Effect.Effect<A, never, Parser.Source | Configuration.Configuration>,
  checker: (value: A) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>,
  failure: ReadonlyArray<string>
) =>
  layer(makeTestLayer(sourceText, config))((it) => {
    it.effect(name, () =>
      parser.pipe(
        Effect.flatMap(checker),
        Effect.flatMap((actual) => expectEqual(actual, failure))
      )
    );
  });

describe("Checker", () => {
  describe("checkFunctions", () => {
    failureTest(
      "should raise an error if `@since` tag is missing",
      {},
      `
/** @since 1.0.0 */
export function a() {}

/** description */
export function b() {}
        `,
      Parser.parseFunctions,
      Checker.checkFunctions,
      [
        "Missing `@since` tag in file /test.ts:\n" +
          "\n" +
          "  4 |\n" +
          "  5 | /** description */\n" +
          "> 6 | export function b() {}\n" +
          "    | ^\n" +
          "  7 |         ",
      ]
    );
  });

  describe("checkExports", () => {
    failureTest(
      "should raise an error if `@since` tag is missing",
      {},
      "export { a }",
      Parser.parseExports,
      Checker.checkExports,
      ["Missing `@since` tag in file /test.ts:\n" + "\n" + "> 1 | export { a }\n" + "    |          ^"]
    );
  });

  describe("checkNamespaces", () => {
    failureTest(
      "should raise an error if `@since` tag is missing",
      {},
      "export namespace A {}",
      Parser.parseNamespaces,
      Checker.checkNamespaces,
      ["Missing `@since` tag in file /test.ts:\n" + "\n" + "> 1 | export namespace A {}\n" + "    | ^"]
    );

    failureTest(
      "should raise an error if `@since` tag is missing on a nested interface",
      {},
      `
      /**
       * @since 1.0.0
       */
      export namespace A {
        export interface B {}
      }
      `,
      Parser.parseNamespaces,
      Checker.checkNamespaces,
      [
        "Missing `@since` tag in file /test.ts:\n" +
          "\n" +
          "  4 |        */\n" +
          "  5 |       export namespace A {\n" +
          "> 6 |         export interface B {}\n" +
          "    |         ^\n" +
          "  7 |       }\n" +
          "  8 |       ",
      ]
    );

    failureTest(
      "should raise an error if `@since` tag is missing on a nested type alias",
      {},
      `
      /**
       * @since 1.0.0
       */
      export namespace A {
        export type B = string
      }
      `,
      Parser.parseNamespaces,
      Checker.checkNamespaces,
      [
        "Missing `@since` tag in file /test.ts:\n" +
          "\n" +
          "  4 |        */\n" +
          "  5 |       export namespace A {\n" +
          "> 6 |         export type B = string\n" +
          "    |         ^\n" +
          "  7 |       }\n" +
          "  8 |       ",
      ]
    );

    failureTest(
      "should raise an error if `@since` tag is missing on a nested namespace",
      {},
      `
      /**
       * @since 1.0.0
       */
      export namespace A {
        export namespace B {}
      }
      `,
      Parser.parseNamespaces,
      Checker.checkNamespaces,
      [
        "Missing `@since` tag in file /test.ts:\n" +
          "\n" +
          "  4 |        */\n" +
          "  5 |       export namespace A {\n" +
          "> 6 |         export namespace B {}\n" +
          "    |         ^\n" +
          "  7 |       }\n" +
          "  8 |       ",
      ]
    );
  });

  describe("checkClasses", () => {
    failureTest(
      "should raise an error if `@since` tag is missing",
      {},
      "export class MyClass {}",
      Parser.parseClasses,
      Checker.checkClasses,
      ["Missing `@since` tag in file /test.ts:\n" + "\n" + "> 1 | export class MyClass {}\n" + "    | ^"]
    );
  });
});
