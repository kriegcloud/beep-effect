# Spec Review Handoff Prompt

Copy-paste this prompt to have Claude Code review the knowledge-graph-integration spec before orchestrator handoff.

---

## Prompt

You are resuming work on the **Knowledge Graph Integration** specification in the **beep-effect** repository.

### Context

A previous Claude Code instance created this spec to integrate effect-ontology patterns into beep-effect. The spec is complete but needs review before handing off to the Phase 0 orchestrator.

**Your role**: Final spec reviewer and fixer. Run the `spec-reviewer` agent, address any issues found, then confirm the spec is ready for orchestrator handoff.

### Directory Structure

You are working in the **beep-effect** repository:

```
beep-effect/                          # You are here
├── packages/                         # Future implementation location
├── specs/
│   ├── _guide/                       # Spec standards and guides
│   │   ├── README.md                 # Spec creation workflow
│   │   ├── HANDOFF_STANDARDS.md      # Handoff document standards
│   └── knowledge-graph-integration/  # The spec to review
│       ├── README.md
│       ├── QUICK_START.md
│       ├── MASTER_ORCHESTRATION.md
│       ├── AGENT_PROMPTS.md
│       ├── RUBRICS.md
│       ├── REFLECTION_LOG.md
│       └── handoffs/
│           └── P0_ORCHESTRATOR_PROMPT.md
└── tmp/
    └── effect-ontology/              # Reference implementation
```

### Your Mission

1. **Run the spec-reviewer agent** on the knowledge-graph-integration spec
2. **Review the output** for any issues or gaps
3. **Fix any problems** found (missing sections, incorrect patterns, unclear instructions)
4. **Verify all files exist** and follow the templates in SPEC_CREATION_GUIDE.md and HANDOFF_STANDARDS.md

### Agent Prompt to Use

Launch the `spec-reviewer` agent with this prompt:

```
Review the knowledge-graph-integration spec for quality and completeness.

Target: specs/knowledge-graph-integration/

Check:
1. README.md follows spec template structure
2. REFLECTION_LOG.md exists (can be empty template)
3. MASTER_ORCHESTRATION.md has all 8 phases defined (P0-P7)
4. AGENT_PROMPTS.md has prompts for all phases
5. RUBRICS.md has evaluation criteria for all phases
6. QUICK_START.md provides 5-minute triage
7. handoffs/P0_ORCHESTRATOR_PROMPT.md is copy-paste ready
8. All code examples use Effect patterns (namespace imports, Effect.gen, Effect.Service)
9. All paths reference tmp/effect-ontology/ correctly
10. Success criteria are measurable
11. Directory context is clear (beep-effect repo, effect-ontology in tmp/)

Output: outputs/spec-review.md with:
- Compliance score
- Issues found
- Recommended fixes
```

### Verification Checklist

After running the agent and making fixes, verify:

- [ ] All 7 spec files exist in `specs/knowledge-graph-integration/`
- [ ] `handoffs/P0_ORCHESTRATOR_PROMPT.md` exists and is actionable
- [ ] All effect-ontology paths use `tmp/effect-ontology/` prefix
- [ ] Directory context section exists in README.md and QUICK_START.md
- [ ] Code examples use namespace imports (`import * as Effect from "effect/Effect"`)
- [ ] No `async/await` in code examples (only `Effect.gen` with `yield*`)
- [ ] RUBRICS.md covers all 8 phases (P0-P7)

### After Review

Once the spec passes review:

1. Report what was reviewed and any fixes made
2. Confirm the spec is ready for P0 orchestrator handoff
3. The user will then use `handoffs/P0_ORCHESTRATOR_PROMPT.md` to start Phase 0

### Reference Files

| Purpose | Path |
|---------|------|
| Spec standards | `specs/_guide/README.md` |
| Handoff standards | `specs/_guide/HANDOFF_STANDARDS.md` |
| Effect patterns | `.claude/rules/effect-patterns.md` |
| The spec to review | `specs/knowledge-graph-integration/` |

### Notes

- This spec was originally authored in the effect-ontology repo's tmp folder, then paths were updated for execution in beep-effect
- The reference implementation at `tmp/effect-ontology/` should be cloned/available when the orchestrator runs
- Focus on ensuring the spec is self-contained and actionable for a fresh Claude instance
