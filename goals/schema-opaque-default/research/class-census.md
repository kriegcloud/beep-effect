# Schema-class census (2026-10-13)

Method: TypeScript AST pass over 6,697 files (excludes node_modules, dist, .repos, graft, scratchpad/effected); class-name matching scoped to local declarations and `./`, `@beep/`, `@/` imports. Counts are approximate where 141 names are declared more than once.

- Decls 7,574: S.Class 6,076 · TaggedClass 520 · TaggedError 751 · Opaque 113 (all repo-utils JSDoc.ts) · extend<Y> subclasses 100 · Entity wrappers 56 · Data.* 33
- Non-error bodies (6,736): 93.1% empty, 5.8% statics-only, 1.0% instance members (34 outside scratchpad: LocalDate x2 w/ Equal/Hash, Pandoc TaggedClass x4, nlp Token/Sentence/Document, ParserOptions, CsvCodecOptions, Wink models, FileProcessingEngineDescriptor)
- instanceof on schema classes: 0 · `new X(`: ~3 non-error · `.make(` 7,296 src / 10,026 test · S.is(X): 182/115 · static `is` on 86 classes (265 uses)
- Nominal-break lower bound: 103 object literals typed as class (66 src/37 test; ~63 outside scratchpad) + 14 `as X` casts; contextual/arg literals NOT counted -> real count only via brand-on typecheck
- Struct-break: 34 behaviour classes; 985 user-static reads; .extend 99 uses + 100 subclass decls; .fields 409, .pipe 305, .check 91, .makeEffect 35, .mapFields 33
- Takeaway: 93% empty bodies, no instanceof/new reliance -> Struct/Opaque candidates; keep Class(+brand) for behaviour classes, extend chains, heavy-static classes
