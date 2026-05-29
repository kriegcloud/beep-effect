# `/deep-research` prompt — Agentic CAD patent tooling

Paste the fenced block below into a **fresh** Claude Code session via `/deep-research`. It will
write its report to `agentic-cad-landscape.md` in this directory.

> Design notes (why this prompt is shaped the way it is) live in the approved plan; the short
> version: scoped to four jobs-to-be-done, "MCP or API" widened to a 5-rung integration ladder
> (so scriptable kernels like FreeCAD/CadQuery/OpenSCAD aren't skipped), a deployment/privilege
> axis added for the runtime's on-device mandate, and the stack handed in as labeled GIVENs so
> the integration sketch is concrete.

````
Research the "Agentic CAD" space — AI/LLM-driven CAD generation and editing — and produce a
comprehensive, cited report aimed at one user: a solo intellectual-property/patent attorney.
Inspiration tool: adam.new (text-to-parametric-3D-CAD).

## Jobs to cover (organize the report around all four)
1. USPTO/WIPO patent FIGURES — generating/cleaning the black-line 2D drawings filed with
   patents (numbered figures, reference numerals, shading/line-weight rules, WIPO ST.96).
2. Invention 3D MODELING — turning an invention disclosure or verbal description into an
   editable parametric 3D model (what adam.new does).
3. PRIOR-ART / reverse-modeling — reconstructing existing devices or accused products from
   descriptions, photos, or specs to compare against claims.
4. Full DISCLOSURE→FIGURE pipeline — agentic flow that ingests a disclosure and auto-drafts
   the figure set + figure descriptions + reference-numeral mapping.

## For EVERY tool/project, score on two axes
A. INTEGRATION LADDER (highest first): native MCP server > documented REST/gRPC API >
   CLI/headless mode > scriptable language or embeddable library (Python/JS/etc.) >
   file-format interop only (STEP/STL/SVG/DXF/GLTF). State exactly which rung it sits on.
B. DEPLOYMENT / PRIVILEGE: cloud-only | hybrid | self-hostable | fully local/offline — and the
   attorney-confidentiality (Rule 1.6) implication of sending client/invention data to it.

## Report structure
- Landscape per job (cited), covering paid AND open-source.
- A ranked TOP PICK + runner-up per job. For each pick: a concrete integration sketch against
  the integration target below, and an explicit deployment/privilege verdict.
- One overall "if you integrate one thing first, start here" recommendation.

## Integration target (GIVEN — do NOT research this; use only to judge fit)
The tools may be wrapped into a local-first agentic runtime with these properties:
- All processing for privileged data must run on-device/offline. Local LLM via Ollama
  (Qwen 2.5 14B / Llama 3.3 / Mistral Small 3); local SQLite + local FalkorDB graph; no client
  data leaves the attorney's devices.
- Integration model: a canonical internal Effect/TypeScript SDK is the contract; external
  surfaces (MCP servers, Claude Desktop) are ADAPTERS over that SDK. So the ideal CAD tool is
  one we can wrap as a Connector+Skill behind the SDK — a scriptable kernel or library beats a
  closed SaaS, even one without its own MCP server.
- Domain anchor: a `PatentAsset` entity (knowledge-graph node) that figure/drawing artifacts
  would attach to; figures are modeled per WIPO ST.96 (a `patent.figure` chunk with figure
  number + caption/description + artifact reference).
- Hard ethics constraint: anything touching real client matter data must be privilege-safe
  (US state-bar Rule 1.6); flag any tool that can't satisfy this.

## Output location
Write the final report to:
goals/agentic-cad-patent-tooling/research/agentic-cad-landscape.md
(Create the file. Use clear headings, a comparison table, and inline source citations.)
````
