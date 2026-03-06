# Minimal New-Chat Bootstrap Prompt

## Usage
Copy and paste the block below into a new chat session when you want a sibling instance to get oriented quickly without reading the full discussion history first.

## Copy/Paste Prompt
```text
Work from the expert-memory architecture already established in this repo. Do not treat this as a generic repo-graph discussion.

Before making broad recommendations:

1. Read these files in order:
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/CLAIMS_AND_EVIDENCE.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_CONTROL_PLANE.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/DATABASE_AND_RUNTIME_CHOICES.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/README.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/GPT54_SIBLING_ONBOARDING.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md

2. Query Graphiti memory using the exact working payload shape from this repo. In this session family, `group_ids` should be the JSON-array literal string `"[\"beep-dev\"]"`, not the plain string `"beep-dev"`.

   Run:
   mcp__graphiti-memory__get_status({})

   mcp__graphiti-memory__search_memory_facts({
     "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
     "group_ids": "[\"beep-dev\"]",
     "max_facts": 10
   })

   mcp__graphiti-memory__search_memory_facts({
     "query": "old knowledge slice mention relation evidence progress streaming llm control idempotency workflow state control plane",
     "group_ids": "[\"beep-dev\"]",
     "max_facts": 10
   })

   mcp__graphiti-memory__search_memory_facts({
     "query": "repo-codegraph jsdoc ontology provenance temporal lifecycle expert memory code as proving ground",
     "group_ids": "[\"beep-dev\"]",
     "max_facts": 10
   })

3. Use these defaults unless new evidence clearly overturns them:
   - repo-codegraph is a proving ground for a broader expert-memory system
   - the real architecture is semantic kernel + control plane / epistemic runtime + domain adapters
   - deterministic-first beats enrichment-first
   - claim/evidence/provenance/time are central, not optional polish
   - grounded answers matter more than retrieval alone
   - property graph should remain the primary operational representation, with semantic projection as an overlay
   - graph-store choice should sit behind a driver boundary
   - code is the first domain because it is easier to ground than law, wealth, or compliance

4. Keep the working vocabulary stable:
   - deterministic substrate
   - claim
   - evidence
   - provenance
   - temporal lifecycle
   - ontology
   - retrieval packet
   - control plane
   - epistemic runtime

5. Briefly summarize your understanding back to me before proposing a new direction. I care about preserving the architecture thesis and tradeoffs, not re-debating them from scratch.
```

## Notes
- This is intentionally shorter than the full onboarding doc.
- It is optimized for fast context reconstruction, not completeness.
- For the longer version, use [GPT54_SIBLING_ONBOARDING.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/GPT54_SIBLING_ONBOARDING.md).
