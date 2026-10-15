# Opportunities & friction receipts

Two receipts from the opening sitting were appended to the predecessor's ledger on 2026-10-13 and
stay there: attorney markup PDFs arriving through the connector as text only, and the USPTO Guide
sitting behind bot walls (`goals/design-figure-generation/research/OPPORTUNITIES.md`).

## 2026-10-13 — a judge P1 on claim scope was overridden by an agent ruling

- **Doing:** reading the predecessor's live judge rounds against the attorney's round-1 markup.
- **Evidence:** live judge round 2 raised the missing interior fastening features as P1 (R2-01 in the
  `goals/design-figure-generation/history/live-matter/evidence.json`). On 2026-10-06 the predecessor's Decision Log
  left them out "as unclaimed". The same day's reflection carried a codification TODO to route
  claim-scope findings to the attorney as questions, but the drawing judge prompt never gained that
  rule. One of the attorney's requests (F5) was to show them.
- **Would have prevented it:** the claim-scope rule in the judge prompt and a review-loop
  disposition (`clarify`) that sends the question to the attorney instead of a Decision Log row.
  PR-G lands both.

## 2026-10-13 — the reviewed set was not the signable set

- **Doing:** matching the attorney's eight markup pages to the sheets that were sent.
- **Evidence:** raster ink coverage matched the markup to the unshaded set (PDF sha256 prefix
  17e086a2, FIG 1 coverage 1.0), not the shaded set the sign-off flow names (227efb7a, coverage
  0.29). Several shading comments were therefore about a set that carried no shading at all. No
  record said which set had gone out.
- **Would have prevented it:** a delivery record written when the outbox draft is created
  (message id, attachment sha256 values, sheet-set hash) and a review round keyed to that hash.
  PR-G adds `DeliveryRecord` and `ReviewRound.reviewedSheetSetSha256`.

## 2026-10-14 — an operator mail went out from the attorney's mailbox

- **Doing:** sending the round-1 questions, meant to come from the operator, through the outbox MCP.
- **Evidence:** the outbox server is configured for one mailbox, the attorney's, so the message went
  from the attorney to the attorney. The server's instructions name a single configured mailbox but
  no step stated which one before the send.
- **Would have prevented it:** state the sending mailbox before any outbox send, and send operator
  mail through the delegated (signed-in user) connector instead of the outbox.

## 2026-10-14 — GitHub's GraphQL burst limit blocked ready and reply for about 20 minutes

- **Doing:** flipping PRs ready and answering review threads across several open lane PRs.
- **Evidence:** `gh pr ready` and `bun run beep yeet reply` failed with `GraphQL: API rate limit
  already exceeded` for about 20 minutes while REST calls (`gh api repos/<o>/<r>/pulls/<n>`) kept
  working.
- **Would have prevented it:** REST fallbacks for the ready flip and thread replies, or one shared
  poller per workstation instead of a GraphQL poll per session.

## 2026-10-14 — a fresh lane started behind origin/main and could not run the quick verify

- **Doing:** opening lanes with `bun run beep worktree new`.
- **Evidence:** the new lane is based on the clone's local `main`, not `origin/main`, so each lane
  needed a `git reset --hard origin/main` after creation. In a fresh lane,
  `bun run beep quality package-verify <pkg> --quick` failed on missing dependency dists; the turbo
  check task (which builds dependencies first) passed.
- **Would have prevented it:** base new lanes on `origin/main` after a fetch, and have the quick
  verify build dependency dists (or route through the turbo check task).

## 2026-10-14 — sweep refused a lane whose PR was opened over REST

- **Doing:** retiring a lane after its PR merged, with `bun run beep yeet sweep --retire`.
- **Evidence:** the PR had been opened over REST during the GraphQL rate limit, so no PR lease was
  recorded, and the sweep refused with "no pull request was observed".
- **Would have prevented it:** record the PR lease from the REST create response, the same as from
  the `yeet publish` path.

## 2026-10-14 — the critic pack carried no zooms, so one critic could not check stroke detail

- **Doing:** running review loop 2 (Grok) on the matter's render-k pack.
- **Evidence:** the critic prompt names `render/zoom-*.png`; the pack had none for that set, and the
  critic listed it under could-not-assess. Zooms had been cut by hand for one earlier set only.
- **Would have prevented it:** the pack refresh cutting the 300 dpi zooms from the set's PDF
  every time (now in the render chain); a `drawings review-pack` command that writes RENDER.md,
  rasters and zooms from a render directory would make it deterministic for the next matter.

## 2026-10-14 — a face that planned lines but drew none was invisible in the coverage report

- **Doing:** judging loop-3 findings that two flaps and the lid were bare.
- **Evidence:** the view's coverage counted those faces as shaded (`shadedFaces`), because the
  count is taken when lines are planned, before hidden-line removal and the legibility pass drop
  every stroke; the critics found the bare faces from the SVG, not from the manifest.
- **Would have prevented it:** a per-view count of faces that planned lines and drew none
  (`lostFaces`) and a validator finding `shading-lost-face` when it is above zero, so the render
  fails its own validation instead of waiting for a reviewer. Landed in #1671 with
  `shading-outline-clearance` and `shading-lone-line`.

## 2026-10-14 — attributing hidden-line output by projected geometry collided twice

- **Doing:** finding why walls stayed bare (loop 2) and why a probe pass bridged a gap (loop 3).
- **Evidence:** strokes of walls at different depths project onto one line, and a post's probe
  pieces lay on a wall's probe line; both times a stroke or piece was credited to the wrong face.
- **Would have prevented it:** the rule now in `kernel.ts`: every shape whose visible pieces
  matter is added to `HLRBRep_Algo` as its own input and read back with `VCompound(shape)`,
  never matched by projected position.

## 2026-10-14 — an attorney's numeric answer reached the model only by hand

- **Doing:** accepting the loop-2 finding that the lap was modelled at the generator's default.
- **Evidence:** the attorney's answer (a 2 in overlap) was recorded in the corpus answers file on
  2026-10-14 but `build-spec.ts` kept `lapWidth: 40` until a critic measured the sheet.
- **Would have prevented it:** the corpus `check-overlap.ts` asserting every numeric answer
  against the generated spec, run by the render chain before a set is packed for review.

## 2026-10-14 — calibration rows and docs drifted from the constants they describe

- **Doing:** answering PR #1671 review round 1 (coderabbit on the Decision Log, the reviewer on
  the `surface-class` docs).
- **Evidence:** the log row for the gap growth said 1.3 while `Shading.rules.ts` sets 1.4; the
  faint tone row said 1-2 lines while `toneSpacing` sets 2-4; three doc sites still described
  level-line (hinge) hatching after the darkest-edge change. Each was written before a later
  calibration and never re-read.
- **Would have prevented it:** a calibration row that names the constant and its file, and a
  lane step that re-reads every row and doc site naming a changed constant before `final`
  (`graft grep "<constant>"` over `goals/` and `src/`); a validator floor read from the schema
  that defines it, never a second literal (`ShadingPlan.clearance` now does this).

## 2026-10-14 — the probe-grid window model cannot tell two cells of a lattice apart

**Doing:** review loop 2 (five-model sequential pass) on the merged pipeline's render; the first two
reviewers found the lid underside bare where it shows through the central cell of the bottom plan,
while the bottom pictorial shades that same cell.
**Evidence:** an env-gated dump of `regionsOf` showed the lid face planned ONE window spanning its
whole step range (3.9 → 333.5 model units): pieces of different probes were merged by overlap along
the step only, so the band landed at the periphery, under the flaps. A first fix (merge only when
the shadow-side ends agree within one probe spacing) banded the central cell but split FIG 1's lid
top along its own diagonal outline into two bands, and a star cell's band spilled along the lines
into the central cell because a window's strokes are centred on a one-fifth-face slab.
**Prevention:** windows merge only when both pieces start at the face's own outline or at the same
occluder edge, and a stretch keeps only the pieces its own probes crossed (kernel `regionsOf`,
`crosses`); the synthetic lattice test "bands every separately bounded visible area" holds it. The
deeper gap stays: five probes per face cannot see a cell narrower than a fifth of the face along
the lines, so a `shading-lost-window` check (a probed window that drew nothing) and adaptive probing
belong to the P13/P14 phases.

## 2026-10-14 — the app Terminal panel cannot elevate, and force pushes are refused

**Doing:** installing veraPDF, qpdf and mupdf-tools through the YubiKey sudo route; amending a
published commit message to carry the packet slug.
**Evidence:** `sudo: The "no new privileges" flag is set` from `yay --sudo yubi-sudo` in the app's
Terminal panel (the AUR build itself succeeded); `git push --force-with-lease` denied by the session's
permission policy after a local `--amend`.
**Prevention:** package installs run in Ghostty, never in the panel (recorded in the session memory);
never amend a pushed commit — put the longer explanation in the PR body with `gh pr edit --body-file`
and keep the commit subject under 100 characters on the first try (commitlint refused a 105-character
subject and `yeet publish` then committed with its own title).

## 2026-10-14 — three loop-2 findings wait on per-stroke intent (P14)

**Doing:** judging review loop 2 (five sequential reviewers) on the merged pipeline's render.
**Evidence:** K-05 (windows chain over gaps under one pitch, so a thin occluder is bridged), K-06 (the
1e-3 hatch lift puts probes inside a neighbour at a grazing butt joint), O-03 (a tapered stroke's length
and centre come from the face's whole chord, leaving a 3.69 mm tick in a 32 mm window).
**Prevention:** all three need the planned stroke next to its drawn pieces: the P14 stroke-intent
sidecar carries planned length, window chord and bridged gaps per stroke, and the ratio check (drawn
under 25% of planned → drop) lands with it. Until then the critic loop is the detector.

## 2026-10-14 — the artifact's note boxes could never reach the operator

**Doing:** giving the attorney a page to mark each shaded sheet right or wrong.
**Evidence:** the published artifact declared the `db` capability and only enabled "Save note" when
`claude.use("db")` resolved; for a public-link viewer who is not signed in it resolves null, and a
signed-in viewer at view level has writes refused (probed with ArtifactData at `view`). The page fell
back to "reply to the email" and nobody noticed until the operator asked.
**Prevention:** lawyer-facing review surfaces follow the sitting-app pattern from the start (private
tailnet page, token path, answers on disk, Codex gate before the link goes out); an artifact is a
look-only copy. The replacement page's gate found 25 defects in round 1 (notes copied across sheets on
Send, a lock after a failed save, a server race on lock, drafts lost on reload); the round-1 and
round-2 reports are kept beside the page under `matter/review-app-drawings-gate/`.

## 2026-10-15 — the per-page pdf-lib merge truncated a stream that only strict readers saw

**Doing:** checking a two-point candidate set with a strict-inflate pass over every FlateDecode stream.
**Evidence:** one stream in a merged sheet PDF failed a strict inflate while every viewer showed the
sheets; pdf-lib re-serialised a stream with an indirect `/Length` and cut it at the end of line before
`endstream`, dropping a final 0x0D data byte. The predecessor's 2026-10-05 receipt had pointed the
driver at that per-page route.
**Prevention:** one `rsvg-convert` run per sheet set with the header rewritten (SPEC Decision Log
2026-10-15), the `pdf-stream-undecodable` validator finding, and a live test that converts two SVGs
and inflates every stream strictly. A receipt that prescribes a route should name the check that
proves the route safe.

## 2026-10-15 — a Grok critic seat could not start under its strict sandbox on this host

**Doing:** running critic loop 3 with a Grok seat.
**Evidence:** Grok's `--sandbox strict` profile could not resolve one runtime-socket deny path on the
workstation and refused to start; the loop recorded a failed run and the next reviewers' summary did
not mention the seat.
**Prevention:** `grokSandboxRefusal` records the seat as unavailable and every loop summary names the
seats that did not run; the sandbox flags stay strict. Fixing the host so the path resolves is the
operator-side follow-up.
