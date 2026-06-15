import { IssueReport, makeRepairInvalidBlocks } from "@beep/agents-server/AssistantTurn";
import { BlockRepairFailed } from "@beep/agents-use-cases/server";
import { RepairError } from "@beep/anthropic";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const invalidParagraph = IssueReport.make({
  index: 0,
  raw: '{"type":"paragraph","children":[{"type":"text","text":1}]}',
  report: "/children/0/text Expected string",
});

const validParagraphReportedInvalid = IssueReport.make({
  index: 0,
  raw: '{"type":"paragraph","children":[{"type":"text","text":"Already valid"}]}',
  report: "synthetic upstream validation issue",
});

describe("BlockRepair", () => {
  it.effect(
    "emits repaired blocks returned by a valid repair envelope",
    Effect.fnUntraced(function* () {
      const repair = makeRepairInvalidBlocks(() =>
        Effect.succeed(
          '{"repairs":[{"index":0,"block":{"type":"paragraph","children":[{"type":"text","text":"Fixed"}]}}]}'
        )
      );

      const repaired = yield* repair([invalidParagraph]);
      expect(A.length(repaired)).toBe(1);

      const first = A.head(repaired);
      expect(O.isSome(first)).toBe(true);
      if (O.isSome(first)) {
        expect(first.value.index).toBe(0);
        expect(first.value.block.type).toBe("paragraph");
      }
    })
  );

  it.effect(
    "drops blocks missing from the repair envelope",
    Effect.fnUntraced(function* () {
      const repair = makeRepairInvalidBlocks(() => Effect.succeed('{"repairs":[]}'));
      const repaired = yield* repair([invalidParagraph]);

      expect(A.isReadonlyArrayEmpty(repaired)).toBe(true);
    })
  );

  it.effect(
    "keeps codec-valid repaired blocks even when the patch is empty",
    Effect.fnUntraced(function* () {
      const repair = makeRepairInvalidBlocks(() =>
        Effect.succeed(
          '{"repairs":[{"index":0,"block":{"type":"paragraph","children":[{"type":"text","text":"Already valid"}]}}]}'
        )
      );

      const repaired = yield* repair([validParagraphReportedInvalid]);

      expect(A.length(repaired)).toBe(1);
      expect(repaired[0]?.block.type).toBe("paragraph");
    })
  );

  it.effect(
    "maps a failed repair call to BlockRepairFailed",
    Effect.fnUntraced(function* () {
      const repair = makeRepairInvalidBlocks(() =>
        Effect.fail(RepairError.make({ message: "model unavailable", operation: "generate_tool_json" }))
      );
      const exit = yield* Effect.exit(repair([invalidParagraph]));

      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        const error = Cause.findErrorOption(exit.cause);
        expect(O.isSome(error)).toBe(true);
        if (O.isSome(error)) {
          expect(S.is(BlockRepairFailed)(error.value)).toBe(true);
        }
      }
    })
  );
});
