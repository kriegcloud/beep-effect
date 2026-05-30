---
"@beep/ui": patch
---

Fix rendering and accessibility bugs across components surfaced by a comprehensive Storybook QA sweep:

- **chart**: data series now paint on first render (disable recharts enter-animation that left charts blank until interaction).
- **progress**: indeterminate state now shows a visible animated fill.
- **tour**: skip zero-size targets without aborting positioning (`continue` not `return`); add a `process` shim in the Storybook preview so `next/link` no longer crashes the dev server.
- **resizable**: `withHandle` now gates the grip affordance; vertical splits size correctly.
- **scroll-area**: orientation styles now apply (`data-[orientation=...]` instead of non-matching variants).
- **slider**: a scalar `value`/`defaultValue` renders one thumb instead of two.
- **dropdown-menu**: `DropdownMenuCheckboxItem` no longer forces controlled mode, so `defaultChecked` works.
- **toggle-group**: `orientation` is forwarded to the primitive (restores vertical keyboard navigation).
- **toggle**: pressed state now has a visible background.
- **todo-item**: row is no longer an interactive `role="button"` wrapping a button (valid ARIA); row activation now flows through `onClick`/the inner controls rather than row-level keyboard activation.
- **kbd**: `KbdGroup` renders a `<span>` (valid inside `<p>`, matches its prop type).
- **calendar**: fix `elative` → `relative` typo so the date-range band positions correctly.
- **link-preview**: render the trigger as an anchor via the `render` prop (no `<a>` nested in `<button>`) and theme-token the preview card so it adapts to light/dark.
- **banner**: add `success`/`warning`/`*-text` theme tokens so semantic variants render distinct colors.
