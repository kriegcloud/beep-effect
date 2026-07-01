/**
 * Incremental assistant-turn scan state helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsServerId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import { Match } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $AgentsServerId.create("AssistantTurn/ScanState");

/**
 * The carry state of the incremental block extractor between chunks.
 *
 * @example
 * ```ts
 * import { initialScanState } from "@beep/agents-server/AssistantTurn"
 * import type { ScanState } from "@beep/agents-server/AssistantTurn"
 *
 * const state: ScanState = initialScanState
 * console.log(state.depth)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ScanState extends S.Class<ScanState>($I`ScanState`)(
  {
    current: S.String.pipe(SchemaUtils.withKeyDefaults("")),
    depth: S.Finite.pipe(SchemaUtils.withKeyDefaults(0)),
    escaped: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false)),
    inBlocksArray: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false)),
    inString: S.Boolean.pipe(SchemaUtils.withKeyDefaults(false)),
  },
  $I.annote("ScanState", {
    description: "The carry state of the incremental block extractor between chunks.",
  })
) {}

/**
 * The empty scan state used to begin scanning a fresh structured-output stream.
 *
 * @example
 * ```ts
 * import { initialScanState } from "@beep/agents-server/AssistantTurn"
 *
 * console.log(initialScanState.inBlocksArray) // false
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const initialScanState = ScanState.make();

/**
 * Fold one chunk of structured-output JSON text into the scan state, returning
 * the next state plus any block element slices that completed within the chunk.
 *
 * @example
 * ```ts
 * import { initialScanState, scanChunk } from "@beep/agents-server/AssistantTurn"
 *
 * const envelope = '{"blocks":[{"type":"paragraph"}]}'
 * const [, completed] = scanChunk(initialScanState, envelope)
 * console.log(completed) // ['{"type":"paragraph"}']
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
// scanChunk is a byte-for-byte port of the POC's incremental JSON block scanner.
// Its branching is the brace/string/escape state machine itself and is locked
// down by a fast-check property test (test/scanChunk.test.ts); extracting helpers
// would scatter the single-pass state without reducing real complexity.
// fallow-ignore-next-line complexity
export const scanChunk = (state: ScanState, text: string): [ScanState, Array<string>] => {
  let { current, depth, escaped, inBlocksArray, inString } = state;
  const completed = A.empty<string>();
  for (const char of text) {
    if (depth > 0) current += char;
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    Match.value(char).pipe(
      Match.when(`"`, () => (inString = false)),
      Match.when("[", () => {
        if (!inBlocksArray) {
          inBlocksArray = true;
        } else if (depth > 0) {
          depth++;
        }
      }),
      Match.when("{", () => {
        if (inBlocksArray) {
          if (depth === 0) {
            current = "{";
          }
          depth++;
        }
      }),
      Match.whenOr("}", "]", () => {
        if (depth > 0) {
          depth--;
          if (depth === 0) {
            completed.push(current);
            current = "";
          }
        }
      }),
      Match.orElse(() => {})
    );
  }
  return [
    {
      inBlocksArray,
      depth,
      inString,
      escaped,
      current,
    },
    completed,
  ];
};
