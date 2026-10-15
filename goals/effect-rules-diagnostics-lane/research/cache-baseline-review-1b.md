# H2 review-wave 1b cache review (2026-10-14)

Reviewer: Codex H2 implementation lane.

The new standards/effect-diagnostics.profile.json owns the nine rules unknown
to tsc-rs 0.6.0. Its contents affect standalone rule enforcement and parity.
Add it to //#lint:tsgo-rules and to the policy fingerprint input declaration.
The CLI command regression reads this file, so @beep/repo-cli test and
property-test inputs include it too. These four computations retain their
commands, outputs, dependency edges, environment and cache flags. The direct
standalone diagnostics lane remains uncached and its affected selector treats
the profile as global. No qualification is granted or widened.

Reviewed subjects are // and @beep/repo-cli. Preserve all prior reviews outside
those subjects, the qualification scope, runtime profile and epoch. The audit
before re-recording reports exactly four configuration-drift blockers for the
four named computations plus reviews for the two Turbo config files. Reversal:
remove the profile-dependent reads and input declarations together, then
re-record the resulting projection with its own review.
