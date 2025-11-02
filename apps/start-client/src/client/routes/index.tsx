import { TodoResults } from "@client/Todos/TodoResults.js";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TodoResults,
});

export function SearchPage() {
  return <TodoResults />;
}
