import { fallbackWorkerSource } from "@beep/build-utils/pwa/fallback";
import { describe, expect, it } from "@beep/testkit";

describe("fallbackWorkerSource", () => {
  describe("source code structure", () => {
    it("should be a non-empty string", () => {
      expect(typeof fallbackWorkerSource).toBe("string");
      expect(fallbackWorkerSource.length).toBeGreaterThan(0);
    });

    it("should use strict mode", () => {
      expect(fallbackWorkerSource).toContain("'use strict'");
    });

    it("should define self.fallback as async function", () => {
      expect(fallbackWorkerSource).toContain("self.fallback = async (request)");
    });
  });

  describe("request destination handling", () => {
    it("should use switch statement on request.destination", () => {
      expect(fallbackWorkerSource).toContain("switch (request.destination)");
    });

    it("should handle 'document' destination", () => {
      expect(fallbackWorkerSource).toContain("case 'document':");
      expect(fallbackWorkerSource).toContain("process.env.__PWA_FALLBACK_DOCUMENT__");
    });

    it("should handle 'image' destination", () => {
      expect(fallbackWorkerSource).toContain("case 'image':");
      expect(fallbackWorkerSource).toContain("process.env.__PWA_FALLBACK_IMAGE__");
    });

    it("should handle 'audio' destination", () => {
      expect(fallbackWorkerSource).toContain("case 'audio':");
      expect(fallbackWorkerSource).toContain("process.env.__PWA_FALLBACK_AUDIO__");
    });

    it("should handle 'video' destination", () => {
      expect(fallbackWorkerSource).toContain("case 'video':");
      expect(fallbackWorkerSource).toContain("process.env.__PWA_FALLBACK_VIDEO__");
    });

    it("should handle 'font' destination", () => {
      expect(fallbackWorkerSource).toContain("case 'font':");
      expect(fallbackWorkerSource).toContain("process.env.__PWA_FALLBACK_FONT__");
    });

    it("should handle empty string destination for fetch/data requests", () => {
      expect(fallbackWorkerSource).toContain("case '':");
      expect(fallbackWorkerSource).toContain("process.env.__PWA_FALLBACK_DATA__");
    });
  });

  describe("Next.js data route handling", () => {
    it("should match Next.js data route pattern", () => {
      expect(fallbackWorkerSource).toContain("request.url.match");
      // The regex uses \/ for forward slashes in the source string
      expect(fallbackWorkerSource).toContain("_next");
      expect(fallbackWorkerSource).toContain("data");
      expect(fallbackWorkerSource).toContain(".json");
    });

    it("should use regex for data route matching", () => {
      // The source contains a regex literal with escaped slashes
      expect(fallbackWorkerSource).toMatch(/request\.url\.match\(\/.*_next.*data.*json/);
    });
  });

  describe("cache matching", () => {
    it("should use caches.match with ignoreSearch option", () => {
      expect(fallbackWorkerSource).toContain("caches.match");
      expect(fallbackWorkerSource).toContain("ignoreSearch: true");
    });
  });

  describe("error response handling", () => {
    it("should return Response.error() as default", () => {
      expect(fallbackWorkerSource).toContain("default:");
      expect(fallbackWorkerSource).toContain("return Response.error()");
    });

    it("should return Response.error() at the end if no match", () => {
      const lines = fallbackWorkerSource.split("\n");
      const lastNonEmptyLines = lines.filter((l) => l.trim().length > 0).slice(-3);
      const lastContent = lastNonEmptyLines.join("\n");
      expect(lastContent).toContain("return Response.error()");
    });
  });

  describe("fallback environment variables", () => {
    it("should reference all expected fallback environment variables", () => {
      const expectedVariables = [
        "__PWA_FALLBACK_DOCUMENT__",
        "__PWA_FALLBACK_IMAGE__",
        "__PWA_FALLBACK_AUDIO__",
        "__PWA_FALLBACK_VIDEO__",
        "__PWA_FALLBACK_FONT__",
        "__PWA_FALLBACK_DATA__",
      ];

      for (const variable of expectedVariables) {
        expect(fallbackWorkerSource).toContain(`process.env.${variable}`);
      }
    });
  });
});
