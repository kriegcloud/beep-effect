# 2026-10-20 — Operator brief: single public origin

## Record

This is the operator brief that opened the goal, after a grilling session on
2026-10-20. It is the only place in the repository that writes the retired
identity hosts in full; every other surface writes them defanged (DESIGN ruling
I7 in [`../SPEC.md`](../SPEC.md)). The `history/` path keeps it outside the
`bun run beep laws retired-iri-authorities` scan.

Two edits from the text as given: the first sentence carried a Cloudflare
dashboard link, replaced by a parenthetical because the repository is public;
the lane header above the brief and the file census below its Acceptance
section are left out. Everything between the markers is otherwise byte for
byte.

Later agent rulings that refine this brief (I1 to I18, including no changesets
and the closeout shape) are in the [`SPEC.md`](../SPEC.md) Decision Log.

<!-- brief:begin -->

I bought beep-effect.com and added it to Cloudflare (Cloudflare dashboard link; account id redacted).
It becomes the single public origin for everything developer- and agent-facing
this repo projects: identity IRIs, docs, Storybook, HttpApi docs, taxonomy
viewers, llms.txt, MCP, packet projections. Open a goal packet
(`/goal public-origin-beep-effect-com`) and land it as ONE PR with the
doctrine entries riding the same PR. Scope is doctrine + code. No deployment,
no Cloudflare config, no CI deploy workflow in this packet; deployment is a
follow-on goal per surface.

## Decisions already made (grilled 2026-10-20, do not reopen)

D1  Identity authority moves. `https://ns.beep.sh/` is retired (we never
    owned beep.sh; it was a placeholder). New root:
    `https://beep-effect.com/ns/`. `@beep/a/b` mints
    `https://beep-effect.com/ns/a/b`; the `beep:` CURIE prefix is unchanged;
    per-vocabulary hash-vs-slash choices are unchanged. Supersede the
    2026-07-02 "authority host (RESOLVED)" entry in
    explorations/identity-as-iri/DECISIONS.md with a new dated entry.

D2  Single public origin, routes not subdomains. Law (architecture-wide,
    goes in standards/architecture/DECISIONS.md and ARCHITECTURE.md):
    the apex `beep-effect.com` hosts ring-0 projections of the public
    substrate only; `/ns/` is reserved forever for identity dereference;
    subdomains are for services and instances that are not projections
    (a practice instance, the proxy, anything authenticated). Rationale:
    llms.txt/robots/sitemap/.well-known are origin-scoped, the knowledge-
    endgame training-data flywheel wants one crawler authority, every listed
    surface is public and unauthenticated so cookie/CSP isolation buys
    nothing, and schema.org/w3.org precedent mints IRIs as apex paths.
    `/ns/` is dereference (exact registry); `/taxonomy` is its HTML
    discovery projection (knowledge-endgame law: dereference and discovery
    stay separate). www redirects to apex (infra, later).

D3  Reserved v1 route table (reserved now, deployed later):
    /ns  /taxonomy  /docs  /api  /storybook  /llms.txt  /mcp
    /labs/<name>  /goals  /explorations  /research
    /.well-known/*  /sitemap.xml
    `/api` = Scalar docs for every HttpApi contract (today apps/labs/api-docs).
    `/labs/<name>` = hosted projection of apps/labs/<name>; <name> is the
    portless name with `.labs.beep.localhost` stripped. Labs keep the segment
    so nothing lab-grade reads as official.

D4  Owner of the hosting map: NEW foundation package `@beep/public-site`
    under packages/foundation/modeling/, created with
    `bun run beep create-package` (never mkdir). It owns:
      - `PublicOrigin` (the literal `https://beep-effect.com`, schema-typed)
      - `SiteRoute` as a `LiteralKit` of the D3 slugs
      - `hostedUrl(route, path?)` returning a typed URL
      - a `labRoute(portlessName)` helper for /labs/<name>
    The identity authority stays a type-level literal in @beep/identity
    (`DefaultIdentityAuthority` in Id.ts; `Identity.make("beep", {authority})`
    in packages.ts; Vocab.ts). @beep/identity must NOT depend on
    @beep/public-site. One test in @beep/public-site asserts
    `hostedUrl("ns") + "/"` equals the identity authority so the two literals
    cannot drift. Hosting is build-time/runtime config as schema, never an
    env read. apps' base-path configs and @beep/repo-configs consume
    @beep/public-site; tooling never becomes the owner because product code
    (MCP output, llms.txt generation) cannot import tooling.

D5  Fold the two drift authorities into `$I`:
      - `https://beep.dev/epistemic/...` in
        packages/epistemic/use-cases/src/ClaimGate/ClaimGate.service.ts
        (CLAIM_CLASS_IRI, EVIDENCE_QUOTE_IRI, CLAIM_SUBJECT_PREFIX) plus the
        JSDoc examples in epistemic domain/tables, and
        apps/labs/lejeune-bolt-workbench/src/runtime/Projections.ts
        (LEJEUNE_ONTOLOGY_NAMESPACE)
      - `https://beep-effect.dev/skill-contract/evidence/...` in
        packages/foundation/modeling/skill-contract/src/Recovery.ts and
        EvidenceReceipt.ts, and `https://beep.dev/evidence/...` examples in
        Gate.ts; the QA judge contract in
        packages/tooling/tool/cli/src/commands/Qa/JudgeContract.ts and
        CitedArtifactExistsGate.ts
    Replace literals with `$EpistemicId.create(...)` /
    `$SkillContractId.create(...)` style derivations from @beep/identity.
    Evidence predicate-type strings are compared by equality in receipts, so
    this is a wire-level change: bump their `/v1` suffix to `/v2` and note it
    in the skill-contract changeset.

D6  Migration posture: hard cut everywhere, one record, one gate.
      - Rewrite every literal of the three retired hosts (ns.beep.sh,
        beep.dev, beep-effect.dev) in src, tests, seeds (.ttl/.jsonld),
        docs, explorations, skills, JSDoc examples. Exempt `**/history/**`
        and `research/**` (immutable packet history; goals/semantica-canary/
        history alone holds ~50k generated occurrences).
      - Also rewrite the exiftool XMP namespace
        `BEEP_QA_XMP_NAMESPACE_URI` in
        packages/drivers/exiftool/src/ExiftoolConfig.ts to
        `https://beep-effect.com/ns/qa/1.0/` (readers key on it; same
        change, same changeset).
      - Add `bun run beep laws retired-iri-authorities` modelled on
        packages/tooling/tool/cli/src/commands/Laws/RetiredEffectPaths.model.ts
        and its registration in Laws.command.ts: fails on any literal
        `https://ns.beep.sh/`, `https://beep.dev/`, `https://beep-effect.dev/`
        outside the exempt dirs, and on any literal `https://beep-effect.com`
        outside @beep/identity and @beep/public-site (the second rule is what
        keeps future surfaces going through `$I`/`hostedUrl`). Wire it into
        the same quality lane that runs retired-effect-paths.
      - Probe evidence (2026-10-20): nothing durable is persisted under the
        old root; corpus hits are practice-kg sitting transcripts and QA
        logs, XDG hits are regenerable caches. No alias/rebase map.

## Doctrine surfaces to update in the same PR

- explorations/identity-as-iri/DECISIONS.md: supersession entry for D1.
- standards/architecture/DECISIONS.md: dated entry "Single public origin
  beep-effect.com; apex hosts projections, /ns/ reserved" (D2, D3, D4).
- standards/architecture/GLOSSARY.md: terms "Identity Authority" (the
  compile-time IRI root, @beep/identity), "Public Origin" (the hosting
  origin, @beep/public-site), "Site Route" (a reserved apex slug). Follow
  CONTEXT-FORMAT.md.
- standards/ARCHITECTURE.md: one binding paragraph under the identity/
  config section stating the apex law and that hosted URLs come from
  @beep/public-site, IRIs from @beep/identity, never string literals.
- explorations/knowledge-endgame/README.md trail: note that the
  training-data-flywheel reopen trigger now has its origin; do NOT unpark.
- Goal packet manifest/README/PLAN/SPEC flipped in the same PR; SPEC.md
  Decision Log carries D1–D6 verbatim with the reversal path (git revert +
  re-run the gate in report mode).

## Acceptance

- `graft grep "ns.beep.sh"`, `"beep.dev/"`, `"beep-effect.dev"` return hits
  only under **/history/** and research/**.
- `bun run beep laws retired-iri-authorities --check` green; a seeded
  violation in a scratch file turns it red.
- @beep/identity type-level assertions updated: `$BeepId.create("x").iri`
  is literally `https://beep-effect.com/ns/x`; existing `$I` call sites
  compile unchanged.
- TaxonomyLoader filter, Taxonomy.seed SCHEME_IRI, party-roles/docketing/
  legal-intake seeds, Vitest.errors IRIs, DocumentAnnotation adapter IRIs
  all under the new root; their tests green.
- `bun run beep quality package-verify` green for @beep/identity,
  @beep/public-site, @beep/ontology, @beep/skill-contract, @beep/epistemic-*,
  @beep/exiftool, @beep/repo-cli (via beep-heavy).
- Changesets: minor for @beep/public-site (new), major-note for
  @beep/skill-contract (predicate-type v2) and @beep/exiftool (XMP ns).
- Yeet publish → ready at content-final → merge at gate → sweep --retire.

<!-- brief:end -->
