import { EditorRuntimeConfig, loadEditorRuntimeConfig, runEditorRuntime } from "@beep/editor-runtime";
import { describe, expect, it } from "@effect/vitest";

describe("@beep/editor-runtime", () => {
  it("exports the runtime entrypoints", () => {
    expect(typeof runEditorRuntime).toBe("function");
    expect(typeof loadEditorRuntimeConfig).toBe("function");
  });

  it("constructs validated runtime configuration values", () => {
    const config = new EditorRuntimeConfig({
      host: "127.0.0.1",
      port: 8789,
      appDataDir: "/tmp/beep-editor-runtime",
      sessionId: "editor-runtime-session",
      version: "0.0.0",
    });

    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(8789);
    expect(config.sessionId).toBe("editor-runtime-session");
  });
});
