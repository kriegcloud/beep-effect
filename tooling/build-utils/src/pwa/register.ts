/**
 * Client-side service worker registration script.
 *
 * This module handles automatic service worker registration, start URL caching,
 * front-end navigation caching, and online/offline state management.
 *
 * @module pwa/register
 *
 * @remarks
 * This file is injected into the main.js bundle at build time.
 * Global variables prefixed with __PWA_ are replaced by webpack's DefinePlugin.
 */

import { pipe } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { Workbox } from "workbox-window";

/**
 * Global PWA configuration variables injected at build time
 */
declare const __PWA_SW__: string;
declare const __PWA_SCOPE__: string;
declare const __PWA_ENABLE_REGISTER__: boolean;
declare const __PWA_START_URL__: string | undefined;
declare const __PWA_CACHE_ON_FRONT_END_NAV__: boolean;
declare const __PWA_RELOAD_ON_ONLINE__: boolean;

/**
 * Extend the Window interface to include workbox
 */
declare global {
  interface Window {
    workbox: Workbox;
  }
}

/**
 * Initialize service worker registration when running in browser context
 */
if (typeof window !== "undefined" && "serviceWorker" in navigator && typeof caches !== "undefined") {
  // Pre-populate start-url cache if not already present
  if (__PWA_START_URL__) {
    caches.has("start-url").then((has) => {
      if (!has) {
        caches.open("start-url").then((c) => c.put(__PWA_START_URL__, new Response("", { status: 200 })));
      }
    });
  }

  // Initialize Workbox with the service worker URL and scope
  window.workbox = new Workbox(window.location.origin + __PWA_SW__, {
    scope: __PWA_SCOPE__,
  });

  // Cache the start URL on first install (non-update)
  if (__PWA_START_URL__) {
    window.workbox.addEventListener("installed", async ({ isUpdate }) => {
      if (!isUpdate) {
        const cache = await caches.open("start-url");
        const response = await fetch(__PWA_START_URL__);

        // Handle redirected responses by creating a new response with OK status (pure conditional)
        const normalizedResponse = response.redirected
          ? new Response(response.body, {
              status: 200,
              statusText: "OK",
              headers: response.headers,
            })
          : response;

        await cache.put(__PWA_START_URL__, normalizedResponse);
      }
    });
  }

  // Cache Next.js data routes on service worker install
  window.workbox.addEventListener("installed", async () => {
    const data = pipe(
      window.performance.getEntriesByType("resource"),
      A.map((e) => e.name),
      A.filter(P.and(Str.startsWith(`${window.location.origin}/_next/data/`), Str.endsWith(".json")))
    );

    const cache = await caches.open("next-data");
    for (const d of data) {
      cache.add(d);
    }
  });

  // Auto-register service worker if enabled
  if (__PWA_ENABLE_REGISTER__) {
    window.workbox.register();
  }

  // Set up front-end navigation caching if enabled
  if (__PWA_CACHE_ON_FRONT_END_NAV__ || __PWA_START_URL__) {
    /**
     * Cache the URL on front-end navigation
     * @param url - The URL being navigated to
     */
    const cacheOnFrontEndNav = (url: string): Promise<void> | undefined => {
      if (!window.navigator.onLine) return undefined;

      if (__PWA_CACHE_ON_FRONT_END_NAV__ && url !== __PWA_START_URL__) {
        return caches.open("others").then((cache) =>
          cache.match(url, { ignoreSearch: true }).then((res) => {
            if (!res) return cache.add(url);
            return Promise.resolve();
          })
        );
      }
      if (__PWA_START_URL__ && url === __PWA_START_URL__) {
        return fetch(__PWA_START_URL__).then((response) => {
          if (!response.redirected) {
            return caches.open("start-url").then((cache) => cache.put(__PWA_START_URL__, response));
          }
          return Promise.resolve();
        });
      }
      return undefined;
    };

    // Override history.pushState to cache navigated URLs
    const originalPushState = history.pushState;
    history.pushState = (...args): void => {
      originalPushState.apply(history, args);
      if (typeof args[2] === "string") {
        cacheOnFrontEndNav(args[2]);
      }
    };

    // Override history.replaceState to cache navigated URLs
    const originalReplaceState = history.replaceState;
    history.replaceState = (...args): void => {
      originalReplaceState.apply(history, args);
      if (typeof args[2] === "string") {
        cacheOnFrontEndNav(args[2]);
      }
    };

    // Cache current page when coming back online
    window.addEventListener("online", () => {
      cacheOnFrontEndNav(window.location.pathname);
    });
  }

  // Reload page when coming back online if enabled
  if (__PWA_RELOAD_ON_ONLINE__) {
    window.addEventListener("online", () => {
      location.reload();
    });
  }
}

/**
 * Export the register script source code as a string for webpack compilation.
 * This allows the build process to inject this code into the main bundle.
 */
export const registerWorkerSource = `
import { Workbox } from 'workbox-window';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined') {
  if (__PWA_START_URL__) {
    caches.has('start-url').then(function (has) {
      if (!has) {
        caches.open('start-url').then(c => c.put(__PWA_START_URL__, new Response('', { status: 200 })));
      }
    });
  }

  window.workbox = new Workbox(window.location.origin + __PWA_SW__, { scope: __PWA_SCOPE__ });

  if (__PWA_START_URL__) {
    window.workbox.addEventListener('installed', async ({ isUpdate }) => {
      if (!isUpdate) {
        const cache = await caches.open('start-url');
        const response = await fetch(__PWA_START_URL__);
        const normalizedResponse = response.redirected
          ? new Response(response.body, { status: 200, statusText: 'OK', headers: response.headers })
          : response;
        await cache.put(__PWA_START_URL__, normalizedResponse);
      }
    });
  }

  window.workbox.addEventListener('installed', async () => {
    const data = window.performance
      .getEntriesByType('resource')
      .map(e => e.name)
      .filter(n => n.startsWith(\`\${window.location.origin}/_next/data/\`) && n.endsWith('.json'));
    const cache = await caches.open('next-data');
    data.forEach(d => cache.add(d));
  });

  if (__PWA_ENABLE_REGISTER__) {
    window.workbox.register();
  }

  if (__PWA_CACHE_ON_FRONT_END_NAV__ || __PWA_START_URL__) {
    const cacheOnFrontEndNav = function (url) {
      if (!window.navigator.onLine) return;
      if (__PWA_CACHE_ON_FRONT_END_NAV__ && url !== __PWA_START_URL__) {
        return caches.open('others').then(cache =>
          cache.match(url, { ignoreSearch: true }).then(res => {
            if (!res) return cache.add(url);
            return Promise.resolve();
          })
        );
      } else if (__PWA_START_URL__ && url === __PWA_START_URL__) {
        return fetch(__PWA_START_URL__).then(function (response) {
          if (!response.redirected) {
            return caches.open('start-url').then(cache => cache.put(__PWA_START_URL__, response));
          }
          return Promise.resolve();
        });
      }
    };

    const pushState = history.pushState;
    history.pushState = function () {
      pushState.apply(history, arguments);
      cacheOnFrontEndNav(arguments[2]);
    };

    const replaceState = history.replaceState;
    history.replaceState = function () {
      replaceState.apply(history, arguments);
      cacheOnFrontEndNav(arguments[2]);
    };

    window.addEventListener('online', () => {
      cacheOnFrontEndNav(window.location.pathname);
    });
  }

  if (__PWA_RELOAD_ON_ONLINE__) {
    window.addEventListener('online', () => {
      location.reload();
    });
  }
}
`;
