/**
 * Integration domain types for external service connections.
 *
 * Ontology alignment:
 *   ExternalServiceRecord  → pao:ExternalService
 *   IntegrationRecord      → pao:Integration
 *   ServiceCapability      → pao:ServiceCapability (Tool | Resource | Prompt)
 */
import { Schema } from "effect"
import { AgentId, ExternalServiceId, IntegrationId } from "./ids.js"
import { IntegrationStatus, ServiceTransport } from "./status.js"

export class ServiceToolCapability extends Schema.Class<ServiceToolCapability>("ServiceToolCapability")({
  _tag: Schema.tag("ServiceToolCapability"),
  name: Schema.String,
  description: Schema.optional(Schema.String)
}) {}

export class ServiceResourceCapability extends Schema.Class<ServiceResourceCapability>("ServiceResourceCapability")({
  _tag: Schema.tag("ServiceResourceCapability"),
  name: Schema.String,
  description: Schema.optional(Schema.String),
  uri: Schema.optional(Schema.String)
}) {}

export class ServicePromptCapability extends Schema.Class<ServicePromptCapability>("ServicePromptCapability")({
  _tag: Schema.tag("ServicePromptCapability"),
  name: Schema.String,
  description: Schema.optional(Schema.String)
}) {}

export const ServiceCapability = Schema.Union([
  ServiceToolCapability,
  ServiceResourceCapability,
  ServicePromptCapability
])
export type ServiceCapability = typeof ServiceCapability.Type

export class ExternalServiceRecord extends Schema.Class<ExternalServiceRecord>("ExternalServiceRecord")({
  serviceId: ExternalServiceId,
  name: Schema.String,
  endpoint: Schema.String,
  transport: ServiceTransport,
  identifier: Schema.String,
  createdAt: Schema.DateTimeUtcFromString
}) {}

export class IntegrationRecord extends Schema.Class<IntegrationRecord>("IntegrationRecord")({
  integrationId: IntegrationId,
  agentId: AgentId,
  serviceId: ExternalServiceId,
  status: IntegrationStatus,
  capabilities: Schema.Array(ServiceCapability),
  createdAt: Schema.DateTimeUtcFromString,
  updatedAt: Schema.DateTimeUtcFromString
}) {}
