# @beep/schema

## 0.1.2

### Patch Changes

- Updated dependencies [[`19c557e`](https://github.com/kriegcloud/beep-effect/commit/19c557eab4129e8c1945f7e1cec83ffb8ba819cf)]:
  - @beep/utils@0.0.2
  - @beep/data@0.0.2

## 0.1.1

### Patch Changes

- [#177](https://github.com/kriegcloud/beep-effect/pull/177) [`35861fc`](https://github.com/kriegcloud/beep-effect/commit/35861fc9dd902e80f82889d02e4108f4e9fdd6cd) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Add schema-first AI sync tooling with generated config schemas, drift checks, transforms, and the supporting identity/schema surface updates.

- Updated dependencies [[`35861fc`](https://github.com/kriegcloud/beep-effect/commit/35861fc9dd902e80f82889d02e4108f4e9fdd6cd)]:
  - @beep/identity@0.1.1

## 0.1.0

### Minor Changes

- [#110](https://github.com/kriegcloud/beep-effect/pull/110) [`1db7b92`](https://github.com/kriegcloud/beep-effect/commit/1db7b926466b58d5020c2e65b5027dfc8f6f947d) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Add branded kebab-case, PascalCase, and snake_case string schemas to
  `@beep/schema`, and tighten the related architecture scratchpad metadata
  contracts used during the driver-boundary documentation pass.

- [#116](https://github.com/kriegcloud/beep-effect/pull/116) [`3810232`](https://github.com/kriegcloud/beep-effect/commit/381023275837ff506a58170eb4bce2f613ef0f75) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Add the shared Next.js config surface in `@beep/repo-configs` and migrate the Next app configs to use the shared module.

### Patch Changes

- [#137](https://github.com/kriegcloud/beep-effect/pull/137) [`7cd3b3e`](https://github.com/kriegcloud/beep-effect/commit/7cd3b3eecddfb1a6fbae7cae361d5a040dbfbca5) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Defer Effect v4 service lookups during static initialization after the mainline sync.

- [#77](https://github.com/kriegcloud/beep-effect/pull/77) [`2ad8f27`](https://github.com/kriegcloud/beep-effect/commit/2ad8f270810cba11712cccb2617761dda429c4d4) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Align schema-first tagged-union modeling in the schema package.

- [#113](https://github.com/kriegcloud/beep-effect/pull/113) [`3382a1a`](https://github.com/kriegcloud/beep-effect/commit/3382a1a96eac09da980266a2ecb8bb508d32876c) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Record AI provider driver integration, OpenAI-compatible streaming fixes, schema helper typing cleanup, and review-thread remediation.

- [#92](https://github.com/kriegcloud/beep-effect/pull/92) [`99c2975`](https://github.com/kriegcloud/beep-effect/commit/99c297515600b34353b7182c7e8e77e7ea0c33d6) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Record the branch-wide repo quality, docgen compatibility, schema/docs cleanup, and CI security remediation work.

- [#105](https://github.com/kriegcloud/beep-effect/pull/105) [`c880401`](https://github.com/kriegcloud/beep-effect/commit/c880401550768f7a087e7ee9fcc3663954a71b2b) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Improve markdown rendering safety and review-driven ergonomics.

  - block percent-encoded protocol bypasses in URL destination sanitization
  - preserve inline-code edge cases (boundary spaces, empty/multiline handling notes)
  - clarify raw HTML and trusted fragment semantics in renderer/schema docs
  - tighten md schema union composition to reuse variant codecs directly

- Updated dependencies [[`7cd3b3e`](https://github.com/kriegcloud/beep-effect/commit/7cd3b3eecddfb1a6fbae7cae361d5a040dbfbca5), [`da32b0d`](https://github.com/kriegcloud/beep-effect/commit/da32b0db75f71de6fc10c1ea64850ced9935e346), [`3810232`](https://github.com/kriegcloud/beep-effect/commit/381023275837ff506a58170eb4bce2f613ef0f75), [`7a4530b`](https://github.com/kriegcloud/beep-effect/commit/7a4530b99af34b14c6f786a1fa12eb85310c9bec), [`99c2975`](https://github.com/kriegcloud/beep-effect/commit/99c297515600b34353b7182c7e8e77e7ea0c33d6)]:
  - @beep/utils@0.0.1
  - @beep/identity@0.1.0
  - @beep/data@0.0.1
