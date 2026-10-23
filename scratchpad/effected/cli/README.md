# cli ./ui (lab half of @effected/cli)

The root and `./testing` half of this port is the `@beep/cli-kit` package
(`packages/foundation/capability/cli-kit`, wave 4-C of `goals/effected-promotion`).
What stays here is the `./ui` half: the Ink screens and live views (`ui/**`), the
`ui.ts`, `ui-testing.ts` and `ui-testing-serializer.ts` entry files, and their tests
under `scratchpad/test/cli`.

The ui files import the root through `@beep/cli-kit` (the barrel type-only, the leaves
and `@beep/cli-kit/internal/*` as values). The lab `boundary.test.ts` keeps the ui
rules (the Ink loader, the process-streams licence, type-only root names); the
package's own boundary test holds the root rules.

This half is deferred (SPEC W4-m): close-out PR C deletes it and records the last sha
that holds it, with the Accounts TUI as the consumer that would bring it back.
