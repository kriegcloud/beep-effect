# Harness the Harness: Claude Code for Lawyers Without the Setup

## Status

<!-- BEGIN GENERATED: EXPLORATION STATUS -->
Stage: `align`
Status: `active`
<!-- END GENERATED: EXPLORATION STATUS -->

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

The developer stack gives Claude real leverage, but it took a dozen-plus MCP
servers, a proxy, a secret manager, toolchains and dozens of permission rules
to get there. Wrap Claude Code so a lawyer gets the same capability on a
Windows workstation without any of that: an onboarding agent that interviews
the practice and provisions it, one gateway MCP, and a harness that owns
Claude Code's extension points. Origin: the Notion Development Todo "Coding
Agent Effectiveness & How the same capabilities can be achieved for non
technical agent setups in beep-effect (law-practice)".

## Next Open Question

Align round 1: Q1 wrap vehicle (extensions only vs an own t3code-style app),
Q2 bootstrap path, Q3 gateway shape, Q4 proving ground, Q5 whether to buy the
ABA adoption data. See [`ops/manifest.json`](./ops/manifest.json).

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - the Notion thesis and the operator's own words.
3. [`RESEARCH.md`](./RESEARCH.md) - t3code, `.mcpb`, Windows, adoption data, in-repo bricks.
4. [`DECISIONS.md`](./DECISIONS.md) - D1–D5.
5. [`research/SOURCES.md`](./research/SOURCES.md) - provenance ledger.

Siblings: [`claude-mods-law-practice`](../claude-mods-law-practice/README.md)
owns the in-Claude-Code wrap layer (graduated to `practice-claude-mod`);
[`stack-installer`](../stack-installer/README.md) holds the installer lessons
this packet re-enters.

## Trail

- 2026-10-14: packet opened from the Notion item (S23, D1); capture of the
  operator discussion; research pass (t3code, `.mcpb`, Claude Code on
  Windows, solo/small-firm adoption, in-repo inventory); D1–D5 recorded;
  stopped at align round 1.
