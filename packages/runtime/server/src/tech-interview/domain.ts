import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { makeEntityId } from "./utils";

export class TodoId extends makeEntityId("TodoId", {
  description: "A unique identifier for a Todo.",
}) {
  static readonly is = S.is(TodoId);
}

export declare namespace TodoId {
  export type Type = typeof TodoId.Type;
  export type Encoded = typeof TodoId.Encoded;
}

export class UserId extends makeEntityId("UserId", {
  description: "A unique identifier for a User.",
}) {
  static readonly is = S.is(UserId);
}

export declare namespace UserId {
  export type Type = typeof UserId.Type;
  export type Encoded = typeof UserId.Encoded;
}

export class PostId extends makeEntityId("UserId", {
  description: "A unique identifier for a Post.",
}) {}

export declare namespace PostId {
  export type Type = typeof PostId.Type;
  export type Encoded = typeof PostId.Encoded;
}

export class Todo extends M.Class<Todo>("@org/Todo")({
  userId: UserId,
  id: TodoId,
  title: S.NonEmptyTrimmedString,
  completed: S.Boolean,
}) {
  static readonly decode = S.decode(Todo);
}

export class Post extends M.Class<Post>("@org/Post")({
  userId: UserId,
  id: PostId,
  title: S.NonEmptyTrimmedString,
  body: S.String,
}) {
  static readonly decode = S.decode(Post);
}
