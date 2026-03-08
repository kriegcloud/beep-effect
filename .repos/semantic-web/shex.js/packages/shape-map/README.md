# shape-map
Javascript library to parse [ShapeMap](https://shexspec.github.io/shape-map/)s

## Usage:

``` javascript
const ShapeMap = require('shape-map');
const shapeMapParser = ShapeMap.Parser.construct(
  'http://base.example/fallback/',
  { base: 'http://my.example/url/', prefixes: {} },
  { base: 'http://my.example/url/', prefixes: {} }
)
const smap = shapeMapParser.parse(`<#n>@<#S1>`)
```

### Methods

#### Parser.construct(fallbackBase, schemaMeta, dataMeta)

Construct ShapeMap parser with appropriate bases and prefixes for parsing nodes and shapes.

parameters:
* fallbackBase - a URL string to use as a base if the schema or data don't supply one
* schemaMeta - a base and prefixes to use when resolving shapes
* dataMeta - a base and prefixes to use when resolving nodes

returns: array of {node, shape} pairs

example:
``` js
const BASE = 'http://my.example/url/'
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const ShExValidator = require("..")
const ShExLoader = require("@shexjs/loader")({
  rdfjs: require('n3'),         // use N3 as an RdfJs implementation
  // fetch: require('node-fetch'), // not needed with string arguments
})
const ShapeMap = require('shape-map')
ShapeMap.start = ShExValidator.Start // ShapeMap parser can use Validators's start symbol

main()
async function main () {
  const loaded = await ShExLoader.load(
    { shexc: [{url: BASE, text: `<#S1> { <p1> [1 2]; <p2> [3 4] }`}]},
    { turtle: [{url: BASE, text: `<#n> <p1> 1 ; <p2> 3 .`}] }
  )
  const shapeMapParser = ShapeMap.Parser.construct(
    'http://base.example/fallback/',
    { base: BASE, prefixes: {} },
    { base: BASE, prefixes: {} }
  )
  const smap = shapeMapParser.parse(`<#n>@<#S1>`)
  console.log(smap)
}
```
output:
```
[
  {
    node: 'http://my.example/url/#n',
    shape: 'http://my.example/url/#S1',
    status: 'conformant'
  }
]
```

For brevity, this example uses a common BASE for both the schema and data.


### Base URLs for schema and data

URLs in the node specifier (left of the `@` sign) are resolved against the dataMeta base and prefix. Likewise, the shape specifier uses the schemaMeta.

In this example, the schema and data use different base URLs. We used relative URLs in the data predicates in order to reference the terms defined in the schema:

example:
``` js
  const loaded = await ShExLoader.load(
    { shexc: [{url: 'http://my.example/schema/', text: `<#S1> { <p1> [1 2]; <p2> [3 4] }`}]},
    { turtle: [{url: 'http://my.example/data/', text: `<#n> <../schema/p1> 1 ; <../schema/p2> 3 .`}] }
  )
  const shapeMapParser = ShapeMap.Parser.construct(
    'http://base.example/fallback/',
    { base: 'http://my.example/schema/', prefixes: {} },
    { base: 'http://my.example/data/', prefixes: {} }
  )
  const smap = shapeMapParser.parse(`<#n>@<#S1>`)
  console.log(smap)
```
output:
```
[
  {
    node: 'http://my.example/data/#n',
    shape: 'http://my.example/schema/#S1',
    status: 'conformant'
  }
]
```


### Prefixes for schema and data

The above example uses relative URLs to make the predicates in the data be the predicates in the schema. This can also be accomplished with prefix declarations:

example:
``` js
  const loaded = await ShExLoader.load(
    { shexc: [{url: 'http://my.example/schema/', text: `PREFIX p: <http://my.example/ns#>
PREFIX s: <http://my.example/shapes#>
s:S1 { p:p1 [1 2]; p:p2 [3 4] }`}]},
    { turtle: [{url: 'http://my.example/data', text: `PREFIX : <http://my.example/ns#>
<#n> :p1 1 ; :p2 3 .`}] }
  )
  const shapeMapParser = ShapeMap.Parser.construct(
    'http://base.example/fallback/',
    { base: 'http://my.example/schema/', prefixes: {shape: 'http://my.example/shapes#'} },
    { base: 'http://my.example/data/', prefixes: {'': 'http://my.example/data#'} }
  )
  const smap = shapeMapParser.parse(`:n@shape:S1`)
  console.log(smap)
```
output:
```
[
  {
    node: 'http://my.example/data#n',
    shape: 'http://my.example/shapes#S1'
  }
]
```

Here, we used different prefixes in the schema, data, and ShapeMap. We can bypass redundant declarations using the metadata from `ShExLoader.load()`.


### Use with @shexjs loader and validator
The ShapeMap parser is typically used with `@shexjs/loader` or some derivative (e.g. `@shexjs/node`). `ShExLoader.load()` returns metadata we can pass directly to the ShapeMap parse. This example ShapeMap (`<#n>@s:S1`) uses the data's base URL and the schema's `s:` prefix:

example:
``` js
const BASE = 'http://my.example/url/'
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const {ShExValidator} = require("..")
const ShExLoader = require("@shexjs/loader")({
  rdfjs: require('n3'),         // use N3 as an RdfJs implementation
  // fetch: require('node-fetch'), // not needed with string arguments
})
const ShapeMap = require('shape-map')
ShapeMap.start = ShExValidator.Start // ShapeMap parser can use Validators's start symbol

main()
async function main () {
  const loaded = await ShExLoader.load(
    { shexc: [{url: 'http://my.example/schema/', text: `PREFIX p: <http://my.example/ns#>
PREFIX s: <http://my.example/shapes#>
s:S1 { p:p1 [1 2]; p:p2 [3 4] }`}]},
    { turtle: [{url: 'http://my.example/data', text: `PREFIX : <http://my.example/ns#>
<#n> :p1 1 ; :p2 3 .`}] }
  )
  const {schema, schemaMeta, data, dataMeta} = loaded
  const shapeMapParser = ShapeMap.Parser.construct(
    'http://base.example/fallback/',
    schemaMeta[0],
    dataMeta[0]
  )
  const smap = shapeMapParser.parse(`<#n>@s:S1`)
  console.log(smap)
  const validator = new ShExValidator(schema, RdfJsDb(data), {})
  const res = validator.validate(smap)
  console.log(res)
}
```
output:
```
[
  {
    node: 'http://my.example/data#n',
    shape: 'http://my.example/shapes#S1'
  }
]
{
  type: 'ShapeTest',
  node: 'http://my.example/data#n',
  shape: 'http://my.example/shapes#S1',
  solution: { type: 'EachOfSolutions', solutions: [ [Object] ] }
}
```

