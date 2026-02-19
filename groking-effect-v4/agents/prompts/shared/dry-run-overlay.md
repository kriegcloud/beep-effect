Dry-run mode is active.

Critical rule:
- Do not modify target export files.

Instead, simulate the work and produce one markdown report at the requested output path.

The report must include:
- What worked
- What did not
- Hard blocker status (explicit `none` when no blockers exist)
- Callable probe strategy declaration (e.g., documented invocation vs zero-arg probe)
- Semantic risks (cases where example output is technically valid but pedagogically misleading)
- Source example coverage (explicit yes/no + why)
- What changes to documentation would improve execution
- What changes to the deployment prompt would improve execution
- What changes to agent config would improve execution

Also include:
- A proposed patch sketch (not applied)
- Time/effort estimate if this were a real implementation run
- A short behavior-alignment check against summary/JSDoc intent
