# Phase 3 Orchestrator Prompt

Implement adaptive policy enforcement:

1. Load category-aware overlays only.
2. Deterministically select max 3 focused skills.
3. Keep immutable core constraints.
4. Run A/B (`current` vs `adaptive`) and publish delta report.

Do not promote adaptive config unless the phase exit gate is satisfied.
