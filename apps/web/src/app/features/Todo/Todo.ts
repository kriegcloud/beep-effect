import { $WebId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $WebId.create("features/Todo/Todo");

export const TodoId = S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(S.brand("TodoId"));

export declare namespace TodoId {
  export type Type = typeof TodoId.Type;
  export type Encoded = typeof TodoId.Encoded;
}

export class Todo extends S.Class<Todo>($I`Todo`)(
  {
    id: TodoId,
    text: S.String,
    completed: S.Boolean,
  },
  $I.annote("Todo", {
    description: "A todo item with an id, text, and completion status",
  })
) {}
