> ## RDFine _/rɪdɪˈfaɪn/_
> ### **RDF**/JS **i**diomatic, **n**ative, **e**njoyable
### [![NPM version](https://img.shields.io/npm/v/@tpluscode/rdfine.svg?style=flat-square)](https://www.npmjs.com/package/@tpluscode/rdfine) [![Build](https://travis-ci.org/tpluscode/rdfine.svg?branch=master)](https://travis-ci.org/tpluscode/rdfine) [![codecov.io](https://codecov.io/github/tpluscode/rdfine/coverage.svg?branch=master)](https://codecov.io/github/tpluscode/rdfine?branch=master)

## About

### Idiomatic

RDFine greatly simplifies the manipulation of data in RDF graph ([RDF/JS datasets][dataset])
by wrapping low-level node handling of triples in plain JavaScript objects.

It is also possible to share the JS-RDF bindings between projects as npm packages.

### Native

While plain JS objects are the preferred way to access the graphs, they do not completely
replace the underlying [RDF/JS dataset][dataset]. Both RDFine objects and the dataset can
be modified simultaneously, with changes to one immediately reflected in the other.

### Effective

RDFine makes it super easy to bootstrap a triple-backed project without the need
to drink up the RDF Kool-Aid. Novices will use the idiomatic JS interface to get
the job done quickly, while power users still can take advantage of seamless
integration with [@rdfjs][rdfjs] libraries.

[dataset]: https://rdf.js.org/dataset-spec/
[rdfjs]: https://www.npmjs.com/search?q=rdfjs

## TL;DR; overview

You have RDF triples in an RDF/JS Dataset object

```turtle
@prefix ex: <http://rdfine.ggg/> .
@prefix schema: <http://schema.org/> .

ex:john a schema:Person ; 
    schema:name "John Doe" ;
    schema:spouse ex:jane ;
    schema:nationality [
        schema:name "USA"
    ] .
```

You want to create a JS object model to access that data

```typescript
import {schema} from '@tpluscode/rdf-ns-builders'
import { namedNode } from '@rdfjs/data-model'
import { RdfResourceImpl, fromObject } from '@tpluscode/rdfine'
import { loadData } from './data/person'
import { Person, PersonMixin } from './model/Person'

// make rdfine "aware" of object model for schema:Person
RdfResourceImpl.factory.addMixin(PersonMixin)

// create entity through the factory
const john = RdfResourceImpl.factory.createEntity<Person>({
  dataset: await loadData(),
  term: namedNode('http://rdfine.ggg/john'),
})

// modify the dataset through JS objects
john.nationality = "United States of America"
// also with deep graph modifications
john.spouse = fromObject({
  types: [schema.Person],
  name: 'Jane Doe',
})

// get the modified dataset, always in sync
const dataset = john._selfGraph.dataset
```

## Installation

```shell script
npm i @tpluscode/rdfine
```

## Usage
### Define resource interfaces

While it is possible to inherit a base resource class, it's best to create partial mixin classes
which implement part of the RDF model. Mixins are dynamically applied to compose a JavaScript object model
closely matching the actual quad data.

```typescript
// Person.ts
import { Constructor, namespace, property, RdfResource } from '@tplusode/rdfine'
import { Term } from '@rdfjs/types'
import { namedNode } from 'rdf-data-model'

// TS: define an interface for your object model
export interface Person extends RdfResource {
  name: string
  friends: Person[]
}

export function PersonMixin<Base extends Constructor>(base: Base) {
  @namespace('http://schema.org/')
  class P extends base implements Person {
  
    // Literal property
    // By default use the property's name with the annotated @namespace    
    @property.literal()
    name!: string  // http://schema.org/name

    // Customize the getter to return objects of a certain property
    @property.resource({
      // http://schema.org/knows
      path: 'knows',
      // always return a JS array
      values: 'array'
    })
    friends!: Person[]
    
    // getting raw RDF/JS terms
    // by annotating with plain @property
    @property({ 
      path: 'http://www.w3.org/2000/01/rdf-schema#label'
    })
    label: Term
    
    // use _selfGraph property to access raw triples
    // by traversing the graph with https://github.com/zazuko/clownface
    get hasOccupation(): boolean {
      return this._selfGraph
        .out(namedNode('http://schema.org/hasOccupation'))
        .terms.length > 0
    }
  }
 
  return P
}

// add a function to decide if the underlying resource
// satisfies the Person interface
// for example by checking its RDF types
PersonMixin.shouldApply = (res: RdfResource) => {
  return res.hasType('http://schema.org/Person')
}
```

### Creating resource instances

Instead of directly creating resource types, which would require deciding up-front, which
mixins to add to the constructed class, a factory can be used.

```typescript
import { DatasetCore } from '@rdfjs/types'
import { namedNode } from 'rdf-data-model'
import { RdfResourceImpl } from '@tpluscode/rdfine'
import { Person, PersonMixin } from './Person'

// register the mixin type with the factory
factory.addMixin(PersonMixin)

// load you RDF triples into a RDF/JS dataset
let dataset: DatasetCore = loadRdfData()

const person = RdfResourceImpl.factory.createEntity<Person>({
  dataset,
  term: namedNode('http://example.com/gh/tpluscode')
})
```

### Use it!

The setters are immediately reflected in the underlying dataset.
Note that any property can also be set with raw RDF term matching the annotated type

```typescript
import { namedNode } from 'rdf-data-model'

person.name = "Tomasz"
person.friends = [
  namedNode('http://example.com/gh/bergos'),
  namedNode('http://example.com/gh/ktk')
] as any

console.log(person._selfGraph.dataset.toString())
```

The last line above will print triples equivalent to those below

```turtle
@prefix schema: <http://schema.org/> .

<http://example.com/gh/tpluscode> 
    schema:name "Tomasz" ;
    schema:knows <http://example.com/gh/bergos> , <http://example.com/gh/ktk>  .
```

## Using with babel

1. `npm i -D @babel/preset-env @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties`
1. Configure babel (for example with `.babelrc`)
    ```
    {
      "presets": [
        "@babel/env"
      ],
      "plugins": [
        [
          "@babel/plugin-proposal-decorators",
          {
            "decoratorsBeforeExport": true
          }
        ],
        [
          "@babel/plugin-proposal-class-properties"
        ]
      ]
    }
    ```
