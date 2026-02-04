# AGENTS.md Quality Audit

Generated: 2026-02-04
Total files audited: 64

## Methodology

Quick heuristic scoring based on:
- **Lines**: File length (proxy for comprehensiveness)
- **Purpose**: Presence of "purpose", "overview", "what this"
- **Files**: Presence of "key files", "important files"
- **Patterns**: Mentions of "pattern", "convention", "standard"
- **Examples**: Count of code blocks (```)
- **Guards**: Presence of "never", "avoid", "don't", "forbidden"

Scoring: Lines × 0.02 + (Purpose > 0 ? 2 : 0) + (Files > 0 ? 2 : 0) + (Patterns > 0 ? 2 : 0) + min(Examples/2, 2) + (Guards > 0 ? 2 : 0)

## Score Distribution (Estimated)

Based on heuristics:
- **Comprehensive (200+ lines, examples, guards)**: ~15 files (23%)
- **Adequate (100-200 lines, some sections)**: ~25 files (39%)
- **Minimal (50-100 lines, basic)**: ~20 files (31%)
- **Stub (<50 lines)**: ~4 files (6%)

## Top Performers (Largest, Most Complete)

| Path | Lines | Code Blocks | Notes |
|------|-------|-------------|-------|
| packages/shared/ui/AGENTS.md | 429 | 28 | Comprehensive with examples |
| packages/iam/client/AGENTS.md | 406 | 22 | Extensive with guards |
| packages/shared/client/AGENTS.md | 313 | 10 | Good coverage |
| packages/knowledge/server/AGENTS.md | 284 | 26 | Many examples |
| packages/shared/server/AGENTS.md | 279 | 18 | Well documented |
| packages/shared/tables/AGENTS.md | 244 | 14 | Good patterns |
| packages/runtime/server/AGENTS.md | 232 | 10 | Solid coverage |
| packages/iam/ui/AGENTS.md | 224 | 6 | Good guards |
| apps/todox/AGENTS.md | 226 | 20 | Many examples |
| packages/comms/client/AGENTS.md | 213 | 8 | Good patterns |

## Needs Improvement (Minimal Content)

| Path | Lines | Code Blocks | Missing |
|------|-------|-------------|---------|
| packages/knowledge/ui/AGENTS.md | 46 | 2 | Sparse |
| packages/calendar/ui/AGENTS.md | 47 | 2 | Minimal |
| packages/common/wrap/AGENTS.md | 47 | 2 | Basic |
| packages/knowledge/client/AGENTS.md | 47 | 2 | Stub-like |
| packages/calendar/client/AGENTS.md | 48 | 2 | Minimal |
| packages/knowledge/domain/AGENTS.md | 52 | 2 | Basic |
| apps/web/AGENTS.md | 55 | 4 | Light |
| packages/calendar/domain/AGENTS.md | 56 | 2 | Minimal |
| packages/calendar/tables/AGENTS.md | 56 | 2 | Basic |
| packages/ui/editor/AGENTS.md | 60 | 2 | Sparse |

## Full Inventory

### Root
| File | Lines | Est. Score |
|------|-------|------------|
| ./AGENTS.md | 153 | 7/10 |

### apps/
| File | Lines | Est. Score |
|------|-------|------------|
| marketing/AGENTS.md | 62 | 4/10 |
| server/AGENTS.md | 68 | 5/10 |
| todox/AGENTS.md | 226 | 8/10 |
| web/AGENTS.md | 55 | 5/10 |

### packages/calendar/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 48 | 4/10 |
| domain/AGENTS.md | 56 | 4/10 |
| server/AGENTS.md | 75 | 5/10 |
| tables/AGENTS.md | 56 | 4/10 |
| ui/AGENTS.md | 47 | 4/10 |

### packages/common/
| File | Lines | Est. Score |
|------|-------|------------|
| constants/AGENTS.md | 96 | 6/10 |
| errors/AGENTS.md | 132 | 6/10 |
| identity/AGENTS.md | 77 | 5/10 |
| invariant/AGENTS.md | 69 | 5/10 |
| schema/AGENTS.md | 95 | 6/10 |
| types/AGENTS.md | 76 | 4/10 |
| utils/AGENTS.md | 97 | 5/10 |
| wrap/AGENTS.md | 47 | 4/10 |

### packages/comms/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 213 | 7/10 |
| domain/AGENTS.md | 207 | 8/10 |
| server/AGENTS.md | 132 | 6/10 |
| tables/AGENTS.md | 162 | 6/10 |
| ui/AGENTS.md | 185 | 7/10 |

### packages/customization/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 164 | 6/10 |
| domain/AGENTS.md | 66 | 4/10 |
| server/AGENTS.md | 87 | 5/10 |
| tables/AGENTS.md | 91 | 5/10 |
| ui/AGENTS.md | 105 | 5/10 |

### packages/documents/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 96 | 5/10 |
| domain/AGENTS.md | 97 | 5/10 |
| server/AGENTS.md | 129 | 6/10 |
| tables/AGENTS.md | 67 | 4/10 |
| ui/AGENTS.md | 79 | 5/10 |

### packages/iam/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 406 | 9/10 |
| domain/AGENTS.md | 199 | 7/10 |
| server/AGENTS.md | 130 | 7/10 |
| tables/AGENTS.md | 174 | 7/10 |
| ui/AGENTS.md | 224 | 8/10 |

### packages/knowledge/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 47 | 4/10 |
| domain/AGENTS.md | 52 | 4/10 |
| server/AGENTS.md | 284 | 9/10 |
| tables/AGENTS.md | 59 | 4/10 |
| ui/AGENTS.md | 46 | 4/10 |

### packages/runtime/
| File | Lines | Est. Score |
|------|-------|------------|
| client/AGENTS.md | 143 | 6/10 |
| server/AGENTS.md | 232 | 7/10 |

### packages/shared/
| File | Lines | Est. Score |
|------|-------|------------|
| ai/AGENTS.md | 71 | 5/10 |
| client/AGENTS.md | 313 | 8/10 |
| domain/AGENTS.md | 189 | 7/10 |
| env/AGENTS.md | 127 | 5/10 |
| integrations/AGENTS.md | 164 | 7/10 |
| server/AGENTS.md | 279 | 8/10 |
| tables/AGENTS.md | 244 | 8/10 |
| ui/AGENTS.md | 429 | 9/10 |

### packages/ui/
| File | Lines | Est. Score |
|------|-------|------------|
| core/AGENTS.md | 171 | 6/10 |
| editor/AGENTS.md | 60 | 4/10 |
| spreadsheet/AGENTS.md | 153 | 6/10 |
| ui/AGENTS.md | 134 | 5/10 |

### packages/_internal/
| File | Lines | Est. Score |
|------|-------|------------|
| db-admin/AGENTS.md | 141 | 6/10 |

### tooling/
| File | Lines | Est. Score |
|------|-------|------------|
| build-utils/AGENTS.md | 147 | 6/10 |
| cli/AGENTS.md | 205 | 7/10 |
| repo-scripts/AGENTS.md | 157 | 7/10 |
| testkit/AGENTS.md | 158 | 7/10 |
| utils/AGENTS.md | 109 | 5/10 |

### tmp/ (External Reference)
| File | Lines | Est. Score |
|------|-------|------------|
| lexical/AGENTS.md | 162 | 5/10 |

## Key Findings

1. **Wide variance**: Scores range from 4/10 to 9/10
2. **IAM slice well-documented**: Consistently high scores across all packages
3. **Knowledge slice inconsistent**: Server excellent (284 lines), others minimal (<60 lines)
4. **Calendar slice needs work**: All packages under 80 lines
5. **Shared packages strong**: Most above 150 lines with good examples

## Recommendations

### Immediate (Quick Wins)
1. Expand calendar/* AGENTS.md files (all under 80 lines)
2. Expand knowledge/{client,domain,tables,ui} to match server quality
3. Add code examples to packages with <4 code blocks

### Structural Improvements
1. Standardize AGENTS.md template across all packages
2. Ensure every AGENTS.md has: Purpose, Key Files, Patterns, Examples, Guardrails
3. Use iam/client/AGENTS.md as the gold standard template

### Content Improvements
1. Add "Common Mistakes" section to all files
2. Include dependency diagram for complex packages
3. Add links to related ai-context.md files (when created)
