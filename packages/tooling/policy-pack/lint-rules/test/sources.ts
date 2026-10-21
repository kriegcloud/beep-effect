/**
 * Inline rule fixture sources.
 *
 * Each rule has an `invalid` source (expected to trip the rule N times) and a `valid`
 * source (expected to be silent). Keeping these as string constants — rather than
 * on-disk `.ts` fixture files — avoids the intentional violations being linted/parsed by
 * Biome, tsc, and ESLint; the harness writes each source to a temp file before linting.
 */

import * as A from "effect/Array";
import type { RuleName } from "@beep/lint-rules";

export type RuleSource = {
  readonly invalid: string;
  readonly invalidCount: number;
  readonly valid: string;
  readonly messageIncludes: string;
};

export const SOURCES: { readonly [K in RuleName]: RuleSource } = {
  "no-native-error": {
    invalidCount: 2,
    messageIncludes: "native Error",
    invalid: A.join(["export const boom = () => new Error('nope');", "export const boom2 = () => new Error();"], "\n"),
    valid: "export const ok = () => 'no native error here';",
  },
  "no-bigint-literals": {
    invalidCount: 3,
    messageIncludes: "BigInt literals",
    invalid: A.join(["export const a = 1n;", "export const b = 0xffn;", "export const c = 0b1010n;"], "\n"),
    valid: A.join(["export const a = BigInt(1);", "export const b = BigInt('255');", "export const c = 42;"], "\n"),
  },
  "no-empty-named-blocks": {
    invalidCount: 1,
    messageIncludes: "empty named import",
    invalid: "import {} from './side-effect.ts';",
    valid: A.join(["import { join } from 'node:path';", "export const p = join('a', 'b');"], "\n"),
  },
  "prefer-array-flat-map": {
    invalidCount: 1,
    messageIncludes: ".map(...).flat()",
    invalid: "export const flattened = [[1], [2]].map((x) => x).flat();",
    valid: A.join(
      ["export const flattened = [[1], [2]].flatMap((x) => x);", "export const mapped = [1, 2].map((x) => x + 1);"],
      "\n"
    ),
  },
  "prefer-identity-annote-pipe": {
    invalidCount: 8,
    messageIncludes: "identity annotations go through",
    invalid: A.join(
      [
        "export const Single = S.String.annotate($I.annote('Single', { description: 'one line' }));",
        "export const Multi = S.Struct({ a: S.String }).annotate(",
        "  $SchemaId.annote('Multi', {",
        "    description: 'spans lines',",
        "  })",
        ");",
        "export const TypedAnnote = S.Number.annotate($I.annote<number>('TypedAnnote'));",
        "export const TypedAnnotate = S.Number.annotate<number>($I.annote('TypedAnnotate'));",
        "export const CheckAnnotate = S.Number.check(S.isInt().annotate($I.annote('CheckAnnotate')));",
        "export const Key = S.Struct({ a: S.String.annotateKey($I.annote('Key.a')) });",
        "export const SuspendKey = S.Struct({ a: S.suspend(() => S.String).annotateKey($I.annote('SuspendKey.a')) });",
        "export class BaseKey extends S.Opaque<BaseKey>()(S.Struct({ a: S.String.annotateKey($I.annote('BaseKey.a')) })) {}",
      ],
      "\n"
    ),
    valid: A.join(
      [
        "export class Tree extends S.Opaque<Tree>()(",
        "  S.TaggedStruct('Tree', {",
        "    children: S.Array(S.suspend((): S.Codec<Tree> => Tree)).annotateKey(",
        "      $I.annote('Tree.children', { description: 'recursive base' })",
        "    ),",
        "    parent: S.NullOr(S.suspend((): S.Codec<Tree> => Tree)).annotateKey($I.annote('Tree.parent')),",
        "  })",
        ") {}",
        "export class Model extends S.Class<Model>('Model')({ a: S.String }, $I.annote('Model', { description: 'class' })) {}",
        "export class Boom extends S.TaggedError<Boom>()('Boom', {}, $I.annoteError<Boom>('Boom', { description: 'error' })) {}",
        "export const Checked = S.Number.check(S.isInt($I.annote('Checked')));",
        "export const Piped = S.String.pipe($I.annoteSchema('Piped', { description: 'canonical' }));",
        "export const PipedKey = S.Struct({ a: S.String.pipe($I.annoteKey('PipedKey.a')) });",
        "export const Plain = S.String.annotate({ identifier: 'Plain' });",
        "export const NotComposer = S.String.annotate(I.annote('NotComposer'));",
        "// S.String.annotate($I.annote('InComment'))",
        "export const InString = 'S.String.annotate($I.annote(1))';",
      ],
      "\n"
    ),
  },
};
