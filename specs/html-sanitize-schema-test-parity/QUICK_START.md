# Quick Start: html-sanitize-schema-test-parity

> Get started in 5 minutes.

---

## Current Status

**Phase 0: Complete** - Scaffolding done, gap analysis documented.

**Next: Phase 1 - Discovery & Verification**

---

## 5-Minute Start

### 1. Verify Current Test State

```bash
# Run existing schema HTML tests
bun run test --filter="make-sanitize-schema"

# Expected: 4 test files, ~60 tests passing
```

### 2. Review Gap Analysis

Key gaps identified in [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md):

| Missing Tests | Utils Reference | Priority |
|---------------|-----------------|:--------:|
| CSS/Style filtering | `sanitize-html.css.test.ts` (68 tests) | P1 |
| Class filtering | `sanitize-html.classes.test.ts` (46 tests) | P1 |
| iframe/script validation | `sanitize-html.iframe.test.ts` (52 tests) | P1 |
| TagsMode variants | Inline in utils tests | P2 |
| Preset configs | Not tested anywhere | P2 |

### 3. Begin Phase 1

Use the `codebase-researcher` agent to verify the gap analysis:

```
Use Task tool with subagent_type="codebase-researcher":

Compare packages/common/utils/src/sanitize-html/types.ts SanitizeOptions
with packages/common/schema/src/integrations/html/sanitize/sanitize-config.ts SanitizeConfig.

Map each option field and identify:
1. Fields with direct equivalents
2. Fields intentionally excluded (callbacks)
3. Fields potentially missing

Output to specs/html-sanitize-schema-test-parity/outputs/type-comparison.md
```

### 4. Create Handoff

After Phase 1 completes, create:
- `handoffs/HANDOFF_P2.md` - Full context for test design phase
- `handoffs/P2_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt for next session

---

## Key Locations

### Schema Implementation
```
packages/common/schema/src/integrations/html/sanitize/
├── sanitize-config.ts      # Main config schema
├── to-sanitize-options.ts  # Config -> runtime options
├── make-sanitize-schema.ts # Schema factory
├── allowed-classes.ts      # Class filtering config
└── allowed-schemes.ts      # URL scheme config
```

### Existing Tests
```
packages/common/schema/test/integrations/html/sanitize/
├── make-sanitize-schema.basic.test.ts      # ✅ Exists
├── make-sanitize-schema.attributes.test.ts # ✅ Exists
├── make-sanitize-schema.xss.test.ts        # ✅ Exists
└── make-sanitize-schema.urls.test.ts       # ✅ Exists
```

### Utils Tests to Reference
```
packages/common/utils/test/sanitize-html/
├── sanitize-html.css.test.ts       # Port to schema
├── sanitize-html.classes.test.ts   # Port to schema
└── sanitize-html.iframe.test.ts    # Port to schema
```

---

## Test Pattern Reference

Use this pattern for new tests:

```typescript
import { describe, expect } from "bun:test";
import {
  AllowedAttributes,
  AllowedTags,
  makeSanitizeSchema,
  type SanitizeConfig,
} from "@beep/schema/integrations/html";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const createSanitizer = (config: SanitizeConfig = {}) => {
  return makeSanitizeSchema(config, sanitizeHtml);
};

describe("makeSanitizeSchema - Feature Name", () => {
  effect(
    "test description",
    Effect.fn(function* () {
      const Sanitize = createSanitizer({
        allowedTags: AllowedTags.specific(["div"]),
        // ... config
      });
      const result = yield* S.decode(Sanitize)("<div>input</div>");
      expect(result).toContain("expected");
    })
  );
});
```

---

## Verification Commands

```bash
# After creating new tests
bun run test --filter="make-sanitize-schema.css"
bun run test --filter="make-sanitize-schema.classes"
bun run test --filter="make-sanitize-schema.iframe"

# Full package verification
bun run check --filter=@beep/schema
bun run lint --filter=@beep/schema
```

---

## Next Steps After Each Phase

| After Phase | Create | Then |
|:-----------:|--------|------|
| 1 | `handoffs/HANDOFF_P2.md` | Begin test design |
| 2 | `handoffs/HANDOFF_P3.md` | Implement CSS tests |
| 3 | `handoffs/HANDOFF_P4.md` | Implement class tests |
| 4 | `handoffs/HANDOFF_P5.md` | Implement iframe tests |
| 5 | `handoffs/HANDOFF_P6.md` | Implement modes tests |
| 6 | `handoffs/HANDOFF_P7.md` | Final validation |
| 7 | Update `REFLECTION_LOG.md` | Spec complete |
