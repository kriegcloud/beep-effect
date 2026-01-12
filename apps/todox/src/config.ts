import type { OpenAIChatModelId } from "@ai-sdk/openai/internal";
import * as A from "effect/Array";
import * as Str from "effect/String";

export const aiModel: OpenAIChatModelId = "gpt-4o-mini";

export function getRoomId(pageId: string) {
  return `liveblocks:examples:${pageId}`;
}

export function getPageId(roomId: string) {
  return A.get(2)(Str.split(":")(roomId));
}

export function getPageUrl(roomId: string) {
  return `/${getPageId(roomId)}`;
}
