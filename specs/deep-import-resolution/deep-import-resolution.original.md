# Deep Import Resolution - Original Prompt

**SPEC_NAME**: deep-import-resolution

## Raw User Request

I just had another instance of claude code produce the below report:

According to this document:
```
3. Deep Import Anti-Pattern (-0.5 points)
1,495 instances of @beep/package-name/internal/... imports bypass public APIs. This creates implicit coupling that agents might replicate.
```

Your task is to systematically create a PLAN.md file in `specs/deep-import-resolution/PLAN.md` containing an itemized checklist of all instances where the internal pattern is used where each list item contains:
- recommendations to fix the issue
- exact file paths
- a map from the old file paths to the new recommended ones

Additionally you should create a `specs/deep-import-resolution/ORCHESTRATION.md` file containing the prompt for another instance of claude to orchestrate sub-agents to resolve each item in PLAN.md

## Context

From AI Documentation Review audit scoring beep-effect at 7.5/10:
- 1,495 instances of `@beep/package-name/internal/...` imports bypass public APIs
- This creates implicit coupling that agents might replicate
- Listed as a -0.5 point deduction in the audit

## Deliverables Expected

1. `specs/deep-import-resolution/PLAN.md` - Itemized checklist with:
   - Exact file paths
   - Recommendations to fix
   - Map from old imports to new recommended ones

2. `specs/deep-import-resolution/ORCHESTRATION.md` - Prompt for sub-agent orchestration
