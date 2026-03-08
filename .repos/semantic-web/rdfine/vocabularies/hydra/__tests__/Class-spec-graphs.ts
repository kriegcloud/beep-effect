import { createGraph } from './support/index.js'

export const multiLevelSupportedOperations = createGraph(`
@prefix vocab: <http://example.com/vocab#> .
@prefix api: <http://example.com/api#> .

vocab:BaseClass a hydra:Class ;
  hydra:supportedOperation api:HeadRequest .

vocab:Issue a hydra:Class ; rdfs:subClassOf vocab:BaseClass ;
  hydra:supportedOperation api:GetIssue .
  
vocab:DraftIssue
  rdfs:subClassOf vocab:Issue ;
  hydra:supportedOperation api:UpdateDraft .`)

export const multiLevelSupportedProperties = createGraph(`
@prefix vocab: <http://example.com/vocab#> .
@prefix api: <http://example.com/api#> .

vocab:BaseClass a hydra:Class ;
  hydra:supportedProperty [
    hydra:property vocab:title
  ] .

vocab:Issue a hydra:Class ; rdfs:subClassOf vocab:BaseClass ;
  hydra:supportedProperty [
    hydra:property vocab:assignee
  ] , [
    hydra:property vocab:status
  ] .

vocab:DraftIssue
  rdfs:subClassOf vocab:Issue ;
  hydra:supportedProperty [
    hydra:property vocab:hasBeenReviewed
  ] .`)

export const duplicateInheritedProperties = createGraph(`
@prefix vocab: <http://example.com/vocab#> .
@prefix api: <http://example.com/api#> .

vocab:Issue a hydra:Class ;
  hydra:supportedProperty [
    hydra:title "Base title" ;
    hydra:property vocab:title
  ] .
  
vocab:DraftIssue
  rdfs:subClassOf vocab:Issue ;
  hydra:supportedProperty [
    hydra:title "Overridden title" ;
    hydra:property vocab:title
  ] .
`)

export const duplicateInheritedOperationsSameId = createGraph(`
@prefix vocab: <http://example.com/vocab#> .
@prefix api: <http://example.com/api#> .

vocab:BaseClass a hydra:Class ;
  hydra:supportedOperation api:HeadRequest .

vocab:Issue a hydra:Class ; rdfs:subClassOf vocab:BaseClass ;
  hydra:supportedOperation api:HeadRequest .
  
vocab:DraftIssue
  rdfs:subClassOf vocab:Issue ;
  hydra:supportedOperation api:HeadRequest .`)
