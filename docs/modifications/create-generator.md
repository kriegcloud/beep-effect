# Create Generator

This documentation details the creation of a generator and thereby assumes you have read
[how to create a parser](./create-parser.md) and [Traqula's expected AST structur](../usage/AST-structure.md).

## GeneratorRules

Traqula provides a framework to create a generator through `@tarqula/core`, further facilitating round tripping generation when following the assumptions we put on the AST and the correct invocation of `printFilter`.

A generator is constructed similarly to a parser by defining may GeneratorRules and linking them together through a builder.
A generatorRule is an object having a `name` and an implementation `gImpl`.
When you want to create both a parser and a generator, we advise you to create objects that contain both `impl` (from ParserRule) and `gImpl` (from GeneratorRule) such as done for [our SPARQL parser here rules](../../packages/rules-sparql-1-1/lib/grammar/general.ts#L18-L39).

`gImpl` is a function that gets helper functions (e.g. SUBRULE) and returns a function that receives:
1. the ast node to transform now,
2. the context
3. remaining optional parameters,
and that function return nothing.

The helper functions exposed are:
* **SUBRULE**: Generate a given subrule.
* **PRINT**: print a given string by appending it to the internal string builder
* **ENSURE**: Ensures the requested characters are printed at the current location. Only print if not already presnt and not added by the next one.
* **ENSURE_EITHER**: Ensures either one of the provided strings. If no string can be ensured, it will print the first argument.
* **NEW_LINE**: Create a new line, will ensure the previous line does not end in blank characters. Enables pretty print through `@traqula/core`s `traqulaIndentation` and `traqulaNewlineAlternative`.
* **PRINT_WORD**: Print all arguments as one word, ensuring it has a space before and behind each word
* **PRINT_WORDS**: Print all arguments as words, ensuring they all have a space before and behind them.
* **PRINT_ON_EMPTY**: Start a newline to print arguments on
* **PRINT_ON_OWN_LINE**: Prints arguments on its own (shared) line (start a new line after this one).

Using these types one can create a rule like:

```typescript
import {GeneratorRule, AstCoreFactory} from "@traqula/core";
export const var_: GeneratorRule<{ astfactory: AstCoreFactory }, 'var', { value: string, child: object }> = <const> {
  name: 'var',
  gImpl: ({PRINT, SUBRULE}) => (ast) => {
    // Print the provided string
    PRINT(`?${ast.value}`);
    // Example subrule call:
    SUBRULE(someOtherRule, ast.child)
  },
};
```

## Round tripping

The most important thing about round tripping is done in the parser and while constructing the AST types.
To do this correctly, read the [documentation on AST structure](../usage/AST-structure.md) carefully.
To support round tripping from the generators side is as simple as checking whether you should actually print.

Taking the example above, making it safe for round tripping is as easy as wrapping the PRINT in `printFiler`.
The printFilter only executes it's provided callback in case the provided AST node is one that should print:

```typescript
import {GeneratorRule, AstCoreFactory} from "@traqula/core";
export const var_: GeneratorRule<{ astfactory: AstCoreFactory }, 'var', { value: string, child: object }> = <const> {
  name: 'var',
  gImpl: ({PRINT, SUBRULE}) => (ast, {astFactory: F}) => {
    // Print the provided string only if `loc` in `ast` says that's required.
    F.printFilter(ast, () => PRINT(`?${ast.value}`));
    // Example subrule call:
    SUBRULE(someOtherRule, ast.child)
  },
};
```

The actual round tripping is handled through the DynamicGenerator which is constructed by the GeneratorBuilder.
It uses two function also exposed to rules, but they should rarely be called manually.
* **CATCHUP**: prints everything from the current catchup location until the index you provide.
* **HANDLE_LOC**: given an AST node will make sure the catchup mechanic is performed for that node.

HANDLE_LOC can help generatorRules that generate many AST nodes at once without calling SUBRULE on them.

## Building the generator

The construction of the generator works exactly the same as the construction of a parser.

1. Register the rules in a GeneratorBuilder:
```typescript
import { GeneratorBuilder } from '@traqula/core';
const generatorBuilder = GeneratorBuilder.create(<const> [var_, someOtherRule]);
```
2. Build using the builder:
```typescript
const myGenerator = generatorBuilder.build();
```
3. Call the constructed generator from any rule you added:
```typescript
const generated = myGenerator.var_(varAst, myContext);
```
