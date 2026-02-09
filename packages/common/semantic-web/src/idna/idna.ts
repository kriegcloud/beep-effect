/**
 * IDNA (Internationalized Domain Names in Applications) utilities.
 *
 * This is a punycode port kept intentionally behavior-compatible with the
 * previous implementation while making failures typed and explicit:
 * - algorithm core returns `Either.Either<A, ParseResult.ParseIssue>`
 * - public Effect API fails with `ParseResult.ParseError`
 * - schema transform is strict and failures are attached to the passed `ast`
 */

import { $SemanticWebId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import { toASCII as domainToASCII, toUnicode as domainToUnicode } from "./internal/domain.ts";
import { decode as punycodeDecode, encode as punycodeEncode } from "./internal/punycode.ts";
import * as _internalUcs from "./internal/ucs2.ts";

const $I = $SemanticWebId.create("idna/idna");

export type IDNAResult<A> = Either.Either<A, ParseResult.ParseIssue>;

const toParseErrorEffect = <A>(result: IDNAResult<A>): Effect.Effect<A, ParseResult.ParseError> =>
  Either.match(result, {
    onLeft: (issue) => Effect.fail(ParseResult.parseError(issue)),
    onRight: Effect.succeed,
  });

/**
 * `IDNA` represents the canonical ASCII form of an IDNA-capable string.
 *
 * Note: this does not enforce host label rules. It mirrors the legacy module,
 * which primarily provides punycode conversions rather than strict hostname
 * validation.
 */
export class IDNA extends S.Class<IDNA>($I`IDNA`)(
  {
    value: S.String,
  },
  $I.annotations("IDNA", {
    description: "Canonical ASCII output of IDNA.toASCII for a domain or email address",
  })
) {
  override readonly toString = (): string => this.value;

  /**
   * The punycode implementation version string (parity with the legacy module).
   */
  static readonly version = "0.1.0";

  /**
   * UCS-2 helpers (pure, synchronous).
   */
  static readonly ucs2 = ({
    decode: _internalUcs.ucs2decode,
    encode: _internalUcs.ucs2encode,
  } as const);

  // ---------------------------------------------------------------------------
  // Result (Either) APIs for synchronous consumers
  // ---------------------------------------------------------------------------

  static encodeResult = (input: string): IDNAResult<string> => punycodeEncode(S.String.ast, input);

  static decodeResult = (input: string): IDNAResult<string> => punycodeDecode(S.String.ast, input);

  static toASCIIResult = (input: string): IDNAResult<string> => domainToASCII(S.String.ast, input);

  static toUnicodeResult = (input: string): IDNAResult<string> => domainToUnicode(S.String.ast, input);

  // ---------------------------------------------------------------------------
  // Effect APIs (fail with ParseError)
  // ---------------------------------------------------------------------------

  static encode = (input: string): Effect.Effect<string, ParseResult.ParseError> =>
    toParseErrorEffect(IDNA.encodeResult(input));

  static decode = (input: string): Effect.Effect<string, ParseResult.ParseError> =>
    toParseErrorEffect(IDNA.decodeResult(input));

  static toASCII = (input: string): Effect.Effect<string, ParseResult.ParseError> =>
    toParseErrorEffect(IDNA.toASCIIResult(input));

  static toUnicode = (input: string): Effect.Effect<string, ParseResult.ParseError> =>
    toParseErrorEffect(IDNA.toUnicodeResult(input));

  // ---------------------------------------------------------------------------
  // Internal helpers for schema decoding (must use passed `ast`)
  // ---------------------------------------------------------------------------

  /** @internal */
  static toASCIIResultWithAst = (ast: AST.AST, input: string): IDNAResult<string> => domainToASCII(ast, input);
}

/**
 * Schema: strict transform from `string -> IDNA` using `toASCII`.
 *
 * Decode failures are `ParseIssue`s constructed with the provided `ast`.
 */
export const IDNAFromString = S.transformOrFail(S.String, IDNA, {
  strict: true,
  decode: (input, _options, ast) =>
    Either.match(IDNA.toASCIIResultWithAst(ast, input), {
      onLeft: Effect.fail,
      onRight: (value) => Effect.succeed(IDNA.make({ value })),
    }),
  encode: (idna) => Effect.succeed(idna.value),
}).annotations(
  $I.annotations("IDNAFromString", {
    description: "Transform from a string into canonical ASCII IDNA form",
  })
);

// ---------------------------------------------------------------------------
// Legacy-compatible named exports (now typed and explicit)
// ---------------------------------------------------------------------------

export const encodeResult = IDNA.encodeResult;
export const decodeResult = IDNA.decodeResult;
export const toASCIIResult = IDNA.toASCIIResult;
export const toUnicodeResult = IDNA.toUnicodeResult;

export const encode = IDNA.encode;
export const decode = IDNA.decode;
export const toASCII = IDNA.toASCII;
export const toUnicode = IDNA.toUnicode;

export const ucs2decode = IDNA.ucs2.decode;
export const ucs2encode = IDNA.ucs2.encode;

export default IDNA;
