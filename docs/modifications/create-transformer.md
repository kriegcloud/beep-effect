# Create Transformer

Transformations exist on two levels.
First we have the small transformations already discussed under [the AST structure docs](../usage/AST-structure.md).
Those transformations help iterate any tree following the format `{ type: string, subType?: string }` (which includes [our SPARQL Algebra](../../packages/algebra-transformations-1-1/lib/algebra.ts)).

More complex transformations can be constructed as a flow of function calls in a modular fashion using the same indirection mechanism used for the parser and generator constructor:

![img.png](traqula-rulemap-single.svg)

## Indirection Definition

Similar to ParserRule and GeneratorRule, a transformer uses `IndirDef` exposed by `@traqula/core`:

```typescript
import { type IndirDef } from '@traqula/core';
type Context = {};
const ruleReturningOne: IndirDef<Context, 'returningOne', 1> = {
  name: 'returningOne',
  fun: () => () => 1,
};
// -----------------------   Context   -   Name    -   ReturnType - Arguments
const ruleAddingOne: InidirDef<Context, 'addingOne', number, [ number ]> = {
  name: 'addingOne',
  fun: ({ SUBRULE }) => (C, otherNumber) => {
    return otherNumber + SUBRULE(ruleReturningOne);
  },
};
```

These rules are then grouped together and managed using th `IndirectionBuilder` of `@traqula/core`:

```typescript
import { IndirectionBuilder } from '@traqula/core';
const indirectionBuilder = IndirectionBuilder
  .create(<const> [ruleReturningOne, ruleAddingOne]);
const oneToAddOne = indirectionBuilder.build();
// --------------------------   context - args
const five = oneToAddOne.addingOne({}, 4);
```
