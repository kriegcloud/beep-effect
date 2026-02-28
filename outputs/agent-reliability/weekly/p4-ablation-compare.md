# P4 Ablation Compare

- baselineRunAtEpochMs: 1772004195565
- baselineStatus: completed
- candidateRunAtEpochMs: 1772287671158
- candidateStatus: completed
- baselineRunMode: simulate
- candidateRunMode: live
- baselineExecutionBackend: unknown
- candidateExecutionBackend: sdk

> NON-COMPARABLE: baseline and candidate do not share equivalent matrix/run-mode assumptions.
> - task IDs differ (baseline=apps_web_01,apps_web_02,apps_web_03,apps_web_04,apps_web_05,apps_web_06,package_lib_01,package_lib_02,package_lib_03,package_lib_04,package_lib_05,package_lib_06,tooling_cli_01,tooling_cli_02,tooling_cli_03,tooling_cli_04,tooling_cli_05,tooling_cli_06 candidate=apps_web_01,package_lib_01,package_lib_03,tooling_cli_01).
> - agents differ (baseline=claude,codex candidate=claude).
> - trials differ (baseline=1,2 candidate=1).
> - runMode differs (baseline=simulate, candidate=live).

| Metric | Baseline | Candidate | Delta |
|---|---:|---:|---:|
| Success Rate | 100.00% | 0.00% | -100.00pp |
| Wrong-API Incidents | 0 | 0 | 0 |
| Run Count | 288 | 16 | -272 |
