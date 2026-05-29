# `/deep-research` prompt — Agentic CAD patent tooling

Paste the fenced block below into a **fresh** Claude Code session via `/deep-research`. It writes
its report to `agentic-cad-landscape.md` in this directory.

> **Status:** run on 2026-05-29 — the report exists at
> [`agentic-cad-landscape.md`](agentic-cad-landscape.md).
>
> Design notes: scoped to four jobs-to-be-done; a 5-rung *integration-surface* axis (so scriptable
> kernels like CadQuery / build123d / FreeCAD aren't skipped) describing what each tool itself
> exposes; a *deployment / confidentiality* axis for the attorney's Rule 1.6 duty. **Repo-agnostic**
> — no in-house SDK / stack / entity is handed in or assumed; each tool is judged on its own merits.

````
Research the "Agentic CAD" space — AI/LLM-driven CAD generation and editing — and produce a comprehensive, cited report aimed at one reader: a solo intellectual-property/patent attorney who is evaluating tools to ADOPT for his practice. Inspiration tool: adam.new (text-to-parametric-3D CAD).

This is a tool-discovery / buyer's-guide landscape. Cover commercial SaaS, licensed/desktop products, open-source repos, libraries, and packages. Do NOT tailor recommendations to any specific in-house software or architecture — evaluate each tool on its own merits and its own published integration surfaces.

## Jobs to cover (organize the report around all four)
1. USPTO/WIPO patent FIGURES — generating/cleaning the black-line 2D drawings filed with patents (numbered figures, reference numerals, shading/line-weight rules, WIPO ST.96 / USPTO drawing standards).
2. Invention 3D MODELING — turning an invention disclosure or verbal description into an editable parametric 3D model (what adam.new does).
3. PRIOR-ART / reverse-modeling — reconstructing existing devices or accused products from descriptions, photos, or specs to compare against claims.
4. Full DISCLOSURE→FIGURE pipeline — agentic flow that ingests a disclosure and auto-drafts the figure set + figure descriptions + reference-numeral mapping.

## For EVERY tool/project, capture two axes
A. INTEGRATION SURFACE — what the tool itself exposes for programmatic use / automation (highest first): native MCP server > documented REST/gRPC/HTTP API > CLI / headless / batch mode > scriptable language or embeddable library (Python/JS/etc.) > file-format interop only (STEP/STL/SVG/DXF/GLTF). State exactly which rung it sits on and name the specific surface (e.g. "Python API", "REST endpoint", "CLI"). Descriptive — what's available to integrate or automate — not a fit-score against any particular system.
B. DEPLOYMENT & CONFIDENTIALITY: cloud-only | hybrid | self-hostable | fully local/offline — and the attorney-confidentiality (US state-bar Rule 1.6) implication of sending client/invention data to it. Flag any tool that cannot keep privileged client matter data confidential (e.g. cloud-only that trains on user data).

## Report structure
- Landscape per job (cited), covering paid AND open-source.
- A comparison table across tools (job; type [SaaS / licensed / OSS / library]; integration surface + rung; deployment; privilege verdict; price signal).
- A ranked TOP PICK + runner-up per job. For each pick: its concrete integration/automation points (the actual API/CLI/library it exposes) and an explicit deployment/privilege verdict for an attorney handling confidential matters.
- One overall "if he adopts one thing first, start here" recommendation.

## Constraints
- Aimed at a solo IP/patent attorney; assume he values client confidentiality (Rule 1.6) and may want options that can run locally or self-hosted for privileged work — but also report the best cloud tools and note the trade-off.
- Repo-agnostic: do NOT design or assume any specific downstream integration architecture. Just report each tool and what it exposes.

## Output location
Write the final report to:
goals/agentic-cad-patent-tooling/research/agentic-cad-landscape.md
(Create the file. Use clear headings, a comparison table, and inline source citations.)
````
