# @beep/md

## 0.0.1

### Patch Changes

- [#105](https://github.com/kriegcloud/beep-effect/pull/105) [`c880401`](https://github.com/kriegcloud/beep-effect/commit/c880401550768f7a087e7ee9fcc3663954a71b2b) Thanks [@kriegcloud](https://github.com/kriegcloud)! - Improve markdown rendering safety and review-driven ergonomics.

  - block percent-encoded protocol bypasses in URL destination sanitization
  - preserve inline-code edge cases (boundary spaces, empty/multiline handling notes)
  - clarify raw HTML and trusted fragment semantics in renderer/schema docs
  - tighten md schema union composition to reuse variant codecs directly

- Updated dependencies [[`7cd3b3e`](https://github.com/kriegcloud/beep-effect/commit/7cd3b3eecddfb1a6fbae7cae361d5a040dbfbca5), [`1db7b92`](https://github.com/kriegcloud/beep-effect/commit/1db7b926466b58d5020c2e65b5027dfc8f6f947d), [`da32b0d`](https://github.com/kriegcloud/beep-effect/commit/da32b0db75f71de6fc10c1ea64850ced9935e346), [`2ad8f27`](https://github.com/kriegcloud/beep-effect/commit/2ad8f270810cba11712cccb2617761dda429c4d4), [`3810232`](https://github.com/kriegcloud/beep-effect/commit/381023275837ff506a58170eb4bce2f613ef0f75), [`7a4530b`](https://github.com/kriegcloud/beep-effect/commit/7a4530b99af34b14c6f786a1fa12eb85310c9bec), [`3382a1a`](https://github.com/kriegcloud/beep-effect/commit/3382a1a96eac09da980266a2ecb8bb508d32876c), [`99c2975`](https://github.com/kriegcloud/beep-effect/commit/99c297515600b34353b7182c7e8e77e7ea0c33d6), [`c880401`](https://github.com/kriegcloud/beep-effect/commit/c880401550768f7a087e7ee9fcc3663954a71b2b)]:
  - @beep/schema@0.1.0
  - @beep/utils@0.0.1
  - @beep/identity@0.1.0
