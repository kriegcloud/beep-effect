import { Result } from "@effect-atom/atom-react";
import type { Todo } from "@shared/types/Todo.js";
import type { TodoId } from "@shared/types/TodoId.js";
import type { TodoServiceError } from "@shared/types/TodoServiceError.js";
import { AnimatePresence, motion } from "motion/react";
import { TodoItem } from "./TodoItem.js";

interface TodoListProps {
  todos: Result.Result<readonly Todo[], TodoServiceError>;
  onToggle: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  return (
    <div>
      {Result.match(todos, {
        onInitial: () => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center text-neutral-500">
            Loading...
          </motion.div>
        ),
        onFailure: (error) => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center text-red-400">
            Error: {String(error.cause)}
          </motion.div>
        ),
        onSuccess: (success) => (
          <>
            {success.value.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", visualDuration: 0.3, bounce: 0 }}
                className="py-8 text-center text-neutral-500"
              >
                No todos yet. Add one above!
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {success.value.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
                ))}
              </AnimatePresence>
            )}
          </>
        ),
      })}
    </div>
  );
}
