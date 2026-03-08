# Traqula Documentation

The Traqula framework enables a modular definition of parsers, transformers and generators.
This documentation documents Traqula's core design decisions, spanning outside the SPARQL query language to other structured languages.
Traqula does currently NOT support streaming parsing, making it ill-suited for creating a parser for large data files.
The following documentation details how to use Traqula to **create your own components**:

1. [Create a parser](modifications/create-parser.md)
2. [AST structure](usage/AST-structure.md)
3. [Create a generator](modifications/create-generator.md)
4. [Create a transformer](modifications/create-transformer.md)

The following documentation pages detail how to **create your own by making modifications to existing components**:

1. [Modify a parser](modifications/modify-parser.md)
2. [Modify a generator](modifications/modify-generator.md)
3. [Modify a transformer](modifications/modify-transformer.md)

When you migrate from [SPARQL.JS](https://github.com/joachimvh/SPARQLAlgebra.js) or [SparqlAlgebra](https://github.com/joachimvh/SPARQLAlgebra.js):
1. [Migration guide SPARQL.JS](./sparqlJSMigration.md)
2. [Migration guide SPARQLAlgebra.Js](./sparqlAlgebraMigration.md)
