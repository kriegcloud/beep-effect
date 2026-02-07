# Verification Report

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Commands

```bash
___
```

## Results

- `___`: `PASS/FAIL` (date)

## Required Audits (Per Module)

Record the exact command and result used to support the “no new `any` / `@ts-ignore` / unchecked casts” gate.

Example:

```bash
rg -n '\bany\b|@ts-ignore|as unknown as|\bas any\b' packages/knowledge/domain/
rg -n '\bany\b|@ts-ignore|as unknown as|\bas any\b' packages/knowledge/tables/
rg -n '\bany\b|@ts-ignore|as unknown as|\bas any\b' packages/knowledge/server/
rg -n '\bany\b|@ts-ignore|as unknown as|\bas any\b' packages/knowledge/client/
rg -n '\bany\b|@ts-ignore|as unknown as|\bas any\b' packages/knowledge/ui/
```

Result:

- `rg ...`: `PASS` (all matches are either fixed or listed in `outputs/AUDIT_ALLOWLIST.md`) (date)
