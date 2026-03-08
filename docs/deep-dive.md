# Deep dive

If we would like to get the given name and family name of all persons known by e.g. Stuart Bloom
(from [tbbt-ld][tbbt]) we can write:

<run-kit node-version="16">

```js
const rdf = require('@zazuko/env-bundle')

// load the tbbt-ld graph
const dataset = await rdf.fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nt')
  .then(response => response.dataset())

// turn the RDF/JS dataset into a Clownface context
const tbbt = rdf.clownface({ dataset })

// get a starting node inside the dataset
const stuartBloom = tbbt.namedNode('http://localhost:8080/data/person/stuart-bloom')

// query for all people Stuart knows and print their full name
stuartBloom
  // get all nodes connected through schema:knows 
  .out(rdf.ns.schema.knows) 
  // for every result
  .map((person) => {
    // get their schema:givenName and schema:familyName
    const personalInformation = person.out([
      rdf.ns.schema.givenName,
      rdf.ns.schema.familyName
    ])
    // join the givenName and familyName with a space
    return personalInformation.values.join(' ')
  })
  // join the list of names with a comma
  .join(', ')
```

</run-kit>

[tbbt]: https://github.com/zazuko/tbbt-ld

## Notes

See that unlike the [Getting started](/#getting-started) example, which uses absolute URIs to refer to terms, the code above imports the [@tpluscode/rdf-ns-builders](https://npm.im/@tpluscode/rdf-ns-builders) library which exports a number of common RDF vocabularies wrapped as [namespace builder objects](https://npm.im/@rdfjs/namespace).

Thus, typing `schema.givenName` is equivalent to `namedNode('http://schema.org/givenName')`
