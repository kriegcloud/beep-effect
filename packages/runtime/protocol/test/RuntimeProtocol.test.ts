import {
  RepoRegistrationCreated,
  SidecarBadRequest,
  SidecarInternalError,
  SidecarNotFound,
} from "@beep/runtime-protocol";
import { Struct } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
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
});
