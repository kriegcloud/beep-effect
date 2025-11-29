import { prisma } from "@beep/notes/server/db";

import { Logger as LoggerExtension } from "@hocuspocus/extension-logger";
import { Redis as RedisExtension } from "@hocuspocus/extension-redis";
import { type onAuthenticatePayload, Server } from "@hocuspocus/server";
import type { RedisOptions } from "ioredis";
import { authenticateFromHeaders } from "./auth";
import { ensureDocument, loadDocumentSnapshot, storeDocumentSnapshot } from "./document";
import type { CollabContext } from "./types";

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const YJS_PORT = toNumber(process.env.YJS_PORT, 4444);
const YJS_HOST = process.env.YJS_HOST ?? "0.0.0.0";
const YJS_PATH = process.env.YJS_PATH ?? "/yjs";
const YJS_TIMEOUT = toNumber(process.env.YJS_TIMEOUT, 10_000);
const YJS_DEBOUNCE = toNumber(process.env.YJS_DEBOUNCE, 2000);
const YJS_MAX_DEBOUNCE = toNumber(process.env.YJS_MAX_DEBOUNCE, 10_000);
const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = toNumber(process.env.REDIS_PORT, 6379);
const REDIS_USERNAME = process.env.REDIS_USERNAME;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const redisOptions: RedisOptions | undefined =
  REDIS_USERNAME || REDIS_PASSWORD
    ? {
        ...(REDIS_USERNAME ? { username: REDIS_USERNAME } : {}),
        ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
      }
    : undefined;

const markReadOnly = (
  context: CollabContext,
  connectionConfig?: undefined | onAuthenticatePayload["connectionConfig"]
) => {
  context.readOnly = true;

  if (connectionConfig) {
    connectionConfig.readOnly = true;
  }
};

const collabServer = new Server(
  {
    address: YJS_HOST,
    debounce: YJS_DEBOUNCE,
    extensions: [
      new LoggerExtension({
        log: (...args) => console.log("[collab]", ...args),
        onChange: false,
      }),
      new RedisExtension({
        host: REDIS_HOST,
        port: REDIS_PORT,
        ...(redisOptions ? { options: redisOptions } : {}),
      }),
    ],
    maxDebounce: YJS_MAX_DEBOUNCE,
    name: "app-collab",
    port: YJS_PORT,
    quiet: true,
    timeout: YJS_TIMEOUT,
    onAuthenticate: async (payload) => {
      const context = (payload.context ??= {}) as CollabContext;
      const documentId = payload.documentName;
      const docRecord = await ensureDocument(context, documentId);
      const { user } = await authenticateFromHeaders(payload.requestHeaders);

      // Anonymous user handling
      if (!user) {
        if (!docRecord.isPublished) {
          throw new Error("Unauthorized: Document is not published");
        }

        // Anonymous users can only view published documents
        markReadOnly(context, payload.connectionConfig);

        return;
      }

      context.userId = user.id;
      const isOwner = docRecord.userId === user.id;

      // Authenticated user accessing an unpublished document that they do not own
      if (!isOwner && !docRecord.isPublished) {
        throw new Error("Forbidden: Document is not published");
      }
      // Set document as read-only if archived or locked
      if (docRecord.isArchived || docRecord.lockPage) {
        markReadOnly(context, payload.connectionConfig);
      }
    },
    onDestroy: async () => {
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.error("[collab] error while disconnecting prisma", error);
      }
    },
    onLoadDocument: async (payload) => {
      const context = payload.context as CollabContext;
      const documentId = payload.documentName;

      if (!context?.document) {
        console.error("[collab] document not found in context");

        return;
      }
      if (context.document.isArchived || context.document.lockPage) {
        markReadOnly(context, payload.connectionConfig);
      }

      // 后端负责初始化 Y.doc（只在 Y.doc 为空时加载一次）
      await loadDocumentSnapshot({
        context,
        document: payload.document,
        documentId,
      });
    },
    onStoreDocument: async (payload) => {
      const context = (payload.context ??= {}) as CollabContext;
      const documentId = payload.documentName;
      const docRecord = await ensureDocument(context, documentId);

      if (context.readOnly) {
        console.log("[collab] skipping store: document is read-only", {
          documentId,
        });

        return;
      }
      if (!context.userId) {
        console.warn("[collab] skipping store: no user id", { documentId });

        return;
      }

      const isOwner = docRecord.userId === context.userId;
      const canEdit = isOwner || docRecord.isPublished;

      if (!canEdit) {
        console.warn("[collab] skipping store: user cannot edit unpublished document", {
          documentId,
          isPublished: docRecord.isPublished,
          ownerId: docRecord.userId,
          userId: context.userId,
        });

        return;
      }

      await storeDocumentSnapshot({
        context,
        document: payload.document,
        documentId,
      });
    },
  },
  {
    path: YJS_PATH,
  }
);

collabServer
  .listen()
  .then(() => {
    const toUriHost = (h: string) => (h.includes(":") ? `[${h}]` : h);

    const addr = collabServer.address;
    const hostForLog = addr.address === "::" ? "[::]" : toUriHost(addr.address || "0.0.0.0");

    console.log(`[collab] listening on ws://${hostForLog}:${addr.port}${YJS_PATH}`);
  })
  .catch((error) => {
    console.error("[collab] failed to start server", error);

    throw error;
  });
