# Agent Instructions for `.repos`

The `.repos` directory contains git subtrees of external repositories. These
subtrees are READ ONLY reference material for agents working in this repo,
especially when comparing APIs, behavior, examples, and upstream conventions.

## Rules

- Treat every subtree directory under `.repos/*/` as read-only reference
  material.
- Do not manually edit files inside subtree directories.
- Do not add tests, fixes, formatting changes, notes, or generated artifacts
  inside subtree directories.
- Do not run install, build, format, test, or typecheck commands inside subtree
  directories when those commands can write artifacts such as `node_modules/`,
  `dist/`, coverage output, caches, or `*.tsbuildinfo` files. Use the subtree
  only for reading/searching unless the user explicitly asks for a subtree
  maintenance operation.
- The only exception under `.repos` is this `AGENTS.md` file, and only when the
  user explicitly asks to update these instructions.
- If an external subtree needs to be refreshed, update it only from the parent
  repository with the appropriate `git subtree pull ... --squash` command.
- If a review comment points at a subtree file, do not patch that file locally.
  Explain that subtree contents are imported reference snapshots and, when
  needed, make the actionable change in this repo's own source or upstream in
  the source repository.
- It is okay to read, search, diff, and run read-only analysis against subtree
  contents for context.

## Current Subtrees

- `effect-v4`: Effect v4 source reference from
  `git@github.com:Effect-TS/effect-smol.git`.
