# Execution friction

| Date | Work | Evidence | Prevention |
| --- | --- | --- | --- |
| 2026-10-17 | Opening worker handoff | Assigned brief asks for the handoff file and final format it names, but contains no explicit handoff path or full report template; it specifies only the ending `final <sha40> #<pr>`. | Include a lane/date handoff path and explicit field template in future dispatches. This lane records the chosen conventional path in SPEC Decision Log and uses it for both handoff and final report. |
| 2026-10-17 | Preparing monitor-free publication | `yeet publish --help` always submits a detached readiness monitor; its flags have no disable-monitor form. The assigned brief forbids a readiness monitor. | Add an explicit monitor-free worker publication option. This lane uses the brief-authorized push/PR fallback after cheap gates. |
