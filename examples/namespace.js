/* eslint-disable import/no-extraneous-dependencies */
import namespace from '@rdfjs/namespace'
import clownface from '../index.js'
import initExample from '../test/support/example.js'

initExample().then(dataset => {
  const people = namespace('http://localhost:8080/data/person/')
  const schema = namespace('http://schema.org/')

  const tbbt = clownface({ dataset })

  const stuartBloom = tbbt.node(people('stuart-bloom'))

  console.log(`name of ${stuartBloom.values[0]}:`)
  console.log(
    stuartBloom
      .out([schema.givenName, schema.familyName])
      .values.join(' '),
  )

  console.log(`people ${stuartBloom.values[0]} knows:`)
  console.log(
    stuartBloom
      .out(schema.knows)
      .map(person => person
        .out([schema.givenName, schema.familyName])
        .values.join(' '),
      )
      .join(', '),
  )

  const apartment4a = tbbt.node('2311 North Los Robles Avenue, Aparment 4A')

  console.log(`people who live in ${apartment4a.values[0]}`)
  console.log(
    apartment4a
      .in(schema.streetAddress)
      .in(schema.address)
      .map(person => person.out(schema.givenName).value)
      .join(', '),
  )

  const neurobiologist = tbbt.has(schema.jobTitle, 'neurobiologist')

  console.log('people with the job title neurobiologist')
  console.log(
    neurobiologist
      .out(schema.givenName)
      .values.join(', '),
  )
})
