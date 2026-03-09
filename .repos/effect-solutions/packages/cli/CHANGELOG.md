# effect-solutions

## 0.4.19

## 0.4.18

## 0.4.17

## 0.4.16

## 0.4.15

## 0.4.14

## 0.4.13

## 0.4.12

### Patch Changes

- [`fa64161`](https://github.com/kitlangton/effect-solutions/commit/fa6416134acc8f4f0c7018f6b971c26bd332e083) Thanks [@kitlangton](https://github.com/kitlangton)! - Add @effect/cli documentation with Task Manager example

## 0.4.11

## 0.4.10

## 0.4.9

## 0.4.8

## 0.4.7

## 0.4.6

### Patch Changes

- Expand docs with retry/timeout, layer providing, and memoization patterns

## 0.3.6

### Patch Changes

- [`3c9d019`](https://github.com/kitlangton/effect-solutions/commit/3c9d019d6c329ce656d39a05da929ce7328c89f1) Thanks [@kitlangton](https://github.com/kitlangton)! - Add Testing with Vitest documentation (draft)

  Comprehensive guide for testing Effect code with @effect/vitest based on patterns from the official Effect repository. Covers setup, assertion styles, test variants, and common patterns.

## 0.3.5

### Patch Changes

- [`0836577`](https://github.com/kitlangton/effect-solutions/commit/083657798ad5c94f48275aded3c4cd1d94f95276) Thanks [@kitlangton](https://github.com/kitlangton)! - Refactor CLI to idiomatic Effect patterns

  - Convert open-issue-service to proper Effect services with BrowserService and IssueService
  - Convert update-notifier to service/layer pattern with UpdateNotifier and UpdateNotifierConfig
  - Add Effect.fn trace names to all effectful functions
  - Implement proper layer composition using Layer.provide
  - Update all tests to use new service patterns
  - Remove MCP package
  - All services use Context.Tag with @cli/ prefix
  - Error handling uses Schema.TaggedError

## 0.3.4

### Patch Changes

- Add detailed help descriptions to CLI args and options. Remove strategy parameter (auto-detect platform). Fix type errors in update-notifier.

## 0.3.3

### Patch Changes

- [`368f3f8`](https://github.com/kitlangton/effect-solutions/commit/368f3f8c01603877c647dc21a02a5f0d1dcf2a3c) Thanks [@kitlangton](https://github.com/kitlangton)! - Improve `list` output formatting with slug/title header and wrapped descriptions for better narrow-terminal readability.

## 0.3.2

### Patch Changes

- [`321726e`](https://github.com/kitlangton/effect-solutions/commit/321726e26d8875fe1ed35389dddaec74f4bdfa9b) Thanks [@kitlangton](https://github.com/kitlangton)! - Add repository field to packages for npm provenance. Fix semver comparison in update notifier to prevent showing false update notifications when current version is newer than published version.

## 0.3.1

### Patch Changes

- [`622f4dc`](https://github.com/kitlangton/effect-solutions/commit/622f4dcfb6e893b4ea0364d13bbbea1b322077a3) Thanks [@kitlangton](https://github.com/kitlangton)! - Stop `tsc --build` from emitting dist test artifacts so `bun test` only runs source tests; also tidy CLI open-issue logging and update notifier typings.

- [`479dc5e`](https://github.com/kitlangton/effect-solutions/commit/479dc5eb5c459aaf0a6f99f0a29ef93cdd72db9c) Thanks [@kitlangton](https://github.com/kitlangton)! - Improve release workflow with OIDC trusted publishing and automatic GitHub releases

## 0.3.0

### Minor Changes

- [`0235cf2`](https://github.com/kitlangton/effect-solutions/commit/0235cf2e51024ac205a5a6d70b405dcefdd524aa) Thanks [@kitlangton](https://github.com/kitlangton)! - Comprehensive feature updates across all packages

  **Website**

  - Add OG image generation via Playwright for social sharing
  - Refactor LLM instructions to shared lib
  - Add route groups for better Next.js organization
  - Update docs content

  **CLI**

  - Add update notifier with daily version checks
  - Add open-issue command for GitHub issue creation
  - Support multiple browser opening strategies

  **MCP Server**

  - Add comprehensive test suite for all tools
  - Refactor for improved testability
  - Add vitest dependency

### Patch Changes

- ## [`f034319`](https://github.com/kitlangton/effect-solutions/commit/f03431945dd92af198a874e0ae50e71a014b8095) Thanks [@kitlangton](https://github.com/kitlangton)! - Add multi-arch CLI binaries, launch wrapper, and tag-driven release CI to fix x86/Intel install failures.

## 0.2.4

### Patch Changes

- aa6efbd: Add new documentation topics (HTTP clients, testing with Vitest, observability), publish MCP server, and improve UI animations. All bunx commands now use @latest suffix for consistency.

## 0.2.3

### Patch Changes

- - Read version from package.json instead of hardcoding
  - Fix MCP resource URI pattern to match docs/\* scheme

## 0.2.2

### Patch Changes

- Fix hardcoded version string in CLI

## 0.2.1

### Patch Changes

- Initial release with documentation CLI and MCP server
