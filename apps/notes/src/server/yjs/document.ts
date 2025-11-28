import type { Prisma } from "@beep/notes/generated/prisma/client";
import { prisma } from "@beep/notes/server/db";
import type { Document as HocusDocument } from "@hocuspocus/server";
import { slateNodesToInsertDelta, yTextToSlateElement } from "@slate-yjs/core";
import { NodeApi, type Value } from "platejs";
import * as Y from "yjs";

import type { CollabContext, CollabDocument } from "./types";

const SHARED_ROOT_KEY = "content";
const MAX_CONTENT_LENGTH = 1_000_000;

const asSlateValue = (value: Prisma.JsonValue | null): Value | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value as Value;
  }

  return null;
};
const toSerializableValue = (value: Value): Value => {
  return structuredClone(value) as Value;
};
const applySlateValueToYDoc = (ydoc: HocusDocument, value: Value) => {
  const sharedRoot = ydoc.get(SHARED_ROOT_KEY, Y.XmlText) as Y.XmlText;

  sharedRoot.delete(0, sharedRoot.length);
  sharedRoot.applyDelta(slateNodesToInsertDelta(value));
};

const extractSlateValueFromYDoc = (ydoc: HocusDocument): Value => {
  const sharedRoot = ydoc.get(SHARED_ROOT_KEY, Y.XmlText) as Y.XmlText;
  const slateElement = yTextToSlateElement(sharedRoot);
  const slateValue: Value = Array.isArray(slateElement) ? (slateElement as Value) : ([slateElement] as Value);

  return toSerializableValue(slateValue);
};

export const ensureDocument = async (context: CollabContext, documentId: string): Promise<CollabDocument> => {
  if (context.document && context.document.id === documentId) {
    return context.document;
  }

  const document = await prisma.document.findUnique({
    select: {
      id: true,
      contentRich: true,
      isArchived: true,
      isPublished: true,
      lockPage: true,
      userId: true,
      yjsSnapshot: true,
    },
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  context.document = document;

  return document;
};

export const loadDocumentSnapshot = async ({
  context,
  document,
  documentId,
}: {
  context: CollabContext;
  document: HocusDocument;
  documentId: string;
}) => {
  const docRecord = await ensureDocument(context, documentId);

  // Prefer yjsSnapshot (binary format) over contentRich (JSON format)
  // Y.applyUpdate is idempotent - it won't duplicate content even if called multiple times
  // This is crucial when using Redis extension to prevent duplicate content after server restart
  if (docRecord.yjsSnapshot) {
    try {
      Y.applyUpdate(document, docRecord.yjsSnapshot);
    } catch (error) {
      console.error("[collab] error applying yjs snapshot", {
        documentId,
        error,
      });
    }
  } else if (docRecord.contentRich) {
    // Fallback: migrate from old JSON format to Yjs format
    // Only apply if document is empty to prevent duplication during migration
    const sharedRoot = document.get(SHARED_ROOT_KEY, Y.XmlText) as Y.XmlText;
    const isEmpty = sharedRoot.length === 0;
    const slateValue = asSlateValue(docRecord.contentRich);

    if (slateValue && isEmpty) {
      applySlateValueToYDoc(document, slateValue);

      // IMPORTANT: Immediately save yjsSnapshot after creating from contentRich
      // This ensures subsequent loads use the same Yjs operation history,
      // preventing duplicate content on reconnection
      try {
        const yjsSnapshot = Buffer.from(Y.encodeStateAsUpdate(document));
        await prisma.document.update({
          data: { yjsSnapshot },
          where: { id: documentId },
        });
      } catch (error) {
        console.error("[collab] Failed to save yjsSnapshot after contentRich migration:", error);
      }
    }
  }
};

export const storeDocumentSnapshot = async ({
  context,
  document,
  documentId,
}: {
  context: CollabContext;
  document: HocusDocument;
  documentId: string;
}) => {
  const docRecord = await ensureDocument(context, documentId);
  const slateValue = extractSlateValueFromYDoc(document);

  const plainText = NodeApi.string({
    children: slateValue,
    type: "root",
  });

  if (plainText.length > MAX_CONTENT_LENGTH) {
    throw new Error("Content is too long");
  }

  // Encode Y.doc state as binary snapshot for idempotent loading
  const yjsSnapshot = Buffer.from(Y.encodeStateAsUpdate(document));

  await prisma.document.update({
    data: {
      content: plainText,
      contentRich: slateValue as Prisma.InputJsonValue,
      yjsSnapshot,
    },
    where: { id: docRecord.id },
  });

  context.document = {
    ...docRecord,
    contentRich: slateValue as Prisma.JsonValue,
    yjsSnapshot,
  };
};
