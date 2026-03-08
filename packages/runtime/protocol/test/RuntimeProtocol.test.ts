import {
  InterruptRepoRun,
  RepoRegistrationCreated,
  RepoRunRpcGroup,
  ResumeRepoRun,
  SidecarBadRequest,
  SidecarInternalError,
  SidecarNotFound,
} from "@beep/runtime-protocol";
import { Struct } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";
import type * as S from "effect/Schema";

const getHttpStatus = (schema: S.Top): number | undefined =>
  Struct.dotGet(schema, ["ast", "annotations", "httpApiStatus"] as const) as number | undefined;

describe("runtime protocol", () => {
  it("preserves explicit HTTP status annotations on control-plane schemas", () => {
    expect(getHttpStatus(RepoRegistrationCreated)).toBe(201);
    expect(getHttpStatus(SidecarBadRequest)).toBe(400);
    expect(getHttpStatus(SidecarNotFound)).toBe(404);
    expect(getHttpStatus(SidecarInternalError)).toBe(500);
  });

  it("exposes interrupt and resume RPC members on the public run group", () => {
    const handlers = RepoRunRpcGroup.of({
      InterruptRepoRun: (_payload) => Effect.die("unused"),
      ResumeRepoRun: (_payload) => Effect.die("unused"),
      StartIndexRepoRun: (_payload) => Effect.die("unused"),
      StartQueryRepoRun: (_payload) => Effect.die("unused"),
      StreamRunEvents: (_payload) => Stream.die("unused"),
    });

    expect(typeof InterruptRepoRun).toBe("function");
    expect(typeof ResumeRepoRun).toBe("function");
    expect(typeof handlers.InterruptRepoRun).toBe("function");
    expect(typeof handlers.ResumeRepoRun).toBe("function");
  });
});
