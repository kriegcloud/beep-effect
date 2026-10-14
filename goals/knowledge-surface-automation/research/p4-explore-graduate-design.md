# P4 design: Workstream E-3 graduation (`beep explore graduate`)

Status: design (docs-only PR, per the packet rule that design lands before code).
Builds on the merged E executor: `goals bootstrap|adopt --write --expect <planId>`
(#1632) and its crash recovery (E11/E12, #1669). The GOAL's definition of done needs
graduation self-hosted: "bootstrap/graduate/adopt self-hosted (this packet adopted)".
Bootstrap and adopt are done. This document is the graduation contract.

## What graduation is today

Graduation is a hand-authored, multi-file edit with no tool:

- Each child goal packet is written by hand, or with `goals bootstrap
  --from-exploration <slug>`, which already records
  `provenance: { exploration, graduated }` in the child manifest and a source line in
  `research/SOURCES.md` (`Bootstrap.ts`, `provenanceExploration`).
- The exploration's `ops/manifest.json` (`exploration-manifest/v1`) is edited by hand:
  `status: "graduated"`, `stage: "graduate"`, `links.goals += goals/<child>`, and
  `updated`.
- No exploration carries an `ops/events/` stream yet, so the manifest is the record.
  The packet-event vocabulary (`packet-created`, `stage-entered`, `status-set`, …) is
  opt-in per packet (`PacketEventStore.ts`).

The failure mode a tool fixes is a half-done graduation, where child packets exist but
the exploration still says `decompose` (or the reverse). The Atlas and `explore --check`
then disagree with `goals/`.

## Decided contract

1. **One plan for the whole graduation.** `beep explore graduate <exploration>
   --goal <slug>=<title> [--goal …] --plan --json` compiles a `GraduationPlan`:
   - `children`: one bootstrap `MaterializationPlan` per `--goal`, each compiled by the
     existing `compileMaterializationPlan` with `provenanceExploration` set (no second
     bootstrap compiler);
   - `explorationEdit`: a typed edit of `explorations/<slug>/ops/manifest.json` that
     sets `status`, `stage`, `updated`, and appends the children to `links.goals`,
     carrying the file's `preImageDigest`;
   - `planId`: a digest over the encoded children plan ids and the edit, so a reviewed
     plan names exactly one outcome.
2. **Refusals before any write.** The plan is conflicted (and `--write` refuses) when:
   the exploration is missing, already `graduated` or `killed`, or its manifest does not
   decode; any child slug already exists under `goals/` or repeats within the plan; a
   child plan is itself conflicted; or no `--goal` is given.
3. **Write order: children first, exploration last.**
   `--write --expect <planId>` recompiles, compares digests, publishes each child with
   `publishBootstrapPlan` (staged, validated, claimed, renamed; E11/E12 recovery), then
   applies the exploration edit only if the manifest still matches `preImageDigest`.
   It writes through a staged file and atomic rename, like adoption. The exploration
   flips last, so a crash never leaves an exploration claiming children that do not
   exist.
4. **Resumable, not transactional.** A crash after some children publish leaves those
   children plus an unflipped exploration. Re-running the same command recompiles: the
   published children are now conflicts (they exist), so the plan reports them as
   `already-published` when their manifest's provenance names this exploration. The
   remaining children and the edit proceed. A child that exists *without* that
   provenance stays a hard conflict, because it belongs to someone else. No journal
   file is needed, since provenance is the journal.
5. **Receipt.** `--write` prints a `GraduationReceipt`: the planId, each child's
   `MaterializationReceipt` (or `already-published`), and the manifest edit's before
   and after digests. As with E10, it is printed and not persisted
   (`ops/materialization.json` stays E-3b, with capsules).
6. **Events stay opt-in.** When the exploration carries `ops/events/`, the edit also
   appends `stage-entered: graduate` and `status-set: graduated` through
   `PacketEventStore`'s guarded append (CAS on the folded revision), after the manifest
   write. When it does not, nothing new is created; opting a packet into events is not
   graduation's job.
7. **Self-hosting proof.** The first real graduation of a `decompose`-stage
   exploration runs through this command. The PR that ships it lands that graduation's
   children and exploration flip, produced by `--write`, the same way #1632 adopted this
   packet with its own executor.

## Schemas (schema → contract → implementation)

- `GraduationChildInput` (`slug`, `title`), decoded from `--goal slug=title`, with the
  slug checked by the existing `PacketSlug`.
- `ExplorationManifestEdit` (`path`, `preImageDigest`, `status`, `stage`, `updated`,
  `appendGoals`).
- `GraduationPlan` (`schemaVersion: "graduation-plan/v1"`, `exploration`, `children`,
  `explorationEdit`, `conflicts`, `alreadyPublished`, `planId`).
- `GraduationReceipt`.
- Service: the plan compiler is pure over a read-only `ExplorationSnapshot`. The writer
  reuses `publishBootstrapPlan` plus one manifest-edit applier shared with adoption's
  preserve check, so there is no third write path.

## Decisions (E13–E17)

- **E13 — one plan, child plans reused.** Reason: one bootstrap compiler and one
  publish path; the graduation plan only composes them. Reverse: let the graduation
  compile its own child payloads if graduation ever needs files bootstrap does not
  write.
- **E14 — children first, exploration last.** Reason: the only state a crash can leave
  is "children exist, exploration not yet flipped", which re-running repairs (E15). The
  opposite order could strand an exploration that claims missing children. Reverse:
  flip first with a `graduating` stage, if a stage like that is ever added.
- **E15 — provenance is the resume journal.** Reason: a published child already records
  `provenance.exploration`, so the replay can tell its own earlier children from a
  foreign packet with the same slug without a new file. Reverse: add a
  `graduation.json` journal if provenance ever stops being written by bootstrap.
- **E16 — events only for packets that opted in.** Reason: the event store is
  per-packet opt-in (D1). Graduation must not silently convert a manifest-only
  exploration into an event-sourced one. Reverse: create the stream at graduation, with
  a genesis `packet-created`, once every exploration is event-sourced.
- **E17 — self-hosting is a real graduation.** Reason: as with adoption (#1632), the
  tool proves itself on live repository state, not only on fixtures. Reverse: none
  needed. If no exploration is ready, the proof waits for one; it is never faked with a
  synthetic exploration.

## Sequencing

- **PR E-3a (this design).**
- **PR E-3b:** the schemas, the pure compiler, `explore graduate --plan --json`, and
  tests: refusal matrix, digest stability, and replay classifying `already-published`
  versus a foreign conflict.
  *Landed scope:* `Explore/Graduate.schemas.ts` (`GraduationChildInput`,
  `GraduationRequest`, `ExplorationSnapshot`, `ExplorationManifestEdit`,
  `GraduationPlan`, and `GraduationReceipt` declared for E-3c) and `Explore/Graduate.ts`
  (`readExplorationSnapshot`, the pure `compileGraduationPlan`, JSON and human renders,
  and the `explore graduate` subcommand, which refuses without `--plan`). Child slugs
  use `GoalSlug`, the grammar the bootstrap compiler already requires, which is
  stricter than `PacketSlug`. Each refusal is a `GraduationConflict` row. The
  `child-conflicted` reason lifts any conflict a compiled child plan carries. Under
  today's bootstrap compiler it cannot occur, because existing slugs are classified
  first. The plan id digests the exploration slug, the children's plan ids in request
  order, and the plain edit row; `alreadyPublished` children are not recompiled. The
  snapshot reads the manifest status, not an event fold: no exploration carries
  `ops/events/` yet, and the E-3c writer owns the event-stream path (contract 6).
- **PR E-3c:** `--write --expect`, the manifest edit applier (shared with adoption's
  preserve check), the event append for opted-in packets, crash-replay tests, and the
  first real graduation (E17).
- **Later (E-3d):** `ops/materialization.json` and rematerialization/capsules (E10).
