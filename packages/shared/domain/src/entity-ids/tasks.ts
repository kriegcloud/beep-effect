import { EntityId } from "@beep/schema/EntityId";

export const TodoId = EntityId.make("todo", {
  brand: "TodoId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/tasks/TodoId"),
    description: "A unique identifier for a Todo",
  },
});
