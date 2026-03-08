# Modifying a parser

Traqula allows you to create a new parser by manipulating an existing parser through its builder.
To create a parser, read [how to create a parser](./create-parser.md).
A [tutorial on parser manipulation within Comunica](https://comunica.dev/docs/modify/getting_started/contribute_new_operation/) provides a practical example on parser modifications.

## Modify the lexer

In case your modification requires an additional lexerToken, or the removal of a lexerToken, you should manipulate the original LexerBuilder accordingly.
LexerBuilder expose various functions to facilitate this behavior:

* **create**: Start by creating a copy of the other LexerBuilder
* **merge**: Append the tokens of another LexerBuilder to this one, filtering duplicate registers of the same LexerToken (by reference) and throwing if a non-resolvable duplicate token name is registered.
* **addBefore / addAfter**: Add a list of tokens before or after an existing token in the builder.
* **delete**: delete a token that exists within th builder (by reference).

> [!warning]
> It is essential that you DO NOT manipulate the LexerBuilder created by another,
> but instead start by copying it:
> ```typescript
> LexerBuilder.create(existingBuilder)
> ```

## Create required parser rules

Just as described in the [creating a parser docs](./create-parser.md)
you should construct the required parser rules in a similar way as the existing parser.
To this end, the implementation of an existing parser rule might help you,
to that end you can request the currently registered grammar rule object from some ParserBuilder using its name.
Say we cant to add an additional alternative to a rule named `graphPatternNotTriples`, meaning we either parse our new subrule, or the original rule:

```typescript
// get the original rule definition. Note that the string is in fact type checked!
// The builder knows it has such an implementation from the typing
const originalGraphPatternNotTriples = sparqlParserBuilder.getRule('graphPatternNotTriples');
const additionalOptionsRule: typeof originalGraphPatternNotTriples = <const> {
  name: originalGraphPatternNotTriples.name,
  impl: $ => C => $.OR([
    { ALT: () => $.SUBRULE(myNewRule) },
    { ALT: originalGraphPatternNotTriples.impl($)(C) }
  ]),
};
```

## Manipulating the ParserBuilder

Just like before, **start by creating a copy of the ParserBuilder** using `ParserBuilder.create(existingParserBuilder)`.
The ParserBuilder has a few functions that facilitate parser modification:

* **patchRule**: change the implementation of a (named) rule by another rule with the same name.
* **addRule**: Add an additional rule to the parser.
* **merge**: Merge another ParserBuilder with this ParserBuilder, resolving duplicate rules when able and throwing when not.
* **deleteRule**: Delete a given rule by providing the name of said rule.
* **widenContext**: In your new rule requires the Parser To have a wider context, this generic function without arguments allows you to register this change.

## Building the parser

What remains is to create the modified parser.
This can be done in [the same way as when creating a parser form skratch](./create-parser.md#build-parser).

> [!important]
> When exposing your parser, note that the parser is not all that counts.
> Help the ecosystem by exposing your ParserBuilder, tokens and grammar rules.

### Type patching

It is possible that you modify a certain parser rule in a way that its interface (e.g. arguments or returned type) does not match the original, breaking the parsers' implementation.

Take a parser rule `myRule` that returns an object of type `number`, when we patch that rule to now return `number | string`,
the rules that call of `myRule` using `SUBRULE` (e.g. `otherRule`) will might need to be patched to handle this new type.
In case no actual rule patching is needed, but the return-type of `otherRule` changes, we can inform the ParserBuilder of this changed type interface from `otherRule` using `typePatch` instead of `patchRule`.
TypePatch is a generic function that takes an object where the keys match the name of rules that need to change and the value is the new type of the returnType and arguments.

```typescript
ParserBuilder
  .create(originalBuilder)
  .patchRule(myRule)
  .typePatch<{
    // Patch only the returnType
    otherRule: [ NewReturnType ],
    // Patch both the returnType and the arguments
    anotherRule: [ NewReturnType, [ NewArgumentType1, NewArgumentType2 ]]
    // Rules not listed remain untouched
  }>();
```

> [!warning]
> Once again, it is essential that you DO NOT manipulate the ParserBuilder created by another,
> but define your own builder starting from an existing one:
> ```typescript
> ParserBuilder.create(existingBuilder)
> ```

Although type patching is not strictly necessary for people modifying a parser, it is hugely helpful for people using your modified parser builder.
The SPARQL 1.2 parser Traqula provides for example [performs type patching](../../engines/parser-sparql-1-2/lib/Parser.ts#L16-L213) to ensure correctness of all rules in that parser builder.
