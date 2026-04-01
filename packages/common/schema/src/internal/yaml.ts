/**
 * Internal YAML runtime helpers.
 *
 * @since 0.0.0
 */

import { createRequire } from "node:module";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

export type BunYamlRuntime = {
  readonly YAML: {
    readonly parse: (input: string) => unknown;
  };
};

export type YamlRuntime = {
  readonly Bun?: BunYamlRuntime;
};

export type YamlModule = typeof import("yaml");

export type YamlParseResult =
  | {
      readonly _tag: "success";
      readonly value: unknown;
    }
  | {
      readonly _tag: "failure";
      readonly messages: ReadonlyArray<string>;
    };

export type YamlModuleLoader = () => YamlModule;

const requireFromYamlModule = createRequire(import.meta.url);

export const loadYamlModule = (): YamlModule => requireFromYamlModule("yaml");

const getBunRuntime = (runtime: YamlRuntime): O.Option<BunYamlRuntime> => O.fromNullishOr(runtime.Bun);

const getBunYamlParse = (input: unknown): O.Option<(input: string) => unknown> =>
  pipe(
    O.fromNullishOr(input),
    O.filter(P.isObject),
    O.flatMap((value) => (P.hasProperty(value, "Bun") ? O.fromNullishOr(value.Bun) : O.none())),
    O.filter(P.isObject),
    O.flatMap((value) => (P.hasProperty(value, "YAML") ? O.fromNullishOr(value.YAML) : O.none())),
    O.filter(P.isObject),
    O.flatMap((value) =>
      P.hasProperty(value, "parse")
        ? (() => {
            const parse = value.parse;

            return P.isFunction(parse) ? O.some((input: string) => parse(input)) : O.none();
          })()
        : O.none()
    )
  );

export const getGlobalYamlRuntime = (): YamlRuntime =>
  pipe(
    getBunYamlParse(globalThis),
    O.match({
      onNone: () => ({}),
      onSome: (parse) => ({
        Bun: {
          YAML: {
            parse,
          },
        },
      }),
    })
  );

export const makeParseYaml =
  (runtime: YamlRuntime, loadYaml: YamlModuleLoader) =>
  (input: string): unknown =>
    pipe(
      getBunRuntime(runtime),
      O.match({
        onNone: () => loadYaml().parse(input),
        onSome: ({ YAML }) => YAML.parse(input),
      })
    );

export const makeParseYamlForSchema =
  (runtime: YamlRuntime, loadYaml: YamlModuleLoader) =>
  (input: string): YamlParseResult =>
    pipe(
      getBunRuntime(runtime),
      O.match({
        onNone: () => {
          const document = loadYaml().parseDocument(input);

          return A.match(document.errors, {
            onEmpty: () =>
              ({
                _tag: "success",
                value: document.toJSON(),
              }) satisfies YamlParseResult,
            onNonEmpty: (errors) =>
              ({
                _tag: "failure",
                messages: A.map(errors, ({ message }) => message),
              }) satisfies YamlParseResult,
          });
        },
        onSome: ({ YAML }) =>
          ({
            _tag: "success",
            value: YAML.parse(input),
          }) satisfies YamlParseResult,
      })
    );
