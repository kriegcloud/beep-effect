# Opportunities

| Date | Work | Evidence | What would have prevented the friction |
| --- | --- | --- | --- |
| 2026-10-14 | Validate the Grok strict sandbox before publishing the critic launcher repair. | The installed Grok CLI refused to start its sandbox because the runtime-socket deny path under `/run/podman/` was inaccessible. Its explicit refusal preserved the read-only boundary; the Grok reviewer cannot run on this host until the sandbox plan is repaired. | A local sandbox preflight that checks deny-path resolution and returns a bounded, actionable result before the reviewer sequence starts. |
