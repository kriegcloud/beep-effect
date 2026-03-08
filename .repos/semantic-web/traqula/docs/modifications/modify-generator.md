# Modify parser

Modifying a parser is actually the same as [modifying a parser](./modify-parser.md)
but using [generator constructions](./create-generator.md).

Simply said, the GeneratorBuilder knows the same functions
as the [ParserBuilder helping you modify the builder](./modify-parser.md#manipulating-the-parserbuilder).
Meaning you can retrieve currently registered rules using `.getRule()`
and create generator implementations as discussed in [creating a generator](./create-generator.md#generatorrules).
One can then start patching rules using `.patchRule()`.

> [!note]
> Like with [modifying a parser](./modify-parser.md), you should create a copy of a ParserBuilder you start from,
> and NOT edit it in place.
