import {serverEnv} from "@beep/shared-env/ServerEnv";
import {type RoomData as LiveBlockRoomData, Liveblocks as LiveblocksNode } from "@liveblocks/node";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import {nanoid} from "nanoid";
import {getRoomId} from "../config";
import {RoomData} from "./schemas";

export const liveblocks = new LiveblocksNode({
  secret: Redacted.value(serverEnv.liveblocks.secretKey),
});

export type RoomInfo = { readonly name: string; readonly url: string };
export type TypedRoomData = LiveBlockRoomData & { readonly metadata: { readonly pageId: string } };
export type TypedRoomDataWithInfo = TypedRoomData & { readonly info: RoomInfo };

export const getLatestRoomEffect = Effect.fn("getLatestRoomEffect")(function* () {
  const {data: rooms} = yield* Effect.tryPromise(() => liveblocks.getRooms({limit: 1}));
  return A.get(0)(rooms);
});

export async function getLatestRoom() {
  const {data: rooms} = await liveblocks.getRooms({limit: 1});

  return A.get(0)(rooms);
}

export const createRoomEffect = Effect.fn("createRoomEffect")(function* (title = "Untitled document") {
  const pageId = nanoid();

  const room = yield* Effect.tryPromise(() => liveblocks.createRoom(getRoomId(pageId), {
    defaultAccesses: ["room:write"],
    metadata: {pageId},
  })).pipe(S.decodeUnknown(RoomData));

  yield* Effect.tryPromise(() => liveblocks.initializeStorageDocument(room.id, {
    liveblocksType: "LiveObject",
    data: {title},
  }));

  return room;
});

export async function createRoom(title = "Untitled document") {
  const pageId = nanoid();

  const room = (await liveblocks.createRoom(getRoomId(pageId), {
    defaultAccesses: ["room:write"],
    metadata: {pageId},
  })) as TypedRoomData;

  const parsed = S.decodeUnknownSync(RoomData)(room);

  await liveblocks.initializeStorageDocument(parsed.id, {
    liveblocksType: "LiveObject",
    data: {title},
  });

  return parsed;
}

export const getRoomEffect = Effect.fn("getRoomEffect")(function* ({
                                                                     cursor,
                                                                     limit,
                                                                   }: {
  readonly cursor?: undefined | string;
  readonly limit?: undefined | number;
}) {
  const {data: rooms = A.empty<TypedRoomData>(), nextCursor} = yield* Effect.tryPromise(() => liveblocks.getRooms({
    startingAfter: cursor,
    limit,
  }));
  return {rooms: rooms, nextCursor};
});

export async function getRooms({
                                 cursor,
                                 limit,
                               }: {
  readonly cursor?: undefined | string;
  readonly limit?: undefined | number;
}) {
  const {data: rooms = A.empty<TypedRoomData>(), nextCursor} = await liveblocks.getRooms({
    startingAfter: cursor,
    limit,
  });

  return {rooms: rooms, nextCursor};
}

export const getRoomTitleEffect = Effect.fn("getRoomTitleEffect")(function* (roomId: string) {
    const storage = yield* Effect.tryPromise(() => liveblocks.getStorageDocument(roomId, "json"));
    return storage.title;
  },
  Effect.tapError(Effect.logError),
  Effect.match({
    onSuccess: F.identity,
    onFailure: () => ""
  }));


export async function getRoomTitle(roomId: string) {
  try {
    const storage = await liveblocks.getStorageDocument(roomId, "json");
    return storage.title;
  } catch (err) {
    console.log(err);
    return "";
  }
}
