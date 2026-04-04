import {
  EditorControlPlaneApi,
  PageSlugParams,
  SidecarBadRequest,
  SidecarInternalError,
  SidecarNotFound,
} from "@beep/editor-protocol";
import { Struct } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import type * as S from "effect/Schema";

const getHttpStatus = (schema: S.Top): number | undefined =>
  Struct.dotGet(schema, ["ast", "annotations", "httpApiStatus"] as const) as number | undefined;

describe("@beep/editor-protocol", () => {
  it("preserves explicit HTTP status annotations on control-plane schemas", () => {
    expect(getHttpStatus(SidecarBadRequest)).toBe(400);
    expect(getHttpStatus(SidecarNotFound)).toBe(404);
    expect(getHttpStatus(SidecarInternalError)).toBe(500);
  });

  it("exposes the public editor control-plane contracts", () => {
    expect(typeof EditorControlPlaneApi).toBe("function");
    expect(typeof PageSlugParams).toBe("function");
  });
});
