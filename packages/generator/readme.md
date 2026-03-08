> ## @rdfine/generator
> ### Creates entity types from RDF vocabularies
### [![NPM version](https://img.shields.io/npm/v/@rdfine/generator.svg?style=flat-square)](https://www.npmjs.com/package/@rdfine/generator) [![Build](https://travis-ci.org/tpluscode/rdfine.svg?branch=master)](https://travis-ci.org/tpluscode/rdfine) [![codecov.io](https://codecov.io/github/tpluscode/rdfine/coverage.svg?branch=master)](https://codecov.io/github/tpluscode/rdfine?branch=master)

## About

With this package you can easily scaffold JavaScript models based on RDF vocabularies:

1. `rdfs:Class` and `schema:Class` become JavaScript classes
   - `rdfs:subClassOf` used to build up class hierarchy
   - because [JavaScript mixins](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) are used, "multiple inheritance" is possible
2. Properties are discovered by exploring the `rdfs:domain`, `rdfs:range`, `schema:domainIncludes` and `schema:rangeIncludes` relations
   - domains and ranges defined using `owl:unionOf` and `owl:disjointUnionOf` are also considered
3. Property return types are assigned:
   - matching JS built-in type for datatype properties
   - resource type for classes within the vocabulary
   - if all fails, the property is defined to return [RDF/JS Term](http://rdf.js.org/data-model-spec/#term-interface)

## TL;DR;

Check the [generated vocabularies](../../vocabularies) to see the generation result.

Check the [examples](../../examples) to see how they are used.

## Usage

```
npm i --save @rdfine/generator
```

The package is a command-line interface which consumes standard input of RDF data.

```
Usage: rdfine-gen [options]

Options:
  --format <format>        Media type of parser to use
  --namespace <namespace>  Namespace URI
  --prefix <prefix>        prefix
  --outDir <outDir>        Output directory (default: ".")
  --verbose                
  -h, --help               display help for command
```

### Generate from a common vocabulary

The easiest way is to pipe the output from [@zazuko/rdf-vocabularies CLI](https://npm.im/@zazuko/rdf-vocabularies#command-line)

```
npm i -g @zazuko/vocabularies
rdf-vocab prefix foaf | rdfine-gen \
  --format application/n-triples \
  --prefix foaf 
```

### Generate from the web

If the given vocabulary is dereferencable form the web, curl can be used to fetch it and pipe to the generator

```
curl http://xmlns.com/foaf/0.1/ -H accept:application/rdf+xml -H | \
  rdfine-gen \
  --format application/rdf+xml \
  --prefix foaf 
```

## Options

The process can be further tweaked by adding a `rdfine` key to package.json. Here's an example of its usage in `@rdfine/schema` package.

```json
{
  "rdfine": {
    "namespace": "http://schema.org/",
    "prefix": "schema",
    "types": {
      "schema:CssSelectorType": "string",
      "schema:URL": "NamedNode",
      "schema:XPathType": "string"
    },
    "exclude": [
      "Class",
      "DataType",
      "DefinedTerm",
      "EducationalOccupationalCredential",
      "Enumeration",
      "GeospatialGeometry",
      "MedicalBusiness",
      "PhysicalActivityCategory",
      "URL",
      "VirtualLocation"
    ]
  }
}
```

`namespace` and `prefix` can be used in place of the CLI params. The former is optional if the vocabulary is known to [@zazuko/rdf-vocabularies](https://npm.im/@zazuko/rdf-vocabularies)

`types` maps non-standard property ranges to built-in JS types. The keys are prefixed name of the given datatype or class. The values is one of the following: `( 'string', 'number', 'boolean', 'Date', 'NamedNode' )`.

`exclude` causes certain classes to be ignored from being generated and removed where they would be used as property types.


## What gets generated

1. For every class `Foo` a `Foo.ts` module:
   2. exports `interface Foo`
   3. default-exports a mixin function `Foo`
   4. exports a default implementation used as `new Foo.Class()`
2. main `index.ts` module:
   3. re-exports all `Foo` interfaces
   4. default-export all mixin functions as an array
3. `lib/namespace/ts` is created with a [@rdfjs/namespace](https://npm.im/@rdfjs/namespace) builder export
