import { LiteralKit } from "@beep/schema/LiteralKit.schema";
import { Button } from "@beep/web/components/ui/button";
import { RocketLaunchIcon } from "@phosphor-icons/react/ssr";

const Status = LiteralKit(["todo", "doing", "done"] as const);

export default function Home() {
  const label = Status.$match("todo", {
    todo: () => "Todo",
    doing: () => "Doing",
    done: () => "Done",
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
      <Button variant="outline">
        <RocketLaunchIcon />
        {label}
      </Button>
      <p className="text-xs text-muted-foreground">Enum value: {Status.Enum.todo}</p>
    </main>
  );
}
