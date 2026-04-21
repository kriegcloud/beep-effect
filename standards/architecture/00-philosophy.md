# Philosophy

beep-effect wants a repo where experimentation is cheap and quality is not.

The architecture is built for a workflow where new domains, slices, and product
ideas appear quickly. That only works if the repo has strong defaults. Without
defaults, every experiment invents its own package boundaries, every agent
chooses a slightly different file shape, and every successful prototype becomes
harder to promote into real product code.

The answer is not one giant framework package. The answer is a repeated slice
shape with clear boundaries.

## The Core Bet

The core bet is:

```txt
high modularity + consistent topology > low ceremony + improvised structure
```

The structure is not there to slow work down. It is there to make experiments
portable. A `TwoFactor` concept should feel the same across domain, use-cases,
server, client, tables, and UI. Once you know the slice grammar, you can move
quickly without hunting.

## Why This Matters More With Agents

Agents do not just read code. They infer intent from nearby files. If topology
is vague, agents improvise. If topology is explicit, agents follow the map.

This is why role suffixes matter. `TwoFactor.events.ts` and
`TwoFactor.event-handlers.ts` are slightly more verbose than one generic
`events.ts`, but they prevent the most expensive class of mistake: writing the
right idea in the wrong layer.

## What The Architecture Is Protecting

The architecture protects:

- domain language from provider leakage
- application intent from server adapter concerns
- providers from product-specific business concepts
- shared from becoming a junk drawer
- UI from becoming the real application layer
- experiments from becoming unremovable global runtime dependencies

The point is not purity for its own sake. The point is preserving optionality.
If a slice is isolated, it can be rewritten, removed, tested, forked, or promoted
without dragging the whole repo with it.

## The Shape Of A Good Slice

A good slice has a small rich domain, explicit use-cases, boring adapters, and
provider wrappers that are technical rather than product-aware.

The slice should answer:

- What does this domain mean?
- What application actions can be performed?
- What ports does the application need?
- Which adapters implement those ports?
- Which providers make those adapters safe?
- Which UI/client surfaces expose the behavior?

When those answers are visible in topology, the repo becomes easier to work in
than a flat pile of clever abstractions.

