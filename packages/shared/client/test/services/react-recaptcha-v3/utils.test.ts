import { afterEach, describe, expect, it } from "bun:test";
import { loadScriptEffect } from "@beep/shared-client/services/react-recaptcha-v3/utils";
import * as Effect from "effect/Effect";

describe("loadScriptEffect", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("should append script to head when appendTo is head", () => {
    Effect.runSync(
      loadScriptEffect({
        async: true,
        appendTo: "head",
        defer: true,
        id: "test-script",
        nonce: "test-nonce",
        src: "https://example.com/script.js",
      })
    );

    const script = document.head.querySelector(
      'script[src="https://example.com/script.js"]'
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();

    if (!script) {
      throw new Error("Script not found");
    }

    expect(script.hasAttribute("async")).toBe(true);
    expect(script.hasAttribute("defer")).toBe(true);
    expect(script.getAttribute("id")).toBe("test-script");
    expect(script.getAttribute("nonce")).toBe("test-nonce");
    expect(script.getAttribute("src")).toBe("https://example.com/script.js");
  });

  it("should append script to body when appendTo is body", () => {
    Effect.runSync(
      loadScriptEffect({
        async: true,
        appendTo: "body",
        defer: true,
        id: "test-script",
        nonce: "test-nonce",
        src: "https://example.com/script.js",
      })
    );

    const script = document.body.querySelector(
      'script[src="https://example.com/script.js"]'
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();

    if (!script) {
      throw new Error("Script not found");
    }

    expect(script.hasAttribute("async")).toBe(true);
    expect(script.hasAttribute("defer")).toBe(true);
    expect(script.getAttribute("id")).toBe("test-script");
    expect(script.getAttribute("nonce")).toBe("test-nonce");
    expect(script.getAttribute("src")).toBe("https://example.com/script.js");
  });

  it("should not set async and defer if they are undefined", () => {
    Effect.runSync(
      loadScriptEffect({
        appendTo: "head",
        id: "test-script",
        src: "https://example.com/script.js",
      })
    );

    const script = document.head.querySelector(
      'script[src="https://example.com/script.js"]'
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();

    if (!script) {
      throw new Error("Script not found");
    }

    expect(script.hasAttribute("async")).toBe(false);
    expect(script.hasAttribute("defer")).toBe(false);
  });
});
