# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-15

Effect and in particular Effect v4 / effect-smol (`.repos/effect-v4`) has many
useful and elegantly designed packages and modules with rich functionality and
equally rich documentation. This monorepo is Effect-native / effect-first, and
agents are heavily used in the repository. One problem is that modules which
look absolutely brilliant, such as `effect/Combiner`, `effect/Reducer`, and
`effect/Filter`, appear to almost never be used. This is a problem for the user
and for the codebase's principles and laws.

The problem breaks into:

- discoverability: knowing the modules exist;
- when to use them;
- how to use them;
- enforcement of their usage.

The suspected answer lies at the intersection of:

- agent hooks;
- specialized sub-agents;
- embeddings;
- a hybrid AST / semantic knowledge graph;
- an upper ontology such as the Unified Foundational Ontology (UFO);
- Effect's rich JSDoc documentation and custom JSDoc tags;
- a tool like `ts-morph`;
- this repository's architecture and module roles.

Theory: create specialized sub-agents for sections of the Effect v4 codebase.
Each has access to a hybrid AST / semantic knowledge graph created by ingesting
and parsing Effect v4 source and documentation into a custom ontology defined
with an upper ontology. This makes the graph queryable and semantically correct.

Hooks could then force correct and aligned output from coding agents by using
the KG. A judge/router could choose the correct sub-agent.

The Effect v4 codebase's JSDoc standards and patterns should be a primary target
for shaping nodes and relationships. Important deterministic surfaces include
top-level module documentation, standardized requirements around exported
symbols, `@category` tags, `@since` tags, `@see`, `**When to use**`,
`**Details**`, titled examples, and the repo's own JSDoc/custom-tag rules.
