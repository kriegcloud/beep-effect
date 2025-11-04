import { Result } from "@effect-atom/atom-react";
import NumberFlow from "@number-flow/react";
import type { Todo } from "@shared/types/Todo.js";
import type { TodoServiceError } from "@shared/types/TodoServiceError.js";

interface TodoStatsProps {
  todos: Result.Result<readonly Todo[], TodoServiceError>;
}

interface TodoStatProps {
  value: number;
  className?: string;
  label: string;
}

function TodoStat({ value, className, label }: TodoStatProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center">
        <NumberFlow
          value={value}
          className={className}
          trend={(oldValue, value) => Math.sign(Math.abs(value) - Math.abs(oldValue))}
        />
      </div>
      <div className="font-bold font-mono text-neutral-400 text-xs">{label}</div>
    </div>
  );
}

export function TodoStats({ todos }: TodoStatsProps) {
  const stats = Result.isSuccess(todos)
    ? {
        total: todos.value.length,
        completed: todos.value.filter((t) => t.completed).length,
        remaining: todos.value.filter((t) => !t.completed).length,
      }
    : { total: 0, completed: 0, remaining: 0 };

  return (
    <div className="flex items-center gap-6 px-4 py-2 font-semibold text-2xl">
      <TodoStat value={stats.total} label="ALL" />
      <TodoStat value={stats.remaining} className="text-blue-500" label="OPEN" />
      <TodoStat value={stats.completed} className="text-emerald-500" label="DONE" />
    </div>
  );
}
