# effect/Boolean Surface

Total exports: 17

| Export | Kind | Overview |
|---|---|---|
| `and` | `const` | Combines two boolean using AND: `self && that`. |
| `Boolean` | `const` | Reference to the global Boolean constructor. |
| `Equivalence` | `const` | An `Equivalence` instance for booleans using strict equality (`===`). |
| `eqv` | `const` | Combines two booleans using EQV (aka XNOR): `!xor(self, that)`. |
| `every` | `const` | This utility function is used to check if all the elements in a collection of boolean values are `true`. |
| `implies` | `const` | Combines two booleans using an implication: `(!self \|\| that)`. |
| `isBoolean` | `const` | Tests if a value is a `boolean`. |
| `match` | `const` | This function returns the result of either of the given functions depending on the value of the boolean parameter. It is useful when you have to run one of two functions dependi... |
| `nand` | `const` | Combines two boolean using NAND: `!(self && that)`. |
| `nor` | `const` | Combines two booleans using NOR: `!(self \|\| that)`. |
| `not` | `const` | Negates the given boolean: `!self` |
| `or` | `const` | Combines two boolean using OR: `self \|\| that`. |
| `Order` | `const` | Provides an `Order` instance for `boolean` that allows comparing and sorting boolean values. In this ordering, `false` is considered less than `true`. |
| `ReducerAnd` | `const` | A `Reducer` for combining `boolean`s using AND. |
| `ReducerOr` | `const` | A `Reducer` for combining `boolean`s using OR. |
| `some` | `const` | This utility function is used to check if at least one of the elements in a collection of boolean values is `true`. |
| `xor` | `const` | Combines two booleans using XOR: `(!self && that) \|\| (self && !that)`. |
