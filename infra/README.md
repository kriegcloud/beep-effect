# Infrastructure path configuration

The committed stack files use absolute placeholders for machine-specific paths.
Pulumi does not expand `$HOME` or `~` in YAML values. Before deploying, replace
the placeholders with paths valid on the machine that consumes them.

For AI Metrics, `aiMetrics:remoteConfigRoot` is an absolute directory on the
remote target, not on the Pulumi workstation. The source default is
`/srv/ai-metrics`; set the existing deployment's directory explicitly to retain
its data and service location. From `infra`, for example:

```sh
pulumi config set aiMetrics:remoteConfigRoot /absolute/remote/path/to/ai-metrics \
  --stack beep-ai-metrics-dankserver
```

OpenClaw requires the target user's absolute home through its identity config;
it never derives that home from the workstation running Pulumi.

For CI runners, the ZIP files are absolute local filesystem inputs on the
Pulumi workstation. From `infra/ci-runners`, set all five artifact paths after
building the artifacts:

```sh
pulumi config set ciFleetController:runnerBinariesSyncerLambdaZip "$HOME/beep-infra-artifacts/gha-runner/v7.10.1/runner-binaries-syncer.zip" --stack production
pulumi config set ciFleetController:runnersLambdaZip "$HOME/beep-infra-artifacts/gha-runner/v7.10.1/runners.zip" --stack production
pulumi config set ciFleetController:terminationWatcherLambdaZip "$HOME/beep-infra-artifacts/gha-runner/v7.10.1/termination-watcher.zip" --stack production
pulumi config set ciFleetController:webhookLambdaZip "$HOME/beep-infra-artifacts/gha-runner/v7.10.1/webhook.zip" --stack production
pulumi config set ciTurboCache:lambdaZipPath "$HOME/beep-infra-artifacts/turbo-cache/2.12.0/turbo-cache.zip" --stack production
```

The shell expands the quoted `$HOME` before Pulumi stores the resulting absolute
value. Keep workstation-specific overrides local; do not commit them.
