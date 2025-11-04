import { Atom, useAtom } from "@effect-atom/atom-react";

interface AddTodoFormProps {
  onAdd: (title: string) => void;
}

const todoTitleAtom = Atom.make("");

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [newTodoTitle, setNewTodoTitle] = useAtom(todoTitleAtom);

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      onAdd(newTodoTitle);
      setNewTodoTitle("");
    }
  };

  return (
    <div className="mb-6 flex gap-2">
      <input
        type="text"
        value={newTodoTitle}
        onChange={(e) => setNewTodoTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddTodo();
          }
        }}
        placeholder="What needs to be done?"
        className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-4 py-2 text-neutral-100 text-sm placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleAddTodo}
        disabled={!newTodoTitle.trim()}
        className="rounded bg-blue-600 px-6 py-2 font-medium text-sm text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
}
