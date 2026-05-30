# @beep/ui

## 0.1.2

### Patch Changes

- [#195](https://github.com/kriegcloud/beep-effect/pull/195) [`ad120c6`](https://github.com/kriegcloud/beep-effect/commit/ad120c68b2d6332f9a737c2a3032fa90c4f1cfff) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Fix rendering and accessibility bugs across components surfaced by a comprehensive Storybook QA sweep:

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

## 0.1.1

### Patch Changes

- Updated dependencies [[`19c557e`](https://github.com/kriegcloud/beep-effect/commit/19c557eab4129e8c1945f7e1cec83ffb8ba819cf)]:
  - @beep/utils@0.0.2

## 0.1.0

### Minor Changes

- [#186](https://github.com/kriegcloud/beep-effect/pull/186) [`9e5fd5c`](https://github.com/kriegcloud/beep-effect/commit/9e5fd5c1f0872a77a9573d474f931d44744e913b) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Add Base UI shadcn components to complete the primitive baseline: `chart` (recharts wrapper), `native-select`, `direction` (RTL/LTR provider), and a composed `date-picker` (Popover + Calendar). New primitives land in `src/components/` (the `ui` alias now resolves to `@beep/ui/components`) and follow the repo's effect-first conventions (`@beep/utils` `A`/`P`/`Str`/`Struct` helpers, strict boolean expressions).

## 0.0.2

### Patch Changes

- [#183](https://github.com/kriegcloud/beep-effect/pull/183) [`f76f5ee`](https://github.com/kriegcloud/beep-effect/commit/f76f5ee4e4192cc2bc957888f4129720d04b3b0d) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Record the dedup clone engine closeout, threshold tuning, and CI verification updates for this internal PR.

## 0.0.1

### Patch Changes

- [#92](https://github.com/kriegcloud/beep-effect/pull/92) [`99c2975`](https://github.com/kriegcloud/beep-effect/commit/99c297515600b34353b7182c7e8e77e7ea0c33d6) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Record the branch-wide repo quality, docgen compatibility, schema/docs cleanup, and CI security remediation work.

- Updated dependencies [[`7cd3b3e`](https://github.com/kriegcloud/beep-effect/commit/7cd3b3eecddfb1a6fbae7cae361d5a040dbfbca5), [`da32b0d`](https://github.com/kriegcloud/beep-effect/commit/da32b0db75f71de6fc10c1ea64850ced9935e346), [`7a4530b`](https://github.com/kriegcloud/beep-effect/commit/7a4530b99af34b14c6f786a1fa12eb85310c9bec), [`99c2975`](https://github.com/kriegcloud/beep-effect/commit/99c297515600b34353b7182c7e8e77e7ea0c33d6)]:
  - @beep/utils@0.0.1
