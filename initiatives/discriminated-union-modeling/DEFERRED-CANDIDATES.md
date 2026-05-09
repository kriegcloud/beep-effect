# Deferred Candidates

This inventory records useful follow-up targets that are outside the first
proof batch. Each candidate needs a focused audit before implementation.

| Candidate | Why deferred |
|---|---|
| PROV `ProvRecord` full `provType` tagging | Higher-risk wire-shape and interoperability work; likely needs explicit compatibility decoding before changing internal shape. |
| ACP generated schema/generator tagged-union support | Belongs in the generator, not hand edits to `_generated/schema.gen.ts`. |
| Markdown `Inline` / `Block` recursive AST unions | Recursive schemas need a dedicated typecheck and docgen pass to avoid destabilizing AST consumers. |
| `DocgenGenerationResult` and `JSDocCategoryNormalization` status/result bags | Tooling result modeling is valuable, but should be paired with focused tests around current reporting behavior. |
| SSE done/data event normalization in xAI/Venice | The public streaming event shape currently exposes done/data bags; normalizing it is a driver API change and needs a compatibility plan. |
| UI/client state bags | Async/loading/error/data state bags should become tagged state models where they own finite UI states, but those changes belong with feature-specific UI tests. |
