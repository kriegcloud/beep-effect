import * as A from "effect/Array";
import * as Str from "effect/String";

export type ChatModelId = "gpt-4o" | "gpt-4o-mini" | "gpt-4-turbo" | "gpt-3.5-turbo";
export const aiModel: ChatModelId = "gpt-4o-mini";

export function getRoomId(pageId: string) {
  return `liveblocks:examples:${pageId}`;
}

export function getPageId(roomId: string) {
  return A.get(2)(Str.split(":")(roomId));
}

export function getPageUrl(roomId: string) {
  return `/${getPageId(roomId)}`;
}
