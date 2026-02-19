import type { Page } from "playwright-core";

/**
 * Registry for PlaywrightPage.make to break the circular dependency between
 * page.ts and common.ts.
 *
 * - common.ts imports from this file to get the maker function
 * - page.ts registers its maker function here at module load time
 *
 * @internal
 */

type PageMaker<T> = (page: Page) => T;

let _pageMaker: PageMaker<unknown> | undefined;

/**
 * Registers the page maker function. Called by page.ts at module load time.
 * @internal
 */
export const registerPageMaker = <T>(maker: PageMaker<T>): void => {
  _pageMaker = maker;
};

/**
 * Creates a wrapped page using the registered maker.
 * @internal
 */
export const makePage = <T>(page: Page): T => {
  if (!_pageMaker) {
    throw new Error(
      "PlaywrightPage maker not registered. Ensure page.ts is imported before using common.ts page methods."
    );
  }
  return _pageMaker(page) as T;
};
