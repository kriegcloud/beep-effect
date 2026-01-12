import { expect, test } from "@playwright/test";
import {
  checkBorderTab,
  checkTab,
  drag,
  dragSplitter,
  dragToEdge,
  findAllTabSets,
  findPath,
  findTabButton,
  Location,
} from "./utils";

test.use({ baseURL: "http://localhost:3001" });

// -----------------------------------------------------------------------------
// Drag Tests
// -----------------------------------------------------------------------------

test.describe("drag tests (test_two_tabs)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("drag tab One to right of Two", async ({ page }) => {
    // Initial state: One in first tabset, Two in second tabset
    await checkTab(page, "/ts0", 0, true, "One");
    await checkTab(page, "/ts1", 0, true, "Two");

    // Drag One to right side of Two's tabset
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.RIGHT);

    // Now should have: Two in first tabset, One in new second tabset
    await checkTab(page, "/ts0", 0, true, "Two");
    await checkTab(page, "/ts1", 0, true, "One");
  });

  test("drag tab One to center of Two's tabset", async ({ page }) => {
    await checkTab(page, "/ts0", 0, true, "One");
    await checkTab(page, "/ts1", 0, true, "Two");

    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.CENTER);

    // Both tabs should now be in the same tabset
    const tabSets = findAllTabSets(page);
    await expect(tabSets).toHaveCount(1);

    await checkTab(page, "/ts0", 0, false, "Two");
    await checkTab(page, "/ts0", 1, true, "One");
  });

  test("drag tab One to top of Two's tabset", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.TOP);

    // One should be above Two now (in a vertical row)
    await checkTab(page, "/r0/ts0", 0, true, "One");
    await checkTab(page, "/r0/ts1", 0, true, "Two");
  });

  test("drag tab One to bottom of Two's tabset", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.BOTTOM);

    // One should be below Two
    await checkTab(page, "/r0/ts0", 0, true, "Two");
    await checkTab(page, "/r0/ts1", 0, true, "One");
  });

  test("drag tab One to left of Two's tabset", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.LEFT);

    // One and Two side by side, One on left
    await checkTab(page, "/ts0", 0, true, "One");
    await checkTab(page, "/ts1", 0, true, "Two");
  });

  test("drag tab to left edge creates new tabset at edge", async ({ page }) => {
    const tabTwo = findTabButton(page, "/ts1", 0);
    await dragToEdge(page, tabTwo, 0);

    // Two should be in a new tabset at the left edge
    await checkTab(page, "/ts0", 0, true, "Two");
    await checkTab(page, "/ts1", 0, true, "One");
  });
});

// -----------------------------------------------------------------------------
// Three Tabs Tests
// -----------------------------------------------------------------------------

test.describe("three tabs tests (test_three_tabs)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_three_tabs");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("initial layout has three tabsets", async ({ page }) => {
    const tabSets = findAllTabSets(page);
    await expect(tabSets).toHaveCount(3);

    await checkTab(page, "/ts0", 0, true, "One");
    await checkTab(page, "/ts1", 0, true, "Two");
    await checkTab(page, "/ts2", 0, true, "Three");
  });

  test("drag One to center of Two", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.CENTER);

    const tabSets = findAllTabSets(page);
    await expect(tabSets).toHaveCount(2);

    await checkTab(page, "/ts0", 0, false, "Two");
    await checkTab(page, "/ts0", 1, true, "One");
    await checkTab(page, "/ts1", 0, true, "Three");
  });

  test("drag Three to center of One, then Two to same tabset", async ({ page }) => {
    // Drag Three to One
    const tabThree = findTabButton(page, "/ts2", 0);
    const tabsetOne = findPath(page, "/ts0");
    await drag(page, tabThree, tabsetOne, Location.CENTER);

    // Now drag Two to the combined tabset
    const tabTwo = findTabButton(page, "/ts1", 0);
    const combinedTabset = findPath(page, "/ts0");
    await drag(page, tabTwo, combinedTabset, Location.CENTER);

    // All three should be in one tabset
    const tabSets = findAllTabSets(page);
    await expect(tabSets).toHaveCount(1);

    await checkTab(page, "/ts0", 0, false, "One");
    await checkTab(page, "/ts0", 1, false, "Three");
    await checkTab(page, "/ts0", 2, true, "Two");
  });

  test("drag tabs to create nested row layout", async ({ page }) => {
    const tabTwo = findTabButton(page, "/ts1", 0);
    const tabsetThree = findPath(page, "/ts2");
    await drag(page, tabTwo, tabsetThree, Location.TOP);

    // Two should be above Three in a nested row
    await checkTab(page, "/ts0", 0, true, "One");
    await checkTab(page, "/r0/ts0", 0, true, "Two");
    await checkTab(page, "/r0/ts1", 0, true, "Three");
  });
});

// -----------------------------------------------------------------------------
// Border Tests
// -----------------------------------------------------------------------------

test.describe("border tests (test_with_borders)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_with_borders");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("initial border tabs are present", async ({ page }) => {
    // Check border tabs exist and are initially unselected
    await checkBorderTab(page, "/border/top", 0, false, "top1");
    await checkBorderTab(page, "/border/bottom", 0, false, "bottom1");
    await checkBorderTab(page, "/border/left", 0, false, "left1");
    await checkBorderTab(page, "/border/right", 0, false, "right1");
  });

  test("clicking border tab selects and shows content", async ({ page }) => {
    const topTab = findTabButton(page, "/border/top", 0);
    await topTab.click();

    await checkBorderTab(page, "/border/top", 0, true, "top1");
  });

  test("clicking another border tab switches selection", async ({ page }) => {
    const topTab = findTabButton(page, "/border/top", 0);
    await topTab.click();
    await checkBorderTab(page, "/border/top", 0, true, "top1");

    const leftTab = findTabButton(page, "/border/left", 0);
    await leftTab.click();

    await checkBorderTab(page, "/border/top", 0, false, "top1");
    await checkBorderTab(page, "/border/left", 0, true, "left1");
  });

  test("drag tab from layout to border", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    const topBorder = page.locator(".flexlayout__border_top");
    await drag(page, tabOne, topBorder, Location.CENTER);

    // One should now be in the top border
    await checkBorderTab(page, "/border/top", 0, false, "top1");
    await checkBorderTab(page, "/border/top", 1, false, "One");
  });

  test("drag tab from border to layout", async ({ page }) => {
    const topTabButton = findTabButton(page, "/border/top", 0);
    const tabsetOne = findPath(page, "/ts0");
    await drag(page, topTabButton, tabsetOne, Location.CENTER);

    // top1 should now be in the first tabset
    await checkTab(page, "/ts0", 0, false, "One");
    await checkTab(page, "/ts0", 1, true, "top1");
  });
});

// -----------------------------------------------------------------------------
// Splitter Tests
// -----------------------------------------------------------------------------

test.describe("splitter tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("dragging splitter resizes tabsets", async ({ page }) => {
    const splitter = page.locator(".flexlayout__splitter").first();
    await expect(splitter).toBeVisible();

    // Get initial widths
    const tabset0 = findPath(page, "/ts0");
    const tabset1 = findPath(page, "/ts1");

    const initialBox0 = await tabset0.boundingBox();
    const initialBox1 = await tabset1.boundingBox();

    if (!initialBox0 || !initialBox1) throw new Error("Could not get bounding boxes");

    // Drag splitter right (horizontal)
    await dragSplitter(page, splitter, false, 50);

    // Check that widths changed
    const finalBox0 = await tabset0.boundingBox();
    const finalBox1 = await tabset1.boundingBox();

    if (!finalBox0 || !finalBox1) throw new Error("Could not get final bounding boxes");

    expect(finalBox0.width).toBeGreaterThan(initialBox0.width);
    expect(finalBox1.width).toBeLessThan(initialBox1.width);
  });

  test("dragging splitter left resizes in opposite direction", async ({ page }) => {
    const splitter = page.locator(".flexlayout__splitter").first();
    const tabset0 = findPath(page, "/ts0");
    const tabset1 = findPath(page, "/ts1");

    const initialBox0 = await tabset0.boundingBox();
    const initialBox1 = await tabset1.boundingBox();

    if (!initialBox0 || !initialBox1) throw new Error("Could not get bounding boxes");

    // Drag splitter left
    await dragSplitter(page, splitter, false, -50);

    const finalBox0 = await tabset0.boundingBox();
    const finalBox1 = await tabset1.boundingBox();

    if (!finalBox0 || !finalBox1) throw new Error("Could not get final bounding boxes");

    expect(finalBox0.width).toBeLessThan(initialBox0.width);
    expect(finalBox1.width).toBeGreaterThan(initialBox1.width);
  });
});

// -----------------------------------------------------------------------------
// Vertical Splitter Tests
// -----------------------------------------------------------------------------

test.describe("vertical splitter tests", () => {
  test.beforeEach(async ({ page }) => {
    // First create a vertical layout by dragging One above Two
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.TOP);
  });

  test("dragging vertical splitter resizes tabsets", async ({ page }) => {
    const splitter = page.locator(".flexlayout__splitter").first();
    await expect(splitter).toBeVisible();

    const tabset0 = findPath(page, "/r0/ts0");
    const tabset1 = findPath(page, "/r0/ts1");

    const initialBox0 = await tabset0.boundingBox();
    const initialBox1 = await tabset1.boundingBox();

    if (!initialBox0 || !initialBox1) throw new Error("Could not get bounding boxes");

    // Drag splitter down (vertical)
    await dragSplitter(page, splitter, true, 50);

    const finalBox0 = await tabset0.boundingBox();
    const finalBox1 = await tabset1.boundingBox();

    if (!finalBox0 || !finalBox1) throw new Error("Could not get final bounding boxes");

    expect(finalBox0.height).toBeGreaterThan(initialBox0.height);
    expect(finalBox1.height).toBeLessThan(initialBox1.height);
  });
});

// -----------------------------------------------------------------------------
// Add Tab Tests
// -----------------------------------------------------------------------------

test.describe("add tab tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("add tab using Add Active button", async ({ page }) => {
    // Click on first tabset to make it active
    const tabOne = findTabButton(page, "/ts0", 0);
    await tabOne.click();

    // Click Add Active button
    const addActiveButton = page.locator('[data-id="add-active"]');
    await addActiveButton.click();

    // New tab should be added to the active tabset
    await expect(findTabButton(page, "/ts0", 1)).toBeVisible();
    await expect(findTabButton(page, "/ts0", 1)).toContainText("Text1");
  });

  test("add multiple tabs using Add Active button", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    await tabOne.click();

    const addActiveButton = page.locator('[data-id="add-active"]');
    await addActiveButton.click();
    await addActiveButton.click();
    await addActiveButton.click();

    await expect(findTabButton(page, "/ts0", 0)).toBeVisible();
    await expect(findTabButton(page, "/ts0", 1)).toBeVisible();
    await expect(findTabButton(page, "/ts0", 2)).toBeVisible();
    await expect(findTabButton(page, "/ts0", 3)).toBeVisible();
  });

  test("add tab to different tabset", async ({ page }) => {
    // Click on second tabset to make it active
    const tabTwo = findTabButton(page, "/ts1", 0);
    await tabTwo.click();

    const addActiveButton = page.locator('[data-id="add-active"]');
    await addActiveButton.click();

    // New tab should be in the second tabset
    await expect(findTabButton(page, "/ts1", 1)).toBeVisible();
    await expect(findTabButton(page, "/ts1", 1)).toContainText("Text1");
  });
});

// -----------------------------------------------------------------------------
// Close Tab Tests
// -----------------------------------------------------------------------------

test.describe("close tab tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("closing last tab in tabset removes the tabset", async ({ page }) => {
    // Add another tab first so we have tabs to work with
    const tabOne = findTabButton(page, "/ts0", 0);
    await tabOne.click();

    const addActiveButton = page.locator('[data-id="add-active"]');
    await addActiveButton.click();

    // Now we have 2 tabs in first tabset
    await expect(findTabButton(page, "/ts0", 0)).toBeVisible();
    await expect(findTabButton(page, "/ts0", 1)).toBeVisible();

    // Close one tab using the close button
    const closeButton = findTabButton(page, "/ts0", 1).locator(
      ".flexlayout__tab_toolbar_button-close"
    );
    await closeButton.click();

    // Should only have one tab left
    await expect(findTabButton(page, "/ts0", 0)).toBeVisible();
    await expect(findTabButton(page, "/ts0", 1)).not.toBeVisible();
  });
});

// -----------------------------------------------------------------------------
// Tab Selection Tests
// -----------------------------------------------------------------------------

test.describe("tab selection tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    // Add another tab to first tabset
    const tabOne = findTabButton(page, "/ts0", 0);
    await tabOne.click();

    const addActiveButton = page.locator('[data-id="add-active"]');
    await addActiveButton.click();
  });

  test("clicking on unselected tab selects it", async ({ page }) => {
    // First tab should be selected initially (One is at index 0, new tab at index 1 is selected after adding)
    // Click on first tab to select it
    const tabOne = findTabButton(page, "/ts0", 0);
    await tabOne.click();

    await expect(tabOne).toHaveClass(/flexlayout__tab_button--selected/);
  });

  test("selected tab shows its content", async ({ page }) => {
    const tabOne = findTabButton(page, "/ts0", 0);
    await tabOne.click();

    const tabContent = findPath(page, "/ts0/t0");
    await expect(tabContent).toBeVisible();
    await expect(tabContent).toContainText("One");
  });

  test("unselected tab hides its content", async ({ page }) => {
    // Select the newly added tab (index 1)
    const newTab = findTabButton(page, "/ts0", 1);
    await newTab.click();

    // Original tab content should be hidden
    const tabOneContent = findPath(page, "/ts0/t0");
    await expect(tabOneContent).not.toBeVisible();
  });
});

// -----------------------------------------------------------------------------
// Maximize Tests
// -----------------------------------------------------------------------------

test.describe("maximize tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo?layout=test_three_tabs");
    await page.waitForSelector(".flexlayout__layout");
  });

  test("double-clicking tabset header maximizes it", async ({ page }) => {
    const tabsetHeader = page.locator(".flexlayout__tabset_tabbar_outer").first();
    await tabsetHeader.dblclick();

    // The tabset should have the maximized class
    const tabset = page.locator(".flexlayout__tabset-maximized");
    await expect(tabset).toBeVisible();

    // Other tabsets should not be visible (only the maximized one)
    const visibleTabsets = page.locator(".flexlayout__tabset:visible");
    await expect(visibleTabsets).toHaveCount(1);
  });

  test("double-clicking again restores layout", async ({ page }) => {
    const tabsetHeader = page.locator(".flexlayout__tabset_tabbar_outer").first();

    // Maximize
    await tabsetHeader.dblclick();
    await expect(page.locator(".flexlayout__tabset-maximized")).toBeVisible();

    // Restore
    await tabsetHeader.dblclick();
    await expect(page.locator(".flexlayout__tabset-maximized")).not.toBeVisible();

    // All tabsets should be visible again
    const tabSets = findAllTabSets(page);
    await expect(tabSets).toHaveCount(3);
  });
});

// -----------------------------------------------------------------------------
// Drag Rect Appearance Tests
// -----------------------------------------------------------------------------

test.describe("drag rect tests", () => {
  test("drag rect appears during tab drag", async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    const tabOne = findTabButton(page, "/ts0", 0);
    const tabOneBox = await tabOne.boundingBox();

    if (!tabOneBox) throw new Error("Could not get tab bounding box");

    // Start dragging
    await page.mouse.move(tabOneBox.x + tabOneBox.width / 2, tabOneBox.y + tabOneBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tabOneBox.x + 50, tabOneBox.y + 50);

    // Check that drag rect is visible
    const dragRect = page.locator(".flexlayout__drag_rect");
    await expect(dragRect).toBeVisible();

    await page.mouse.up();
  });

  test("outline rect appears over drop targets", async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");

    const tabOneBox = await tabOne.boundingBox();
    const tabsetTwoBox = await tabsetTwo.boundingBox();

    if (!tabOneBox || !tabsetTwoBox) throw new Error("Could not get bounding boxes");

    // Start dragging towards tabset two
    await page.mouse.move(tabOneBox.x + tabOneBox.width / 2, tabOneBox.y + tabOneBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      tabsetTwoBox.x + tabsetTwoBox.width / 2,
      tabsetTwoBox.y + tabsetTwoBox.height / 2,
      { steps: 10 }
    );

    // Check that outline rect is visible
    const outlineRect = page.locator(".flexlayout__outline_rect");
    await expect(outlineRect).toBeVisible();

    await page.mouse.up();
  });
});

// -----------------------------------------------------------------------------
// Edge Rect Tests
// -----------------------------------------------------------------------------

test.describe("edge rect tests", () => {
  test("edge rects appear at layout edges during drag", async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    const tabOne = findTabButton(page, "/ts0", 0);
    const tabOneBox = await tabOne.boundingBox();

    if (!tabOneBox) throw new Error("Could not get tab bounding box");

    // Start dragging
    await page.mouse.move(tabOneBox.x + tabOneBox.width / 2, tabOneBox.y + tabOneBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tabOneBox.x + 50, tabOneBox.y + 50);

    // Edge rects should appear
    const edgeRects = page.locator(".flexlayout__edge_rect");
    await expect(edgeRects.first()).toBeVisible();

    await page.mouse.up();
  });
});

// -----------------------------------------------------------------------------
// Layout Persistence Tests
// -----------------------------------------------------------------------------

test.describe("layout persistence", () => {
  test("layout state persists after reload", async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    // Modify layout - drag One to center of Two
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.CENTER);

    // Verify modification
    const tabSets = findAllTabSets(page);
    await expect(tabSets).toHaveCount(1);

    // Reload page
    await page.reload();
    await page.waitForSelector(".flexlayout__layout");

    // Layout should be restored from localStorage
    const tabSetsAfter = findAllTabSets(page);
    await expect(tabSetsAfter).toHaveCount(1);
  });

  test("reload button resets layout", async ({ page }) => {
    await page.goto("/demo?layout=test_two_tabs");
    await page.waitForSelector(".flexlayout__layout");

    // Modify layout
    const tabOne = findTabButton(page, "/ts0", 0);
    const tabsetTwo = findPath(page, "/ts1");
    await drag(page, tabOne, tabsetTwo, Location.CENTER);

    await expect(findAllTabSets(page)).toHaveCount(1);

    // Click reload button
    const reloadButton = page.locator("button", { hasText: "Reload" });
    await reloadButton.click();
    await page.waitForTimeout(500); // Wait for layout reload

    // Layout should be reset to original
    await expect(findAllTabSets(page)).toHaveCount(2);
  });
});
