# Dashboard UI

Use this file when working on dashboard page layout, tables, page chrome, or app shell UI.

## Design Direction

- Follow a data dense, low chrome interface style.
- Prioritize information density, scannability, and functional clarity over ornamentation.
- Keep the interface visually quiet. Use color for status, actions, and categorization, never for decoration.
- Do not add gradients, shadows, decorative borders, illustrations, or marketing style visuals.
- Prefer typography, spacing, and alignment for hierarchy instead of decorative treatments.
- Display technical identifiers exactly as they exist in the system. Do not humanize, prettify, or title case them.

## Page Structure

- Standard page structure is breadcrumb row, page header, then the primary content area.
- Page headers should contain a bold title, optional muted description, and page level actions aligned to the top right.
- Detail pages should show important technical identifiers like UUIDs as copyable monospace secondary content near the title.
- Use one of the established content layouts: full width table, single column stacked sections, or split panel.
- Do not invent new top level page layout patterns unless the existing three are clearly insufficient.

## App Style Scrolling

- Pages must not scroll as whole documents.
- Treat the dashboard like an application shell, not a long scrolling document.
- The outer page or route layout should own viewport height and use `overflow-hidden`.
- Inner panes, sidebars, tables, editors, tab panels, and content regions should own scrolling with `overflow-auto`, `overflow-y-auto`, or `overflow-x-auto`.
- Preserve `min-h-0` and `flex-1` style constraints so inner scroll containers can shrink and scroll correctly.
- Match the existing signed in shell pattern where the app shell is viewport constrained and scrolling happens inside inner panes.

## Navigation And Tabs

- Keep breadcrumbs at the top of dashboard pages.
- Use horizontal tabs for entity subviews like setup, models, results, or summary.
- Active tabs should be indicated with understated structural emphasis, not decorative fills.

## Tables

- Prefer full width tables as the primary list layout for entity collections.
- Tables should be flat and dense. Use horizontal separators. Do not use alternating row fills or vertical borders.
- Header rows should use stronger typography, not filled backgrounds.
- Missing optional values should render as `-`.
- Put text heavy flex columns on the left and compact fixed columns on the right.
- Right align numeric and date columns.
- Center single enum status style columns.
- Keep action columns right aligned and always last.
- Keep fixed columns nowrap.
- Truncate wide text columns instead of letting them blow out the layout.
- Name columns should clamp to one line. Description style columns may clamp to two lines.
- Prefer horizontal scrolling for overflowing tables instead of responsive card conversions.

## Tables And Identifiers

- Technical names, feature ids, slugs, metrics, and UUIDs should remain raw and exact.
- Show technical identifiers in monospace with muted styling.
- When identifiers are likely to be copied into code, queries, or API calls, use a copyable identifier treatment.

## Sections And Forms

- On detail and configuration pages, group related fields into clearly labeled stacked sections.
- Use bordered section containers with consistent internal spacing.
- Prefer full width vertical stacking for complex configuration flows.
- Use side by side fields only when the relationship is tight and both values are short.

## Split Panels And Filters

- For results and summary style pages, use a split panel layout with filters or selectors on the left and primary content on the right.
- Separate split panels through spacing and layout, not heavy dividers or visual chrome.
