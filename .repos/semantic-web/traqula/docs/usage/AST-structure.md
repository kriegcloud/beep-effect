# AST Manipulation

Traqula, through its parser and generator allows you to parse, manipulate and generate queries.
This manipulation can be done in a [round-tripping](https://en.wikipedia.org/wiki/Round-trip_format_conversion) fashion, empowering powerful tools useful for structured languages (e.g. [linters](https://en.wikipedia.org/wiki/Lint_(software))).

This documentation page goes into detail on the AST structure used by Traqula and how to both create and modify ASTs.

## AST Structure

The AST structure is declared using TypeScript types as a [tree](https://en.wikipedia.org/wiki/Tree_(abstract_data_type)) of [@traqula/core Nodes](../../packages/core/lib/types.ts#L37).
The AST nodes contain the information to identify the _type_ and _subType_ of the AST-node, and also contain information to round-trip the node through the _SourceLocation information_.

### Source Location

The source location (`loc`) optionally relates an AST-node to the string character range the node represents.
This information is then used by the Traqula core generator to enable round-tripping.

There are six kinds of source location information:
1. **SourceLocationSource**: Relate the node to the source through a character range.
2. **SourceLocationInlinedSource**: Add a new source indicating what part of the new source this node represents and what part of the original source is replaced by this new source.
3. **SourceLocationNoMaterialize**: Indicate this node and it's children are not represented in the query, but merely provide additional usability to the AST consumers.
4. **SourceLocationStringReplace**: Indicate this node and it's children can be represented using a specified string instead of the specified range of characters in the original string.
5. **SourceLocationNodeReplace**: Indicate you wish the generator to auto generate the AST node as a replacement of the specified range.
6. **SourceLocationNodeAutoGenerate**: Indicate you wish the generator to auto generate the string for this node and do not relate it to the source string (since you likely don't have it).

In order to support round tripping, the AST tree structure has the following restrictions regarding the ranges:
1. The source related ranges of descendents of a node that relates itself to a source using some range, should be contained within that node. Concretely: if a node says it represents range x-y, it's descendants must represent subranges of x-y.
2. The generation of a single node should call to sub generations in the order that matches the ranges order:
If a node has subnodes A, B and C; the generating function should call to A, B and C in the order that they represent in string.

Furthermore, parsers may choose to emit only _SourceLocationNodeAutoGenerate_ since collecting the source information puts additional strain on the lexer.
This is what happens for Traqula's SPARQL parsers, and it's why you need to [enable collecting the info in the context](../../engines/parser-sparql-1-1/README.md#collecting-round-tripping-information).

### SPARQL AST

The SPARQL AST is declared as union type `Sparql11Nodes`
[within @traqula/rules-sparql-1-1](../../packages/rules-sparql-1-1/lib/Sparql11types.ts).
Additionally,
the package contains [a factory](../../packages/rules-sparql-1-1/lib/astFactory.ts) simplifying the creation of AST nodes.

In the example bellow we parse a SPARQL query and append the prefix `ex:` to the list of prefixes:

```typescript
import { Parser } from '@traqula/parser-sparql-1-1'
import { Generator } from '@traqula/generator-sparql-1-1'
import { AstFactory, type QuerySelect } from '@traqula/rules-sparql-1-1'
const parser = new Parser();
const generator = new Generator();
const F = new AstFactory();
const query = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
SELECT * { ?s ?p ?o }
`

const ast = <QuerySelect> parser.parse(query);
ast.context.append(F.contextDefinitionPrefix(
  F.gen(),
  'ex',
  F.termNamed(F.gen(), 'https://example.com/')
));
const truety = generator.generate(ast) === `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX ex: <https://example.com/>
SELECT * { ?s ?p ?o }
`;
```

## Transform

In order to facilitate the manipulation of multiple nodes, possibly deep within the AST,
Traqula provides a generic transformer that uses the `type` and `subType` of the AST nodes.

The example below shows how the transformer can capitalize all string literals in a SPARQL query:

```typescript
import { AstTransformer, AstFactory } from "@traqula/rules-sparql-1-1";
import { Parser } from '@traqula/parser-sparql-1-1'
import { Generator } from '@traqula/generator-sparql-1-1'
const parser = new Parser();
const transformer = new AstTransformer();
const F = new AstFactory();
const generator = new Generator();

const ast = parser.parse(`
SELECT * {
  ?s ?p 'bang', 'help',
'monster' .
}
`)
const transformed = transformer.transformNodeSpecific(ast, {}, {
  // Target Nodes of type 'term' and subType 'literal', providing the function to transform them.
  'term': { 'literal': { transform: (literal) => {
    if (typeof literal.langOrIri === 'object' &&
      literal.langOrIri.value === 'http://www.w3.org/2001/XMLSchema#string') {
      return F.literal(F.sourceLocationNodeReplaceUnsafe(literal), literal.value.toUpperCase());
    }
    return literal;
  }}}
});
const truety = generator.generate(transformed) === `
SELECT * {
  ?s ?p 'BANG', 'HELP',
'MONSTER' .
}
`
```
