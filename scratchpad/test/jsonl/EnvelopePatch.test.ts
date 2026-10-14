import { Envelope, JsonlEvent } from "../../effected/jsonl/index.ts";
import { assert, describe, it } from "@effect/vitest";
import { assertFailure, assertSuccess } from "@effect/vitest/utils";
import * as DateTime from "effect/DateTime";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as SchemaAST from "effect/SchemaAST";
import * as Tuple from "effect/Tuple";

const at = DateTime.makeUnsafe(0);
class Payload extends S.Class<Payload>("jsonl/test/EnvelopePatch/Payload")({ count: S.Finite }) {}

describe("patch encoder declaration boundaries", () => {
  it("rejects non-record inputs through the class declaration parser", () => {
    const events = Tuple.make(JsonlEvent.make("patched", { data: Payload }));
    const input = { at, event: "patched", data: Payload.make({ count: 1 }) } as const;
    Reflect.set(input, "data", null);
    assertFailure(
      Result.mapError(Envelope.encodePatchResult(input, events), (error) => error._tag),
      "InvalidData"
    );
  });

  it("retains declarations without an encoding", () => {
    const events = Tuple.make(JsonlEvent.make("patched", { data: S.declare(P.isString) }));
    assertSuccess(
      Envelope.encodePatchResult({ at, event: "patched", data: "text" }, events),
      '{"at":"1970-01-01T00:00:00.000Z","event":"patched","data":"text"}\n'
    );
  });

  it("retains declarations whose encoding is not an object", () => {
    const events = Tuple.make(JsonlEvent.make("patched", { data: S.DateTimeUtcFromString }));
    assertSuccess(
      Envelope.encodePatchResult({ at, event: "patched", data: at }, events),
      '{"at":"1970-01-01T00:00:00.000Z","event":"patched","data":"1970-01-01T00:00:00.000Z"}\n'
    );
  });

  it("preserves an explicit encoding parser when rejecting a non-record", () => {
    const ast = Payload.ast;
    if (!SchemaAST.isDeclaration(ast)) return assert.fail("expected a class declaration");
    const codec = S.make<typeof Payload>(new SchemaAST.Declaration(
      ast.typeParameters,
      ast.run,
      ast.annotations,
      ast.checks,
      ast.encoding,
      ast.context,
      ast.encodingChecks,
      ast.run
    ));
    const events = Tuple.make(JsonlEvent.make("patched", { data: codec }));
    const input = { at, event: "patched", data: Payload.make({ count: 1 }) } as const;
    Reflect.set(input, "data", null);
    assertFailure(
      Result.mapError(Envelope.encodePatchResult(input, events), (error) => error._tag),
      "InvalidData"
    );
  });
});
