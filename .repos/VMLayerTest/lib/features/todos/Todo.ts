import * as Schema from "effect/Schema";

export const Todo = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  completed: Schema.Boolean,
});

export type Todo = Schema.Schema.Type<typeof Todo>;
