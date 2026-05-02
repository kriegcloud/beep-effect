# Architecture Glossary And Context Format

In this repo, canonical architecture language lives in
`standards/architecture/GLOSSARY.md`, with binding rule text in
`standards/ARCHITECTURE.md` and the numbered rationale docs. Do not create
generic `CONTEXT.md` or `CONTEXT-MAP.md` files for architecture grilling.

Use this file as the formatting guide for glossary and context updates produced
by the `grill-with-docs` skill.

## Glossary entries

Add or update a glossary entry when a term becomes canonical architecture
vocabulary. Keep entries short and operational:

```md
## Term Name

A one-paragraph definition that states what the term means in this repo and
where it belongs. Include the boundary it protects when that is the point.
```

Good glossary candidates:

- topology words: `Slice`, `Shared Kernel`, `Driver`, `Foundation Family`
- boundary words: `Port`, `Adapter`, `Action Error`, `Port Error`
- routing words: `Promotion Record`, `Canonical Subpath Name`,
  `Cleanup-On-Touch`
- role words: `Domain-Kind Folder`, `Role Suffix`, `Config Contract`

Poor glossary candidates:

- one package's private helper name
- a product concept that belongs only in a slice README
- generic TypeScript, Effect, React, or database terminology
- temporary migration task names
- implementation details that do not affect architecture language

## Definition rules

- Be precise about ownership: name the package family, slice layer, or doc
  surface that owns the concept.
- Keep definitions architecture-level, not implementation trivia.
- Prefer repo vocabulary over ecosystem synonyms.
- Include caveats when a common ecosystem term has a repo-specific meaning.
- If a term conflicts with existing glossary language, either reconcile it or
  ask the user to choose the canonical meaning before editing.

Useful caveat pattern:

```md
**Terminology caveat:** In strict DDD this term often means X. In this repo it
means Y because <repo-specific reason>.
```

## Package-local context

When the resolved language is package-local rather than architecture-wide, do
not add it to `GLOSSARY.md`. Put it near the package that owns it:

- package purpose, consumers, and routing policy -> package `README.md`
- high-bar `shared/*` export rationale -> package README promotion record
- assistant guidance for future agents -> `AGENTS.md` / `CLAUDE.md` only when
  the repo already uses that surface for the package
- implementation examples -> tests, fixture package, or local docs beside the
  package

## Architecture context checks

Before adding or changing a term, check:

- Does `standards/ARCHITECTURE.md` already define the rule?
- Does `GLOSSARY.md` already define the term or a better synonym?
- Does `DECISIONS.md` already record the doctrine?
- Is this a package-local promotion record rather than a glossary term?
- Is current code disagreeing with target doctrine, or is the doctrine missing?

If the docs already answer the question, quote the repo term and continue the
grill. If the docs are silent and the term materially affects boundaries, ask a
single branch-closing question before updating.

## Relationship notes

Use relationship notes when a term is commonly confused with another term. Keep
them short and boundary-focused:

```md
## Shared Kernel

The DDD meaning of the `shared` package family: deliberately shared
cross-slice product language. It is not a synonym for `foundation`, `common`,
`core`, or reusable technical substrate.
```

Common relationships to preserve:

- `shared` is deliberate cross-slice product language; `foundation` is
  domain-agnostic reusable substrate.
- `drivers` wrap external technical engines; `server` implements product ports.
- `config` names typed runtime/application contracts; `env` is only one source.
- `use-cases` own application intent and ports; `server` owns live adapters and
  Layer composition.
- public action errors cross the use-case public boundary; port and driver
  errors must be translated before then.

## Example review note

When challenging fuzzy language, be concrete:

```txt
You are calling this shared because two files could import it. The architecture
uses shared for deliberate cross-slice product semantics, not reusable shape.
My recommendation is to keep it in the owning slice unless we can name at least
two consumers and write the promotion record.
```

This keeps the grill tied to the repo's vocabulary instead of generic DDD
language.
