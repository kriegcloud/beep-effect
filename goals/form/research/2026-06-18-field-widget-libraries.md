# P0 — 2026 field-widget library selections

Freshness: 2026-06-18. Method: fan-out web research + **adversarial verification**
(a second agent re-checked each pick against the npm registry / unpkg / GitHub
for version, React-19 peer support, maintenance, and license). Versions below are
the verified latest-stable as of June 2026 and are the exact catalog pins.

## Summary

| Widget | Decision | Catalog pin(s) | License | Verdict |
| --- | --- | --- | --- | --- |
| Phone | `libphonenumber-js` engine + own base-ui picker (drop react-phone-number-input) | `libphonenumber-js` `1.13.6` | MIT (+ Apache-2.0 metadata) | approved |
| Color | `react-colorful` picker UI; value/transforms stay in `@beep/schema` `Color/` | `react-colorful` `5.7.0` | MIT | approved-with-caveats |
| Emoji | `frimousse` (Liveblocks) headless picker | `frimousse` `0.3.0` | MIT | approved-with-caveats |
| Rating | **Build custom** on base-ui RadioGroup + Tailwind (no lib) | none | MIT (repo-owned) | approved |
| Upload | `react-dropzone` headless `useDropzone()` | `react-dropzone` `15.0.0` | MIT | approved-with-caveats |
| Country | base-ui Combobox + dataset + SVG flags (no picker lib) | `countries-list` `3.3.0`, `country-flag-icons` `1.6.17` | MIT | approved |

All picks are browser-safe and compose with `@base-ui/react` + Tailwind v4. None
contradicts a locked decision. Three carry an "open-range React peer" caveat
(React 19 satisfied by `>=16.8` rather than an explicit `^19` declaration) —
documented per widget.

## Phone — `libphonenumber-js@1.13.6` (drop react-phone-number-input)

- **Decision:** use `libphonenumber-js` directly as the parse/validate/format
  engine; build the input + country picker as a base-ui/Tailwind primitive in
  `@beep/ui`. Do **not** adopt `react-phone-number-input` — its entire value is
  the country-select + flag UI we are rebuilding, and it drags `classnames`,
  `input-format`, `prop-types`, a `style.css`, and an unverified React-19 peer.
- **React 19:** non-issue — verified **zero** `peerDependencies` and **zero**
  runtime `dependencies` (pure logic, React-version-agnostic).
- **Implementation:** country select = base-ui `Combobox` fed by `getCountries()`
  + `getCountryCallingCode()`; national input runs `new AsYouType(country).input()`
  for live formatting; store `parsePhoneNumber(national, country)?.number` (the
  **E.164 string**) as the field value, keeping the display string in separate
  scoped-atom UI state to avoid React-19 controlled-input cursor thrash; validate
  with a schema-first `S.String` refinement calling `isValidPhoneNumber` /
  `isPossiblePhoneNumber`.
- **Caveats:** import from `libphonenumber-js/min` (~38 KB gz) or `/mobile`, **not**
  the default `max` barrel; metadata changes near-daily → pin exactly + add a
  Renovate/Dependabot refresh cadence; `min` metadata weakens `isValidPhoneNumber`
  (length-only) — pick the metadata variant to match the validation guarantee.

## Color — `react-colorful@5.7.0` (picker UI only)

- **Decision:** `react-colorful` for the picker UI; **all** color math /
  normalization stays in `@beep/schema` `Color/` (`HexColor`, `NormalizeHexColor`,
  `Rgb`, `OklchColor`, transforms). The field treats react-colorful's `onChange`
  output as **raw input** parsed/normalized through `@beep/schema` `Color/`
  **before** it reaches form state.
- **React 19:** satisfied — peer `react/react-dom >=16.8.0` (open range; not an
  explicit `^19`). Hooks-only, zero runtime deps, `sideEffects:false`, ~2.8 KB.
- **Caveats (why "with caveats"):** **not headless** — fixed DOM + runtime
  `<style>` injection (so the field wrapper must be client-only to stay
  browser-safe); styleable only via `.react-colorful*` class overrides; single
  maintainer + long dormancy then a 2026-05-07 republish (bus-factor risk,
  mitigated by MIT + zero deps making vendoring trivial). Documented fallback: a
  custom base-ui/Tailwind picker if design control or maintenance lapses.

## Emoji — `frimousse@0.3.0` (Liveblocks, headless)

- **Decision:** `frimousse` — fully headless render-prop parts
  (`EmojiPicker.Root/Search/Viewport/List/Empty/…`), no bundled CSS, no bundled
  popover. Mount inside the existing `@beep/ui` base-ui `Popover` and style parts
  with Tailwind v4.
- **React 19:** explicit — peer `react: "^18 || ^19"`; no `react-dom` peer; zero
  runtime deps; MIT.
- **Caveats (why "with caveats"):** it fetches the **Emojibase** dataset from the
  default jsDelivr CDN at runtime — for a browser-safe/CSP/offline-deterministic
  foundation package, set `emojibaseUrl` explicitly and **self-host**
  `emojibase-data` (verify its separate MIT/CC license). Pre-1.0 (semver-minor can
  break → exact-pin `0.3.0`, gate upgrades behind review). Last npm release
  2025-07-15 (~11-mo gap) but the repo is actively maintained (Liveblocks-backed).

## Rating — build custom on base-ui (no library)

- **Decision:** compose `@base-ui/react` `RadioGroup` + `Radio` + `Field` into a
  Tailwind-styled rating primitive in `@beep/ui`; bind in `@beep/form`. **No new
  runtime dependency.** Verified locally: the repo's substrate is `@base-ui/react`
  `1.5.0` (peer `react ^17||^18||^19`, MIT) which ships `radio`/`radio-group`/
  `field` (and `number-field`/`otp-field`) but **no rating** primitive — so custom
  composition is required, not a missed export.
- **Why not a lib:** the only viable off-the-shelf option (`@smastrom/react-rating`,
  MIT) is stale (last release 2024-01), has no explicit `^19` peer, and ships its
  own `style.css` + a fixed CSS-variable model that conflicts with Tailwind v4 and
  adds a stylesheet to a browser-safe package.
- **Implementation notes:** rating = `RadioGroup` of N (or 2N for half-steps)
  `Radio` star glyphs; fill driven by Tailwind `data-[checked]` variants;
  `readOnly` maps to `RadioGroup readOnly` keeping a11y semantics distinct from
  `disabled`; keep the `@beep/form` value a plain `number`; half-star fill needs a
  Tailwind clip/overlay (since `data-[checked]` is binary) implemented **without**
  importing a stylesheet. ~150 LOC of owned code.

## Upload — `react-dropzone@15.0.0` (headless hook)

- **Decision:** `react-dropzone`'s headless `useDropzone()` hook; build all three
  variants (Upload / UploadAvatar / UploadBox) by spreading
  `getRootProps()`/`getInputProps()` onto `@beep/ui` primitives and driving
  styling from `isDragActive`/`isDragAccept`/`isDragReject`. Value surfaces as
  `File | File[]` from `onDrop`.
- **React 19 — caveat (why "with caveats"):** v15.0.0 (shipped 2026-02-10) declares
  peer `react: ">= 16.8 || 18.0.0"`. React 19.2 satisfies the **open `>= 16.8`
  bound** (installs cleanly, no `--legacy-peer-deps`) but there is **no explicit
  `^19`** declaration — satisfaction by omission, not intent. Re-verify on future
  React majors.
- **Other flags:** drags `prop-types` (legacy, small, MIT); `react-dom` is **not**
  a peer (good for browser-safe foundation); v15 breaking change — `isDragReject`
  clears after drop, so post-drop rejection UI must read
  `fileRejections`/`onDropRejected`; variants must be client components;
  object-URL previews need manual `URL.revokeObjectURL` on cleanup. Pre-vetted
  exit if upstream stalls or explicit-`^19`/WAI-ARIA DnD becomes required: **React
  Aria `DropZone`** (`react-aria-components`, Apache-2.0, explicit `^19`).

## Country — base-ui Combobox + dataset + SVG flags (no picker lib)

- **Decision (honours LOCKED #8):** no external picker library. Add two MIT data
  deps — `countries-list@3.3.0` (ISO 3166-1: alpha-2 keys, alpha-3 via
  `getCountryData`, English + native names, calling codes, currency, continents,
  optional emoji map) and `country-flag-icons@1.6.17` (SVG flags as React
  components, e.g. `country-flag-icons/react/3x2/US`). Do **not** bundle the data.
  Build a small `@beep/ui` adapter mapping alpha-2 → flag component + a typed,
  Schema-validated option list; render in a base-ui `Combobox` (single,
  filterable, custom flag+label items).
- **Why catalog deps not bundling:** maintained ISO data + pixel-consistent SVG
  flags beat hand-bundled data and beat unicode flag emoji (which render
  inconsistently/absent on Windows and are unstylable).
- **React 19 / Tailwind:** `country-flag-icons` declares **no** React peer and
  **no** deps (version-agnostic; `/react/3x2` returns a bare `<svg>` via
  `React.createElement`); use the React-component path (avoid the optional
  `flags.css` data-URL path); size flags with Tailwind utilities.
