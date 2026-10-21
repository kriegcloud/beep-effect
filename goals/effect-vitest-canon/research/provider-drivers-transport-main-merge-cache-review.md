# Disjoint branch and main cache review merge

Retain the branch dependency arrays reviewed in `goals/effect-vitest-canon/research/provider-drivers-service-main-merge-cache-review.md`
and the independently reviewed main arrays. Three-way comparison confirms
disjoint changed computation sets and identical computation membership. Only
dependencies differ: all commands, configurations, source records, qualification
scope, profile, epoch and other metadata remain equal. No qualification is
promoted. Preserve main's existing HTML/NLP review at its original path and
record this lane-specific merged basis separately.

Branch computations:

- `@beep/anthropic#audit`
- `@beep/anthropic#build`
- `@beep/anthropic#check`
- `@beep/anthropic#coverage`
- `@beep/anthropic#lint:deprecated-apis`
- `@beep/anthropic#package-test-typecheck`
- `@beep/anthropic#test`
- `@beep/anthropic#test:property`
- `@beep/openai#audit`
- `@beep/openai#build`
- `@beep/openai#check`
- `@beep/openai#coverage`
- `@beep/openai#lint:deprecated-apis`
- `@beep/openai#package-test-typecheck`
- `@beep/openai#test`
- `@beep/openai#test:integration`
- `@beep/openai-compat#audit`
- `@beep/openai-compat#build`
- `@beep/openai-compat#check`
- `@beep/openai-compat#coverage`
- `@beep/openai-compat#lint:deprecated-apis`
- `@beep/openai-compat#package-test-typecheck`
- `@beep/openai-compat#test`
- `@beep/openai-compat#test:integration`
- `@beep/openai-compat#test:property`
- `retired:venice-ai#audit`
- `retired:venice-ai#build`
- `retired:venice-ai#check`
- `retired:venice-ai#coverage`
- `retired:venice-ai#lint:deprecated-apis`
- `retired:venice-ai#package-test-typecheck`
- `retired:venice-ai#test`
- `retired:venice-ai#test:integration`
- `retired:venice-ai#test:integration:parallel`
- `retired:venice-ai#test:property`
- `retired:xai#audit`
- `retired:xai#build`
- `retired:xai#check`
- `retired:xai#coverage`
- `retired:xai#lint:deprecated-apis`
- `retired:xai#package-test-typecheck`
- `retired:xai#test`
- `retired:xai#test:integration`
- `retired:xai#test:property`

Main computations:

- `@beep/ai-sync#audit`
- `@beep/ai-sync#build`
- `@beep/ai-sync#check`
- `@beep/ai-sync#coverage`
- `@beep/ai-sync#lint:deprecated-apis`
- `@beep/ai-sync#package-test-typecheck`
- `@beep/ai-sync#test`
- `@beep/ai-sync#test:integration`
- `@beep/ai-sync#test:property`
- `@beep/api-transport#audit`
- `@beep/api-transport#build`
- `@beep/api-transport#check`
- `@beep/api-transport#coverage`
- `@beep/api-transport#doctest`
- `@beep/api-transport#lint:deprecated-apis`
- `@beep/api-transport#package-test-typecheck`
- `@beep/api-transport#test`
- `@beep/api-transport#test:integration`
- `@beep/api-transport#test:property`
