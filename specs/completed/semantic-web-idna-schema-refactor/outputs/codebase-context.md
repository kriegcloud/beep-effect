# IDNA Codebase Context

## Export Surfaces

### `packages/common/semantic-web/src/idna/index.ts`

Exports and shapes:
- `ErrorType` (named re-export from `./errors`). Source: `packages/common/semantic-web/src/idna/index.ts:3`.
- `*` (re-export all from `./idna`). Source: `packages/common/semantic-web/src/idna/index.ts:4`.
- `DomainCallback`, `IDNAConfig`, `MapCallback` (type re-exports from `./model`). Source: `packages/common/semantic-web/src/idna/index.ts:5`.
- Default export `idna` (value imported from `./idna`, currently the `IDNA` instance). Source: `packages/common/semantic-web/src/idna/index.ts:1,7`.

Notes:
- Default export is value, not type.
- All exports are synchronous values/types.

### `packages/common/semantic-web/src/idna/idna.ts`

Exports and shapes (all synchronous):
- `maxInt: number` constant. Source: `packages/common/semantic-web/src/idna/idna.ts:10`.
- `map<T, R>(array: T[], callback: MapCallback<T, R>): R[]` utility. Source: `packages/common/semantic-web/src/idna/idna.ts:27`.
- `mapDomain(domain: string, callback: DomainCallback): string` utility. Source: `packages/common/semantic-web/src/idna/idna.ts:48`.
- `ucs2decode(string: string): number[]` (UCS-2 to code points). Source: `packages/common/semantic-web/src/idna/idna.ts:79`.
- `ucs2encode(codePoints: number[]): string` (code points to UCS-2). Source: `packages/common/semantic-web/src/idna/idna.ts:109`.
- `basicToDigit(codePoint: number): number`. Source: `packages/common/semantic-web/src/idna/idna.ts:128`.
- `digitToBasic(digit: number, flag: number): number`. Source: `packages/common/semantic-web/src/idna/idna.ts:156`.
- `adapt(delta: number, numPoints: number, firstTime: boolean): number`. Source: `packages/common/semantic-web/src/idna/idna.ts:179`.
- `decode(input: string): string` (punycode decode). Source: `packages/common/semantic-web/src/idna/idna.ts:193`.
- `encode(input: string): string` (punycode encode). Source: `packages/common/semantic-web/src/idna/idna.ts:264`.
- `toUnicode(input: string): string` (domain/email string mapping). Source: `packages/common/semantic-web/src/idna/idna.ts:346`.
- `toASCII(input: string): string` (domain/email string mapping). Source: `packages/common/semantic-web/src/idna/idna.ts:361`.
- `IDNA: IDNAConfig` instance (constructed `IDNAConfig`). Source: `packages/common/semantic-web/src/idna/idna.ts:384`.
- Default export `IDNA` (value). Source: `packages/common/semantic-web/src/idna/idna.ts:403`.

Relevant types referenced:
- `DomainCallback`, `MapCallback` from `packages/common/semantic-web/src/idna/model.ts:8,13`.
- `IDNAConfig` and `UCS2` classes from `packages/common/semantic-web/src/idna/model.ts:26,44`.

### `packages/common/semantic-web/src/idna/errors.ts`

Exports and shapes:
- `ErrorType` class (string literal kit: `"overflow" | "not-basic" | "invalid-input"`) with `static MESSAGES`. Source: `packages/common/semantic-web/src/idna/errors.ts:14-31`.
- `OverFlowError`, `NotBasicError`, `InvalidInputError` classes (Effect `TaggedError`), each with shape `{ input: unknown }` and a `message` getter. Source: `packages/common/semantic-web/src/idna/errors.ts:33-71`.
- `IDNAError` class (Effect `Union` of the three errors) with `static new` dual overload:
  - `(errorType: ErrorType.Type, input: unknown) => OverFlowError | NotBasicError | InvalidInputError`
  - `(input: unknown) => (errorType: ErrorType.Type) => OverFlowError | NotBasicError | InvalidInputError`
  Source: `packages/common/semantic-web/src/idna/errors.ts:74-95`.
- Namespace exports for `ErrorType` and `IDNAError` (Type/Encoded). Source: `packages/common/semantic-web/src/idna/errors.ts:25-29,97-100`.

## Tests and Behaviors

### `packages/common/semantic-web/test/idna/idna.test.ts`

Import surface (named, synchronous):
- `decode`, `encode`, `IDNA`, `toASCII`, `toUnicode`, `ucs2decode`, `ucs2encode` from `@beep/semantic-web/idna/idna`. Source: `packages/common/semantic-web/test/idna/idna.test.ts:2`.

Behavior assertions (summary):
- Basic encode/decode roundtrips and empty string handling.
  - Examples: `encode("m\xFCnchen")`, `decode("mnchen-3ya")`, `encode("")`, `decode("")`. Source: `packages/common/semantic-web/test/idna/idna.test.ts:233-267`.
- Invalid decode input throws `"Invalid input"` and specific error messages for not-basic and overflow cases.
  - `decode("abc-!")` => throws `"Invalid input"`.
  - `decode("ls8h=")` => `"Invalid input"`.
  - `decode("\x81-")` => `"Illegal input >= 0x80 (not a basic code point)"`.
  - `decode("\x81")` => `"Invalid input"`.
  - `decode("bb000000")` => `"Overflow: input needs wider integers to process"`.
  Source: `packages/common/semantic-web/test/idna/idna.test.ts:255-369`.
- `toASCII`/`toUnicode` domain and email conversions, roundtrip, ASCII passthrough. Source: `packages/common/semantic-web/test/idna/idna.test.ts:271-312`.
- `ucs2decode` and `ucs2encode` roundtrips, surrogate handling, non-mutation of input array. Source: `packages/common/semantic-web/test/idna/idna.test.ts:314-381`.
- Version exposure: `IDNA.version === "0.1.0"`. Source: `packages/common/semantic-web/test/idna/idna.test.ts:320`.
- Table-driven tests for:
  - `decode` over `testData.strings`.
  - `encode` over `testData.strings`.
  - `toUnicode` over `testData.domains` and `testData.strings` passthrough.
  - `toASCII` over `testData.domains` and `testData.strings` passthrough.
  - IDNA2003 separator support via `testData.separators`.
  Source: `packages/common/semantic-web/test/idna/idna.test.ts:382-468`.

## Import Sites

### `@beep/semantic-web/idna` (default export)

1. `packages/common/semantic-web/src/uri/uri.ts:38`
- Import: `import idna from "@beep/semantic-web/idna";` (default value).
- Usage: `idna.toASCII(...)` and `idna.toUnicode(...)` (synchronous methods on IDNA config instance).
  - `idna.toASCII` in parse normalization. Source: `packages/common/semantic-web/src/uri/uri.ts:355`.
  - `idna.toASCII`/`idna.toUnicode` in serialize. Source: `packages/common/semantic-web/src/uri/uri.ts:450-451`.

2. `packages/common/semantic-web/src/uri/schemes/mailto.ts:1`
- Import: `import idna from "@beep/semantic-web/idna";` (default value).
- Usage: `idna.toASCII(...)` and `idna.toUnicode(...)` during parse/serialize of mailto.
  - Parse: `idna.toASCII(...)`. Source: `packages/common/semantic-web/src/uri/schemes/mailto.ts:103`.
  - Serialize: `idna.toASCII(...)` or `idna.toUnicode(...)`. Source: `packages/common/semantic-web/src/uri/schemes/mailto.ts:137-138`.

### `@beep/semantic-web/idna/idna` (named imports)

1. `packages/common/semantic-web/test/idna/idna.test.ts:2`
- Import: `import { decode, encode, IDNA, toASCII, toUnicode, ucs2decode, ucs2encode } from "@beep/semantic-web/idna/idna";` (named).
- Usage: all synchronous function calls, plus `IDNA.version` property assertion.

### Local imports from `packages/common/semantic-web/src/idna/*`

1. `packages/common/semantic-web/src/idna/index.ts:1`
- Import: `import idna from "./idna";` (default value, re-exported as default).

2. `packages/common/semantic-web/src/idna/idna.ts:6-8`
- Imports: `IDNAError` from `"./errors.ts"`, `IDNAConfig` and `UCS2` from `"./model.ts"`.
- These are local internal dependencies; all usage is synchronous.

No other in-repo import sites found for `@beep/semantic-web/idna`, `@beep/semantic-web/idna/idna`, or `packages/common/semantic-web/src/idna/*` outside the files listed above. Evidence: `rg -n "@beep/semantic-web/idna" -S packages` and `rg -n "semantic-web/idna" -S packages`.

## Thrown Error Cases (IDNA)

From `packages/common/semantic-web/src/idna/idna.ts` via `IDNAError.new(...)`:

- `not-basic`:
  - Triggered in `decode` when an input character before the delimiter has code point >= 0x80.
  - Source: `packages/common/semantic-web/src/idna/idna.ts:199`.

- `invalid-input`:
  - Triggered in `decode` when `index >= inputLength` while decoding variable-length integer.
  - Triggered in `decode` when `basicToDigit(...) >= base` for a consumed character.
  - Sources: `packages/common/semantic-web/src/idna/idna.ts:216,222`.

- `overflow`:
  - Triggered in `decode` when `digit > (maxInt - i) / w`.
  - Triggered in `decode` when `w > maxInt / baseMinusT`.
  - Triggered in `decode` when `Math.floor(i / out) > maxInt - n`.
  - Triggered in `encode` when `m - n > (maxInt - delta) / handledCPCountPlusOne`.
  - Triggered in `encode` when `currentValue < n && ++delta > maxInt`.
  - Sources: `packages/common/semantic-web/src/idna/idna.ts:225,237,249,316,324`.

Notes:
- Error messages are defined in `ErrorType.MESSAGES` and surfaced via each error class `message` getter. Source: `packages/common/semantic-web/src/idna/errors.ts:20-31,45-71`.
