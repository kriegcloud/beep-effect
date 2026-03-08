import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import type { AgentId, ExternalServiceId, IntegrationId } from "../../domain/src/ids.js"
import type { ExternalServiceRecord, IntegrationRecord } from "../../domain/src/integration.js"
import { ServiceCapability } from "../../domain/src/integration.js"
import type { IntegrationPort } from "../../domain/src/ports.js"
import { IntegrationStatus, ServiceTransport } from "../../domain/src/status.js"

// ---------------------------------------------------------------------------
// Row schemas
// ---------------------------------------------------------------------------

const ExternalServiceRowSchema = Schema.Struct({
  service_id: Schema.String,
  name: Schema.String,
  endpoint: Schema.String,
  transport: ServiceTransport,
  identifier: Schema.String,
  created_at: Schema.String
})
type ExternalServiceRow = typeof ExternalServiceRowSchema.Type

const IntegrationRowSchema = Schema.Struct({
  integration_id: Schema.String,
  agent_id: Schema.String,
  service_id: Schema.String,
  status: IntegrationStatus,
  capabilities_json: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String
})
type IntegrationRow = typeof IntegrationRowSchema.Type

// ---------------------------------------------------------------------------
// Codec helpers
// ---------------------------------------------------------------------------

const ServiceIdRequest = Schema.Struct({ serviceId: Schema.String })
const IntegrationIdRequest = Schema.Struct({ integrationId: Schema.String })
const AgentServiceRequest = Schema.Struct({
  agentId: Schema.String,
  serviceId: Schema.String
})

import { sqlInstant, sqlJsonColumn } from "./persistence/SqlCodecs.js"

const capabilitiesJson = sqlJsonColumn(Schema.Array(ServiceCapability))

// ---------------------------------------------------------------------------
// Service implementation
// ---------------------------------------------------------------------------

export class IntegrationPortSqlite extends ServiceMap.Service<IntegrationPortSqlite>()(
  "server/IntegrationPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      // ---- External Services ----

      const findServiceById = SqlSchema.findOneOption({
        Request: ServiceIdRequest,
        Result: ExternalServiceRowSchema,
        execute: ({ serviceId }) =>
          sql`
            SELECT service_id, name, endpoint, transport, identifier, created_at
            FROM external_services
            WHERE service_id = ${serviceId}
            LIMIT 1
          `.withoutTransform
      })

      const getService: IntegrationPort["getService"] = (serviceId) =>
        findServiceById({ serviceId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeServiceRow
            })
          ),
          Effect.orDie
        )

      const createService: IntegrationPort["createService"] = (service) =>
        sql`
          INSERT INTO external_services (
            service_id, name, endpoint, transport, identifier, created_at
          ) VALUES (
            ${service.serviceId},
            ${service.name},
            ${service.endpoint},
            ${service.transport},
            ${service.identifier},
            ${sqlInstant.encode(service.createdAt)}
          )
          ON CONFLICT(service_id) DO UPDATE SET
            name = excluded.name,
            endpoint = excluded.endpoint,
            transport = excluded.transport,
            identifier = excluded.identifier
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.orDie
        )

      // ---- Integrations ----

      const findIntegrationById = SqlSchema.findOneOption({
        Request: IntegrationIdRequest,
        Result: IntegrationRowSchema,
        execute: ({ integrationId }) =>
          sql`
            SELECT integration_id, agent_id, service_id, status,
                   capabilities_json, created_at, updated_at
            FROM integrations
            WHERE integration_id = ${integrationId}
            LIMIT 1
          `.withoutTransform
      })

      const findIntegrationByAgentService = SqlSchema.findOneOption({
        Request: AgentServiceRequest,
        Result: IntegrationRowSchema,
        execute: ({ agentId, serviceId }) =>
          sql`
            SELECT integration_id, agent_id, service_id, status,
                   capabilities_json, created_at, updated_at
            FROM integrations
            WHERE agent_id = ${agentId} AND service_id = ${serviceId}
            LIMIT 1
          `.withoutTransform
      })

      const getIntegration: IntegrationPort["getIntegration"] = (integrationId) =>
        findIntegrationById({ integrationId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeIntegrationRow
            })
          ),
          Effect.orDie
        )

      const getIntegrationByService: IntegrationPort["getIntegrationByService"] = (agentId, serviceId) =>
        findIntegrationByAgentService({ agentId, serviceId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeIntegrationRow
            })
          ),
          Effect.orDie
        )

      const createIntegration: IntegrationPort["createIntegration"] = (integration) =>
        sql`
          INSERT INTO integrations (
            integration_id, agent_id, service_id, status,
            capabilities_json, created_at, updated_at
          ) VALUES (
            ${integration.integrationId},
            ${integration.agentId},
            ${integration.serviceId},
            ${integration.status},
            ${capabilitiesJson.encode(integration.capabilities)},
            ${sqlInstant.encode(integration.createdAt)},
            ${sqlInstant.encode(integration.updatedAt)}
          )
          ON CONFLICT(integration_id) DO UPDATE SET
            agent_id = excluded.agent_id,
            service_id = excluded.service_id,
            status = excluded.status,
            capabilities_json = excluded.capabilities_json,
            updated_at = excluded.updated_at
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.orDie
        )

      const updateStatus: IntegrationPort["updateStatus"] = (integrationId, status) =>
        sql`
          UPDATE integrations
          SET status = ${status},
              updated_at = CURRENT_TIMESTAMP
          WHERE integration_id = ${integrationId}
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.orDie
        )

      return {
        createService,
        getService,
        createIntegration,
        getIntegration,
        getIntegrationByService,
        updateStatus
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

// ---------------------------------------------------------------------------
// Row decoders
// ---------------------------------------------------------------------------

const decodeServiceRow = (row: ExternalServiceRow): ExternalServiceRecord =>
  ({
    serviceId: row.service_id as ExternalServiceId,
    name: row.name,
    endpoint: row.endpoint,
    transport: row.transport,
    identifier: row.identifier,
    createdAt: sqlInstant.decode(row.created_at)
  }) as ExternalServiceRecord

const decodeIntegrationRow = (row: IntegrationRow): IntegrationRecord =>
  ({
    integrationId: row.integration_id as IntegrationId,
    agentId: row.agent_id as AgentId,
    serviceId: row.service_id as ExternalServiceId,
    status: row.status,
    capabilities: capabilitiesJson.decode(row.capabilities_json),
    createdAt: sqlInstant.decode(row.created_at),
    updatedAt: sqlInstant.decode(row.updated_at)
  }) as IntegrationRecord
