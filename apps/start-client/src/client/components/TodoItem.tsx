import type { Todo } from "@shared/types/Todo.js";
import type { TodoId } from "@shared/types/TodoId.js";
import { AnimatePresence, motion } from "motion/react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <motion.div
      layout
      layoutId={`todo-${todo.id}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: -20,
        filter: "blur(4px)",
        transition: { type: "spring", visualDuration: 0.2, bounce: 0 },
      }}
      transition={{ type: "spring", visualDuration: 0.3, bounce: 0 }}
      className="mb-2"
    >
      <div className="flex items-center gap-3 rounded border border-neutral-800 bg-neutral-900/50 p-3 hover:border-neutral-700">
        <button type="button" onClick={() => onToggle(todo.id)} className="group relative h-5 w-5 shrink-0">
          <motion.div
            animate={{
              scale: todo.completed ? [1, 1.15, 1] : 1,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className={`h-full w-full rounded-full border-2 ${
              todo.completed
                ? "border-emerald-500 bg-emerald-500"
                : "border-neutral-600 bg-transparent group-hover:border-neutral-500"
            }`}
          >
            <AnimatePresence mode="wait">
              {todo.completed && (
                <motion.svg
                  key="checkmark"
                  initial={{ scale: 0, rotate: -90, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    visualDuration: 0.3,
                    bounce: 0.4,
                  }}
                  className="h-full w-full text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <title>Completed</title>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                      delay: 0.05,
                    }}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
        <motion.span
          layout
          className={`flex-1 text-sm transition-all duration-300 ${
            todo.completed ? "text-neutral-500 line-through" : "text-neutral-200"
          }`}
        >
          {todo.title}
        </motion.span>
        <motion.button
          type="button"
          onClick={() => onDelete(todo.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", visualDuration: 0.15, bounce: 0.3 }}
          className="rounded px-3 py-1 font-medium text-neutral-500 text-xs hover:bg-neutral-800 hover:text-red-400"
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
}
