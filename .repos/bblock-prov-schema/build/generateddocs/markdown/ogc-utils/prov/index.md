
# Provenance Chain (Schema)

`ogc.ogc-utils.prov` *v0.1*

Schema for a provenance chain based on PROV vocabulary semantics, Agents, Activities and Entities. This schema is designed as a mix-in that can be used to add properties to other objects in a polymorphic way.

[*Status*](http://www.opengis.net/def/status): Under development

## Description

## Provenance chain

A JSON schema defining objects that may be referenced or nested as a chain of Activities, Entities or Agents (or subclasses thereof)

This schema implements the PROV vocabulary semantics (through JSON-LD mapping directly to the PROV-O RDF model.)

## Object typing

Object typing needs to be explicit to support effective semantic mapping to the PROV vocabulary, and to support schema validation scope clarity (using the right sub-schema for objects in a collection representing the directed graph model of PROV).

`provType` may be used to map to the subClasses of the Provenance vocabulary.

Custom application object types are explicit (`activityType`, `agentType`, `entityType` to support schema validation clarity).



Note that entityType is optional and may be replaced by `featureType` for compatibility with the OGC Feature implementation (implicitly always an Entity)

likewise the use of the property `type` is not specified to allow compatibility with GeoJSON features that must have this property with a constant value ("Feature" or "FeatureCollection").


## Examples

### Simple relationships
#### json
```json
{
  "id": "Object2",
  "wasDerivedFrom": "Object1"
}





```

#### jsonld
```jsonld
{
  "@context": [
    {
      "iana": "http://www.iana.org/assignments/"
    },
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/context.jsonld"
  ],
  "id": "Object2",
  "wasDerivedFrom": "Object1"
}
```

#### ttl
```ttl
@prefix prov: <http://www.w3.org/ns/prov#> .

<http://www.example.com/exampleEntities/Object2> prov:wasDerivedFrom <http://www.example.com/exampleEntities/Object1> .


```


### Activity
this is a simple activity referencing some relevant document
#### json
```json
{
  "provType": "Activity",
  "id": "someActivity_1",
  "endedAtTime": "2029-01-01T22:05:19+02:00",
  "wasAssociatedWith": "eg_agents:bc-3",
  "used": {
    "provType": "Entity",
    "id": "Act3",
    "wasAttributedTo": "eg_agents:Gov1",
    "links": [
      {
        "href": "https://some.gov/linktoact/",
        "rel": "related"
      }
    ]
  }
}





```

#### jsonld
```jsonld
{
  "@context": [
    {
      "iana": "http://www.iana.org/assignments/"
    },
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/context.jsonld"
  ],
  "provType": "Activity",
  "id": "someActivity_1",
  "endedAtTime": "2029-01-01T22:05:19+02:00",
  "wasAssociatedWith": "eg_agents:bc-3",
  "used": {
    "provType": "Entity",
    "id": "Act3",
    "wasAttributedTo": "eg_agents:Gov1",
    "links": [
      {
        "href": "https://some.gov/linktoact/",
        "rel": "related"
      }
    ]
  }
}
```

#### ttl
```ttl
@prefix iana: <http://www.iana.org/assignments/> .
@prefix oa: <http://www.w3.org/ns/oa#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://www.example.com/exampleActivity/someActivity_1> a prov:Activity ;
    prov:endedAtTime "2029-01-01T22:05:19+02:00"^^xsd:dateTime ;
    prov:used <http://www.example.com/exampleActivity/Act3> ;
    prov:wasAssociatedWith <http://www.example.com/exampleActivity/eg_agents:bc-3> .

<http://www.example.com/exampleActivity/Act3> a prov:Entity ;
    rdfs:seeAlso [ iana:relation <http://www.iana.org/assignments/relation/related> ;
            oa:hasTarget <https://some.gov/linktoact/> ] ;
    prov:wasAttributedTo <http://www.example.com/exampleActivity/eg_agents:Gov1> .


```


### Provenance Chain
DAG defined by an object list.
#### json
```json
{
  "@context": {
    "@base": "https://example.org/aThing/",
    "agents": "https://someagentregister.eg/",
    "thing": "https://example.org/entities/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "survtypes": "https://example.org/surveytypes/",
    "surveyreg": "https://example.org/surveys/",
    "featureType": {
      "@id": "@type",
      "@context": {
        "@base": "http://example.org/myEntities/"
      }
    },
    "activityType": {
      "@id": "@type",
      "@context": {
        "@base": "http://example.org/myActivityTypes/"
      }
    }
  },
  "id": "DP-1",
  "type": "Feature",
  "featureType": "Survey",
  "wasGeneratedBy": [
    "surveyreg:DP-1-S1",
    {
      "activityType": "Registration",
      "id": "surveyreg:DP-1-S2",
      "endedAtTime": "2019-01-01T19:03:15+01:00",
      "wasAssociatedWith": "agents:bc-3",
      "used": {
        "id": "Example-Act",
        "wasAttributedTo": "agents:nz",
        "links": [
          {
            "href": "https://nze.gov/linktoact/Example1",
            "rel": "related"
          }
        ]
      }
    }
  ],
  "has_provenance": [
    {
      "id": "DP-2223",
      "provType": "Entity",
      "featureType": "Survey",
      "wasGeneratedBy": "DP-1-S1"
    },
    {
      "provType": "Activity",
      "id": "surveyreg:DP-1-S1",
      "activityType": "InitialSurvey",
      "endedAtTime": "2023-10-05T05:03:15+01:00",
      "wasAssociatedWith": "agents:ah-2344503",
      "used": {
        "id": "thing:Act3",
        "entityType": "Legislation",
        "wasAttributedTo": "agents:nz",
        "links": [
          {
            "href": "https://some.gov/linktoact/",
            "rel": "related"
          }
        ]
      }
    }
  ]
}




```

#### jsonld
```jsonld
{
  "@context": [
    {
      "iana": "http://www.iana.org/assignments/"
    },
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/context.jsonld",
    {
      "@base": "https://example.org/aThing/",
      "agents": "https://someagentregister.eg/",
      "thing": "https://example.org/entities/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "survtypes": "https://example.org/surveytypes/",
      "surveyreg": "https://example.org/surveys/",
      "featureType": {
        "@id": "@type",
        "@context": {
          "@base": "http://example.org/myEntities/"
        }
      },
      "activityType": {
        "@id": "@type",
        "@context": {
          "@base": "http://example.org/myActivityTypes/"
        }
      }
    }
  ],
  "id": "DP-1",
  "type": "Feature",
  "featureType": "Survey",
  "wasGeneratedBy": [
    "surveyreg:DP-1-S1",
    {
      "activityType": "Registration",
      "id": "surveyreg:DP-1-S2",
      "endedAtTime": "2019-01-01T19:03:15+01:00",
      "wasAssociatedWith": "agents:bc-3",
      "used": {
        "id": "Example-Act",
        "wasAttributedTo": "agents:nz",
        "links": [
          {
            "href": "https://nze.gov/linktoact/Example1",
            "rel": "related"
          }
        ]
      }
    }
  ],
  "has_provenance": [
    {
      "id": "DP-2223",
      "provType": "Entity",
      "featureType": "Survey",
      "wasGeneratedBy": "DP-1-S1"
    },
    {
      "provType": "Activity",
      "id": "surveyreg:DP-1-S1",
      "activityType": "InitialSurvey",
      "endedAtTime": "2023-10-05T05:03:15+01:00",
      "wasAssociatedWith": "agents:ah-2344503",
      "used": {
        "id": "thing:Act3",
        "entityType": "Legislation",
        "wasAttributedTo": "agents:nz",
        "links": [
          {
            "href": "https://some.gov/linktoact/",
            "rel": "related"
          }
        ]
      }
    }
  ]
}
```

#### ttl
```ttl
@prefix agents: <https://someagentregister.eg/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix iana: <http://www.iana.org/assignments/> .
@prefix oa: <http://www.w3.org/ns/oa#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix surveyreg: <https://example.org/surveys/> .
@prefix thing: <https://example.org/entities/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://example.org/aThing/DP-1> a <http://example.org/myEntities/Survey> ;
    dcterms:provenance <https://example.org/aThing/DP-2223>,
        surveyreg:DP-1-S1 ;
    prov:wasGeneratedBy surveyreg:DP-1-S1,
        surveyreg:DP-1-S2 .

<https://example.org/aThing/DP-2223> a <http://example.org/myEntities/Survey>,
        prov:Entity ;
    prov:wasGeneratedBy <https://example.org/aThing/DP-1-S1> .

<https://example.org/aThing/Example-Act> rdfs:seeAlso [ iana:relation <http://www.iana.org/assignments/relation/related> ;
            oa:hasTarget <https://nze.gov/linktoact/Example1> ] ;
    prov:wasAttributedTo agents:nz .

thing:Act3 a <https://example.org/aThing/Legislation> ;
    rdfs:seeAlso [ iana:relation <http://www.iana.org/assignments/relation/related> ;
            oa:hasTarget <https://some.gov/linktoact/> ] ;
    prov:wasAttributedTo agents:nz .

surveyreg:DP-1-S2 a <http://example.org/myActivityTypes/Registration> ;
    prov:endedAtTime "2019-01-01T19:03:15+01:00"^^xsd:dateTime ;
    prov:used <https://example.org/aThing/Example-Act> ;
    prov:wasAssociatedWith agents:bc-3 .

surveyreg:DP-1-S1 a <http://example.org/myActivityTypes/InitialSurvey>,
        prov:Activity ;
    prov:endedAtTime "2023-10-05T05:03:15+01:00"^^xsd:dateTime ;
    prov:used thing:Act3 ;
    prov:wasAssociatedWith agents:ah-2344503 .


```


### Qualified Generation
A [qualified generation](https://www.w3.org/TR/prov-o/#qualifiedGeneration) example.
#### json
```json
{
  "@context": {
    "@base": "https://example.org/aThing/",
    "agents": "https://someagentregister.eg/",
    "thing": "https://example.org/entities/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "survtypes": "https://example.org/surveytypes/",
    "surveyreg": "https://example.org/surveys/",
    "featureType": {
      "@id": "@type",
      "@context": {
        "@base": "http://example.org/myEntities/"
      }
    },
    "activityType": {
      "@id": "@type",
      "@context": {
        "@base": "http://example.org/myActivityTypes/"
      }
    }
  },
  "id": "DP-1",
  "type": "Feature",
  "featureType": "Survey",
  "qualifiedGeneration": [
    {
      "type": "Generation",
      "activity": {
        "id": "uuid:d7e8b17e-2d80-4c42-a797-bc3628f52c44",
        "type": [
          "wfprov:ProcessRun",
          "Activity"
        ],
        "name": "Run of workflow/packed.cwl#main/sorted"
      },
      "atTime": "2018-10-25T15:46:38.058365",
      "hadRole": "wf:main/sorted/output"
    }
  ]
}




```

#### jsonld
```jsonld
{
  "@context": [
    {
      "iana": "http://www.iana.org/assignments/"
    },
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/context.jsonld",
    {
      "@base": "https://example.org/aThing/",
      "agents": "https://someagentregister.eg/",
      "thing": "https://example.org/entities/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "survtypes": "https://example.org/surveytypes/",
      "surveyreg": "https://example.org/surveys/",
      "featureType": {
        "@id": "@type",
        "@context": {
          "@base": "http://example.org/myEntities/"
        }
      },
      "activityType": {
        "@id": "@type",
        "@context": {
          "@base": "http://example.org/myActivityTypes/"
        }
      }
    }
  ],
  "id": "DP-1",
  "type": "Feature",
  "featureType": "Survey",
  "qualifiedGeneration": [
    {
      "type": "Generation",
      "activity": {
        "id": "uuid:d7e8b17e-2d80-4c42-a797-bc3628f52c44",
        "type": [
          "wfprov:ProcessRun",
          "Activity"
        ],
        "name": "Run of workflow/packed.cwl#main/sorted"
      },
      "atTime": "2018-10-25T15:46:38.058365",
      "hadRole": "wf:main/sorted/output"
    }
  ]
}
```

#### ttl
```ttl
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://example.org/aThing/DP-1> a <http://example.org/myEntities/Survey> ;
    prov:qualifiedGeneration [ prov:activity <uuid:d7e8b17e-2d80-4c42-a797-bc3628f52c44> ;
            prov:atTime "2018-10-25T15:46:38.058365"^^xsd:dateTime ;
            prov:hadRole <wf:main/sorted/output> ] .

<uuid:d7e8b17e-2d80-4c42-a797-bc3628f52c44> rdfs:label "Run of workflow/packed.cwl#main/sorted" .


```


### Workflow (using LLM) Example
A provenance chain for a workflow using a Large Language Model to interpret a query and and a geospatial data source.

This is a fairly trivial example not attempting to standardise descriptions of such workflows, which would be an obvious profile for this model.
#### json
```json
{
    "prov:type": "prov:Activity",
    "generated": {
        "id": "output",
        "type": "Entity",
        "AgentType": "SoftwareAgent",
        "response": [
            {
                "id": "LLM Generated Code",
                "type": "Entity",
                "wasGeneratedBy": "gemini-1.5-pro-001",
                "data": "gdf.to_crs(epsg=7856).set_index('name').loc['UNSW Village'].geometry.distance(gdf.to_crs(epsg=7856)[gdf.amenity == 'hospital'].geometry).min()"
            },
            {
                "id": "Code Output",
                "type": "Entity",
                "data": "511.8048618048641"
            },
            {
                "id": "Final Output",
                "type": "Entity",
                "wasGeneratedBy": "gemini-1.5-flash-001",
                "data": "The closest hospital to UNSW Village is approximately 512 meters away."
            }
        ]
    },
    "startedAtTime": "2024-11-19T05:07:22.927913Z",
    "endedAtTime": "2024-11-19T05:07:34.304708Z",
    "used": [
        {
            "id": "file",
            "type": "Entity",
            "data": [
                {
                    "id": "osmdata.shp",
                    "type": "Entity",
                    "records": 3544
                }
            ]
        },
        {
            "id": "user_input",
            "prov:type": "Entity",
            "input": "How far away is the closest hospital from UNSW village"
        }
    ]
}
```

#### jsonld
```jsonld
{
  "@context": [
    {
      "iana": "http://www.iana.org/assignments/"
    },
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/context.jsonld"
  ],
  "prov:type": "prov:Activity",
  "generated": {
    "id": "output",
    "type": "Entity",
    "AgentType": "SoftwareAgent",
    "response": [
      {
        "id": "LLM Generated Code",
        "type": "Entity",
        "wasGeneratedBy": "gemini-1.5-pro-001",
        "data": "gdf.to_crs(epsg=7856).set_index('name').loc['UNSW Village'].geometry.distance(gdf.to_crs(epsg=7856)[gdf.amenity == 'hospital'].geometry).min()"
      },
      {
        "id": "Code Output",
        "type": "Entity",
        "data": "511.8048618048641"
      },
      {
        "id": "Final Output",
        "type": "Entity",
        "wasGeneratedBy": "gemini-1.5-flash-001",
        "data": "The closest hospital to UNSW Village is approximately 512 meters away."
      }
    ]
  },
  "startedAtTime": "2024-11-19T05:07:22.927913Z",
  "endedAtTime": "2024-11-19T05:07:34.304708Z",
  "used": [
    {
      "id": "file",
      "type": "Entity",
      "data": [
        {
          "id": "osmdata.shp",
          "type": "Entity",
          "records": 3544
        }
      ]
    },
    {
      "id": "user_input",
      "prov:type": "Entity",
      "input": "How far away is the closest hospital from UNSW village"
    }
  ]
}
```

#### ttl
```ttl
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://www.example.com/exampleEntity/user_input> prov:type "Entity" .

[] prov:endedAtTime "2024-11-19T05:07:34.304708+00:00"^^xsd:dateTime ;
    prov:generated <http://www.example.com/exampleEntity/output> ;
    prov:startedAtTime "2024-11-19T05:07:22.927913+00:00"^^xsd:dateTime ;
    prov:type "prov:Activity" ;
    prov:used <http://www.example.com/exampleEntity/file>,
        <http://www.example.com/exampleEntity/user_input> .


```

## Schema

```yaml
$schema: https://json-schema.org/draft/2020-12/schema
description: Provenance Chain using PROV-O core model supporting both an ID based
  object graph and nesting
$defs:
  objectref:
    $anchor: objectref
    $ref: https://opengeospatial.github.io/bblocks/annotated-schemas/ogc-utils/iri-or-curie/schema.yaml
  oneOrMoreObjectref:
    $anchor: oneOrMoreObjectref
    $ref: https://opengeospatial.github.io/bblocks/annotated-schemas/ogc-utils/iri-or-curie/schema.yaml#/$defs/MultipleOrObject
  oneOrMoreActivitiesOrRefIds:
    $anchor: oneOrMoreActivitiesOrRefIds
    oneOf:
    - $ref: '#objectref'
    - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Activity
    - type: array
      items:
        anyOf:
        - $ref: '#objectref'
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Activity
  oneOrMoreEntitiesOrRefIds:
    $anchor: oneOrMoreEntitiesOrRefIds
    oneOf:
    - $ref: '#objectref'
    - $ref: '#Entity'
    - type: array
      items:
        anyOf:
        - $ref: '#objectref'
        - $ref: '#Entity'
  oneOrMoreAgentsOrRefIds:
    $anchor: oneOrMoreAgentsOrRefIds
    oneOf:
    - $ref: '#objectref'
    - $ref: '#Agent'
    - type: array
      items:
        anyOf:
        - $ref: '#objectref'
        - $ref: '#Agent'
  externalLink:
    $anchor: externalLink
    $ref: https://opengeospatial.github.io/bblocks/annotated-schemas/ogc-utils/json-link/schema.yaml
  Entity:
    $anchor: Entity
    $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-entity/schema.yaml
  EntityWithRequirements:
    allOf:
    - $ref: '#Entity'
    - anyOf:
      - required:
        - provType
      - required:
        - prov:type
      - required:
        - type
      - required:
        - featureType
      - required:
        - entityType
      - required:
        - wasGeneratedBy
      - required:
        - wasAttributedTo
      - required:
        - wasDerivedFrom
      - required:
        - has_provenance
  Activity:
    $anchor: Activity
    $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-activity/schema.yaml
  ActivityWithRequirements:
    allOf:
    - $ref: '#Activity'
    - anyOf:
      - required:
        - provType
      - required:
        - prov:type
      - required:
        - type
      - required:
        - used
      - required:
        - wasInformedBy
      - required:
        - endedAtTime
      - required:
        - startedAtTime
      - required:
        - wasAssociatedWith
  Agent:
    $anchor: Agent
    $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-agent/schema.yaml
  AgentWithRequirements:
    allOf:
    - $ref: '#Agent'
    - anyOf:
      - required:
        - provType
      - required:
        - type
      - required:
        - agentType
      - required:
        - prov:type
      - required:
        - actedOnBehalfOf
  Association:
    $anchor: Association
    $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-agent/schema.yaml#Association
  Influence:
    $anchor: Influence
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      influencer:
        anyOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreActivitiesOrRefIds
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreAgentsOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#influencer
        x-jsonld-type: '@id'
      entity:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#entity
        x-jsonld-type: '@id'
      activity:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreActivitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#activity
        x-jsonld-type: '@id'
      agent:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreAgentsOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#agent
        x-jsonld-type: '@id'
    anyOf:
    - required:
      - influencer
    - required:
      - entity
    - required:
      - activity
    - required:
      - agent
  influenced:
    $anchor: influenced
    type: object
    properties:
      wasInfluencedBy:
        anyOf:
        - $ref: '#oneOrMoreActivitiesOrRefIds'
        - $ref: '#oneOrMoreEntitiesOrRefIds'
        - $ref: '#oneOrMoreAgentsOrRefIds'
        x-jsonld-id: http://www.w3.org/ns/prov#wasInfluencedBy
        x-jsonld-type: '@id'
      qualifiedInfluence:
        oneOf:
        - $ref: '#objectref'
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Influence
        - type: array
          items:
            oneOf:
            - $ref: '#objectref'
            - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Influence
        x-jsonld-id: http://www.w3.org/ns/prov#qualifiedInfluence
        x-jsonld-type: '@id'
  Prov:
    $anchor: Prov
    description: An list of provenance objects linked together to form a provenance
      chain for the current object. Objects may have nested objects as well, with
      or without referencable ids
    type: array
    items:
      oneOf:
      - $ref: '#/$defs/EntityWithRequirements'
      - $ref: '#/$defs/AgentWithRequirements'
      - $ref: '#/$defs/ActivityWithRequirements'
anyOf:
- $ref: '#Prov'
- $ref: '#/$defs/EntityWithRequirements'
- $ref: '#/$defs/ActivityWithRequirements'
x-jsonld-extra-terms:
  activityType: '@type'
  agentType: '@type'
  entityType: '@type'
  featureType: '@type'
  provType: '@type'
  Activity: http://www.w3.org/ns/prov#Activity
  ActivityInfluence: http://www.w3.org/ns/prov#ActivityInfluence
  Agent: http://www.w3.org/ns/prov#Agent
  AgentInfluence: http://www.w3.org/ns/prov#AgentInfluence
  Association: http://www.w3.org/ns/prov#Association
  Attribution: http://www.w3.org/ns/prov#Attribution
  Bundle: http://www.w3.org/ns/prov#Bundle
  Collection: http://www.w3.org/ns/prov#Collection
  Communication: http://www.w3.org/ns/prov#Communication
  Delegation: http://www.w3.org/ns/prov#Delegation
  Derivation: http://www.w3.org/ns/prov#Derivation
  EmptyCollection: http://www.w3.org/ns/prov#EmptyCollection
  End: http://www.w3.org/ns/prov#End
  Entity: http://www.w3.org/ns/prov#Entity
  EntityInfluence: http://www.w3.org/ns/prov#EntityInfluence
  Generation: http://www.w3.org/ns/prov#Generation
  Influence: http://www.w3.org/ns/prov#Influence
  InstantaneousEvent: http://www.w3.org/ns/prov#InstantaneousEvent
  Invalidation: http://www.w3.org/ns/prov#Invalidation
  Location: http://www.w3.org/ns/prov#Location
  Organization: http://www.w3.org/ns/prov#Organization
  Person: http://www.w3.org/ns/prov#Person
  Plan: http://www.w3.org/ns/prov#Plan
  PrimarySource: http://www.w3.org/ns/prov#PrimarySource
  Quotation: http://www.w3.org/ns/prov#Quotation
  Revision: http://www.w3.org/ns/prov#Revision
  Role: http://www.w3.org/ns/prov#Role
  SoftwareAgent: http://www.w3.org/ns/prov#SoftwareAgent
  Start: http://www.w3.org/ns/prov#Start
  Usage: http://www.w3.org/ns/prov#Usage
  ServiceDescription: http://www.w3.org/ns/prov#ServiceDescription
  DirectQueryService: http://www.w3.org/ns/prov#DirectQueryService
  Accept: http://www.w3.org/ns/prov#Accept
  Contribute: http://www.w3.org/ns/prov#Contribute
  Contributor: http://www.w3.org/ns/prov#Contributor
  Copyright: http://www.w3.org/ns/prov#Copyright
  Create: http://www.w3.org/ns/prov#Create
  Creator: http://www.w3.org/ns/prov#Creator
  Modify: http://www.w3.org/ns/prov#Modify
  Publish: http://www.w3.org/ns/prov#Publish
  Publisher: http://www.w3.org/ns/prov#Publisher
  Replace: http://www.w3.org/ns/prov#Replace
  RightsAssignment: http://www.w3.org/ns/prov#RightsAssignment
  RightsHolder: http://www.w3.org/ns/prov#RightsHolder
  Submit: http://www.w3.org/ns/prov#Submit
  Dictionary: http://www.w3.org/ns/prov#Dictionary
  EmptyDictionary: http://www.w3.org/ns/prov#EmptyDictionary
  KeyEntityPair: http://www.w3.org/ns/prov#KeyEntityPair
  Insertion: http://www.w3.org/ns/prov#Insertion
  Removal: http://www.w3.org/ns/prov#Removal
  atTime:
    x-jsonld-id: http://www.w3.org/ns/prov#atTime
    x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
  endedAtTime:
    x-jsonld-id: http://www.w3.org/ns/prov#endedAtTime
    x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
  generatedAtTime:
    x-jsonld-id: http://www.w3.org/ns/prov#generatedAtTime
    x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
  invalidatedAtTime:
    x-jsonld-id: http://www.w3.org/ns/prov#invalidatedAtTime
    x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
  startedAtTime:
    x-jsonld-id: http://www.w3.org/ns/prov#startedAtTime
    x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
  value: http://www.w3.org/ns/prov#value
  provenanceUriTemplate: http://www.w3.org/ns/prov#provenanceUriTemplate
  pairKey:
    x-jsonld-id: http://www.w3.org/ns/prov#pairKey
    x-jsonld-type: http://www.w3.org/2000/01/rdf-schema#Literal
  removedKey:
    x-jsonld-id: http://www.w3.org/ns/prov#removedKey
    x-jsonld-type: http://www.w3.org/2000/01/rdf-schema#Literal
  actedOnBehalfOf:
    x-jsonld-id: http://www.w3.org/ns/prov#actedOnBehalfOf
    x-jsonld-type: '@id'
  agent:
    x-jsonld-id: http://www.w3.org/ns/prov#agent
    x-jsonld-type: '@id'
  alternateOf:
    x-jsonld-id: http://www.w3.org/ns/prov#alternateOf
    x-jsonld-type: '@id'
  atLocation:
    x-jsonld-id: http://www.w3.org/ns/prov#atLocation
    x-jsonld-type: '@id'
  entity:
    x-jsonld-id: http://www.w3.org/ns/prov#entity
    x-jsonld-type: '@id'
  generated:
    x-jsonld-id: http://www.w3.org/ns/prov#generated
    x-jsonld-type: '@id'
  hadActivity:
    x-jsonld-id: http://www.w3.org/ns/prov#hadActivity
    x-jsonld-type: '@id'
  activity:
    x-jsonld-id: http://www.w3.org/ns/prov#activity
    x-jsonld-type: '@id'
  hadGeneration:
    x-jsonld-id: http://www.w3.org/ns/prov#hadGeneration
    x-jsonld-type: '@id'
  hadMember:
    x-jsonld-id: http://www.w3.org/ns/prov#hadMember
    x-jsonld-type: '@id'
  hadPlan:
    x-jsonld-id: http://www.w3.org/ns/prov#hadPlan
    x-jsonld-type: '@id'
  hadPrimarySource:
    x-jsonld-id: http://www.w3.org/ns/prov#hadPrimarySource
    x-jsonld-type: '@id'
  hadRole:
    x-jsonld-id: http://www.w3.org/ns/prov#hadRole
    x-jsonld-type: '@id'
  hadUsage:
    x-jsonld-id: http://www.w3.org/ns/prov#hadUsage
    x-jsonld-type: '@id'
  influenced:
    x-jsonld-id: http://www.w3.org/ns/prov#influenced
    x-jsonld-type: '@id'
  influencer:
    x-jsonld-id: http://www.w3.org/ns/prov#influencer
    x-jsonld-type: '@id'
  invalidated:
    x-jsonld-id: http://www.w3.org/ns/prov#invalidated
    x-jsonld-type: '@id'
  qualifiedAssociation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedAssociation
    x-jsonld-type: '@id'
  qualifiedAttribution:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedAttribution
    x-jsonld-type: '@id'
  qualifiedCommunication:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedCommunication
    x-jsonld-type: '@id'
  qualifiedDelegation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedDelegation
    x-jsonld-type: '@id'
  qualifiedDerivation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedDerivation
    x-jsonld-type: '@id'
  qualifiedEnd:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedEnd
    x-jsonld-type: '@id'
  qualifiedGeneration:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedGeneration
    x-jsonld-type: '@id'
  qualifiedInfluence:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedInfluence
    x-jsonld-type: '@id'
  qualifiedInvalidation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedInvalidation
    x-jsonld-type: '@id'
  qualifiedPrimarySource:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedPrimarySource
    x-jsonld-type: '@id'
  qualifiedQuotation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedQuotation
    x-jsonld-type: '@id'
  qualifiedRevision:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedRevision
    x-jsonld-type: '@id'
  qualifiedStart:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedStart
    x-jsonld-type: '@id'
  qualifiedUsage:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedUsage
    x-jsonld-type: '@id'
  specializationOf:
    x-jsonld-id: http://www.w3.org/ns/prov#specializationOf
    x-jsonld-type: '@id'
  used:
    x-jsonld-id: http://www.w3.org/ns/prov#used
    x-jsonld-type: '@id'
  wasAssociatedWith:
    x-jsonld-id: http://www.w3.org/ns/prov#wasAssociatedWith
    x-jsonld-type: '@id'
  wasAttributedTo:
    x-jsonld-id: http://www.w3.org/ns/prov#wasAttributedTo
    x-jsonld-type: '@id'
  wasDerivedFrom:
    x-jsonld-id: http://www.w3.org/ns/prov#wasDerivedFrom
    x-jsonld-type: '@id'
  wasEndedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasEndedBy
    x-jsonld-type: '@id'
  wasGeneratedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasGeneratedBy
    x-jsonld-type: '@id'
  wasInfluencedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasInfluencedBy
    x-jsonld-type: '@id'
  wasInformedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasInformedBy
    x-jsonld-type: '@id'
  wasInvalidatedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasInvalidatedBy
    x-jsonld-type: '@id'
  wasQuotedFrom:
    x-jsonld-id: http://www.w3.org/ns/prov#wasQuotedFrom
    x-jsonld-type: '@id'
  wasRevisionOf:
    x-jsonld-id: http://www.w3.org/ns/prov#wasRevisionOf
    x-jsonld-type: '@id'
  wasStartedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasStartedBy
    x-jsonld-type: '@id'
  has_anchor:
    x-jsonld-id: http://www.w3.org/ns/prov#has_anchor
    x-jsonld-type: '@id'
  has_provenance:
    x-jsonld-id: http://purl.org/dc/terms/provenance
    x-jsonld-type: '@id'
  has_query_service:
    x-jsonld-id: http://www.w3.org/ns/prov#has_query_service
    x-jsonld-type: '@id'
  describesService:
    x-jsonld-id: http://www.w3.org/ns/prov#describesService
    x-jsonld-type: '@id'
  pingback:
    x-jsonld-id: http://www.w3.org/ns/prov#pingback
    x-jsonld-type: '@id'
  dictionary:
    x-jsonld-id: http://www.w3.org/ns/prov#dictionary
    x-jsonld-type: '@id'
  derivedByInsertionFrom:
    x-jsonld-id: http://www.w3.org/ns/prov#derivedByInsertionFrom
    x-jsonld-type: '@id'
  derivedByRemovalFrom:
    x-jsonld-id: http://www.w3.org/ns/prov#derivedByRemovalFrom
    x-jsonld-type: '@id'
  insertedKeyEntityPair:
    x-jsonld-id: http://www.w3.org/ns/prov#insertedKeyEntityPair
    x-jsonld-type: '@id'
  hadDictionaryMember:
    x-jsonld-id: http://www.w3.org/ns/prov#hadDictionaryMember
    x-jsonld-type: '@id'
  pairEntity:
    x-jsonld-id: http://www.w3.org/ns/prov#pairEntity
    x-jsonld-type: '@id'
  qualifiedInsertion:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedInsertion
    x-jsonld-type: '@id'
  qualifiedRemoval:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedRemoval
    x-jsonld-type: '@id'
  asInBundle:
    x-jsonld-id: http://www.w3.org/ns/prov#asInBundle
    x-jsonld-type: '@id'
  mentionOf:
    x-jsonld-id: http://www.w3.org/ns/prov#mentionOf
    x-jsonld-type: '@id'
  id: '@id'
  name: http://www.w3.org/2000/01/rdf-schema#label
  links: http://www.w3.org/2000/01/rdf-schema#seeAlso
x-jsonld-prefixes:
  prov: http://www.w3.org/ns/prov#
  xsd: http://www.w3.org/2001/XMLSchema#
  rdfs: http://www.w3.org/2000/01/rdf-schema#
  dct: http://purl.org/dc/terms/
  rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#

```

Links to the schema:

* YAML version: [schema.yaml](https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.json)
* JSON version: [schema.json](https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml)


# JSON-LD Context

```jsonld
{
  "@context": {
    "wasInfluencedBy": {
      "@id": "prov:wasInfluencedBy",
      "@type": "@id"
    },
    "qualifiedInfluence": {
      "@id": "prov:qualifiedInfluence",
      "@type": "@id"
    },
    "hadMember": {
      "@id": "prov:hadMember",
      "@type": "@id"
    },
    "id": "@id",
    "provType": "@type",
    "featureType": "@type",
    "entityType": "@type",
    "has_provenance": {
      "@id": "dct:provenance",
      "@type": "@id"
    },
    "wasGeneratedBy": {
      "@id": "prov:wasGeneratedBy",
      "@type": "@id"
    },
    "wasAttributedTo": {
      "@id": "prov:wasAttributedTo",
      "@type": "@id"
    },
    "wasDerivedFrom": {
      "@id": "prov:wasDerivedFrom",
      "@type": "@id"
    },
    "alternateOf": {
      "@id": "prov:alternateOf",
      "@type": "@id"
    },
    "hadPrimarySource": {
      "@id": "prov:hadPrimarySource",
      "@type": "@id"
    },
    "specializationOf": {
      "@id": "prov:specializationOf",
      "@type": "@id"
    },
    "wasInvalidatedBy": {
      "@id": "prov:wasInvalidatedBy",
      "@type": "@id"
    },
    "wasQuotedFrom": {
      "@id": "prov:wasQuotedFrom",
      "@type": "@id"
    },
    "wasRevisionOf": {
      "@id": "prov:wasRevisionOf",
      "@type": "@id"
    },
    "atLocation": {
      "@id": "prov:atLocation",
      "@type": "@id"
    },
    "links": {
      "@context": {
        "href": {
          "@type": "@id",
          "@id": "oa:hasTarget"
        },
        "rel": {
          "@context": {
            "@base": "http://www.iana.org/assignments/relation/"
          },
          "@id": "http://www.iana.org/assignments/relation",
          "@type": "@id"
        },
        "type": "dct:type",
        "hreflang": "dct:language",
        "title": "rdfs:label",
        "length": "dct:extent"
      },
      "@id": "rdfs:seeAlso"
    },
    "qualifiedGeneration": {
      "@id": "prov:qualifiedGeneration",
      "@type": "@id"
    },
    "qualifiedInvalidation": {
      "@id": "prov:qualifiedInvalidation",
      "@type": "@id"
    },
    "qualifiedDerivation": {
      "@id": "prov:qualifiedDerivation",
      "@type": "@id"
    },
    "qualifiedAttribution": {
      "@id": "prov:qualifiedAttribution",
      "@type": "@id"
    },
    "activityType": "@type",
    "agentType": "@type",
    "Activity": "prov:Activity",
    "ActivityInfluence": "prov:ActivityInfluence",
    "Agent": "prov:Agent",
    "AgentInfluence": "prov:AgentInfluence",
    "Association": "prov:Association",
    "Attribution": "prov:Attribution",
    "Bundle": "prov:Bundle",
    "Collection": "prov:Collection",
    "Communication": "prov:Communication",
    "Delegation": "prov:Delegation",
    "Derivation": "prov:Derivation",
    "EmptyCollection": "prov:EmptyCollection",
    "End": "prov:End",
    "Entity": "prov:Entity",
    "EntityInfluence": "prov:EntityInfluence",
    "Generation": "prov:Generation",
    "Influence": "prov:Influence",
    "InstantaneousEvent": "prov:InstantaneousEvent",
    "Invalidation": "prov:Invalidation",
    "Location": "prov:Location",
    "Organization": "prov:Organization",
    "Person": "prov:Person",
    "Plan": "prov:Plan",
    "PrimarySource": "prov:PrimarySource",
    "Quotation": "prov:Quotation",
    "Revision": "prov:Revision",
    "Role": "prov:Role",
    "SoftwareAgent": "prov:SoftwareAgent",
    "Start": "prov:Start",
    "Usage": "prov:Usage",
    "ServiceDescription": "prov:ServiceDescription",
    "DirectQueryService": "prov:DirectQueryService",
    "Accept": "prov:Accept",
    "Contribute": "prov:Contribute",
    "Contributor": "prov:Contributor",
    "Copyright": "prov:Copyright",
    "Create": "prov:Create",
    "Creator": "prov:Creator",
    "Modify": "prov:Modify",
    "Publish": "prov:Publish",
    "Publisher": "prov:Publisher",
    "Replace": "prov:Replace",
    "RightsAssignment": "prov:RightsAssignment",
    "RightsHolder": "prov:RightsHolder",
    "Submit": "prov:Submit",
    "Dictionary": "prov:Dictionary",
    "EmptyDictionary": "prov:EmptyDictionary",
    "KeyEntityPair": "prov:KeyEntityPair",
    "Insertion": "prov:Insertion",
    "Removal": "prov:Removal",
    "atTime": {
      "@id": "prov:atTime",
      "@type": "xsd:dateTime"
    },
    "endedAtTime": {
      "@id": "prov:endedAtTime",
      "@type": "xsd:dateTime"
    },
    "generatedAtTime": {
      "@id": "prov:generatedAtTime",
      "@type": "xsd:dateTime"
    },
    "invalidatedAtTime": {
      "@id": "prov:invalidatedAtTime",
      "@type": "xsd:dateTime"
    },
    "startedAtTime": {
      "@id": "prov:startedAtTime",
      "@type": "xsd:dateTime"
    },
    "value": "prov:value",
    "provenanceUriTemplate": "prov:provenanceUriTemplate",
    "pairKey": {
      "@id": "prov:pairKey",
      "@type": "rdfs:Literal"
    },
    "removedKey": {
      "@id": "prov:removedKey",
      "@type": "rdfs:Literal"
    },
    "actedOnBehalfOf": {
      "@id": "prov:actedOnBehalfOf",
      "@type": "@id"
    },
    "agent": {
      "@id": "prov:agent",
      "@type": "@id"
    },
    "entity": {
      "@id": "prov:entity",
      "@type": "@id"
    },
    "generated": {
      "@id": "prov:generated",
      "@type": "@id"
    },
    "hadActivity": {
      "@id": "prov:hadActivity",
      "@type": "@id"
    },
    "activity": {
      "@id": "prov:activity",
      "@type": "@id"
    },
    "hadGeneration": {
      "@id": "prov:hadGeneration",
      "@type": "@id"
    },
    "hadPlan": {
      "@id": "prov:hadPlan",
      "@type": "@id"
    },
    "hadRole": {
      "@id": "prov:hadRole",
      "@type": "@id"
    },
    "hadUsage": {
      "@id": "prov:hadUsage",
      "@type": "@id"
    },
    "influenced": {
      "@id": "prov:influenced",
      "@type": "@id"
    },
    "influencer": {
      "@id": "prov:influencer",
      "@type": "@id"
    },
    "invalidated": {
      "@id": "prov:invalidated",
      "@type": "@id"
    },
    "qualifiedAssociation": {
      "@id": "prov:qualifiedAssociation",
      "@type": "@id"
    },
    "qualifiedCommunication": {
      "@id": "prov:qualifiedCommunication",
      "@type": "@id"
    },
    "qualifiedDelegation": {
      "@id": "prov:qualifiedDelegation",
      "@type": "@id"
    },
    "qualifiedEnd": {
      "@id": "prov:qualifiedEnd",
      "@type": "@id"
    },
    "qualifiedPrimarySource": {
      "@id": "prov:qualifiedPrimarySource",
      "@type": "@id"
    },
    "qualifiedQuotation": {
      "@id": "prov:qualifiedQuotation",
      "@type": "@id"
    },
    "qualifiedRevision": {
      "@id": "prov:qualifiedRevision",
      "@type": "@id"
    },
    "qualifiedStart": {
      "@id": "prov:qualifiedStart",
      "@type": "@id"
    },
    "qualifiedUsage": {
      "@id": "prov:qualifiedUsage",
      "@type": "@id"
    },
    "used": {
      "@id": "prov:used",
      "@type": "@id"
    },
    "wasAssociatedWith": {
      "@id": "prov:wasAssociatedWith",
      "@type": "@id"
    },
    "wasEndedBy": {
      "@id": "prov:wasEndedBy",
      "@type": "@id"
    },
    "wasInformedBy": {
      "@id": "prov:wasInformedBy",
      "@type": "@id"
    },
    "wasStartedBy": {
      "@id": "prov:wasStartedBy",
      "@type": "@id"
    },
    "has_anchor": {
      "@id": "prov:has_anchor",
      "@type": "@id"
    },
    "has_query_service": {
      "@id": "prov:has_query_service",
      "@type": "@id"
    },
    "describesService": {
      "@id": "prov:describesService",
      "@type": "@id"
    },
    "pingback": {
      "@id": "prov:pingback",
      "@type": "@id"
    },
    "dictionary": {
      "@id": "prov:dictionary",
      "@type": "@id"
    },
    "derivedByInsertionFrom": {
      "@id": "prov:derivedByInsertionFrom",
      "@type": "@id"
    },
    "derivedByRemovalFrom": {
      "@id": "prov:derivedByRemovalFrom",
      "@type": "@id"
    },
    "insertedKeyEntityPair": {
      "@id": "prov:insertedKeyEntityPair",
      "@type": "@id"
    },
    "hadDictionaryMember": {
      "@id": "prov:hadDictionaryMember",
      "@type": "@id"
    },
    "pairEntity": {
      "@id": "prov:pairEntity",
      "@type": "@id"
    },
    "qualifiedInsertion": {
      "@id": "prov:qualifiedInsertion",
      "@type": "@id"
    },
    "qualifiedRemoval": {
      "@id": "prov:qualifiedRemoval",
      "@type": "@id"
    },
    "asInBundle": {
      "@id": "prov:asInBundle",
      "@type": "@id"
    },
    "mentionOf": {
      "@id": "prov:mentionOf",
      "@type": "@id"
    },
    "name": "rdfs:label",
    "prov": "http://www.w3.org/ns/prov#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "dct": "http://purl.org/dc/terms/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "oa": "http://www.w3.org/ns/oa#",
    "@version": 1.1
  }
}
```

You can find the full JSON-LD context here:
[context.jsonld](https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/context.jsonld)

## Sources

* [The PROV-O vocabulary](https://www.w3.org/TR/prov-o/)

# For developers

The source code for this Building Block can be found in the following repository:

* URL: [https://github.com/ogcincubator/bblock-prov-schema](https://github.com/ogcincubator/bblock-prov-schema)
* Path: `_sources/prov`

