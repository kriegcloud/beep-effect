import type { Document } from "@beep/notes/generated/prisma/client";

export type CollabContext = {
  document?: CollabDocument;
  readOnly?: boolean;
  userId?: string;
};

export type CollabDocument = Pick<
  Document,
  "contentRich" | "id" | "isArchived" | "isPublished" | "lockPage" | "userId" | "yjsSnapshot"
>;
