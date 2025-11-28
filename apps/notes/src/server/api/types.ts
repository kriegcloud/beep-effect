import type { RouterOutputs } from "@beep/notes/server/api/root";

export type RouterCommentItem = RouterOutputs["comment"]["discussions"]["discussions"][0]["comments"][0];

export type RouterDiscussionItem = RouterOutputs["comment"]["discussions"]["discussions"][0];

export type RouterDocumentItem = RouterOutputs["document"]["documents"]["documents"][0];

export type RouterDocumentVersionItem = RouterOutputs["version"]["documentVersions"]["versions"][0];

export type RouterUserItem = RouterOutputs["user"]["users"]["items"][0];
