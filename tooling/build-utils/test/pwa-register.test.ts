import { registerWorkerSource } from "@beep/build-utils/pwa/register";
import { describe, expect, it } from "@beep/testkit";

describe("registerWorkerSource", () => {
  describe("source code structure", () => {
    it("should be a non-empty string", () => {
      expect(typeof registerWorkerSource).toBe("string");
      expect(registerWorkerSource.length).toBeGreaterThan(0);
    });

    it("should import Workbox from workbox-window", () => {
      expect(registerWorkerSource).toContain("import { Workbox } from 'workbox-window'");
    });

    it("should check for browser context", () => {
      expect(registerWorkerSource).toContain("typeof window !== 'undefined'");
      expect(registerWorkerSource).toContain("'serviceWorker' in navigator");
      expect(registerWorkerSource).toContain("typeof caches !== 'undefined'");
    });
  });

  describe("start-url caching", () => {
    it("should check for __PWA_START_URL__ variable", () => {
      expect(registerWorkerSource).toContain("__PWA_START_URL__");
    });

    it("should pre-populate start-url cache", () => {
      expect(registerWorkerSource).toContain("caches.has('start-url')");
      expect(registerWorkerSource).toContain("caches.open('start-url')");
    });

    it("should handle redirected responses with pure conditional", () => {
      expect(registerWorkerSource).toContain("response.redirected");
      expect(registerWorkerSource).toContain("new Response(response.body");
      expect(registerWorkerSource).toContain("status: 200");
      expect(registerWorkerSource).toContain("statusText: 'OK'");
    });
  });

  describe("Workbox initialization", () => {
    it("should create Workbox instance with service worker URL and scope", () => {
      expect(registerWorkerSource).toContain("window.workbox = new Workbox");
      expect(registerWorkerSource).toContain("window.location.origin + __PWA_SW__");
      expect(registerWorkerSource).toContain("scope: __PWA_SCOPE__");
    });

    it("should listen for installed event", () => {
      expect(registerWorkerSource).toContain("addEventListener('installed'");
    });

    it("should check for isUpdate on installation", () => {
      expect(registerWorkerSource).toContain("isUpdate");
    });
  });

  describe("Next.js data caching", () => {
    it("should cache Next.js data routes on install", () => {
      expect(registerWorkerSource).toContain("caches.open('next-data')");
    });

    it("should filter resources for /_next/data/ JSON files", () => {
      expect(registerWorkerSource).toContain("/_next/data/");
      expect(registerWorkerSource).toContain(".json");
    });

    it("should use performance.getEntriesByType for resource entries", () => {
      expect(registerWorkerSource).toContain("window.performance");
      expect(registerWorkerSource).toContain("getEntriesByType('resource')");
    });
  });

  describe("auto-registration", () => {
    it("should check __PWA_ENABLE_REGISTER__ before registering", () => {
      expect(registerWorkerSource).toContain("if (__PWA_ENABLE_REGISTER__)");
      expect(registerWorkerSource).toContain("window.workbox.register()");
    });
  });

  describe("front-end navigation caching", () => {
    it("should check __PWA_CACHE_ON_FRONT_END_NAV__ flag", () => {
      expect(registerWorkerSource).toContain("__PWA_CACHE_ON_FRONT_END_NAV__");
    });

    it("should define cacheOnFrontEndNav function", () => {
      expect(registerWorkerSource).toContain("cacheOnFrontEndNav = function");
    });

    it("should check navigator.onLine before caching", () => {
      expect(registerWorkerSource).toContain("window.navigator.onLine");
    });

    it("should cache to 'others' cache for non-start URLs", () => {
      expect(registerWorkerSource).toContain("caches.open('others')");
    });

    it("should override history.pushState", () => {
      expect(registerWorkerSource).toContain("history.pushState = function");
    });

    it("should override history.replaceState", () => {
      expect(registerWorkerSource).toContain("history.replaceState = function");
    });

    it("should listen for online event to cache current page", () => {
      expect(registerWorkerSource).toContain("addEventListener('online'");
      expect(registerWorkerSource).toContain("window.location.pathname");
    });
  });

  describe("reload on online", () => {
    it("should check __PWA_RELOAD_ON_ONLINE__ flag", () => {
      expect(registerWorkerSource).toContain("__PWA_RELOAD_ON_ONLINE__");
    });

    it("should reload page when coming back online if enabled", () => {
      expect(registerWorkerSource).toContain("location.reload()");
    });
  });

  describe("PWA configuration variables", () => {
    it("should reference all expected global PWA variables", () => {
      const expectedVariables = [
        "__PWA_SW__",
        "__PWA_SCOPE__",
        "__PWA_ENABLE_REGISTER__",
        "__PWA_START_URL__",
        "__PWA_CACHE_ON_FRONT_END_NAV__",
        "__PWA_RELOAD_ON_ONLINE__",
      ];

      for (const variable of expectedVariables) {
        expect(registerWorkerSource).toContain(variable);
      }
    });
  });
});
