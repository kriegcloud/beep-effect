# icon-standardization: Reflection Log

> Cumulative learnings from spec creation and implementation phases.

---

## Reflection Entries

### P0: Scaffolding (2026-02-14)

1. **What Worked**
   - Codebase exploration agent quickly identified all three icon library usages with exact file paths
   - Full grep of Iconify wrapper consumers revealed the true scope (~60+ files vs initial rough estimate)
   - Identifying `styled(Iconify)` and `iconifyClasses` patterns early prevents surprises during replacement
   - Reading the Iconify wrapper source revealed the MUI sx prop integration challenge

2. **What Didn't Work**
   - Initial complexity assessment underestimated scope (scored 41, but the Iconify wrapper's deep embedding and MUI integration pushes effective complexity higher)
   - The generic spec scaffold templates were too generic - all had to be rewritten entirely

3. **Methodology Improvements**
   - For "replace library X with Y" migrations, always check for wrapper/abstraction layers first - they multiply the scope
   - Inventory phase should group by BOTH package AND icon prefix (solar, eva, mingcute) for efficient batch processing

4. **Prompt Refinements**
   - Swarm agents need explicit guidance on `sx` prop migration since it's the most error-prone transformation
   - The `styled()` pattern migration deserves its own explicit rule in agent prompts
   - Social/brand icons should be called out as a special case requiring early investigation

5. **Codebase-Specific Insights**
   - The `Iconify` wrapper is deeply embedded: used in layouts, routing, inputs, forms, settings, molecules, animations
   - `packages/ui/core/src/constants/iconify/icon-sets.ts` contains ~50+ embedded SVG definitions - all can be deleted
   - MUI component overrides in `packages/ui/core/src/theme/core/components/` use inline SVG with Iconify URL comments (independent of Iconify React package but still need migration)
   - 6+ nav item components use `styled(Iconify)` for arrow animations
   - Social brand icons (twitter, facebook, github, google, linkedin, instagram) come from a custom Iconify set

---

## Accumulated Improvements

### Template Updates
- "Replace library" specs should include a "wrapper/abstraction audit" step in P0
- Agent prompts for replacement work need explicit rules for each prop migration pattern

### Process Updates
- Running `better-icons` search during P0 (not just P1) would validate that Phosphor has adequate coverage before committing to the migration

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. Early wrapper/abstraction layer identification - prevents scope surprises
2. Grep for both the wrapper component AND the underlying library imports
3. Reading the wrapper source to understand prop interface differences

### Top 3 Potential Pitfalls
1. MUI `sx` prop incompatibility with Phosphor components - needs explicit migration strategy
2. `styled()` composition with icon components - different prop interfaces
3. Social/brand icons may not have direct Phosphor equivalents
