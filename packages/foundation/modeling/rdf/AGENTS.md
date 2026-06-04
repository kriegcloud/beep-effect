# @beep/rdf

Pure RDF and linked-data value models for the repo.

- This is a `foundation/modeling` package.
- Keep it domain-safe: no capability, driver, tooling, app, slice, server,
  table, UI, or live Layer dependencies.
- Use schema-first models and `$RdfId` identities.
- `@beep/semantic-web` may re-export this package for compatibility, but this
  package must not import `@beep/semantic-web`.
