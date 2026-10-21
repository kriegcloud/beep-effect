# Rust Dependabot remediation investigation — 2026-10-20

## Evidence and execution boundary

Initial sections record source/advisory review during the execution hold. Parent
subsequently confirmed PR #1928 merged and released execution; the post-hold
receipt below records Cargo lock generation, source integrity and native proof.
No commits, publication or alert-status changes were made by this lane.

GitHub's `commits/main` API and the local `origin/main` both identified
`8086a42233ab3eab7265c8deb7a6f3816686d445` during this review. The lock versions
below appear in both that revision and the working tree. Exact alert metadata is
in the ignored `raw/dependabot-open.json`; this report excludes private payloads.

## Exact alert inventory

| Alert | Manifest | Locked version on reviewed main | Advisory | Disposition |
| --- | --- | --- | --- | --- |
| [61](https://github.com/beep-effect/beep-effect/security/dependabot/61) | `apps/professional-desktop/src-tauri/Cargo.lock` | glib 0.18.5 | [GHSA-wrw7-89jp-8q8g](https://github.com/advisories/GHSA-wrw7-89jp-8q8g) | Valid vulnerable dependency; compatible upstream fix unavailable; candidate source backport below |
| [306](https://github.com/beep-effect/beep-effect/security/dependabot/306) | `apps/labs/semantica/src-tauri/Cargo.lock` | glib 0.18.5 | Same glib advisory | Same root cause and compatibility constraint as 61 |
| [333](https://github.com/beep-effect/beep-effect/security/dependabot/333) | `apps/professional-desktop/src-tauri/Cargo.lock` | rustls 0.23.40 | [GHSA-2mjx-qc3c-rqvc](https://github.com/rustls/rustls/security/advisories/GHSA-2mjx-qc3c-rqvc) | Compatible targeted update candidate: 0.23.45 |
| [310](https://github.com/beep-effect/beep-effect/security/dependabot/310) | `apps/professional-desktop/src-tauri/Cargo.lock` | serde_with 3.20.0 | [GHSA-7gcf-g7xr-8hxj](https://github.com/jonasbb/serde_with/security/advisories/GHSA-7gcf-g7xr-8hxj) | Compatible targeted update candidate: 3.21.0 |

The semantica lock already has serde_with 3.22.0 and no rustls package. Its
serde_with version is beyond alert 310's affected range. This does not remove
its glib alert.

## Prior work and overlap

The historical July 4 dependency-cleanup record identified glib 0.18.5 through
GTK 0.18.2 and Tauri 2.11.x as blocked by compatible version constraints. That
historical conclusion was rechecked against current locks, registry metadata,
and upstream source here; it is not treated as current proof by itself.
Targeted searches of existing tracked security-goal findings and research did
not identify these GHSA identifiers, crate names, or VariantStrIter as an
existing remediation packet. These are dependency advisories added to this
packet, separate from its eight CSF source-code findings. Alerts 61 and 306
share one upstream flaw across two dependency roots and require proof in both.

## glib: valid flaw, no compatible released upstream fix

The reviewed lock chains include:

- professional-desktop: tauri 2.11.1 / tauri-runtime-wry 2.11.1 / wry 0.55.1
  and webkit2gtk 2.0.2 → gtk 0.18.2 → glib 0.18.5;
- semantica: tauri 2.11.5 / tauri-runtime-wry 2.11.4 / wry 0.55.1 and
  webkit2gtk 2.0.2 → gtk 0.18.2 → glib 0.18.5.

The [latest Tauri 2.12.4 dependency metadata](https://crates.io/api/v1/crates/tauri/2.12.4/dependencies)
still requires gtk `^0.18` on Linux/BSD. [GTK 0.18.2](https://crates.io/api/v1/crates/gtk/0.18.2/dependencies)
requires glib `^0.18`. Crates.io lists 0.18.5 as the newest 0.18 release, with
no 0.18.6. GTK 0.19.0 instead requires glib `^0.22`; it cannot satisfy Tauri's
`^0.18` requirement. A standalone glib >=0.20 dependency would either add a
second incompatible crate version or fail the GTK requirement, leaving the
vulnerable glib in place. A Tauri patch update alone does not solve this.

The official [gtk-rs 0.18 branch source](https://github.com/gtk-rs/gtk-rs-core/blob/42b9caf98e03ded086362d9653ca58fe94dc8658/glib/src/variant_iter.rs)
and locally cached published glib 0.18.5 both retain the exact vulnerable
`VariantStrIter::impl_get`: immutable `p` passed as `&p` to variadic
`g_variant_get_child`, followed by `CStr::from_ptr(p)`. The merged upstream
[fix PR #1343](https://github.com/gtk-rs/gtk-rs-core/pull/1343) changes `p` to
mutable and passes `&mut p`; merge commit is
`05dff0ee696f9bcd8617cd48c4b812d046d440cb`. That change preserves the public
API. No maintained compatible official 0.18 release or fixed 0.18 branch was
identified. Applications contain no direct VariantStrIter or glib str_iter
call in their Rust sources; transitive native-runtime reachability remains
unproven, and absence of a direct application call is insufficient dismissal
evidence.

### Approved shared backport

The narrow production fix is two lines in `src/variant_iter.rs`, but a Cargo
path patch requires the published crate's complete source distribution. The
cached source tree was approximately 1.72 MB before omitting cache metadata.
The orchestrator approved one shared source at `vendor/rust/glib-0.18.5` and
both application manifest patch sections. It retains glib's 0.18 ABI, version,
features, and public API. This is repo-maintained until the upstream dependency
line changes. No fork, incompatible override, fake version bump, or
hand-edited lock/checksum was created.

Do not claim automatic Dependabot closure from a path-patched vulnerable
version. Record source equivalence, audit-tool behavior, and any eventual
explicit closure separately from runtime proof.

### Provenance, patch wiring, and reversal

Use the official crates.io `glib` 0.18.5 source archive corresponding to the
existing Cargo.lock checksum; extract the published distribution, excluding
Cargo's local cache marker `.cargo-ok`, and retain the MIT `COPYRIGHT` and `LICENSE`
files in that distribution. Record its registry checksum, published
VCS revision, and upstream PR/commit in a short backport receipt alongside it.
Both reviewed locks identify archive checksum
`233daaf6e83ae6a12a52055f568f9d7cf4671dabb78ff9560ab6da230ce00ee5`.
The published `.cargo_vcs_info.json` identifies source revision
`42b9caf98e03ded086362d9653ca58fe94dc8658`, path `glib`. These values were
read from existing metadata; archive integrity has not been checked during
the execution hold. Do not rename the crate, change its version, remove
features, or alter its public API. Apply only the upstream `let mut p` and `&mut p` fix plus a focused
optimized iterator regression in its existing `src/variant_iter.rs` test module.

Authored professional-desktop manifest addition:

```toml
[patch.crates-io]
glib = { path = "../../../vendor/rust/glib-0.18.5" }
```

Authored semantica manifest addition:

```toml
[patch.crates-io]
glib = { path = "../../../../vendor/rust/glib-0.18.5" }
```

Those are two independent application roots; each needs its own patch section
and Cargo-generated lock change. The approved shared copy prevents drift.
Application packaging must include that path; check packaged-source build
inputs in addition to local checkout builds. No root workspace manifest or
unrelated application was changed.

The backport source, both manifest patch sections, both generated lock changes,
and receipt should form an independently reviewable commit within the combined
PR. Reversal is the inverse of that commit: remove both patch entries and the
vendored directory, restore the preceding Cargo locks, then rebuild both roots.
That reversal restores the known vulnerable baseline and is a recovery route,
not an acceptable final security disposition. The preferred retirement path is
a supported GTK/Tauri stack whose resolved glib is fixed, or a genuinely fixed
compatible upstream release: remove both patches/vendor source, regenerate both
locks, and repeat optimized iterator and application checks. Preserve the
receipt in packet history when retiring the vendor tree.

### Reviewed decision and authored source

The orchestrator approved one shared source at `vendor/rust/glib-0.18.5` as the single source used by both application roots. Reason: preserve exactly one
upstream source plus safety patch, so both dependency roots cannot drift.
Both manifests now contain the corresponding Cargo path patches:

- professional-desktop: `../../../vendor/rust/glib-0.18.5`;
- semantica: `../../../../vendor/rust/glib-0.18.5`.

The published cached source archive was extracted without registry/cache
metadata or build outputs. Original MIT LICENSE/COPYRIGHT and upstream source
remain. Production changes are the upstream two-line mutability fix; four
focused iterator regressions were authored in `src/variant_iter.rs` for an
optimized test run after the hold. `vendor/rust/README.md` and the crate's
`SECURITY-BACKPORT.md` provide source provenance, upkeep, exact pending test
commands, and reversal/retirement steps. `vendor/rust/.gitignore` excludes
standalone test output and its generated local lock.

This narrow security change to semantica's frozen src-tauri surface follows
the explicit task authorization for both manifests; it makes no canary or UI
change. Parent records the shared-source decision in the packet SPEC.
Reversal removes the two patches and vendor source and restores the preceding
locks as one backport commit; it returns to the known vulnerable baseline.
Preferred retirement replaces the patched source with a genuinely fixed
supported dependency stack and reruns both application checks.

Both application Cargo locks are deliberately unchanged while execution is
held. They still describe registry glib until Cargo regeneration after PR
#1928. Source authoring is therefore not a claim that either built application
already uses the backport or that either alert has closed.

## rustls: compatible security update

The reviewed professional lock contains tauri-plugin-updater 2.10.1 and reqwest
0.13.3. [Updater dependency metadata](https://crates.io/api/v1/crates/tauri-plugin-updater/2.10.1/dependencies)
allows rustls `^0.23`; reqwest's 0.13 line also permits 0.23.45. The advisory
affects 0.23.13 through 0.23.44, with 0.23.45 fixing encryption-level boundary
validation. Proposed minimal update: resolve rustls 0.23.45 using Cargo in
professional-desktop only, keeping existing feature/provider choices. Its
published source is already cached, which is inventory evidence, not a build
result. A newer compatible release may be selected after reading its changes;
0.23.45 is the minimum release required by this exact advisory.

`src/lib.rs` registers tauri-plugin-updater and `run_update_check` calls
`updater.check().await`; tauri.conf.json configures an HTTPS GitHub release
endpoint. This establishes a real TLS client path; no exploit was executed.
The advisory states that transcript authentication remains intact, so it does
not establish arbitrary handshake completion by a network attacker.

## serde_with: compatible update, exploit-specific use not established

The reviewed professional lock has tauri-utils 2.9.1 → serde_with 3.20.0.
[tauri-utils metadata](https://crates.io/api/v1/crates/tauri-utils/2.9.1/dependencies)
permits serde_with `^3`. 3.21.0 is the minimum fixed release; both 3.20.0 and
3.21.0 declare Rust 1.88, so this update does not raise the declared MSRV.
Cargo must also resolve the paired serde_with_macros dependency normally.

The affected surface is KeyValueMap serialization of empty entries. Neither
application's Rust source directly references serde_with or KeyValueMap.
The exact upstream tauri-utils-v2.9.1 config.rs and config_v1/mod.rs use
`serde_with::skip_serializing_none`, a different surface. Exploit-specific
reachability is not established; the vulnerable locked dependency remains
valid remediation scope. Updating avoids relying on a reachability exception.

## Pending execution after PR #1928

1. Reconcile the merged main revision and reread these four alert records.
2. In professional-desktop's Rust root, use Cargo to update rustls to 0.23.45
   and serde_with to 3.21.0; inspect the generated diff and retain compatible
   features, providers, and paired macros. Do not add unused direct
   dependencies merely to force transitive resolution.
3. Compare the authored shared glib source against the original registry
   archive and upstream fix, preserving license and provenance. Generate both
   application locks through Cargo so their patch sections take effect.
4. Inspect resolved dependency chains for both roots and confirm no vulnerable
   registry glib remains alongside the patched source, no duplicate glib ABI
   is introduced, and the professional rustls/serde_with fixes actually land.
5. Build/check both Rust application roots with their production Linux GTK /
   WebKit features and locked dependencies. Run normal Rust tests and release
   mode VariantStrIter forward, reverse, nth, and nth_back regression coverage
   against the actual patched source: the UB is optimization-sensitive.
6. Exercise professional-desktop's updater check with the unchanged crypto
   configuration and smoke-test both application shells. Run the affected
   workspace package verification and the combined PR's canonical gates.
7. Refresh dependency alerts after merge. Keep source fix, successful build,
   exploit reachability, dependency audit output, and alert closure as separate
   evidence claims.

## Released-hold execution receipt (2026-10-20)

Parent confirmed PR #1928 merged at `426d494b3433ccddf797a2d896984f1ad23c81ad`
and integrated main before releasing execution. Cargo generated both application
locks. Professional resolves rustls 0.23.45, rustls-webpki 0.103.16, serde_with
and serde_with_macros 3.21.0. Cargo removed now-unused Windows 0.62 support
packages as resolver fallout; no direct dependency or crypto feature changed.
Semantica retains serde_with/macros 3.22.0. Both roots resolve exactly one glib,
version 0.18.5 from the shared path, with no registry glib duplicate.
`cargo tree --locked -i glib` confirms both dependency roots reach that source.

Recomputed the original `.crate` SHA-256:
`233daaf6e83ae6a12a52055f568f9d7cf4671dabb78ff9560ab6da230ce00ee5`.
Compared every published file with the vendor tree: only `src/variant_iter.rs`
differs (upstream two-line safety patch plus four focused tests); the published
`.cargo_vcs_info.json` is omitted as documented. License/COPYRIGHT are identical.

Passed: `cargo test --release --manifest-path vendor/rust/glib-0.18.5/Cargo.toml
security_variant_str_iter -- --nocapture`: four tests passed, zero failed.
Passed: `cargo check --locked` independently in both application roots, with
normal Linux production GTK/WebKit/Tauri features. Their dev profiles completed
in 26.88s and 26.98s. The vendored older upstream code emits 34 compiler
warnings, primarily newly diagnosed lifetime syntax; these are unchanged
upstream source and were not broadened into this security patch.

Application library tests are running separately. These build receipts do not
claim live application-shell/updater execution or automatic alert closure.

Application library tests also passed: professional-desktop `cargo test --locked
--lib` ran 15 tests, zero failures; semantica completed successfully with zero
library tests. Full optimized retained iterator module also passed 15 tests.

The full optimized `variant_iter::tests` module passed 15 tests, zero failures,
including all retained upstream iterator tests plus the four security cases.
Logs and Cargo dependency trees are retained under
`~/.cache/beep/security-dependency-proof-20261020/`. No live desktop shell or
updater was launched, so build/tests do not assert network-update behavior.

## Canonical affected-app package handoff

After the root dependency install was ready, ran one package per invocation:

- `bun run beep quality package-verify @beep/professional-desktop`: exit 0;
  audit passed (16.9s), docgen passed (16.3s).
- `bun run beep quality package-verify @beep/semantica`: exit 0;
  audit passed (13.5s); docgen skipped by the package verifier.

Final command logs are retained in ignored `raw/professional-desktop-package-verify.log`
and `raw/semantica-package-verify.log` inside this packet. Neither invocation
reported a failure requiring introduced/inherited/environment attribution.
Both applications retain only the intended Cargo manifest/lock changes; no GUI
or development server was launched. Parent retains the combined CLI/global
proof and publication ownership.

Final staging normalized the extra blank line at the end of the upstream MIT
LICENSE to satisfy git whitespace checks. License text and grant are unchanged;
this is an explicit formatting exception to the published-byte comparison,
beside the documented Rust source patch and added backport receipt.
