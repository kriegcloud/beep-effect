### Round Tripping

We decided to implement round tripping by creating a `location` field for eachAST node.
The location indicates a source string and a start and end index of the string representation of that AST node within the source string.
To reduce string repetitions, an undefined source string means this node shares the same source string as its parent.

We considered round tripping where spaces and special cases were captured as part of a round tripping type (RTT) field in each AST,
but that solution was not maintainable. The issue was that some strings are not materialized in teh AST such as an empty group: `{  {  } . } }.`
Tracking this as part of the AST creates a complex 'ownership' problem.
Additionally capturing the complexity of all edge-cases proved to be difficult on a grammar basis, as such, reasoning over code became a nightmare.
Lastly, capturing round tripping info in your AST types creates for a strongly types AST, but that comes with a maintainability tradeoff.
Looking back, there were many issues with the approach.
The reason it was attempted in the first place was so IDE-like tooling could be implemented easily since the RTT types could be edited themselves,
instead of editing the string representations.

### Altered AST from SPARQL.JS

This library will replace [SPARQL.JS](https://github.com/RubenVerborgh/SPARQL.js/) in the Comunica project, as such there was a debate on whether the AST should be the same since it would require minimal refactoring.
In the end we decided to change the AST to be closer to typical ASTs so language tolling could easily be integrated ontop of the generator output.
Converting the AST to algebra was previously done by [SPARQL algebra.js](https://github.com/joachimvh/SPARQLAlgebra.js),
which will be merged as a package in this monorepo.
It will be up to the algebra generator to optimize the AST to a structure most suitable by query engines such as Comunica.

### Generation
Our generator must support
replacement operations like: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-replacing-a-node
but also replacements with specific string formats. using `path.replaceWith(F.someType(..., { source: 'own string', start: 0, end: length-1; }))`

The generator is initialized with sources and skip-ranges.
A rule sharing source with parent will start with a catchup, only afterward will it start generating underlying rules.
The catchup function of the generator knows when a rule is replaced since it will be registered as a skip-range, and skip-ranges are not generated using catchup's.

Generation rules that have an ast that is not Localized SHOULD NOT print since they do noy auto catchup.

Currently, the constructed generator does not support that you have a source tracked node within something that is generated.
That means that you need to use `F.forcedAutoGenTree()` to force the whole subtree on some node to be auto generated too.
In the future we could change this implementation in such a way that we would detect when source bound nodes are present and use range arithmetics.
We do not do that yet to keep things simple.

### Altering subrule results

Be careful when recreating nodes that have been created by subrules since the recreation might lose information if the a modified grammar adds more fields to the node.
Example, do:
```
res[0].subject = subject;
res[0].loc = C.factory.sourceLocation(subject, res[0]);
// WARNING for future use: overwriting elements like this is
//  bad practice since it will remove future extensions
// res[0] = C.factory.triple(subject, predicate, object, C.factory.sourceLocation(subject, object));
```
