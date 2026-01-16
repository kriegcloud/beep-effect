import { existsSync } from "node:fs";
import { Effect } from "effect";
import { chromium } from "playwright-core";
import { PlaywrightError } from "./errors";

export const useHelper =
  <Wrap>(api: Wrap) =>
  <A>(userFunction: (api: Wrap) => Promise<A>) =>
    Effect.tryPromise(() => userFunction(api)).pipe(Effect.mapError(PlaywrightError.wrap));

/**
 * Checks if Playwright browsers are installed.
 * Use this to conditionally skip tests when browsers aren't available.
 *
 * @example
 * ```ts
 * import { describe } from "bun:test";
 * import { isPlaywrightAvailable } from "@beep/testkit/playwright/utils";
 *
 * describe.skipIf(!isPlaywrightAvailable)("Playwright tests", () => {
 *   // tests that require browser
 * });
 * ```
 */
export const isPlaywrightAvailable: boolean = (() => {
  try {
    const executablePath = chromium.executablePath();
    return existsSync(executablePath);
  } catch {
    return false;
  }
})();
