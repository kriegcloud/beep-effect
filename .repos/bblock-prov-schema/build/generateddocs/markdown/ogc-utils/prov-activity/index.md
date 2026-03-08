
# Prov Activity (Schema)

`ogc.ogc-utils.prov-activity` *v0.1*

Sub-schema for PROV Entities

[*Status*](http://www.opengis.net/def/status): Under development

## Description

## Activity Object sub-schema

Defines Activities and core subtypes.
## Examples

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
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-activity/context.jsonld"
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
    "https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-activity/context.jsonld"
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
description: PROV Activity object schema
$defs:
  dateTime:
    type: string
    format: date-time
    pattern: ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$
  ActivityTypes:
    oneOf:
    - type: string
      enum:
      - Activity
      - prov:Activity
    - type: array
      contains:
        type: string
        enum:
        - Activity
        - prov:Activity
      items:
        type: string
  Activity:
    $anchor: Activity
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      provType:
        $ref: '#/$defs/ActivityTypes'
        x-jsonld-id: '@type'
      prov:type:
        $ref: '#/$defs/ActivityTypes'
      activityType:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreObjectref
        x-jsonld-id: '@type'
      endedAtTime:
        $ref: '#/$defs/dateTime'
        x-jsonld-id: http://www.w3.org/ns/prov#endedAtTime
        x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
      wasAssociatedWith:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreAgentsOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#wasAssociatedWith
        x-jsonld-type: '@id'
      wasInformedBy:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreActivitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#wasInformedBy
        x-jsonld-type: '@id'
      used:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#used
        x-jsonld-type: '@id'
      wasStartedBy:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#wasStartedBy
        x-jsonld-type: '@id'
      wasEndedBy:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#wasEndedBy
        x-jsonld-type: '@id'
      invalidated:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#invalidated
        x-jsonld-type: '@id'
      generated:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#generated
        x-jsonld-type: '@id'
      atLocation:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: http://www.w3.org/ns/prov#atLocation
        x-jsonld-type: '@id'
      qualifiedUsage:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Usage'
        - type: array
          items:
            oneOf:
            - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
            - $ref: '#/$defs/Usage'
        x-jsonld-id: http://www.w3.org/ns/prov#qualifiedUsage
        x-jsonld-type: '@id'
      qualifiedCommunication:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Communication'
        - type: array
          items:
            oneOf:
            - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
            - $ref: '#/$defs/Generation'
        x-jsonld-id: http://www.w3.org/ns/prov#qualifiedCommunication
        x-jsonld-type: '@id'
      qualifiedStart:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Start'
        x-jsonld-id: http://www.w3.org/ns/prov#qualifiedStart
        x-jsonld-type: '@id'
      qualifiedEnd:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/End'
        x-jsonld-id: http://www.w3.org/ns/prov#qualifiedEnd
        x-jsonld-type: '@id'
      qualifiedAssociation:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Association
        - type: array
          items:
            oneOf:
            - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
            - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Association
        x-jsonld-id: http://www.w3.org/ns/prov#qualifiedAssociation
        x-jsonld-type: '@id'
    allOf:
    - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#influenced
  Usage:
    $anchor: Usage
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      type:
        oneOf:
        - type: string
          enum:
          - prov:Usage
          - Usage
        - type: array
          contains:
            type: string
            enum:
            - prov:Usage
            - Usage
          items:
            type: string
      atTime:
        $ref: '#/$defs/dateTime'
        x-jsonld-id: http://www.w3.org/ns/prov#atTime
        x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
      entity:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreEntitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#entity
        x-jsonld-type: '@id'
    required:
    - entity
  ActivityInfluence:
    $anchor: ActivityInfluence
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      atTime:
        $ref: '#/$defs/dateTime'
        x-jsonld-id: http://www.w3.org/ns/prov#atTime
        x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
      hadRole:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreObjectref
        x-jsonld-id: http://www.w3.org/ns/prov#hadRole
        x-jsonld-type: '@id'
      influencer:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreObjectref
        x-jsonld-id: http://www.w3.org/ns/prov#influencer
        x-jsonld-type: '@id'
      hadActivity:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreActivitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#hadActivity
        x-jsonld-type: '@id'
      activity:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#oneOrMoreActivitiesOrRefIds
        x-jsonld-id: http://www.w3.org/ns/prov#activity
        x-jsonld-type: '@id'
  Generation:
    $anchor: Generation
    allOf:
    - $ref: '#/$defs/ActivityInfluence'
    - type: object
      properties:
        type:
          oneOf:
          - type: string
            const: Generation
          - type: array
            contains:
              type: string
              const: Generation
            items:
              type: string
      required:
      - type
  Invalidation:
    $anchor: Invalidation
    allOf:
    - $ref: '#/$defs/ActivityInfluence'
    - type: object
      properties:
        type:
          oneOf:
          - type: string
            const: Invalidation
          - type: array
            contains:
              type: string
              const: Invalidation
            items:
              type: string
      required:
      - type
  Communication:
    $anchor: Communication
    allOf:
    - $ref: '#/$defs/ActivityInfluence'
    - type: object
      properties:
        type:
          oneOf:
          - type: string
            const: Communication
          - type: array
            contains:
              type: string
              const: Communication
            items:
              type: string
      required:
      - type
  Derivation:
    $anchor: Derivation
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      type:
        oneOf:
        - type: string
          const: Derivation
        - type: array
          contains:
            type: string
            const: Derivation
          items:
            type: string
      hadGeneration:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Generation'
        x-jsonld-id: http://www.w3.org/ns/prov#hadGeneration
        x-jsonld-type: '@id'
      hadActivity:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Activity'
        x-jsonld-id: http://www.w3.org/ns/prov#hadActivity
        x-jsonld-type: '@id'
      hadUsage:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Usage'
        x-jsonld-id: http://www.w3.org/ns/prov#hadUsage
        x-jsonld-type: '@id'
      entity:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Entity
        x-jsonld-id: http://www.w3.org/ns/prov#entity
        x-jsonld-type: '@id'
    required:
    - atTime
    - entity
  Delegation:
    $anchor: Delegation
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      type:
        oneOf:
        - type: string
          const: Delegation
        - type: array
          contains:
            type: string
            const: Delegation
          items:
            type: string
      agent:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Agent
        x-jsonld-id: http://www.w3.org/ns/prov#agent
        x-jsonld-type: '@id'
      hadActivity:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Activity'
        x-jsonld-id: http://www.w3.org/ns/prov#hadActivity
        x-jsonld-type: '@id'
  Attribution:
    $anchor: Attribution
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      type:
        oneOf:
        - type: string
          const: Attribution
        - type: array
          contains:
            type: string
            const: Attribution
          items:
            type: string
      agent:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Agent
        x-jsonld-id: http://www.w3.org/ns/prov#agent
        x-jsonld-type: '@id'
  StartOrEnd:
    type: object
    properties:
      id:
        $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        x-jsonld-id: '@id'
      type:
        oneOf:
        - type: string
        - type: array
          items:
            type: string
      atTime:
        $ref: '#/$defs/dateTime'
        x-jsonld-id: http://www.w3.org/ns/prov#atTime
        x-jsonld-type: http://www.w3.org/2001/XMLSchema#dateTime
      entity:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#Entity
        x-jsonld-id: http://www.w3.org/ns/prov#entity
        x-jsonld-type: '@id'
      hadActivity:
        oneOf:
        - $ref: https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml#objectref
        - $ref: '#/$defs/Activity'
        x-jsonld-id: http://www.w3.org/ns/prov#hadActivity
        x-jsonld-type: '@id'
    required:
    - atTime
  Start:
    allOf:
    - $ref: '#/$defs/StartOrEnd'
    - properties:
        type:
          anyOf:
          - const: Start
          - contains:
              const: Start
  End:
    allOf:
    - $ref: '#/$defs/StartOrEnd'
    - properties:
        type:
          anyOf:
          - const: End
          - contains:
              const: End
anyOf:
- $ref: '#/$defs/Activity'
x-jsonld-extra-terms:
  agentType: '@type'
  entityType: '@type'
  featureType: '@type'
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
  entity:
    x-jsonld-id: http://www.w3.org/ns/prov#entity
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
  qualifiedAttribution:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedAttribution
    x-jsonld-type: '@id'
  qualifiedDelegation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedDelegation
    x-jsonld-type: '@id'
  qualifiedDerivation:
    x-jsonld-id: http://www.w3.org/ns/prov#qualifiedDerivation
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
  specializationOf:
    x-jsonld-id: http://www.w3.org/ns/prov#specializationOf
    x-jsonld-type: '@id'
  wasAttributedTo:
    x-jsonld-id: http://www.w3.org/ns/prov#wasAttributedTo
    x-jsonld-type: '@id'
  wasDerivedFrom:
    x-jsonld-id: http://www.w3.org/ns/prov#wasDerivedFrom
    x-jsonld-type: '@id'
  wasGeneratedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasGeneratedBy
    x-jsonld-type: '@id'
  wasInfluencedBy:
    x-jsonld-id: http://www.w3.org/ns/prov#wasInfluencedBy
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

* YAML version: [schema.yaml](https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-activity/schema.json)
* JSON version: [schema.json](https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-activity/schema.yaml)


# JSON-LD Context

```jsonld
{
  "@context": {
    "wasInfluencedBy": {
      "@context": {
        "links": {
          "@id": "rdfs:seeAlso",
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
          }
        }
      },
      "@id": "prov:wasInfluencedBy",
      "@type": "@id"
    },
    "qualifiedInfluence": {
      "@context": {
        "influencer": {
          "@context": {
            "links": {
              "@id": "rdfs:seeAlso",
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
              }
            }
          },
          "@id": "prov:influencer",
          "@type": "@id"
        },
        "entity": {
          "@context": {
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
            }
          },
          "@id": "prov:entity",
          "@type": "@id"
        }
      },
      "@id": "prov:qualifiedInfluence",
      "@type": "@id"
    },
    "id": "@id",
    "provType": "@type",
    "activityType": "@type",
    "endedAtTime": {
      "@id": "prov:endedAtTime",
      "@type": "xsd:dateTime"
    },
    "wasAssociatedWith": {
      "@id": "prov:wasAssociatedWith",
      "@type": "@id"
    },
    "wasInformedBy": {
      "@id": "prov:wasInformedBy",
      "@type": "@id"
    },
    "used": {
      "@context": {
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
        }
      },
      "@id": "prov:used",
      "@type": "@id"
    },
    "wasStartedBy": {
      "@context": {
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
        }
      },
      "@id": "prov:wasStartedBy",
      "@type": "@id"
    },
    "wasEndedBy": {
      "@context": {
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
        }
      },
      "@id": "prov:wasEndedBy",
      "@type": "@id"
    },
    "invalidated": {
      "@context": {
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
        }
      },
      "@id": "prov:invalidated",
      "@type": "@id"
    },
    "generated": {
      "@context": {
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
        }
      },
      "@id": "prov:generated",
      "@type": "@id"
    },
    "atLocation": {
      "@id": "prov:atLocation",
      "@type": "@id"
    },
    "qualifiedUsage": {
      "@context": {
        "entity": {
          "@context": {
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
            }
          },
          "@id": "prov:entity",
          "@type": "@id"
        }
      },
      "@id": "prov:qualifiedUsage",
      "@type": "@id"
    },
    "qualifiedCommunication": {
      "@id": "prov:qualifiedCommunication",
      "@type": "@id"
    },
    "qualifiedStart": {
      "@context": {
        "entity": {
          "@context": {
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
            }
          },
          "@id": "prov:entity",
          "@type": "@id"
        }
      },
      "@id": "prov:qualifiedStart",
      "@type": "@id"
    },
    "qualifiedEnd": {
      "@context": {
        "entity": {
          "@context": {
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
            }
          },
          "@id": "prov:entity",
          "@type": "@id"
        }
      },
      "@id": "prov:qualifiedEnd",
      "@type": "@id"
    },
    "qualifiedAssociation": {
      "@id": "prov:qualifiedAssociation",
      "@type": "@id"
    },
    "agentType": "@type",
    "entityType": "@type",
    "featureType": "@type",
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
    "alternateOf": {
      "@id": "prov:alternateOf",
      "@type": "@id"
    },
    "entity": {
      "@id": "prov:entity",
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
    "hadMember": {
      "@id": "prov:hadMember",
      "@type": "@id"
    },
    "hadPlan": {
      "@id": "prov:hadPlan",
      "@type": "@id"
    },
    "hadPrimarySource": {
      "@id": "prov:hadPrimarySource",
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
    "qualifiedAttribution": {
      "@id": "prov:qualifiedAttribution",
      "@type": "@id"
    },
    "qualifiedDelegation": {
      "@id": "prov:qualifiedDelegation",
      "@type": "@id"
    },
    "qualifiedDerivation": {
      "@id": "prov:qualifiedDerivation",
      "@type": "@id"
    },
    "qualifiedGeneration": {
      "@id": "prov:qualifiedGeneration",
      "@type": "@id"
    },
    "qualifiedInvalidation": {
      "@id": "prov:qualifiedInvalidation",
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
    "specializationOf": {
      "@id": "prov:specializationOf",
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
    "wasGeneratedBy": {
      "@id": "prov:wasGeneratedBy",
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
    "has_anchor": {
      "@id": "prov:has_anchor",
      "@type": "@id"
    },
    "has_provenance": {
      "@id": "dct:provenance",
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
    "links": "rdfs:seeAlso",
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
[context.jsonld](https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov-activity/context.jsonld)

## Sources

* [The PROV-O vocabulary](https://www.w3.org/TR/prov-o/)

# For developers

The source code for this Building Block can be found in the following repository:

* URL: [https://github.com/ogcincubator/bblock-prov-schema](https://github.com/ogcincubator/bblock-prov-schema)
* Path: `_sources/prov-activity`

