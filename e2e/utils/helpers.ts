import { assert } from "@beep/testkit";
import type { PlaywrightLocatorService } from "@beep/testkit/playwright/locator";
import type { PlaywrightPageService } from "@beep/testkit/playwright/page";
import * as Effect from "effect/Effect";

// -----------------------------------------------------------------------------
// Locator Helpers (Synchronous - return locator services)
// -----------------------------------------------------------------------------

export const findAllTabSets = (page: PlaywrightPageService) => {
  return page.locator(".flexlayout__tabset");
};

export const findPath = (page: PlaywrightPageService, path: string) => {
  return page.locator(`[data-layout-path="${path}"]`);
};

export const findTabButton = (page: PlaywrightPageService, path: string, index: number) => {
  return findPath(page, `${path}/tb${index}`);
};

// -----------------------------------------------------------------------------
// Check Helpers (Effect-returning)
// -----------------------------------------------------------------------------

export const checkTab = (
  page: PlaywrightPageService,
  path: string,
  index: number,
  selected: boolean,
  text: string
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const tabButton = findTabButton(page, path, index);
    const tabContent = findPath(page, `${path}/t${index}`);

    // Check tab button visibility
    const isVisible = yield* tabButton.use((l) => l.isVisible());
    assert(isVisible, `Tab button at ${path}/tb${index} should be visible`);

    // Check selected/unselected class
    const className = yield* tabButton.use((l) => l.getAttribute("class"));
    const expectedClass = selected
      ? "flexlayout__tab_button--selected"
      : "flexlayout__tab_button--unselected";
    assert(
      className?.includes(expectedClass),
      `Tab button should have class ${expectedClass}`
    );

    // Check button text content
    const buttonContentLocator = tabButton
      .locator(".flexlayout__tab_button_content")
      .first();
    const buttonText = yield* buttonContentLocator.textContent();
    assert(
      buttonText?.includes(text),
      `Tab button content should contain "${text}"`
    );

    // Check tab content visibility (visible only when selected)
    const contentVisible = yield* tabContent.use((l) => l.isVisible());
    assert(
      contentVisible === selected,
      `Tab content visibility should be ${selected}`
    );

    // Check tab content text
    const contentText = yield* tabContent.textContent();
    assert(
      contentText?.includes(text),
      `Tab content should contain "${text}"`
    );
  });

export const checkBorderTab = (
  page: PlaywrightPageService,
  path: string,
  index: number,
  selected: boolean,
  text: string
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const tabButton = findTabButton(page, path, index);
    const tabContent = findPath(page, `${path}/t${index}`);

    // Check tab button visibility
    const isVisible = yield* tabButton.use((l) => l.isVisible());
    assert(isVisible, `Border tab button at ${path}/tb${index} should be visible`);

    // Check selected/unselected class
    const className = yield* tabButton.use((l) => l.getAttribute("class"));
    const expectedClass = selected
      ? "flexlayout__border_button--selected"
      : "flexlayout__border_button--unselected";
    assert(
      className?.includes(expectedClass),
      `Border tab button should have class ${expectedClass}`
    );

    // Check button text content
    const buttonContentLocator = tabButton
      .locator(".flexlayout__border_button_content")
      .first();
    const buttonText = yield* buttonContentLocator.textContent();
    assert(
      buttonText?.includes(text),
      `Border tab button content should contain "${text}"`
    );

    // Check tab content (only visible when selected)
    if (selected) {
      const contentVisible = yield* tabContent.use((l) => l.isVisible());
      assert(contentVisible, `Selected border tab content should be visible`);

      const contentText = yield* tabContent.textContent();
      assert(
        contentText?.includes(text),
        `Border tab content should contain "${text}"`
      );
    }
  });

// -----------------------------------------------------------------------------
// Location Constants
// -----------------------------------------------------------------------------

export const Location = {
  CENTER: 0,
  TOP: 1,
  BOTTOM: 2,
  LEFT: 3,
  RIGHT: 4,
  LEFTEDGE: 5,
} as const;

export type LocationValue = (typeof Location)[keyof typeof Location];

function getLocation(
  rect: { x: number; y: number; width: number; height: number },
  loc: LocationValue
) {
  switch (loc) {
    case Location.CENTER:
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    case Location.TOP:
      return { x: rect.x + rect.width / 2, y: rect.y + 5 };
    case Location.BOTTOM:
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height - 5 };
    case Location.LEFT:
      return { x: rect.x + 5, y: rect.y + rect.height / 2 };
    case Location.RIGHT:
      return { x: rect.x + rect.width - 5, y: rect.y + rect.height / 2 };
    case Location.LEFTEDGE:
      return { x: rect.x, y: rect.y + rect.height / 2 };
    default:
      throw new Error(`Unknown location: ${loc}`);
  }
}

// -----------------------------------------------------------------------------
// Drag Helpers (Effect-returning with escape hatch for mouse operations)
// -----------------------------------------------------------------------------

export const drag = (
  page: PlaywrightPageService,
  from: PlaywrightLocatorService,
  to: PlaywrightLocatorService,
  loc: LocationValue
): Effect.Effect<void> =>
  Effect.gen(function* () {
    // Get bounding boxes using escape hatch
    const fr = yield* from.use((l) => l.boundingBox());
    const tr = yield* to.use((l) => l.boundingBox());

    if (!fr || !tr) {
      return yield* Effect.fail(new Error("Could not get bounding boxes"));
    }

    const cf = getLocation(fr, Location.CENTER);
    const ct = getLocation(tr, loc);

    // Mouse operations MUST use page.use() escape hatch
    yield* page.use(async (p) => {
      await p.mouse.move(cf.x, cf.y);
      await p.mouse.down();
      await p.mouse.move(ct.x, ct.y, { steps: 10 });
      await p.mouse.up();
    });
  });

export const dragToEdge = (
  page: PlaywrightPageService,
  from: PlaywrightLocatorService,
  edgeIndex: number
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const fr = yield* from.use((l) => l.boundingBox());
    if (!fr) {
      return yield* Effect.fail(new Error("Could not get bounding box for source"));
    }

    const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };

    // Start move and get edge rect
    yield* page.use(async (p) => {
      await p.mouse.move(cf.x, cf.y);
      await p.mouse.down();
      await p.mouse.move(cf.x + 10, cf.y + 10); // start move to make edges show
    });

    // Get edge locator and bounding box
    const edgeRects = page.locator(".flexlayout__edge_rect");
    const edge = edgeRects.nth(edgeIndex);
    const tr = yield* edge.use((l) => l.boundingBox());

    if (!tr) {
      // Clean up mouse state
      yield* page.use(async (p) => {
        await p.mouse.up();
      });
      return yield* Effect.fail(new Error("Could not get bounding box for edge"));
    }

    const ct = { x: tr.x + tr.width / 2, y: tr.y + tr.height / 2 };

    yield* page.use(async (p) => {
      await p.mouse.move(ct.x, ct.y, { steps: 10 });
      await p.mouse.up();
    });
  });

export const dragSplitter = (
  page: PlaywrightPageService,
  from: PlaywrightLocatorService,
  upDown: boolean,
  distance: number
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const fr = yield* from.use((l) => l.boundingBox());
    if (!fr) {
      return yield* Effect.fail(new Error("Could not get bounding box for splitter"));
    }

    const cf = { x: fr.x + fr.width / 2, y: fr.y + fr.height / 2 };
    const ct = {
      x: cf.x + (upDown ? 0 : distance),
      y: cf.y + (upDown ? distance : 0),
    };

    yield* page.use(async (p) => {
      await p.mouse.move(cf.x, cf.y);
      await p.mouse.down();
      await p.mouse.move(ct.x, ct.y, { steps: 10 });
      await p.mouse.up();
    });
  });
