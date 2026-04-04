import { EditorClientConfig, normalizeSidecarBaseUrl } from "@beep/editor-client";
import { describe, expect, it } from "@effect/vitest";

describe("@beep/editor-client", () => {
  it("normalizes sidecar API roots back to the server origin", () => {
    expect(normalizeSidecarBaseUrl("http://127.0.0.1:8789/api/v0/")).toBe("http://127.0.0.1:8789");
  });

  it("constructs validated client configuration values", () => {
    const config = new EditorClientConfig({
      baseUrl: "http://127.0.0.1:8789",
      sessionId: "editor-session",
    });

    expect(config.baseUrl).toBe("http://127.0.0.1:8789");
    expect(config.sessionId).toBe("editor-session");
  });
});
