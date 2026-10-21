# Python Dependabot source remediation — 2026-10-20

Status: execution hold released after parent confirmed PR #1928 merged. The
post-hold receipt below records generated lock and isolated test/runtime proof.
Earlier investigation sections preserve their authoring-time boundary. No live
runtime/model changes, commits, publication or alert-status changes were made.

## Current-main and checkout provenance

The GitHub `commits/main` API returned
`8086a42233ab3eab7265c8deb7a6f3816686d445`. Local `HEAD` and `origin/main`
returned that same revision during this investigation. Both committed manifests
and locks therefore have the vulnerable versions below. This is a point-in-time
main read, not proof that main will remain unchanged before integration.

Source: ignored `raw/dependabot-open.json`, six pip alerts, all targeting
`packages/tooling/tool/cli/python/photo-face/uv.lock`.

| Alert | Advisory | Locked version | Affected range | First patched |
| --- | --- | --- | --- | --- |
| #326 | GHSA-gh4c-6fx4-qh6g | urllib3 2.7.0 | >=2.6.2,<2.8.0 | 2.8.0 |
| #325 | GHSA-vxq7-64xx-v4gw | urllib3 2.7.0 | >=1.10.3,<2.8.0 | 2.8.0 |
| #324 | GHSA-8988-9cw3-xx77 | urllib3 2.7.0 | >=1.26.0,<2.8.0 | 2.8.0 |
| #309 | GHSA-rrmf-rvhw-rf47 | torch 2.9.1+rocm7.2.0.lw.git7e1940d4 | <=2.12.1 | 2.13.0 |
| #308 | GHSA-qfhq-4f3w-5fph | torch 2.9.1+rocm7.2.0.lw.git7e1940d4 | <2.10.0 | 2.10.0 |
| #307 | GHSA-6w46-j5rx-g56g | pytest 8.4.2 | <9.0.3 | 9.0.3 |

The lock also contains torch 2.9.1+cpu under the mutually exclusive CPU extra.
Both distributions need updating; updating only CPU would leave the named ROCm
alerts valid. None is claimed already fixed or dismissed as unreachable.

Advisories: [urllib3 Deflate loop](https://github.com/advisories/GHSA-gh4c-6fx4-qh6g),
[urllib3 chunk-size buffer](https://github.com/advisories/GHSA-vxq7-64xx-v4gw),
[urllib3 HTTPS proxy TLS](https://github.com/advisories/GHSA-8988-9cw3-xx77),
[torch JIT](https://github.com/advisories/GHSA-rrmf-rvhw-rf47),
[torch LSTM](https://github.com/advisories/GHSA-qfhq-4f3w-5fph),
[pytest tmpdir](https://github.com/advisories/GHSA-6w46-j5rx-g56g).

## Reachability and prior overlaps

The current lock's `insightface -> requests -> urllib3` dependency chain makes
urllib3 a runtime dependency. The worker's own model downloader uses the standard
library's `urllib.request`, not urllib3; that distinction does not prove all
InsightFace or future requests paths unreachable. The streaming advisories need
malicious chunked responses; the proxy advisory needs specific HTTPS proxy and
TLS configuration combinations. No application exploit was executed.

Torch is optional and ordinary Buffalo execution installs neither torch wheel.
AdaFace loads fixed vendored inference graphs and strict safetensors weights;
source inspection found no direct `torch.jit.script` or `torch.lstm_cell` call in
the worker. The JIT advisory is local memory corruption and the LSTM advisory is
local memory corruption with an upstream patch linked in the record. Absence of
a direct worker call does not establish an unreachable transitive runtime path.
Retain version-based remediation rather than an unsupported dismissal.

The original AdaFace distribution/model contract landed in PR #931, commit
`3babc4cdfd474fbb54c7473c1ca35ea8425aeaa7`. Its history explicitly includes
preserving CPU fallback, fail-closed model verification and runtime policy.
The package README documents Linux x64 ROCm/CPU isolation, the same safetensors
weights across both environments, gfx1201 device probing, and the
`BEEP_PHOTO_FACE_ROCM_LIBRARY_PATH` override for native loader compatibility.
These are retained as acceptance requirements, not replaced by a generic PyPI
CUDA wheel or by forced CPU-only execution.

Prior packet `goals/codex-security-findings-2026-09-03/findings/CSF-010.md`
addresses bounded detector crops; `CSF-012.md` addresses aggregate worker/report
limits. Both record PR #949 and historical 53-test proof with dependency-gated
skips. Those controls are separate from dependency versions and do not close
these six alerts. Their historical proof is not proof for this upgrade.
No separate retained photo-curation goal packet was identified in the targeted
source/history search; no missing receipt is invented.

## Upstream package metadata and candidate pins

[pytest 9.0.3 metadata](https://pypi.org/pypi/pytest/9.0.3/json) and
[urllib3 2.8.0 metadata](https://pypi.org/pypi/urllib3/2.8.0/json) both require
Python >=3.10, compatible with this project's Python 3.12 contract.
[requests 2.34.2 metadata](https://pypi.org/pypi/requests/2.34.2/json) permits
urllib3 >=1.26,<3, so 2.8.0 does not contradict its declared requirement.
The manifest now pins pytest 9.0.3 and constrains the transitive urllib3 to 2.8.0
using uv's documented `tool.uv.constraint-dependencies` setting. See
[uv settings](https://docs.astral.sh/uv/reference/settings/#constraint-dependencies).
This preserves the direct dependency shape while enforcing the transport pin.

The existing [AMD ROCm 7.2 catalog](https://repo.radeon.com/rocm/manylinux/rocm-rel-7.2/)
offers CPython 3.12 torch through 2.10.0. That fixes #308 but does not satisfy
#309's >=2.13.0 floor. Therefore a same-catalog 2.10 update is insufficient.

The official [PyTorch ROCm 7.2 index](https://download.pytorch.org/whl/rocm7.2/torch/)
and [CPU index](https://download.pytorch.org/whl/cpu/torch/) advertise
CPython 3.12 Linux x64 `torch-2.13.0+rocm7.2` and `torch-2.13.0+cpu` wheels.
Candidate manifest replacements select these exact builds, retaining ROCm 7.2,
Python 3.12, Linux x64 and mutually exclusive extras.

CPU wheel `.metadata` and bounded ZIP64 metadata reads of the ROCm wheel confirm:

- Both report `Requires-Python: >=3.10`.
- Both require filelock, typing-extensions>=4.10.0, setuptools>=77.0.3,
  sympy>=1.13.3, networkx>=2.5.1, jinja2 and fsspec>=0.8.5.
- The ROCm wheel additionally requires `triton-rocm==3.7.1` on Linux for
  Python <3.15. It does not declare CUDA/NVIDIA package dependencies.
- The old explicit AMD `triton==3.5.1+rocm7.2.0...` is replaced with the
  official CPython 3.12 `triton-rocm==3.7.1` wheel. Leaving both would risk
  overlapping Python modules with incompatible providers.

[triton-rocm metadata](https://download.pytorch.org/whl/triton_rocm-3.7.1-cp312-cp312-linux_x86_64.whl.metadata)
confirms Python >=3.10,<3.15; the
[official index](https://download.pytorch.org/whl/rocm7.2/triton-rocm/)
advertises that exact build and SHA-256
`b200ade2418b8450e4e3e69c33c804e2cc07d1e36dc9678ac8ac1dd65f9e10e1`.
The CPU index advertises torch wheel SHA-256
`4ca4a9394b0c771238a4f73590fdbbc4debad85ed0fa63d026ae1b085da7d6e2`.

The ROCm wheel is 6,227,849,000 bytes. The index lacks separate METADATA;
bounded HTTP ranges read the ZIP64 central directory and its small METADATA
entry without fetching the wheel as an installable asset. An initial mirror
ignored Range and was closed without reading its body; the canonical
`download.pytorch.org` endpoint honored ranges. A first central-directory parse
encountered ZIP64's sentinel offset, then a ZIP64-aware parse succeeded. No
installation or dependency resolver ran. Native library and gfx1201 behavior
remain unproven despite the compatible target tags.

## Changed and deliberately pending state

Changed the Python manifest/README and exact runtime-provenance consumers listed
below, plus this report. Worker graph, model weights/hashes, thresholds, device policy,
CPU fallback and native-library override remain intact.

`uv.lock` intentionally still describes the old vulnerable environment because
lock generation is prohibited during the hold. The manifest/lock mismatch must
not be published or called fixed. Frozen execution will correctly refuse this
mismatch until the lock is regenerated after release.

After parent confirms #1928 merged, integrate main, reconcile these candidate
pins, budget disk for the large ROCm wheel plus extracted environments, then:

1. Run a narrow lock update from `python/photo-face`, preserving unrelated
   transitive versions where possible: `uv lock --upgrade-package urllib3
   --upgrade-package pytest`. Changed direct-URL torch/triton sources must also
   be reflected by the resolver. Review the resulting diff and confirm BOTH
   torch distributions, triton-rocm, urllib3 and pytest and removal of stale
   triton provider. Do not hand-edit lock artifacts or fake versions.
2. Use an isolated disposable cache/environment under `~/.cache/beep/`, not a
   live runtime environment. Run frozen Python 3.12 default-worker tests and
   lint, then run tests with `--extra adaface-cpu`; dependency-gated numerical
   tests must execute rather than silently skip in the CPU lane. Existing
   regressions cover fixed-graph bucket indexing, alignment, bounded crops,
   strict safetensors, protocol budgets and orchestration policy.
3. Materialize the ROCm extra separately; check torch version/HIP provenance,
   native import, triton-rocm provider, intended gfx1201 device selection and
   the existing finite native tensor probe. Preserve active GPU jobs and old
   environment. Then run a minimal synthetic forward pass through the vendored
   graph with the new torch cohort. Real-model proof must use an already
   approved model cache/fixture without downloading or exposing user photos.
4. Run repo CLI portability/fallback regressions and package verification,
   followed by exact merged-head dependency-graph/alert reads. Registry
   metadata availability and a local lock do not by themselves close alerts.

If resolution or ROCm inference fails, keep this lane open. Alternatives are a
compatible official later ROCm-7.2 torch cohort meeting >=2.13, or a reproducible
patched build with provenance and runtime proof. Keeping AMD 2.9.1, downgrading
scope to CPU-only, or dismissing the alerts because the specific API is not
called directly are not accepted resolutions. This report records no new
billing, live runtime changes or alert-status decisions.

## Completed caller update and complete changed paths

After the parent extended ownership, updated the exact accepted runtime versions
in `MatchPerson.worker-service.ts` to `2.13.0+cpu` and `2.13.0+rocm7.2`.
The strict equality comparison, ROCm HIP 7.2 and gfx1201 checks, single-device
requirement, CPU/HIP coherence and fallback-warning policy remain unchanged.

Updated successful CPU/ROCm model fixtures and schema documentation. Expanded
the existing worker-envelope regression to reject the old vulnerable pins,
missing distribution suffixes (`2.13.0`) and cross-family suffixes in BOTH
CPU and ROCm provenance. Existing successful cases now exercise the candidate
new exact pins. `person-match-portability.test.ts` contains no old torch version
pin; its platform/fallback behavior is unchanged and remains a pending test.

Complete dependency-lane changed files (repository relative):

- `packages/tooling/tool/cli/python/photo-face/pyproject.toml`
- `packages/tooling/tool/cli/python/photo-face/README.md`
- `packages/tooling/tool/cli/python/photo-face/tests/test_adaface_backend.py`
- `packages/tooling/tool/cli/src/commands/Files/internal/MatchPerson.worker-service.ts`
- `packages/tooling/tool/cli/src/commands/Files/internal/MatchPerson.schemas.ts`
- `packages/tooling/tool/cli/test/files-command.test.ts`
- `packages/tooling/tool/cli/test/person-match-model-store.test.ts`
- `goals/codex-security-findings-2026-10-20/research/dependabot-python.md`

The remaining old-version mentions in authored regression inputs intentionally
exercise rejection; historical packet evidence and the held lock preserve their
actual versions. Tests and package checks still have not run. Actual
`torch.__version__` reporting remains a post-hold runtime gate: if it differs
from the candidate expected value, inspect and reconcile provenance rather than
loosening the guard to accept arbitrary versions.

## Released-hold resolution and isolated proof (2026-10-20)

Parent confirmed PR #1928 merged at `426d494b3433ccddf797a2d896984f1ad23c81ad`
and integrated main before releasing execution. Before wheel acquisition,
`df -h /home` reported 535 GiB available. The 6.23 GB archive, extracted cache,
and separate default/CPU/ROCm environments fit a conservative 35 GB proof
budget. Environments live only under `~/.cache/beep/security-dependency-proof-20261020/`.
No existing photo-face environment, runtime service, GPU job, model or photo
collection was modified. uv's normal shared artifact cache received downloaded
wheels; isolated environments prevent changing existing installed cohorts.

`uv lock --upgrade-package urllib3 --upgrade-package pytest` completed in
2m28s and resolved 47 packages. Generated lock selects:

- urllib3 2.8.0 and pytest 9.0.3;
- torch 2.13.0+cpu and torch 2.13.0+rocm7.2 in conflicting extras;
- triton-rocm 3.7.1, removing the previous AMD `triton` provider.

uv upgraded the lock format revision from 3 to 5 and simplified impossible
mutually exclusive extra markers. No unrelated package versions changed.
The resolver recorded ROCm wheel SHA-256
`2ad8066cb9d3c00b2dc77ec5af998eed495e7240e724e8c28124d4d5faba52f0`;
CPU/triton hashes match the previously retrieved official index values.
No hand-authored lock change was made.

Proof used CPython 3.12.13 and frozen sync separately for each cohort:

| Cohort | Actual result |
| --- | --- |
| Default, without torch | 53 passed, 3 intentional dependency-gated skips; `ruff check .` passed |
| `--extra adaface-cpu` | 56 passed, zero skipped; actual torch 2.13.0+cpu, HIP `None` |
| `--extra adaface` | 56 passed, zero skipped; actual torch 2.13.0+rocm7.2, HIP 7.2.53211, triton-rocm 3.7.1 |
| CLI provenance/model-store/portability | 3 test files, 135 tests passed |

The CLI command was run from its package root using `bunx vitest run --config
vitest.config.ts test/files-command.test.ts test/person-match-model-store.test.ts
test/person-match-portability.test.ts`. Parent owns the combined package-level
verification because its Accounts changes share `@beep/repo-cli`.

Native ROCm import succeeded without an added library override. The existing
`_probe_device(torch, 0)` passed allocation, CPU/GPU transfer, matmul and sync,
reporting GPU 0 `gfx1201`. Two devices are enumerated on this host; proof selected
one device. A synthetic forward pass through BOTH unchanged vendored graphs
passed independently on CPU and ROCm: aligner outputs `(1,1050,4)`,
`(1,1050,2)`, `(1,1050,10)`, `(1,16)`, `None`; recognizer output `(1,512)`.
All produced tensor values were finite. ROCm emitted four `(null): No such file
or directory` diagnostics during runtime discovery, but imports, strict device
probe and both graph executions returned success. These diagnostics do not
establish an inference failure; retain the existing typed failure/fallback
policy unchanged.

An initial default-suite call overlapped the still-running lock resolver and
therefore exercised the old frozen lock. That result was treated only as a
baseline, then repeated after resolution; the table reports the repeated new
cohort. This exposed that `uv --frozen` trusts the existing lock while an
independent resolution is pending: serialize lock completion before proof.

No approved pre-existing model cache was found at the worker's standard
`~/.cache/beep/photo-face/adaface-kprpe` path. Synthetic graphs use random
initial weights; this receipt does not claim pinned real-weight face quality,
threshold calibration, a real-photo run, or actual full worker inference.
No model download was initiated. Existing model checksums and strict-state tests
are retained; real-weight validation remains a separate acceptance boundary.

Sanitized command/output logs and the native synthetic script are retained in
`~/.cache/beep/security-dependency-proof-20261020/`. This source/lock/runtime
proof does not claim merged-head graph ingestion or automatic alert closure.
