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

import type { Workbox } from "workbox-window";

/**
 * Extend the Window interface to include workbox
 */
declare global {
  interface Window {
    workbox: Workbox;
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
