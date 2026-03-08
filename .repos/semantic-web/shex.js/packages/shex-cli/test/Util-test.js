const VERBOSE = "VERBOSE" in process.env
const TESTS = "TESTS" in process.env ? process.env["TESTS"].split(/,/) : null

const ShExParser = require('@shexjs/parser')
const ShExUtil = require('@shexjs/util')
const N3 = require('n3')

const Fs = require('fs')
const expect = require('chai').expect

const Base = 'http://schema.example/shape'
const Voc = 'http://schema.example/vocab#'
const Tests = [
  { name: 'doubly-nested',
    schema: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#nestable1> ;
  :p2 @<#SkipMe> ;
  :p5 @<#twoRefs> ;
  :p6 @<#nodeConstraint>
}
<#nestable1> {
  :p3 @<#nestable2> ;
  :p4 @<#AndMe>
}
<#nestable2> {
  :p5 @<#twoRefs>
}
<#SkipMe> { :p0 [1] }
<#AndMe> { :p0 [2] }
<#twoRefs> { :p0 [5] }
<#nodeConstraint> [6]
`,
    renamed: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @_:renamed1 ;
  :p2 @<#SkipMe> ;
  :p5 @<#twoRefs> ;
  :p6 @<#nodeConstraint>
}
_:renamed1 {
  :p3 @_:renamed2 ;
  :p4 @<#AndMe>
}
_:renamed2 {
  :p5 @<#twoRefs>
}
<#SkipMe> { :p0 [1] }
<#AndMe> { :p0 [2] }
<#twoRefs> { :p0 [5] }
<#nodeConstraint> [6]
`,
    transformed: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @_:nestable1 ;
  :p2 @<#SkipMe> ;
  :p5 @<#twoRefs> ;
  :p6 @<#nodeConstraint>
}
_:nestable1 {
  :p3 @_:nestable2 ;
  :p4 @<#AndMe>
}
_:nestable2 {
  :p5 @<#twoRefs>
}
<#SkipMe> { :p0 [1] }
<#AndMe> { :p0 [2] }
<#twoRefs> { :p0 [5] }
<#nodeConstraint> [6]
`,
    nested: `
PREFIX : <${Voc}>
<#outer> {
  :p1 {
    :p3 {
      :p5 @<#twoRefs>
    } ;
    :p4 @<#AndMe>
  } ;
  :p2 @<#SkipMe> ;
  :p5 @<#twoRefs> ;
  :p6 @<#nodeConstraint>
}
<#SkipMe> { :p0 [1] }
<#AndMe> { :p0 [2] }
<#twoRefs> { :p0 [5] }
<#nodeConstraint> [6]
`,
    nestedList: {
      'http://schema.example/shape#nestable1': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p1'
      },
      'http://schema.example/shape#nestable2': {
        referrer: 'http://schema.example/shape#nestable1',
        predicate: 'http://schema.example/vocab#p3'
      }
    },
    renamedList: {
      '_:renamed1': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p1',
        was: 'http://schema.example/shape#nestable1'
      },
      '_:renamed2': {
        referrer: 'http://schema.example/shape#nestable1',
        newReferrer: '_:renamed1',
        predicate: 'http://schema.example/vocab#p3',
        was: 'http://schema.example/shape#nestable2'
      }
    },
    transformedList: {
      '_:nestable1': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p1',
        was: 'http://schema.example/shape#nestable1'
      },
      '_:nestable2': {
        referrer: 'http://schema.example/shape#nestable1',
        newReferrer: '_:nestable1',
        predicate: 'http://schema.example/vocab#p3',
        was: 'http://schema.example/shape#nestable2'
      }
    },
    predicateUsage: {
      'http://schema.example/vocab#p1': {
        uses: [ '0' ],
        commonType: 'http://schema.example/shape#nestable1',
        polymorphic: false
      },
      'http://schema.example/vocab#p2': {
        uses: [ '0' ],
        commonType: 'http://schema.example/shape#SkipMe',
        polymorphic: false
      },
      'http://schema.example/vocab#p5': {
        uses: [ '0', '2' ],
        commonType: 'http://schema.example/shape#twoRefs',
        polymorphic: false
      },
      'http://schema.example/vocab#p6': {
        uses: [ '0' ],
        commonType: 'http://schema.example/shape#nodeConstraint',
        polymorphic: false
      },
      'http://schema.example/vocab#p3': {
        uses: [ '1' ],
        commonType: 'http://schema.example/shape#nestable2',
        polymorphic: false
      },
      'http://schema.example/vocab#p4': {
        uses: [ '1' ],
        commonType: 'http://schema.example/shape#AndMe',
        polymorphic: false
      },
      'http://schema.example/vocab#p0': {
        uses: [ '3', '4', '5' ],
        commonType: { type: 'NodeConstraint', values: [{
          'type': 'http://www.w3.org/2001/XMLSchema#integer',
          'value': '1'
        }] },
        polymorphic: false
      }
    }
  },
  { name: 'extended',
    schema: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#extended> ;
  :p2 @<#notExtended>
}
<#another> EXTENDS @<#extended> {}
<#extended> { :p2 [1] }
<#notExtended> { :p2 [2] }
`,
    renamed: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#extended> ;
  :p2 @_:renamed3
}
<#another> EXTENDS @<#extended> {}
<#extended> { :p2 [1] }
_:renamed3 { :p2 [2] }
`,
    transformed: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#extended> ;
  :p2 @_:notExtended
}
<#another> EXTENDS @<#extended> {}
<#extended> { :p2 [1] }
_:notExtended { :p2 [2] }
`,
    nested: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#extended> ;
  :p2 { :p2 [2] }
}
<#another> EXTENDS @<#extended> {}
<#extended> { :p2 [1] }
`,
    nestedList: {
      'http://schema.example/shape#notExtended': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p2'
      }
    },
    renamedList: {
      '_:renamed3': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p2',
        was: 'http://schema.example/shape#notExtended'
      }
    },
    transformedList: {
      '_:notExtended': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p2',
        was: 'http://schema.example/shape#notExtended'
      }
    },
    predicateUsage: {
      'http://schema.example/vocab#p1': {
        uses: [ '0' ],
        commonType: 'http://schema.example/shape#extended',
        polymorphic: false
      },
      'http://schema.example/vocab#p2': {
        uses: [ '0', '2', '3' ],
        commonType: null,
        polymorphic: false
      }
    }
  },
  { name: 'abstract',
    schema: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#abstract> ;
  :p2 @<#notAbstract>
}
ABSTRACT <#abstract> { :p2 [1] }
<#notAbstract> { :p2 [2] }
`,
    renamed: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#abstract> ;
  :p2 @_:renamed2
}
ABSTRACT <#abstract> { :p2 [1] }
_:renamed2 { :p2 [2] }
`,
    transformed: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#abstract> ;
  :p2 @_:notAbstract
}
ABSTRACT <#abstract> { :p2 [1] }
_:notAbstract { :p2 [2] }
`,
    nested: `
PREFIX : <${Voc}>
<#outer> {
  :p1 @<#abstract> ;
  :p2 { :p2 [2] }
}
ABSTRACT <#abstract> { :p2 [1] }
`,
    nestedList: {
      'http://schema.example/shape#notAbstract': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p2'
      }
    },
    renamedList: {
      '_:renamed2': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p2',
        was: 'http://schema.example/shape#notAbstract'
      }
    },
    transformedList: {
      '_:notAbstract': {
        referrer: 'http://schema.example/shape#outer',
        predicate: 'http://schema.example/vocab#p2',
        was: 'http://schema.example/shape#notAbstract'
      }
    },
    predicateUsage: {
      'http://schema.example/vocab#p1': {
        uses: [ '0' ],
        commonType: 'http://schema.example/shape#abstract',
        polymorphic: false
      },
      'http://schema.example/vocab#p2': {
        uses: [ '0', '1', '2' ],
        commonType: null,
        polymorphic: false
      }
    }
  }
]

const AppInfo1 = {
  "type": "ShapeTest",
  "node": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1",
  "shape": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/ObservationShape",
  "solution": {
    "type": "EachOfSolutions",
    "solutions": [
      {
        "type": "EachOfSolution",
        "expressions": [
          {
            "type": "TripleConstraintSolutions",
            "predicate": "http://hl7.org/fhir/status",
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                {
                  "value": "preliminary"
                },
                {
                  "value": "final"
                }
              ]
            },
            "solutions": [
              {
                "type": "TestedTriple",
                "subject": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1",
                "predicate": "http://hl7.org/fhir/status",
                "object": {
                  "value": "final"
                },
                "referenced": {
                  "type": "NodeConstraintTest",
                  "focus": "\"final\"",
                  "shapeExpr": {
                    "type": "NodeConstraint",
                    "values": [
                      {
                        "value": "preliminary"
                      },
                      {
                        "value": "final"
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            "type": "TripleConstraintSolutions",
            "predicate": "http://hl7.org/fhir/subject",
            "valueExpr": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/PatientShape",
            "solutions": [
              {
                "type": "TestedTriple",
                "subject": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1",
                "predicate": "http://hl7.org/fhir/subject",
                "object": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Patient2",
                "referenced": {
                  "type": "ShapeTest",
                  "node": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Patient2",
                  "shape": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/PatientShape",
                  "solution": {
                    "type": "EachOfSolutions",
                    "solutions": [
                      {
                        "type": "EachOfSolution",
                        "expressions": [
                          {
                            "type": "TripleConstraintSolutions",
                            "predicate": "http://hl7.org/fhir/name",
                            "valueExpr": {
                              "type": "NodeConstraint",
                              "datatype": "http://www.w3.org/2001/XMLSchema#string"
                            },
                            "min": 0,
                            "max": -1,
                            "solutions": [
                              {
                                "type": "TestedTriple",
                                "subject": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Patient2",
                                "predicate": "http://hl7.org/fhir/name",
                                "object": {
                                  "value": "Bob"
                                },
                                "referenced": {
                                  "type": "NodeConstraintTest",
                                  "focus": "\"Bob\"",
                                  "shapeExpr": {
                                    "type": "NodeConstraint",
                                    "datatype": "http://www.w3.org/2001/XMLSchema#string"
                                  }
                                }
                              }
                            ]
                          },
                          {
                            "type": "TripleConstraintSolutions",
                            "predicate": "http://hl7.org/fhir/birthdate",
                            "valueExpr": {
                              "type": "NodeConstraint",
                              "datatype": "http://www.w3.org/2001/XMLSchema#date"
                            },
                            "min": 0,
                            "max": 1,
                            "solutions": [
                              {
                                "type": "TestedTriple",
                                "subject": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Patient2",
                                "predicate": "http://hl7.org/fhir/birthdate",
                                "object": {
                                  "value": "1999-12-31",
                                  "type": "http://www.w3.org/2001/XMLSchema#date"
                                },
                                "referenced": {
                                  "type": "NodeConstraintTest",
                                  "focus": "\"1999-12-31\"^^http://www.w3.org/2001/XMLSchema#date",
                                  "shapeExpr": {
                                    "type": "NodeConstraint",
                                    "datatype": "http://www.w3.org/2001/XMLSchema#date"
                                  }
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
}

const Error1 = {
  "type": "Failure",
  "node": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1",
  "shape": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/ObservationShape",
  "errors": [
    {
      "type": "TypeMismatch",
      "triple": {
        "type": "TestedTriple",
        "subject": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1",
        "predicate": "http://hl7.org/fhir/subject",
        "object": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Patient2"
      },
      "constraint": {
        "type": "TripleConstraint",
        "predicate": "http://hl7.org/fhir/subject",
        "valueExpr": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/PatientShape"
      },
      "errors": [
        {
          "type": "TypeMismatch",
          "triple": {
            "type": "TestedTriple",
            "subject": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Patient2",
            "predicate": "http://hl7.org/fhir/birthdate",
            "object": {
              "value": "1999-12-31T01:23:45",
              "type": "http://www.w3.org/2001/XMLSchema#dateTime"
            }
          },
          "constraint": {
            "type": "TripleConstraint",
            "predicate": "http://hl7.org/fhir/birthdate",
            "valueExpr": {
              "type": "NodeConstraint",
              "datatype": "http://www.w3.org/2001/XMLSchema#date"
            },
            "min": 0,
            "max": 1
          },
          "errors": [
            "Error validating \"1999-12-31T01:23:45\"^^http://www.w3.org/2001/XMLSchema#dateTime as {\"type\":\"NodeConstraint\",\"datatype\":\"http://www.w3.org/2001/XMLSchema#date\"}: mismatched datatype: http://www.w3.org/2001/XMLSchema#dateTime !== http://www.w3.org/2001/XMLSchema#date"
          ]
        }
      ]
    },
    {
      "type": "MissingProperty",
      "property": "http://hl7.org/fhir/subject",
      "valueExpr": "http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/PatientShape"
    }
  ]
}

describe('shex-util:', function () {

  describe('utility function nestShapes', function () {
    const parser = ShExParser.construct(Base, {}, {index: false})
    Tests.forEach(test => {
      it (`should nest ${test.name}`, function () {
        const orig = parser.parse(test.schema)

        // just get the list of nestables
        const unaltered = JSON.parse(JSON.stringify(orig))
        let notNestedList = ShExUtil.nestShapes(unaltered, {
          no: true,
          rename: true, // shouldn't matter, no preempts rename
          transform: function (id, shapeExpr) {
            throw Error('Should not arrive here')
          },
          noNestPattern: 'SkipMe|AndMe'
        })
        expect(notNestedList).to.deep.equal(test.nestedList)
        expect(unaltered).to.deep.equal(orig)

        // nest them 
        const nested = JSON.parse(JSON.stringify(orig))
        const nestedList = ShExUtil.nestShapes(nested, {
          rename: false,
          transform: function (id, shapeExpr) {
            throw Error('Should not arrive here')
          },
          noNestPattern: 'SkipMe|AndMe'
        })
        const expectedNest = parser.parse(test.nested)
        expect(nested).to.deep.equal(expectedNest)
        expect(nestedList).to.deep.equal(test.nestedList)

        // rename with default function
        const renamed = JSON.parse(JSON.stringify(orig))
        const renamedList = ShExUtil.nestShapes(renamed, {
          rename: true,
          noNestPattern: 'SkipMe|AndMe'
        })
        const expectedRenamed = parser.parse(test.renamed)
        expect(renamed).to.deep.equal(expectedRenamed)
        expect(renamedList).to.deep.equal(test.renamedList)

        // rename them with supplied function
        const transformed = JSON.parse(JSON.stringify(orig))
        const transformedList = ShExUtil.nestShapes(transformed, {
          rename: true,
          transform: function (id, shapeExpr) {
            if (!id.startsWith(Base)) {
              throw Error('transformation target "' + id + '" doesn\'t start  with "' + Base + '"')
            }
            return '_:' + id.substr(Base.length + 1)
          },
          noNestPattern: 'SkipMe|AndMe'
        })
        const expectedTransformed = parser.parse(test.transformed)
        expect(transformed).to.deep.equal(expectedTransformed)
        expect(transformedList).to.deep.equal(test.transformedList)
      })
    })
  })

  describe('utility function getPredicateUsage', function () {
    const parser = ShExParser.construct(Base, {}, {index: false})
    Tests.forEach(test => {
      it (`should nest ${test.name}`, function () {
        const orig = parser.parse(test.schema)
        const unaltered = JSON.parse(JSON.stringify(orig))
        const untyped = {}
        const predicateUsage = ShExUtil.getPredicateUsage(unaltered, untyped)
        expect(predicateUsage).to.deep.equal(test.predicateUsage)
      })
    })
  })

  describe('utility function getProofGraph', function () {
    it (`should parse validation results`, function () {
      const store = new N3.Store()
      ShExUtil.getProofGraph(AppInfo1, store, N3.DataFactory)
      expect(store.size).to.equal(4)
    })
  })
/* -- deprecated
  describe('utility function valToSimple', function () {
    it (`should parse validation results`, function () {
      const simple = ShExUtil.valToSimple(AppInfo1)
      expect(simple).to.deep.equal({
        'http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1': [
          'http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/ObservationShape'
        ]
      })
      expect(ShExUtil.simpleToShapeMap(simple)).to.deep.equal([
        { node: 'http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/Obs1',
          shape: 'http://localhost/checkouts/shexSpec/shex.js/packages/shex-webapp/examples/ObservationShape' }
      ])
    })
  })
*/
  describe('utility function errsToSimple', function () {
    it (`should parse validation failure`, function () {
      const simple = ShExUtil.errsToSimple(Error1)
      expect(simple.join('')).to.include('Error validating "1999-12-31T01:23:45"^^http://www.w3.org/2001/XMLSchema#dateTime')
    })
  })
})
