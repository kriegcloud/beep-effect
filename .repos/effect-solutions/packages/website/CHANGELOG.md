# @effect-best-practices/website

## 0.4.19

### Patch Changes

- [#19](https://github.com/kitlangton/effect-solutions/pull/19) [`b28d951`](https://github.com/kitlangton/effect-solutions/commit/b28d951a1c3ada7a29ee48e2c9f720b52a57211d) Thanks [@f15u](https://github.com/f15u)! - add service `use` pattern

- [`3953a68`](https://github.com/kitlangton/effect-solutions/commit/3953a688c11d0bc20865fcdbe668c0f06959837a) Thanks [@kitlangton](https://github.com/kitlangton)! - Clarify that Schema lives in `effect/Schema` and prefer per-test layers over `it.layer` unless you deliberately share state.

- [#26](https://github.com/kitlangton/effect-solutions/pull/26) [`2545267`](https://github.com/kitlangton/effect-solutions/commit/25452675a9aa7a78cb91a5665de12c9b16b2df36) Thanks [@urban](https://github.com/urban)! - Strengthen the visual affordance for interactive elements

## 0.4.18

### Patch Changes

- [`a1286a6`](https://github.com/kitlangton/effect-solutions/commit/a1286a64029fd93c4722fda2f177706475fca1ae) Thanks [@kitlangton](https://github.com/kitlangton)! - Note that schema lives in `effect/Schema` and stop suggesting installing `@effect/schema`.

## 0.4.17

### Patch Changes

- [`f1a32bf`](https://github.com/kitlangton/effect-solutions/commit/f1a32bfb4ed33e49e85e5dbc951e3c4bc91ba5d9) Thanks [@kitlangton](https://github.com/kitlangton)! - improve it.layer docs

## 0.4.16

### Patch Changes

- [`b8d8b07`](https://github.com/kitlangton/effect-solutions/commit/b8d8b077a37da74bf5c8517217711dc7584b2a90) Thanks [@kitlangton](https://github.com/kitlangton)! - fix terminal error rendering and add colors

- [`fa52619`](https://github.com/kitlangton/effect-solutions/commit/fa52619e932f2d103b0fb3fd2752d0269a141ef4) Thanks [@kitlangton](https://github.com/kitlangton)! - Refactor TerminalDemo component into a subfolder with extracted domain, services, and commands.

## 0.4.15

### Patch Changes

- [`72dd8fe`](https://github.com/kitlangton/effect-solutions/commit/72dd8feab06c0a2d6ab4722e3609b2ea89bddabc) Thanks [@kitlangton](https://github.com/kitlangton)! - reset-button-sfx

## 0.4.14

### Patch Changes

- [`e382f93`](https://github.com/kitlangton/effect-solutions/commit/e382f938fec1e5b41007afdfb357dad92f46be41) Thanks [@kitlangton](https://github.com/kitlangton)! - terminal-demo-focus-scroll

## 0.4.13

### Patch Changes

- [`a1c06ba`](https://github.com/kitlangton/effect-solutions/commit/a1c06ba27f3d07267136df35ae9cabd2fdef9570) Thanks [@kitlangton](https://github.com/kitlangton)! - Add interactive terminal demo for CLI docs. Simulates task manager CLI in browser with localStorage persistence.

## 0.4.12

### Patch Changes

- [`fa64161`](https://github.com/kitlangton/effect-solutions/commit/fa6416134acc8f4f0c7018f6b971c26bd332e083) Thanks [@kitlangton](https://github.com/kitlangton)! - Add @effect/cli documentation with Task Manager example

## 0.4.11

### Patch Changes

- [`09c18d9`](https://github.com/kitlangton/effect-solutions/commit/09c18d99ab0efdcce99c2e1dd306996c07fa1a4d) Thanks [@kitlangton](https://github.com/kitlangton)! - restructure data modeling docs

## 0.4.10

### Patch Changes

- [`f7f5e91`](https://github.com/kitlangton/effect-solutions/commit/f7f5e91d7f280f3b774fb0af669c4baaa099d3aa) Thanks [@kitlangton](https://github.com/kitlangton)! - Fix header icon animation on navigation

## 0.4.9

### Patch Changes

- [`ee78386`](https://github.com/kitlangton/effect-solutions/commit/ee7838681c37c92e75a7ca9feeea7e020b088cf8) Thanks [@kitlangton](https://github.com/kitlangton)! - Publish testing doc

## 0.4.8

### Patch Changes

- [`021de1a`](https://github.com/kitlangton/effect-solutions/commit/021de1a3b3716af81bc357fbde629b2fad36fada) Thanks [@kitlangton](https://github.com/kitlangton)! - Fix header link height and title animation

## 0.4.7

### Patch Changes

- [`0820a79`](https://github.com/kitlangton/effect-solutions/commit/0820a79a79c0452ec48551915d99880c06432ff8) Thanks [@kitlangton](https://github.com/kitlangton)! - Add expected errors vs defects section to error handling doc. Add MDX table styling with edge-to-edge borders.

- [`35e8333`](https://github.com/kitlangton/effect-solutions/commit/35e8333ce485c6d277cb9b192094c950134ee427) Thanks [@kitlangton](https://github.com/kitlangton)! - Overhaul testing-with-vitest doc with worked example, fix heading anchor links

## 0.4.6

### Patch Changes

- Expand docs with retry/timeout, layer providing, and memoization patterns

## 0.4.5

### Patch Changes

- Clarify Effect.fn call-site tracing and yieldable errors documentation

## 0.4.4

### Patch Changes

- [`3c9d019`](https://github.com/kitlangton/effect-solutions/commit/3c9d019d6c329ce656d39a05da929ce7328c89f1) Thanks [@kitlangton](https://github.com/kitlangton)! - Add comprehensive test coverage for documentation examples

  Created test files for all non-draft documentation to validate code examples are correct and working. All 61 tests passing with vitest and @effect/vitest.

- [`3c9d019`](https://github.com/kitlangton/effect-solutions/commit/3c9d019d6c329ce656d39a05da929ce7328c89f1) Thanks [@kitlangton](https://github.com/kitlangton)! - Add Testing with Vitest documentation (draft)

  Comprehensive guide for testing Effect code with @effect/vitest based on patterns from the official Effect repository. Covers setup, assertion styles, test variants, and common patterns.

- [`3c9d019`](https://github.com/kitlangton/effect-solutions/commit/3c9d019d6c329ce656d39a05da929ce7328c89f1) Thanks [@kitlangton](https://github.com/kitlangton)! - Upgrade @effect/vitest to 0.27.0 for utils export support

  Upgrade from 0.1.0 to 0.27.0 to support importing assertion utilities from @effect/vitest/utils. Update test infrastructure to use vitest instead of bun test for documentation examples.

## 0.4.3

### Patch Changes

- [`63e6201`](https://github.com/kitlangton/effect-solutions/commit/63e62013b6a2baa000d75563fad6a90ed68aa337) Thanks [@kitlangton](https://github.com/kitlangton)! - Add docs typecheck script: ensures TypeScript code blocks in docs are valid

- [`c933808`](https://github.com/kitlangton/effect-solutions/commit/c933808fc05e7cadfc5f70da140542dc4fc30342) Thanks [@kitlangton](https://github.com/kitlangton)! - Add Twitter creator and site tags for better card attribution

## 0.4.2

### Patch Changes

- [`b734ce1`](https://github.com/kitlangton/effect-solutions/commit/b734ce194e262a04931c5f9e674c913f79652a90) Thanks [@kitlangton](https://github.com/kitlangton)! - Add MIT license and contributing guidelines with issue-first workflow

- Improve agent setup instructions: restructure LLM instructions with consolidated confirmation rules and interaction modes, refine quick-start documentation with clearer agent-guided setup framing, and simplify reference repositories guidance

- [`b734ce1`](https://github.com/kitlangton/effect-solutions/commit/b734ce194e262a04931c5f9e674c913f79652a90) Thanks [@kitlangton](https://github.com/kitlangton)! - Standardize code style across documentation examples: remove semicolons, use destructured imports from 'effect', enforce camelCase layer naming, and consistent @app/ tag prefixes

## 0.4.1

### Patch Changes

- [`6a6f9ec`](https://github.com/kitlangton/effect-solutions/commit/6a6f9ecc471f25c3a9cc6c253b0dc1c4d16d7de0) Thanks [@kitlangton](https://github.com/kitlangton)! - Fix AudioContext errors and sound queueing issues. Sounds now wait for first user interaction (click/keydown/touch) before playing, preventing console warnings and simultaneous playback of queued sounds. Also fixed negative blur filter values in animations.

## 0.4.0

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

## 0.3.0

### Minor Changes

- 243af14: Remove interactive lesson components and simplify site navigation. Add CursorInstallButton for one-click MCP setup. Update design documentation with hard-edge styling guidelines.

### Patch Changes

- f9f85b3: Add mock layer implementation patterns to services documentation
- 85cb49a: Improve LLM instructions UX and add GitHub link

  - Restructure overview with "LLM Agent Quick Start" section
  - Add GitHub link to header next to sound toggle
  - Fix text overflow glitch in LLMInstructionsButton animation

## 0.2.0

### Minor Changes

- Add LLM Instructions button to overview page

  New LLMInstructionsButton component provides:

  - One-click copy of AI assistant setup instructions
  - Guidance on MCP setup, project setup, and Effect questions
  - Links to MCP server commands and CLI access
  - Complete list of key topics covered in documentation

  Helps users quickly share Effect Solutions context with AI assistants for better Effect development support.
