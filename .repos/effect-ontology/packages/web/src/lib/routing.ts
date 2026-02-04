/**
 * Routing utilities for ontology-scoped navigation
 *
 * @module lib/routing
 */

/**
 * Generate entity detail link
 */
export function entityLink(ontologyId: string, iri: string): string {
  return `/o/${ontologyId}/entities/${encodeURIComponent(iri)}`
}

/**
 * Generate class detail link
 */
export function classLink(ontologyId: string, iri: string): string {
  return `/o/${ontologyId}/classes/${encodeURIComponent(iri)}`
}

/**
 * Generate link detail link
 */
export function linkLink(ontologyId: string, linkId: string): string {
  return `/o/${ontologyId}/links/${linkId}`
}

/**
 * Generate document detail link
 */
export function documentLink(ontologyId: string, documentId: string): string {
  return `/o/${ontologyId}/documents/${documentId}`
}

/**
 * Generate ontology home link
 */
export function ontologyHomeLink(ontologyId: string): string {
  return `/o/${ontologyId}`
}

/**
 * Generate entities list link
 */
export function entitiesLink(ontologyId: string): string {
  return `/o/${ontologyId}/entities`
}

/**
 * Generate links list link
 */
export function linksLink(ontologyId: string): string {
  return `/o/${ontologyId}/links`
}

/**
 * Generate ingest link
 */
export function ingestLink(ontologyId: string): string {
  return `/o/${ontologyId}/links/ingest`
}

/**
 * Generate documents link
 */
export function documentsLink(ontologyId: string): string {
  return `/o/${ontologyId}/documents`
}

/**
 * Generate timeline link
 */
export function timelineLink(ontologyId: string): string {
  return `/o/${ontologyId}/timeline`
}

/**
 * Generate classes link
 */
export function classesLink(ontologyId: string): string {
  return `/o/${ontologyId}/classes`
}

/**
 * Generate batches link
 */
export function batchesLink(ontologyId: string): string {
  return `/o/${ontologyId}/batches`
}
