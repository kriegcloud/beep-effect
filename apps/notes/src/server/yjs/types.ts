import type { Document } from "@beep/notes/generated/prisma/client";

export type CollabContext = {
  document?: undefined | CollabDocument;
  readOnly?: undefined | boolean;
  userId?: undefined | string;
};

export type CollabDocument = Pick<
  Document,
  "contentRich" | "id" | "isArchived" | "isPublished" | "lockPage" | "userId" | "yjsSnapshot"
>;
