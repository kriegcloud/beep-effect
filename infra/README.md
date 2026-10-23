# Infrastructure path configuration

Committed stack files never carry a machine-specific absolute path. Pulumi does
not expand `$HOME` or `~` in YAML values, so the programs resolve those paths
themselves when they start. Following this guide needs no `pulumi config set`
and leaves no edits in tracked files.

## CI runner artifacts

The ZIP inputs in `ci-runners/Pulumi.production.yaml` are paths relative to an
artifacts root on the Pulumi workstation, for example
`turbo-cache/2.12.0/turbo-cache.zip`. The version directories stay in the
stack file so an artifact upgrade remains a reviewed config change.

The root is `BEEP_INFRA_ARTIFACTS_ROOT` when it is set, otherwise
`$HOME/beep-infra-artifacts`. It must be absolute. The Turbo cache build
(`lambda/turbo-cache/build.sh`) writes into the same root. To use another
directory for one run, from `infra/ci-runners`:

```sh
BEEP_INFRA_ARTIFACTS_ROOT=/absolute/path/to/artifacts pulumi preview --stack production
```

An absolute value in a stack key still overrides the root for that key. Set
one only in an uncommitted stack, never in the committed `production` file.

## AI Metrics remote root

`aiMetrics:remoteConfigRoot` is a directory on the remote target, not on the
Pulumi workstation. When the stack leaves it unset, the program uses
`BEEP_AI_METRICS_REMOTE_CONFIG_ROOT` when that is set, otherwise
`/home/<aiMetrics:sshUser>/ai-metrics`, which is where the existing
`beep-ai-metrics-dankserver` deployment keeps its compose file and service.
To deploy elsewhere for one run, from `infra`:

```sh
BEEP_AI_METRICS_REMOTE_CONFIG_ROOT=/absolute/remote/path/to/ai-metrics \
  pulumi preview --stack beep-ai-metrics-dankserver
```

## OpenClaw

OpenClaw requires the target user's absolute home through its identity config;
it never derives that home from the workstation running Pulumi.
