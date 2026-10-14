# Worker-aware cheap-gate concurrency — 2026-10-14

The ten-minute worker run demonstrated concurrent repository-wide scans
stalling at the proof slice's soft memory threshold. Added a schema-decoded
BEEP_QUALITY_CHEAP_GATE_CONCURRENCY setting accepting 1, 2, 3 or 4. Missing
or malformed values retain the four-lane default. Pre-push remains serial,
wave ordering and required gate coverage remain unchanged. The setting is
read at call time rather than captured when the module loads.

The worker launcher explicitly selects one cheap-gate lane. BEEP_ forwarding
already carries this non-secret setting into detached services; Turbo's
pass-through declaration now includes it as well. This selects a worker budget
without guessing capabilities from hostnames or changing other machines.
The existing 7 GiB soft / 8 GiB hard / 256 MiB swap and two-CPU limits remain.

Tests exercise accepted widths, absent/invalid settings, call-time environment
changes, unchanged pre-push serialization and the detached service's exact
environment argument and recorded forwarded-variable name. Package lint/type
verification passes. Live rerun results will be appended after verification.
