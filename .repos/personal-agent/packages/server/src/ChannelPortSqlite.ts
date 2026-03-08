import { GenerationConfigOverrideSchema, ModelOverrideSchema } from "@template/domain/config"
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import type { AgentId, ChannelId, ConversationId, SessionId } from "../../domain/src/ids.js"
import type { ChannelPort, ChannelRecord, ChannelSummaryRecord } from "../../domain/src/ports.js"
import { sqlInstant, sqlInstantNullable, sqlJsonColumn } from "./persistence/SqlCodecs.js"
import { ChannelCapability, ChannelType } from "../../domain/src/status.js"

const ChannelRowSchema = Schema.Struct({
  channel_id: Schema.String,
  channel_type: ChannelType,
  agent_id: Schema.String,
  active_session_id: Schema.String,
  active_conversation_id: Schema.String,
  capabilities_json: Schema.String,
  model_override_json: Schema.Union([Schema.String, Schema.Null]),
  generation_config_override_json: Schema.Union([Schema.String, Schema.Null]),
  created_at: Schema.String
})
type ChannelRow = typeof ChannelRowSchema.Type

const ChannelSummaryRowSchema = Schema.Struct({
  channel_id: Schema.String,
  channel_type: ChannelType,
  agent_id: Schema.String,
  active_session_id: Schema.String,
  active_conversation_id: Schema.String,
  created_at: Schema.String,
  last_turn_at: Schema.Union([Schema.String, Schema.Null]),
  message_count: Schema.Number
})
type ChannelSummaryRow = typeof ChannelSummaryRowSchema.Type

const ChannelIdRequest = Schema.Struct({ channelId: Schema.String })
const capabilitiesJson = sqlJsonColumn(Schema.Array(ChannelCapability))
const modelOverrideJson = sqlJsonColumn(ModelOverrideSchema)
const generationConfigOverrideJson = sqlJsonColumn(GenerationConfigOverrideSchema)

export class ChannelPortSqlite extends ServiceMap.Service<ChannelPortSqlite>()(
  "server/ChannelPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findChannelById = SqlSchema.findOneOption({
        Request: ChannelIdRequest,
        Result: ChannelRowSchema,
        execute: ({ channelId }) =>
          sql`
            SELECT
              channel_id,
              channel_type,
              agent_id,
              active_session_id,
              active_conversation_id,
              capabilities_json,
              model_override_json,
              generation_config_override_json,
              created_at
            FROM channels
            WHERE channel_id = ${channelId}
            LIMIT 1
          `.withoutTransform
      })

      const get: ChannelPort["get"] = (channelId) =>
        findChannelById({ channelId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeChannelRow
            })
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const list: ChannelPort["list"] = (query) =>
        Effect.gen(function*() {
          const rows = query?.agentId
            ? yield* sql`
                SELECT
                  c.channel_id,
                  c.channel_type,
                  c.agent_id,
                  c.active_session_id,
                  c.active_conversation_id,
                  c.created_at,
                  MAX(t.created_at) AS last_turn_at,
                  COALESCE(COUNT(t.turn_id), 0) AS message_count
                FROM channels c
                LEFT JOIN turns t ON t.session_id = c.active_session_id
                WHERE c.agent_id = ${query.agentId}
                GROUP BY
                  c.channel_id,
                  c.channel_type,
                  c.agent_id,
                  c.active_session_id,
                  c.active_conversation_id,
                  c.created_at
                ORDER BY
                  COALESCE(MAX(t.created_at), c.created_at) DESC,
                  c.created_at DESC
              `.withoutTransform
            : yield* sql`
                SELECT
                  c.channel_id,
                  c.channel_type,
                  c.agent_id,
                  c.active_session_id,
                  c.active_conversation_id,
                  c.created_at,
                  MAX(t.created_at) AS last_turn_at,
                  COALESCE(COUNT(t.turn_id), 0) AS message_count
                FROM channels c
                LEFT JOIN turns t ON t.session_id = c.active_session_id
                GROUP BY
                  c.channel_id,
                  c.channel_type,
                  c.agent_id,
                  c.active_session_id,
                  c.active_conversation_id,
                  c.created_at
                ORDER BY
                  COALESCE(MAX(t.created_at), c.created_at) DESC,
                  c.created_at DESC
              `.withoutTransform

          return rows.map((row: any) => {
            const decoded = Schema.decodeUnknownSync(ChannelSummaryRowSchema)(row)
            return decodeChannelSummaryRow(decoded)
          })
        }).pipe(
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const create: ChannelPort["create"] = (channel) =>
        sql`
          INSERT INTO channels (
            channel_id,
            channel_type,
            agent_id,
            active_session_id,
            active_conversation_id,
            capabilities_json,
            model_override_json,
            generation_config_override_json,
            created_at
          ) VALUES (
            ${channel.channelId},
            ${channel.channelType},
            ${channel.agentId},
            ${channel.activeSessionId},
            ${channel.activeConversationId},
            ${capabilitiesJson.encode(channel.capabilities)},
            ${channel.modelOverride ? modelOverrideJson.encode(channel.modelOverride) : null},
            ${channel.generationConfigOverride ? generationConfigOverrideJson.encode(channel.generationConfigOverride) : null},
            ${sqlInstant.encode(channel.createdAt)}
          )
          ON CONFLICT(channel_id) DO UPDATE SET
            channel_type = excluded.channel_type,
            agent_id = excluded.agent_id,
            active_session_id = excluded.active_session_id,
            active_conversation_id = excluded.active_conversation_id,
            capabilities_json = excluded.capabilities_json
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const deleteChannel: ChannelPort["delete"] = (channelId) =>
        sql`
          DELETE FROM channels
          WHERE channel_id = ${channelId}
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const updateModelPreference: ChannelPort["updateModelPreference"] = (channelId, update) =>
        Effect.gen(function*() {
          if ("modelOverride" in update && "generationConfigOverride" in update) {
            yield* sql`
              UPDATE channels SET
                model_override_json = ${update.modelOverride ? modelOverrideJson.encode(update.modelOverride) : null},
                generation_config_override_json = ${update.generationConfigOverride ? generationConfigOverrideJson.encode(update.generationConfigOverride) : null}
              WHERE channel_id = ${channelId}
            `.unprepared
          } else if ("modelOverride" in update) {
            yield* sql`
              UPDATE channels SET
                model_override_json = ${update.modelOverride ? modelOverrideJson.encode(update.modelOverride) : null}
              WHERE channel_id = ${channelId}
            `.unprepared
          } else if ("generationConfigOverride" in update) {
            yield* sql`
              UPDATE channels SET
                generation_config_override_json = ${update.generationConfigOverride ? generationConfigOverrideJson.encode(update.generationConfigOverride) : null}
              WHERE channel_id = ${channelId}
            `.unprepared
          }
        }).pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        get,
        list,
        create,
        delete: deleteChannel,
        updateModelPreference
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const decodeChannelRow = (row: ChannelRow): ChannelRecord => ({
  channelId: row.channel_id as ChannelId,
  channelType: row.channel_type,
  agentId: row.agent_id as AgentId,
  activeSessionId: row.active_session_id as SessionId,
  activeConversationId: row.active_conversation_id as ConversationId,
  capabilities: capabilitiesJson.decode(row.capabilities_json),
  modelOverride: row.model_override_json ? modelOverrideJson.decode(row.model_override_json) : null,
  generationConfigOverride: row.generation_config_override_json
    ? generationConfigOverrideJson.decode(row.generation_config_override_json)
    : null,
  createdAt: sqlInstant.decode(row.created_at)
})

const decodeChannelSummaryRow = (row: ChannelSummaryRow): ChannelSummaryRecord => ({
  channelId: row.channel_id as ChannelSummaryRecord["channelId"],
  channelType: row.channel_type,
  agentId: row.agent_id as ChannelSummaryRecord["agentId"],
  activeSessionId: row.active_session_id as ChannelSummaryRecord["activeSessionId"],
  activeConversationId: row.active_conversation_id as ChannelSummaryRecord["activeConversationId"],
  createdAt: sqlInstant.decode(row.created_at),
  lastTurnAt: sqlInstantNullable.decode(row.last_turn_at),
  messageCount: row.message_count
})
