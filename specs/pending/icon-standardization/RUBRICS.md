# icon-standardization: Evaluation Rubrics

> Criteria for evaluating phase and spec completion quality.

---

## Phase Completion Criteria

### P1: Inventory
| Criterion | Pass | Fail |
|-----------|------|------|
| Coverage | Every Iconify/Lucide/MUI-override icon has an entry | Missing icons |
| Phosphor mapping | Each entry has a Phosphor replacement with Icon postfix | Unmapped or deprecated names |
| File accuracy | File paths and line numbers are verifiable | Stale/incorrect references |
| Special cases | Social/brand/custom icons have explicit handling notes | Left ambiguous |

### P2: Replacement
| Criterion | Pass | Fail |
|-----------|------|------|
| Import convention | ALL Phosphor imports use Icon postfix | Any bare import (e.g., `Trash`) |
| No Iconify usage | Zero `<Iconify` JSX elements remain | Any `<Iconify` found |
| No Lucide usage | Zero lucide-react imports remain | Any lucide-react import found |
| sx prop handling | Iconify sx props migrated correctly | Runtime style errors |
| styled() migration | styled(Iconify) replaced correctly | Type errors in styled components |
| Existing Phosphor | Pre-existing Phosphor imports preserved | Accidental removal/duplication |

### P3: Cleanup
| Criterion | Pass | Fail |
|-----------|------|------|
| Files deleted | Iconify directories removed | Leftover files |
| Exports clean | No barrel exports reference deleted files | Import errors |
| Dependencies removed | @iconify/react, lucide-react gone from all package.json | Any remaining reference |
| Lockfile updated | bun.lock reflects removals | Stale lockfile |

### P4: Quality Gates
| Criterion | Pass | Fail |
|-----------|------|------|
| Build | `bun run build` exits 0 | Build errors |
| Type check | `bun run check` exits 0 | Type errors |
| Tests | `bun run test` exits 0 | Test failures |
| Lint | `bun run lint` exits 0 after `lint:fix` | Lint errors |

---

## Overall Spec Grading

| Grade | Criteria |
|-------|----------|
| A (Complete) | All 4 phases pass, inventory produced, zero remaining non-Phosphor icons |
| B (Functional) | P2-P4 pass but inventory has minor gaps (e.g., line numbers off) |
| C (Partial) | Core replacement done but some MUI overrides or edge cases remain |
| D (Incomplete) | Replacement started but gates fail or significant icons unmigrated |
| F (Failed) | Spec abandoned or gates broken without resolution |
