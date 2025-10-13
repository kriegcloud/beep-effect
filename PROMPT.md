# Codex Session Brief: Legacy Settings Navigation Upgrade

You are continuing the `beep-effect` monorepo integration to bring the legacy settings experience (`packages/ui/src/settings`) up-to-date with the navigation schema that already powers `settings-v2`. Keep the guardrails in `AGENTS.md` in mind—namespace imports for Effect modules, no native array/string helpers, and align with slice boundaries.

## Context Snapshot
- The source of truth lives under `packages/ui-core/src/settings/schema/`. `NavigationMenuType`, `SideNavType`, `TopNavType`, and `NavColor` are string literal kits that expose `.Enum` and `.Options` helpers plus `Type` aliases.
- Legacy `SettingsState` (`packages/ui-core/src/settings/types.ts`) is still hard-coded to `navLayout: "vertical" | "horizontal" | "mini"` with legacy nav colors (`"integrate" | "apparent"`).
- `defaultSettings` (`packages/ui-core/src/settings/settings-config.ts`) currently mirrors those legacy fields and is consumed by `SettingsProvider` and `SettingsDrawer`.
- Dashboard surfaces (`packages/ui/src/layouts/dashboard/**`) consume `settings.state.navLayout` and `settings.state.navColor`, so removing `navLayout` requires replacing that logic with the new schema fields.

## Required Changes
### 1. Schema Alignment (Core)
- In `packages/ui-core/src/settings/types.ts`, import the schema classes and align `SettingsState` to their `Type` aliases:
  - Replace `navLayout` entirely with `navigationMenuType: NavigationMenuType.Type`.
  - Introduce `sidenavType: SideNavType.Type`, `topnavType: TopNavType.Type`, and reuse `NavColor.Type`.
  - Consider exposing the schema-driven flags already in `SettingsConfig` (`sidenavCollapsed`, `openNavbarDrawer`, `drawerWidth`) only if the legacy UI needs them; otherwise document why they stay omitted.
- Update `SettingsContextValue` and helper signatures so `setState`/`setField` accept the expanded state.
- In `packages/ui-core/src/settings/settings-config.ts`, pull defaults from `SettingsConfig.initialValue` (e.g. `NavigationMenuType.Enum.sidenav`, `NavColor.Enum.default`). Bump `version` if you need to force a reset on older cookies.

### 2. Legacy Settings State & Persistence
- Update `packages/ui/src/settings/context/settings-provider.tsx` to hydrate/persist the new fields. The storage helpers already accept generics—verify the `useCookies`/`useLocalStorage` hook handles the broadened shape.
- Ensure `onReset` and the version migration logic reset the new keys. Use `jetbrains__search_in_files_by_text` for `"navLayout"` to confirm the field disappears.

### 3. Drawer UX Refresh
- Replace the old `NavLayoutOptions` usage in `packages/ui/src/settings/drawer/settings-drawer.tsx` with controls for:
  - `navigationMenuType` (`sidenav` | `topnav` | `combo`)
  - `sidenavType` (`default` | `stacked` | `slim`)
  - `topnavType` (`default` | `stacked` | `slim`)
- Update `NavColorOptions` to the new `NavColor` values (`default`, `vibrant`). If you keep the existing component (`packages/ui/src/settings/drawer/nav-layout-option.tsx`), rename/refactor it to accept the schema enums and tighten typings (`NavigationMenuType.Type`, etc.).
- Use `packages/ui/src/settings-v2/settings-panel/{NavigationMenuPanel,SidenavShapePanel,TopnavShapePanel}.tsx` as behavior references only. Do not import v2 reducers or provider state into the legacy drawer.

### 4. Downstream Layout Consumers
- Refactor `packages/ui/src/layouts/dashboard/layout.tsx`, `content.tsx`, and `css-vars.ts` (and any other hits from `jetbrains__search_in_files_by_text "navLayout"`):
  - Drive conditional rendering off `navigationMenuType`, `sidenavType`, and `sidenavCollapsed`/`drawerWidth` as appropriate.
  - Update nav color theme derivation in `dashboardNavColorVars` to the new `NavColor` palette (`default`/`vibrant`), keeping parity with the existing visual intent.
  - Replace `settings.setField("navLayout", …)` toggles with logic that updates the new schema-backed fields.

### 5. Smoke Tests & Validation
- Compile after each major edit (`bun run lint`). If layout logic changes are significant, consider `bun run check` to catch type regressions.
- Keep `packages/ui/src/settings-v2/**` untouched; use it only to confirm string literals and UX expectations.

## Useful Tool Calls
- `jetbrains__list_directory_tree` for quick directory surveys.
- `jetbrains__get_file_text_by_path` to inspect schema/config/provider files.
- `jetbrains__search_in_files_by_text` (or `rg`) to confirm all `navLayout`, `"integrate"`, and `"apparent"` usages are migrated.
- `apply_patch` for focused diffs on individual files.

Deliverables are accepted when the legacy settings provider/drawer compile against the schema types, the dashboard layout builds without `navLayout`, and the new enums drive both defaults and UI interactions.
