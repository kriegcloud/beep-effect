/**
 * Service Worker fallback handler for offline responses.
 *
 * This module provides a fallback function that returns cached offline
 * responses based on the request destination type.
 *
 * @module pwa/fallback
 *
 * @remarks
 * This file is compiled separately by webpack and injected into the service worker.
 * The process.env variables are replaced at build time by webpack's EnvironmentPlugin.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
 */
import * as Match from "effect/Match";

declare const self: ServiceWorkerGlobalScope & {
  fallback: (request: Request) => Promise<Response | undefined>;
};

declare const caches: CacheStorage;

/**
 * Environment variables injected at build time
 */
declare const process: {
  env: {
    __PWA_FALLBACK_DOCUMENT__?: string;
    __PWA_FALLBACK_IMAGE__?: string;
    __PWA_FALLBACK_AUDIO__?: string;
    __PWA_FALLBACK_VIDEO__?: string;
    __PWA_FALLBACK_FONT__?: string;
    __PWA_FALLBACK_DATA__?: string;
  };
};

/**
 * Helper to match cache if env var is set.
 */
const matchCacheIfEnv = (envVar: string | undefined): Promise<Response | undefined> | undefined =>
  envVar ? caches.match(envVar, { ignoreSearch: true }) : undefined;

/**
 * Fallback function that returns cached offline responses based on request destination.
 *
 * @param request - The failed request to provide a fallback for
 * @returns A cached response if available, or an error response
 *
 * @example
 * ```typescript
 * // In a workbox plugin's handlerDidError callback:
 * handlerDidError: async ({ request }) => self.fallback(request)
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
 */
// Only register the fallback function when running in a ServiceWorker context
// This guard prevents errors when the module is imported during Node.js build
if (typeof self !== "undefined" && "ServiceWorkerGlobalScope" in self) {
  self.fallback = (request: Request): Promise<Response | undefined> =>
    Match.value(request.destination).pipe(
      Match.when("document", () => matchCacheIfEnv(process.env.__PWA_FALLBACK_DOCUMENT__)),
      Match.when("image", () => matchCacheIfEnv(process.env.__PWA_FALLBACK_IMAGE__)),
      Match.when("audio", () => matchCacheIfEnv(process.env.__PWA_FALLBACK_AUDIO__)),
      Match.when("video", () => matchCacheIfEnv(process.env.__PWA_FALLBACK_VIDEO__)),
      Match.when("font", () => matchCacheIfEnv(process.env.__PWA_FALLBACK_FONT__)),
      Match.when("", () => {
        // Empty string indicates a fetch() call for data (e.g., Next.js data routes)
        if (process.env.__PWA_FALLBACK_DATA__ && request.url.match(/\/_next\/data\/.+\/.+\.json$/i)) {
          return caches.match(process.env.__PWA_FALLBACK_DATA__, { ignoreSearch: true });
        }
        return undefined;
      }),
      Match.orElse(() => undefined)
    ) ?? Promise.resolve(Response.error());
}

/**
 * Export the fallback source code as a string for webpack compilation.
 * This allows the build process to compile this file separately.
 */
export const fallbackWorkerSource = `
'use strict';

self.fallback = async (request) => {
  switch (request.destination) {
    case 'document':
      if (process.env.__PWA_FALLBACK_DOCUMENT__)
        return caches.match(process.env.__PWA_FALLBACK_DOCUMENT__, { ignoreSearch: true });
      break;
    case 'image':
      if (process.env.__PWA_FALLBACK_IMAGE__)
        return caches.match(process.env.__PWA_FALLBACK_IMAGE__, { ignoreSearch: true });
      break;
    case 'audio':
      if (process.env.__PWA_FALLBACK_AUDIO__)
        return caches.match(process.env.__PWA_FALLBACK_AUDIO__, { ignoreSearch: true });
      break;
    case 'video':
      if (process.env.__PWA_FALLBACK_VIDEO__)
        return caches.match(process.env.__PWA_FALLBACK_VIDEO__, { ignoreSearch: true });
      break;
    case 'font':
      if (process.env.__PWA_FALLBACK_FONT__)
        return caches.match(process.env.__PWA_FALLBACK_FONT__, { ignoreSearch: true });
      break;
    case '':
      if (process.env.__PWA_FALLBACK_DATA__ && request.url.match(/\\/_next\\/data\\/.+\\/.+\\.json$/i))
        return caches.match(process.env.__PWA_FALLBACK_DATA__, { ignoreSearch: true });
      break;
    default:
      return Response.error();
  }
  return Response.error();
};
`;
