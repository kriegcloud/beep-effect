/**
 * Domain Identity Types
 *
 * Branded types for deploy CLI entities to ensure type safety and validation.
 *
 * @since 1.0.0
 * @module Domain/Identity
 */

import { Schema } from "effect"

// =============================================================================
// Environment & Project Identifiers
// =============================================================================

/**
 * Environment identifier: dev or prod
 */
export const Environment = Schema.Literal("dev", "prod")
export type Environment = typeof Environment.Type

/**
 * GCP Project ID - validated against GCP naming rules
 * Must start with a letter, 6-30 chars, lowercase letters, digits, and hyphens
 */
export const ProjectId = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/),
  Schema.brand("ProjectId"),
  Schema.annotations({
    title: "GCP Project ID",
    description: "Valid GCP project identifier (6-30 chars, lowercase alphanumeric + hyphens)"
  })
)
export type ProjectId = typeof ProjectId.Type

/**
 * GCP Region - validated region format
 */
export const Region = Schema.String.pipe(
  Schema.pattern(/^[a-z]+-[a-z]+\d+$/),
  Schema.brand("Region"),
  Schema.annotations({
    title: "GCP Region",
    description: "Valid GCP region (e.g., us-central1)"
  })
)
export type Region = typeof Region.Type

// =============================================================================
// Docker Types
// =============================================================================

/**
 * Docker image reference for GCR or Artifact Registry
 * Format: (gcr.io|us-docker.pkg.dev)/project/repo:tag
 */
export const DockerImage = Schema.String.pipe(
  Schema.pattern(/^(gcr\.io|[a-z]+-docker\.pkg\.dev)\/[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._/-]*:[a-z0-9._-]+$/),
  Schema.brand("DockerImage"),
  Schema.annotations({
    title: "Docker Image",
    description: "Fully-qualified Docker image reference for GCR or Artifact Registry"
  })
)
export type DockerImage = typeof DockerImage.Type

// =============================================================================
// Terraform Types
// =============================================================================

/**
 * Terraform workspace name
 */
export const TerraformWorkspace = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]*$/),
  Schema.brand("TerraformWorkspace"),
  Schema.annotations({
    title: "Terraform Workspace",
    description: "Valid Terraform workspace name"
  })
)
export type TerraformWorkspace = typeof TerraformWorkspace.Type

/**
 * File path (absolute or relative)
 */
export const FilePath = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("FilePath"),
  Schema.annotations({
    title: "File Path",
    description: "Valid file system path"
  })
)
export type FilePath = typeof FilePath.Type

// =============================================================================
// Helpers
// =============================================================================

/**
 * Construct a Docker image tag from components
 */
export const makeDockerImage = (
  registry: "gcr.io" | `${string}-docker.pkg.dev`,
  project: string,
  repo: string,
  tag: string
): DockerImage => `${registry}/${project}/${repo}:${tag}` as DockerImage
