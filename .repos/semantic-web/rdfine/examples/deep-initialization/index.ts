import { turtle } from '@tpluscode/rdf-string'
import * as Schema from '@rdfine/schema'
import { SchemaFactory } from '@rdfine/schema/Factory'
import { fromObject } from '@tpluscode/rdfine/RdfResource'
import { schema } from '@tpluscode/rdf-ns-builders'
import Environment from '@zazuko/env/Environment.js'
import ZazukoEnv from '@rdfine/env'

const environment = new Environment([SchemaFactory], { parent: ZazukoEnv })

const bigBangTheory = environment.namespace('http://tbbt.example.com/')

async function main() {
  const graph = environment.clownface({ term: bigBangTheory.Howard })

  // the person gets initialized with it whole subgraph
  const howard = environment.rdfine.schema.Person(graph, {
    givenName: 'Howard',
    familyName: 'Wolowitz',
    knows: {
      id: bigBangTheory.Sheldon,
      types: [schema.Person],
      hasOccupation: {
        types: [schema.Occupation],
        name: 'Theoretical physicist',
      },
      name: 'Sheldon Cooper',
    },
    memberOf: {
      types: [schema.Organization],
      name: 'CalTech',
    },
  })

  // existing entities can also be used
  const penny = environment.rdfine.schema.Person(graph.node(bigBangTheory.Penny), {
    knows: howard,
  })
  penny.name = 'Penny'

  // and individual properties initialized from plain objects
  howard.spouse = fromObject<Schema.Person>({
    id: bigBangTheory.Bernadette,
    types: [schema.Person],
    givenName: 'Bernadette',
    familyName: 'Rostenkowski-Wolowitz',
    alternateName: 'Bernadette Rostenkowski',
  })

  return turtle`${graph.dataset}`.toString()
}

main()
  .then(console.log)
  .catch(console.error)
