# Unified Layout Settings Plan

## Context Snapshot
- `packages/ui/src/settings` (“dashboard settings”) exposes a cookie-aware provider and feature-rich drawer UI, but its state shape (`SettingsState`) is ad-hoc and not governed by Effect schemas. Extending it requires editing multiple files manually and it has drift from the layout logic used in `packages/ui/src/layouts/main-layout`.
- `packages/ui/src/settings-v2` introduces `SettingsConfig` / `SettingsAction` schemas in `packages/ui-core/src/settings/schema`, plus a reducer-driven layout system powering the new main layout. However it only syncs to `localStorage`, ships a limited feature set (no font/contrast/primary-color controls, no versioning), and duplicates reducer logic instead of reusing `SettingsAction.reduceAndApply`.
- Cross-cutting issues: the two providers cannot interoperate, runtime detection (`apps/web/src/app-config.ts`) only populates the legacy context, settings panels have separate APIs, and persistence/validation logic is scattered between `ui-core` utils and React providers.

## Goals
- Single schema-driven source of truth that covers all layout + appearance options currently handled by either system.
- First-class persistence pipeline with cookie support (to stay compatible with SSR detection) and opt-in `localStorage` fallback for client-only overrides.
- Cohesive React API that exposes typed helpers for reading, updating, and scoping settings, without leaking persistence details.
- Extensible action/reducer layer that reuses Effect schema refinements for runtime safety and provides ergonomic helper methods.
- UI surfaces (drawer/panel/toggles) that can be composed per layout and configured from the top level (e.g., disable sections, override labels) without duplicating logic.
- Migration path that lets us incrementally move `@beep/ui` consumers and `apps/web` layouts without breaking existing cookie data.

Non-goals: redesigning theming, overhauling `ThemeProvider`, or shipping brand-new layout variants beyond parity requirements.

## Proposed Architecture

### 1. Canonical Schema & Modeling (`packages/ui-core/src/settings`)
- Replace the current `SettingsConfig` class with a multi-section schema (e.g., `LayoutSettings`) composed of Effect sub-structs: `appearance`, `navigation`, `behavior`, `meta`.
- Merge legacy fields (`fontSize`, `fontFamily`, `primaryColor`, `contrast`, `compactLayout`, `navLayout`, `version`) with v2-only fields (`navigationMenuType`, `sidenavType`, `topnavType`, `drawerWidth`, `openNavbarDrawer`).
- Provide derived unions/enums via kits (`NavigationLayoutKit`, `NavDensityKit`, etc.) for UI consumption and validation.
- Keep `Schema.TaggedError` surfaces for invalid payloads; expose an Effect codec to safely decode existing cookie blobs (with backward-compatible transforms for missing fields).
- Deliver a companion `SettingsPatch` schema (strict partial) for update operations to guard mutation APIs.

### 2. Persistence Layer (`packages/ui-core/src/settings/persistence.ts` new module)
- Build a small Effect-driven storage service with three capabilities: `read`, `write`, `clear`. It should abstract cookies (`next/headers` on the server, `document.cookie` on the client) and optionally cascade to `localStorage`.
- Encode/decode settings through the schema codec; automatically apply migrations when encountering an older `version`.
- Expose helpers for `getServerSettings` (async Effect leveraging `cookies()`), `getClientSettings` (lazy detection), and `persistClientSettings` that callers can use without duplicating storage logic.
- Add unit tests (Vitest) covering: cookie round-trips, migration of missing fields, and fallback behavior.

### 3. React Integration Layer (`packages/ui/src/settings-manager`)
- Introduce a new `SettingsManagerProvider` that:
  - accepts optional `initialSettings` (from SSR) and `storageStrategy` (“cookie-only”, “cookie+localStorage”, “memory” for tests).
  - boots a reducer created by lifting `SettingsAction.reduceAndApply` into React via `useReducer`.
  - wraps state updates in `Effect.runPromise` (to reuse schema-backed reducer helper) and writes through the persistence layer on success.
- Replace `useSettingsContext` exports from both legacy folders with re-exports from the manager to reduce surface duplication; the old module can delegate to the new provider during migration.
- Provide focused hooks (`useSettingsSelector`, `useSettingsActions`, `useSettingsScopedUpdater`) that encourage fine-grained updates and memoization.
- Surface a configuration object describing which setting groups are enabled for a given layout; components can consult this instead of hard-coding visibility logic.

### 4. UI Surfaces Alignment
- Refactor `SettingsDrawer` and the settings-v2 panel modules to consume the new selector/actions API and the consolidated schema enums.
- Extract shared primitives (option grids, toggle tabs, preview cards) into `packages/ui/src/settings-manager/components` to avoid duplication.
- Support top-level configuration for hiding sections, injecting custom descriptions, or replacing option lists (e.g., bespoke palettes) via props/context.
- Ensure both drawer and panel respect the same persistence + reducer and can co-exist while migration happens.

### 5. Layout Integration
- Update `packages/ui/src/layouts/main-layout` and `packages/ui/src/layouts/dashboard` to read from `SettingsManagerProvider`; remove direct references to legacy contexts once parity is achieved.
- Centralize layout-specific side effects (e.g., toggling `openNavbarDrawer`, recalculating `drawerWidth`) into typed action creators housed near the reducer to avoid inline logic repetition.
- Keep `useSettingsPanelMountEffect` but make it consume the new manager configuration API rather than mutating provider state directly.

### 6. Query/String Overrides
- Rewrite `useConfigFromQuery` to validate against the new schema (leverage `SettingsPatch`), route updates through the unified dispatch API, and persist via the manager.
- Document allowed query parameters and ensure the pipeline resets conflicting options (e.g., invalid combinations) using schema refinement errors.

### 7. Documentation & Tooling
- Publish developer docs under `docs/patterns/layout-settings.md` describing schema sections, persistence strategy, and consumption examples.
- Update AGENT guardrails referencing settings to point at the new module names.
- Add Storybook or dedicated preview pages showcasing drawer/panel states to aid QA.

## Migration Strategy
1. **Foundation**: ship schema + persistence refactor behind feature flag while keeping existing providers untouched.
2. **Provider Swap**: introduce `SettingsManagerProvider` and proxy both legacy providers to it; ensure SSR config (`apps/web/src/app-config.ts`) populates the new provider.
3. **UI Alignment**: refactor `SettingsDrawer` and settings-v2 panel to consume unified APIs while maintaining current look & feel.
4. **Layout Update**: migrate `main-layout` and `dashboard` to the new hooks; remove duplicated reducer logic.
5. **Cleanup**: delete legacy provider implementations, consolidate exports under `@beep/ui/settings`, and freeze the old schema types.

Each stage should be gated by integration tests or manual QA notes to confirm persistence, SSR hydration, and layout toggles still function.

## Risks & Mitigations
- **Cookie size pressure**: expanded schema may exceed limits; mitigate by compressing payload (e.g., short enum keys) or moving seldom-used fields to localStorage-only.
- **Hydration mismatches**: ensure server and client decode identically by using the shared codec inside both SSR and CSR entry points.
- **Backward compatibility**: old cookies lacking new fields must default safely; include migration logic and bump `version` to force regeneration when necessary.
- **Concurrent writers**: guard against batched updates overwriting each other by applying reducer updates atomically and reading latest state before persisting.

## Open Questions
- Should organization/tenant-specific settings be scoped differently (e.g., cookie name per tenant)?
- Do we need audit or analytics hooks when settings change (for telemetry)?
- How should we expose experimental layout toggles without bloating the public schema (feature flags vs. schema extensions)?

## Immediate Next Actions
1. Draft the consolidated schema + codec with migration tests.
2. Implement the persistence abstraction and wire `app-config` SSR detection to it.
3. Prototype `SettingsManagerProvider` and migrate one layout (e.g., `dashboard`) as a proving ground before full rollout.
