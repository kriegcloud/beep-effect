const ShExRSchema = {
  "type": "Schema",
  "start": "http://www.w3.org/ns/shex#Schema",
  "shapes": [
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#Schema",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#Schema" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#imports", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#IriList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#startActs", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#SemActList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#start", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExpr" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#shapes", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#ShapeDeclList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#shapeDeclOrExpr",
      "shapeExpr": {
        "type": "ShapeOr",
        "shapeExprs": [
          "http://www.w3.org/ns/shex#ShapeDecl",
          "http://www.w3.org/ns/shex#shapeExpr"
        ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#ShapeDecl",
      "shapeExpr": {
        "type": "Shape", "closed": true,
        "expression": {
          "type": "EachOf",
          "expressions": [
            { "type": "TripleConstraint",
              "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#ShapeDecl" ] }
            },
            { "type": "TripleConstraint",
              "predicate": "http://www.w3.org/ns/shex#abstract", "min": 0, "max": 1,
              "valueExpr": {
                "type": "NodeConstraint",
                "values": [
                  { "value": "true", "type": "http://www.w3.org/2001/XMLSchema#boolean" },
                  { "value": "false", "type": "http://www.w3.org/2001/XMLSchema#boolean" }
                ] } },
            { "type": "TripleConstraint",
              "predicate": "http://www.w3.org/ns/shex#shapeExpr",
              "valueExpr": "http://www.w3.org/ns/shex#shapeExpr" }
          ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#shapeExpr",
      "shapeExpr": { "type": "ShapeOr",
      "shapeExprs": [
        "http://www.w3.org/ns/shex#ShapeOr",
        "http://www.w3.org/ns/shex#ShapeAnd",
        "http://www.w3.org/ns/shex#ShapeNot",
        "http://www.w3.org/ns/shex#NodeConstraint",
        "http://www.w3.org/ns/shex#Shape",
        "http://www.w3.org/ns/shex#ShapeExternal"
      ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#ShapeOr",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#ShapeOr" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#shapeExprs",
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExprList2Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#ShapeAnd",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#ShapeAnd" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#shapeExprs",
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExprList2Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#ShapeNot",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#ShapeNot" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#shapeExpr",
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExpr" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#NodeConstraint",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#NodeConstraint" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#nodeKind", "min": 0, "max": 1,
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                "http://www.w3.org/ns/shex#iri",
                "http://www.w3.org/ns/shex#bnode",
                "http://www.w3.org/ns/shex#literal",
                "http://www.w3.org/ns/shex#nonliteral"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#datatype", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "nodeKind": "iri" } },
          "http://www.w3.org/ns/shex#xsFacets",
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#values", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#valueSetValueList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#semActs", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#SemActList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#annotation", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#AnnotationList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#Shape",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#Shape" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#extends", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExprList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#closed", "min": 0, "max": 1,
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                { "value": "true", "type": "http://www.w3.org/2001/XMLSchema#boolean" },
                { "value": "false", "type": "http://www.w3.org/2001/XMLSchema#boolean" }
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#extra", "min": 0, "max": -1,
            "valueExpr": { "type": "NodeConstraint", "nodeKind": "iri" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#expression", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#tripleExpression" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#semActs", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#SemActList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#annotation", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#AnnotationList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#ShapeExternal",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "TripleConstraint",
        "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#ShapeExternal" ] } } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#SemAct",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#SemAct" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#name",
            "valueExpr": { "type": "NodeConstraint", "nodeKind": "iri" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#code", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#Annotation",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#Annotation" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#predicate",
            "valueExpr": { "type": "NodeConstraint", "nodeKind": "iri" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#object",
            "valueExpr": "http://www.w3.org/ns/shex#objectValue"
          } ]
      } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#facet_holder",
      "shapeExpr": { "type": "Shape",
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "OneOf", "id": "http://www.w3.org/ns/shex#xsFacets", "min": 0, "max": -1,
            "expressions": [
              "http://www.w3.org/ns/shex#stringFacet",
              "http://www.w3.org/ns/shex#numericFacet"
            ] },
          { "type": "OneOf", "id": "http://www.w3.org/ns/shex#stringFacet",
            "expressions": [
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#length",
                "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#minlength",
                "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#maxlength",
                "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
              { "type": "EachOf",
                "expressions": [
                  { "type": "TripleConstraint",
                    "predicate": "http://www.w3.org/ns/shex#pattern",
                    "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } },
                  { "type": "TripleConstraint",
                    "predicate": "http://www.w3.org/ns/shex#flags", "min": 0, "max": 1,
                    "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } }
                ] }
            ] },
          { "type": "OneOf", "id": "http://www.w3.org/ns/shex#numericFacet",
            "expressions": [
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#mininclusive",
                "valueExpr": "http://www.w3.org/ns/shex#numericLiteral" },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#minexclusive",
                "valueExpr": "http://www.w3.org/ns/shex#numericLiteral" },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#maxinclusive",
                "valueExpr": "http://www.w3.org/ns/shex#numericLiteral" },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#maxexclusive",
                "valueExpr": "http://www.w3.org/ns/shex#numericLiteral" },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#totaldigits",
                "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
              { "type": "TripleConstraint",
                "predicate": "http://www.w3.org/ns/shex#fractiondigits",
                "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } }
            ] }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#numericLiteral",
      "shapeExpr": { "type": "ShapeOr",
      "shapeExprs": [
        { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" },
        { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#decimal" },
        { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#double" }
      ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#valueSetValue",
      "shapeExpr": { "type": "ShapeOr",
      "shapeExprs": [
        "http://www.w3.org/ns/shex#objectValue",
        "http://www.w3.org/ns/shex#IriStem",
        "http://www.w3.org/ns/shex#IriStemRange",
        "http://www.w3.org/ns/shex#LiteralStem",
        "http://www.w3.org/ns/shex#LiteralStemRange",
        "http://www.w3.org/ns/shex#Language",
        "http://www.w3.org/ns/shex#LanguageStem",
        "http://www.w3.org/ns/shex#LanguageStemRange"
      ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#objectValue",
      "shapeExpr": { "type": "ShapeOr",
      "shapeExprs": [
        { "type": "NodeConstraint", "nodeKind": "iri" },
        { "type": "NodeConstraint", "nodeKind": "literal" }
      ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#IriStem",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#IriStem" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#stem",
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#IriStemRange",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#IriStemRange" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#stem",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" },
                "http://www.w3.org/ns/shex#Wildcard"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#exclusion",
            "valueExpr": "http://www.w3.org/ns/shex#IriStemExclusionList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#LiteralStem",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#LiteralStem" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#stem",
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#LiteralStemRange",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#LiteralStemRange" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#stem",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" },
                "http://www.w3.org/ns/shex#Wildcard"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#exclusion",
            "valueExpr": "http://www.w3.org/ns/shex#LiteralStemExclusionList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#Language",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#Language" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#languageTag",
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#LanguageStem",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#LanguageStem" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#stem",
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#LanguageStemRange",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#LanguageStemRange" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#stem",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" },
                "http://www.w3.org/ns/shex#Wildcard"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#exclusion",
            "valueExpr": "http://www.w3.org/ns/shex#LanguageStemExclusionList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#Wildcard",
      "shapeExpr": { "type": "ShapeAnd",
      "shapeExprs": [
        { "type": "NodeConstraint", "nodeKind": "bnode" },
        { "type": "Shape", "closed": true,
          "expression": {
            "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#Wildcard" ] } } }
      ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#tripleExpression",
      "shapeExpr": { "type": "ShapeOr",
      "shapeExprs": [
        "http://www.w3.org/ns/shex#NotYetResolvedInclusion",
        "http://www.w3.org/ns/shex#TripleConstraint",
        "http://www.w3.org/ns/shex#OneOf",
        "http://www.w3.org/ns/shex#EachOf"
      ] } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#NotYetResolvedInclusion",
      "shapeExpr": { "type": "Shape", "closed": true } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#OneOf",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#OneOf" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#min", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#max", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#expressions",
            "valueExpr": "http://www.w3.org/ns/shex#tripleExpressionList2Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#semActs", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#SemActList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#annotation", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#AnnotationList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#EachOf",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#EachOf" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#min", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#max", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#expressions",
            "valueExpr": "http://www.w3.org/ns/shex#tripleExpressionList2Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#semActs", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#SemActList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#annotation", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#AnnotationList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#TripleConstraint",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            "valueExpr": { "type": "NodeConstraint", "values": [ "http://www.w3.org/ns/shex#TripleConstraint" ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#inverse", "min": 0, "max": 1,
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                { "value": "true", "type": "http://www.w3.org/2001/XMLSchema#boolean" },
                { "value": "false", "type": "http://www.w3.org/2001/XMLSchema#boolean" }
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#negated", "min": 0, "max": 1,
            "valueExpr": {
              "type": "NodeConstraint",
              "values": [
                { "value": "true", "type": "http://www.w3.org/2001/XMLSchema#boolean" },
                { "value": "false", "type": "http://www.w3.org/2001/XMLSchema#boolean" }
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#min", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#max", "min": 0, "max": 1,
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#predicate",
            "valueExpr": { "type": "NodeConstraint", "nodeKind": "iri" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#valueExpr", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExpr" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#semActs", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#SemActList1Plus" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/ns/shex#annotation", "min": 0, "max": 1,
            "valueExpr": "http://www.w3.org/ns/shex#AnnotationList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#tripleExpressionList2Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#tripleExpression" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": "http://www.w3.org/ns/shex#tripleExpressionList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#tripleExpressionList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#tripleExpression" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#tripleExpressionList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#IriList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": { "type": "NodeConstraint", "nodeKind": "iri" } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#IriList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#SemActList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#SemAct" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#SemActList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#ShapeDeclList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
        "expression": {
          "type": "EachOf",
          "expressions": [
            { "type": "TripleConstraint",
              "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
              "valueExpr": "http://www.w3.org/ns/shex#ShapeDecl" },
            { "type": "TripleConstraint",
              "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
              "valueExpr": {
                "type": "ShapeOr",
                "shapeExprs": [
                  { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                  "http://www.w3.org/ns/shex#ShapeDeclList1Plus"
                ] } }
          ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#shapeDeclOrExprList2Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExpr" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExprList1Plus" }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#shapeDeclOrExprList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#shapeDeclOrExpr" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#shapeDeclOrExprList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#valueSetValueList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#valueSetValue" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#valueSetValueList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#AnnotationList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": "http://www.w3.org/ns/shex#Annotation" },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#AnnotationList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#IriStemExclusionList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "nodeKind": "iri" },
                "http://www.w3.org/ns/shex#IriStem"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#IriStemExclusionList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#LiteralStemExclusionList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" },
                "http://www.w3.org/ns/shex#LiteralStem"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#LiteralStemExclusionList1Plus"
              ] } }
        ] } } },
    { "type": "ShapeDecl", "id": "http://www.w3.org/ns/shex#LanguageStemExclusionList1Plus",
      "shapeExpr": {
      "type": "Shape", "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" },
                "http://www.w3.org/ns/shex#LanguageStem"
              ] } },
          { "type": "TripleConstraint",
            "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
            "valueExpr": {
              "type": "ShapeOr",
              "shapeExprs": [
                { "type": "NodeConstraint", "values": [ "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" ] },
                "http://www.w3.org/ns/shex#LanguageStemExclusionList1Plus"
              ] } }
        ] } } }
  ],
  "@context": "http://www.w3.org/ns/shex.jsonld"
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExRSchema;

