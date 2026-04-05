import { ThemeToggleButton } from "./components/theme-toggle-button.tsx";

export function EditorWorkspaceApp() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-6">
        <div className="flex justify-end">
          <ThemeToggleButton />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-semibold tracking-tight">BEEP!</h1>
        </div>
      </main>
    </div>
  );
}
