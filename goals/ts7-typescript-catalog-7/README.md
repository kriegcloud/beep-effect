# TypeScript catalog 7: TS7 exit lane E

Lifecycle: `completed-retained` (operator ruling, 2026-10-15).

Root TypeScript is 7.0.2. Infra/Pulumi keeps 6.x; the live codemod and census
use @typescript/typescript6. Native oxlint replaces Madge and Fallow discovers
manual support roots. The @typescript/native alias remains a separate follow-up.

Read [SPEC.md](SPEC.md), [PLAN.md](PLAN.md), [GOAL.md](GOAL.md), then
[ops/manifest.json](ops/manifest.json). Decisions include superseded approaches
so a future agent does not restore the rejected patches or exemption.

Implementation commit: ca9d9a5828. Main integration: baf501b4aa, containing
94f1b6adbf. The orchestrator owns git and publication; packet completion does not
claim that publication happened or that the full repo-cli audit passed.

Verification evidence and exact exit codes:
`~/.cache/beep/orchestrator/briefs/ts7-exit/lanes/report-E.md`, Waves 1-4.
Raw logs are its sibling e-logs directory. Retained reds are attributed there.
S31b's root-only review is documented in
[research/cache-baseline-basis.md](research/cache-baseline-basis.md).
