import { ModelFamily } from "@app/domain/ai-models";
import * as Chat from "@app/domain/api/chat-rpc";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { SqlSchema } from "effect/unstable/sql";
import { SqlClient } from "effect/unstable/sql/SqlClient";
import { ChatModel } from "./chat-model.js";
import { PgLive } from "./pg-live.js";

export class ChatRepo extends Context.Service<ChatRepo, {
  readonly create: (args: {
    readonly userId: string;
    readonly title: string;
    readonly model: typeof ModelFamily.Type;
  }) => Effect.Effect<typeof ChatModel.Type>;
  readonly findById: (
    chatId: Chat.ChatId,
    userId: string,
  ) => Effect.Effect<typeof ChatModel.Type, Chat.ChatNotFoundError>;
  readonly listByUser: (
    userId: string,
    cursor: Option.Option<DateTime.Utc>,
  ) => Effect.Effect<{ items: ReadonlyArray<typeof ChatModel.Type>; hasMore: boolean; }>;
  readonly delete: (
    chatId: Chat.ChatId,
    userId: string,
  ) => Effect.Effect<void, Chat.ChatNotFoundError>;
  readonly startRun: (args: {
    readonly chatId: Chat.ChatId;
    readonly userId: string;
    readonly runId: Chat.RunId;
    readonly messages: ReadonlyArray<typeof Chat.Message.Type>;
  }) => Effect.Effect<boolean>;
  readonly finishRun: (args: {
    readonly chatId: Chat.ChatId;
    readonly userId: string;
    readonly runId: Chat.RunId;
    readonly messages: ReadonlyArray<typeof Chat.Message.Type>;
  }) => Effect.Effect<void>;
  readonly clearActiveRun: (args: {
    readonly chatId: Chat.ChatId;
    readonly userId: string;
    readonly runId: Chat.RunId;
  }) => Effect.Effect<void>;
}>()("ChatRepo", {
  make: Effect.gen(function*() {
    const sql = yield* SqlClient;

    const insertQuery = SqlSchema.findOne({
      Request: ChatModel.insert,
      Result: ChatModel,
      execute: (req) => sql`INSERT INTO chats ${sql.insert(req).returning("*")}`,
    });

    const findByIdQuery = SqlSchema.findOne({
      Request: Schema.Struct({ chatId: Chat.ChatId, userId: Schema.String }),
      Result: ChatModel,
      execute: ({ chatId, userId }) =>
        sql`
        SELECT * FROM chats
        WHERE id = ${chatId} AND user_id = ${userId}
      `,
    });

    const PAGE_SIZE = 50;

    const listQuery = SqlSchema.findAll({
      Request: Schema.Struct({
        userId: Schema.String,
        cursor: Schema.NullOr(Schema.DateTimeUtcFromString),
      }),
      Result: ChatModel,
      execute: ({ userId, cursor }) =>
        sql`
        SELECT * FROM chats
        WHERE user_id = ${userId}
          ${cursor !== null ? sql`AND updated_at < ${cursor}` : sql``}
        ORDER BY updated_at DESC
        LIMIT ${PAGE_SIZE + 1}
      `,
    });

    const deleteQuery = SqlSchema.findOne({
      Request: Schema.Struct({ chatId: Chat.ChatId, userId: Schema.String }),
      Result: Schema.Struct({ id: Chat.ChatId }),
      execute: ({ chatId, userId }) =>
        sql`
        DELETE FROM chats
        WHERE id = ${chatId} AND user_id = ${userId}
        RETURNING id
      `,
    });

    const startRunQuery = SqlSchema.findOneOption({
      Request: Schema.Struct({
        chatId: Chat.ChatId,
        userId: Schema.String,
        runId: Chat.RunId,
        messages: Schema.fromJsonString(Schema.Array(Chat.Message)),
      }),
      Result: Schema.Struct({ id: Chat.ChatId }),
      execute: ({ chatId, userId, runId, messages }) =>
        sql`
        UPDATE chats
        SET messages = ${messages}, active_run_id = ${runId}, updated_at = NOW()
        WHERE id = ${chatId} AND user_id = ${userId} AND active_run_id IS NULL
        RETURNING id
      `,
    });

    const finishRunQuery = SqlSchema.void({
      Request: Schema.Struct({
        chatId: Chat.ChatId,
        userId: Schema.String,
        runId: Chat.RunId,
        messages: Schema.fromJsonString(Schema.Array(Chat.Message)),
      }),
      execute: ({ chatId, userId, runId, messages }) =>
        sql`
        UPDATE chats
        SET messages = ${messages}, active_run_id = NULL, updated_at = NOW()
        WHERE id = ${chatId} AND user_id = ${userId} AND active_run_id = ${runId}
      `,
    });

    const clearActiveRunQuery = SqlSchema.void({
      Request: Schema.Struct({
        chatId: Chat.ChatId,
        userId: Schema.String,
        runId: Chat.RunId,
      }),
      execute: ({ chatId, userId, runId }) =>
        sql`
        UPDATE chats
        SET active_run_id = NULL, updated_at = NOW()
        WHERE id = ${chatId} AND user_id = ${userId} AND active_run_id = ${runId}
      `,
    });

    return {
      create: ({ userId, title, model }) =>
        insertQuery(ChatModel.insert.make({
          userId,
          title,
          model,
          messages: [],
          activeRunId: null,
        })).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
            NoSuchElementError: Effect.die,
          }),
        ),

      findById: (chatId, userId) =>
        findByIdQuery({ chatId, userId }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
            NoSuchElementError: () => new Chat.ChatNotFoundError({ id: chatId }),
          }),
        ),

      listByUser: (userId, cursor) =>
        listQuery({
          userId,
          cursor: Option.getOrNull(cursor),
        }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
          }),
          Effect.map((rows) => ({
            items: rows.slice(0, PAGE_SIZE),
            hasMore: rows.length > PAGE_SIZE,
          })),
        ),

      delete: (chatId, userId) =>
        deleteQuery({ chatId, userId }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
            NoSuchElementError: () => new Chat.ChatNotFoundError({ id: chatId }),
          }),
          Effect.asVoid,
        ),

      startRun: ({ chatId, userId, runId, messages }) =>
        startRunQuery({ chatId, userId, runId, messages }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
          }),
          Effect.map(Option.isSome),
        ),

      finishRun: ({ chatId, userId, runId, messages }) =>
        finishRunQuery({ chatId, userId, runId, messages }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
          }),
        ),

      clearActiveRun: ({ chatId, userId, runId }) =>
        clearActiveRunQuery({ chatId, userId, runId }).pipe(
          Effect.catchTags({
            SchemaError: Effect.die,
            SqlError: Effect.die,
          }),
        ),
    };
  }),
}) {
  static layer: Layer.Layer<ChatRepo> = Layer.effect(this, this.make).pipe(
    Layer.provide(PgLive),
  );
}
