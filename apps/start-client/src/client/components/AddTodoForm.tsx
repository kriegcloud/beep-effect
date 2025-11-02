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
    <div className="flex gap-2 mb-6">
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
        className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
      />
      <button
        type="button"
        onClick={handleAddTodo}
        disabled={!newTodoTitle.trim()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
}
