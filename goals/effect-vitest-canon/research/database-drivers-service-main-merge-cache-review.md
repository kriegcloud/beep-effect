# Disjoint branch and main cache review merge

Retain the branch dependency arrays reviewed in `goals/effect-vitest-canon/research/database-drivers-nlp-main-merge-cache-review.md`
and the independently reviewed main arrays. Three-way comparison confirms
disjoint changed computation sets and identical computation membership. Only
dependencies differ: all commands, configurations, source records, qualification
scope, profile, epoch and other metadata remain equal. No qualification is
promoted. Preserve main's existing HTML/NLP review at its original path and
record this lane-specific merged basis separately.

Branch computations:

- `@beep/drizzle#audit`
- `@beep/drizzle#build`
- `@beep/drizzle#check`
- `@beep/drizzle#coverage`
- `@beep/drizzle#lint:deprecated-apis`
- `@beep/drizzle#package-test-typecheck`
- `@beep/drizzle#test`
- `@beep/drizzle#test:integration`
- `@beep/drizzle#test:integration:serial`
- `@beep/drizzle#test:property`
- `@beep/duckdb#audit`
- `@beep/duckdb#build`
- `@beep/duckdb#check`
- `@beep/duckdb#coverage`
- `@beep/duckdb#lint:deprecated-apis`
- `@beep/duckdb#package-test-typecheck`
- `@beep/duckdb#test`
- `@beep/duckdb#test:property`
- `@beep/postgres#audit`
- `@beep/postgres#build`
- `@beep/postgres#check`
- `@beep/postgres#coverage`
- `@beep/postgres#lint:deprecated-apis`
- `@beep/postgres#package-test-typecheck`
- `@beep/postgres#test`
- `@beep/postgres#test:integration`
- `@beep/postgres#test:integration:serial`
- `@beep/postgres#test:property`

Main computations:

- `retired:firecrawl#audit`
- `retired:firecrawl#build`
- `retired:firecrawl#check`
- `retired:firecrawl#coverage`
- `retired:firecrawl#lint:deprecated-apis`
- `retired:firecrawl#package-test-typecheck`
- `retired:firecrawl#test`
- `retired:firecrawl#test:integration`
- `retired:firecrawl#test:integration:parallel`
- `retired:firecrawl#test:property`
- `@beep/runpod#audit`
- `@beep/runpod#build`
- `@beep/runpod#check`
- `@beep/runpod#codegen`
- `@beep/runpod#coverage`
- `@beep/runpod#lint:deprecated-apis`
- `@beep/runpod#package-test-typecheck`
- `@beep/runpod#test`
- `@beep/runpod#test:integration`
- `@beep/runpod#test:integration:parallel`
- `@beep/runpod#test:property`
- `@beep/sanity#audit`
- `@beep/sanity#build`
- `@beep/sanity#check`
- `@beep/sanity#coverage`
- `@beep/sanity#lint:deprecated-apis`
- `@beep/sanity#package-test-typecheck`
- `@beep/sanity#test`
- `@beep/sanity#test:integration`
- `@beep/sanity#test:property`
