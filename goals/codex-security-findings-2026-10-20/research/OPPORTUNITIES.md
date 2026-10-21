# Friction receipts

- 2026-10-20: Full report enrichment initially reached a browser challenge while
  CSV ingestion worked. The operator restored authenticated ChatGPT access;
  all eight reports were then captured through the supported browser UI.
  Prevent with an authenticated-session check before detail enrichment. No
  cookies, tokens, undocumented APIs or signed artifact URLs were extracted.
- 2026-10-20: fflate catches exceptions from a streaming output callback and
  returns them through its error callback. Preserve typed resource-limit errors
  across that boundary; otherwise node/byte-limit failures become generic parser
  errors. Source: installed UnzipInflate.push. Regression coverage is authored,
  execution held for PR #1928.

- 2026-10-20: The initial draft pass treated the dependency on PR #1928 as a
  reason to stop although source/test authoring could continue. The operator
  requested parallel work; disjoint DOCX, graph, and tooling workers found
  additional budget-accounting and consumer-coverage gaps without executing
  held checks. Prevent by distinguishing a proof/publication dependency from
  independent implementation work in the execution plan.

- 2026-10-20 resumed proof: `quality package-verify --help` documents a variadic
  package argument, but execution rejects multiple arguments with "expected at
  most one package argument". Run one package per command until the command
  help and runtime agree. The failed multi-package call ran no package proof.

- 2026-10-21: After #1928 integration, the Markdown import gate scanned
  ignored historical output under `scratchpad/.jsdoc-loop/generated-docs`.
  The source tree was not the failing input. Preserve such generated caches
  outside the repository scan surface, with a recoverable archive, before
  qualification; do not edit thousands of generated examples as source fixes.
- 2026-10-21: A newly generated Fallow audit reported introduced complexity
  in DOCX XML/ZIP handling and claim traversal. Targeted regressions alone
  had passed. Keep budget accounting explicit during refactoring and rerun
  both the security regressions and the collected gates before publication.

- 2026-10-20 resumed cheap proof: markdown Effect import enforcement scanned
  ignored historical `scratchpad/.jsdoc-loop/generated-docs` output, producing
  errors despite tracked authored docs passing. Preserved the 9 MiB cache
  outside the checkout; the specific gate passed. Future documentation scans
  should distinguish authored input from ignored generated caches without
  weakening enforcement on tracked docs.

- 2026-10-21: The package audit did not replace the synthetic test-file check
  used by Heavy/Check. Hosted diagnostics found metadata guard, optional-header
  and hub API issues after local package proof passed. Run each changed
  package's `package-test-typecheck` as part of the focused handoff; preserve
  its separate artifact and diagnostics instead of inferring it from audit.
