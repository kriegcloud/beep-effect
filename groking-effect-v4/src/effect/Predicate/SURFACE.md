# effect/Predicate Surface

Total exports: 50

| Export | Kind | Overview |
|---|---|---|
| `and` | `const` | Creates a predicate that returns `true` only if both predicates are `true`. |
| `compose` | `const` | Composes two predicates or refinements into one. |
| `eqv` | `const` | Creates a predicate that returns `true` when both predicates agree. |
| `every` | `function` | Creates a predicate that returns `true` if all predicates in the collection return `true`. |
| `hasProperty` | `const` | Checks whether a value has a given property key. |
| `implies` | `const` | Creates a predicate representing logical implication: if `antecedent`, then `consequent`. |
| `isBigInt` | `function` | Checks whether a value is a `bigint`. |
| `isBoolean` | `function` | Checks whether a value is a `boolean`. |
| `isDate` | `function` | Checks whether a value is a `Date`. |
| `isError` | `function` | Checks whether a value is an `Error`. |
| `isFunction` | `function` | Checks whether a value is a `function`. |
| `isIterable` | `function` | Checks whether a value is iterable. |
| `isMap` | `function` | Checks whether a value is a `Map`. |
| `isNever` | `function` | A guard that always returns `false`. |
| `isNotNull` | `function` | Checks whether a value is not `null`. |
| `isNotNullish` | `function` | Checks whether a value is not `null` and not `undefined`. |
| `isNotUndefined` | `function` | Checks whether a value is not `undefined`. |
| `isNull` | `function` | Checks whether a value is `null`. |
| `isNullish` | `function` | Checks whether a value is `null` or `undefined`. |
| `isNumber` | `function` | Checks whether a value is a `number`. |
| `isObject` | `function` | Checks whether a value is a plain object (not an array, not `null`). |
| `isObjectKeyword` | `function` | Checks whether a value is an `object` in the JavaScript sense (objects, arrays, functions). |
| `isObjectOrArray` | `function` | Checks whether a value is an object or an array (non-null object). |
| `isPromise` | `function` | Checks whether a value is a `Promise`-like object with `then` and `catch`. |
| `isPromiseLike` | `function` | Checks whether a value is `PromiseLike` (has a `then` method). |
| `isPropertyKey` | `function` | Checks whether a value is a valid `PropertyKey` (string, number, or symbol). |
| `isReadonlyObject` | `function` | Checks whether a value is a readonly object. |
| `isRegExp` | `function` | Checks whether a value is a `RegExp`. |
| `isSet` | `function` | Checks whether a value is a `Set`. |
| `isString` | `function` | Checks whether a value is a `string`. |
| `isSymbol` | `function` | Checks whether a value is a `symbol`. |
| `isTagged` | `const` | Checks whether a value has a `_tag` property equal to the given tag. |
| `isTruthy` | `function` | Checks whether a value is truthy. |
| `isTupleOf` | `const` | Checks whether a readonly array has exactly `n` elements. |
| `isTupleOfAtLeast` | `const` | Checks whether a readonly array has at least `n` elements. |
| `isUint8Array` | `function` | Checks whether a value is a `Uint8Array`. |
| `isUndefined` | `function` | Checks whether a value is `undefined`. |
| `isUnknown` | `function` | A guard that always returns `true`. |
| `mapInput` | `const` | Transforms the input of a predicate using a mapping function. |
| `nand` | `const` | Creates a predicate that returns `true` unless both predicates are `true`. |
| `nor` | `const` | Creates a predicate that returns `true` when neither predicate is `true`. |
| `not` | `function` | Negates a predicate. |
| `or` | `const` | Creates a predicate that returns `true` if either predicate is `true`. |
| `Predicate` | `interface` | A function that decides whether a value of type `A` satisfies a condition. |
| `PredicateTypeLambda` | `interface` | Type-level lambda for higher-kinded usage of {@link Predicate}. |
| `Refinement` | `interface` | A predicate that also narrows the input type when it returns `true`. |
| `some` | `function` | Creates a predicate that returns `true` if any predicate in the collection returns `true`. |
| `Struct` | `function` | Creates a predicate for objects by applying predicates to named properties. |
| `Tuple` | `function` | Creates a predicate for tuples by applying predicates to each element. |
| `xor` | `const` | Creates a predicate that returns `true` if exactly one predicate is `true`. |
