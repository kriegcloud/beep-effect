import { Button } from "@client/components/ui/button.js";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Home } from "lucide-react";
import { installPromptAtom } from "./atoms.js";

export function InstallButton() {
  return Result.builder(useAtomValue(installPromptAtom))
    .onSuccess((install) => (
      <Button onClick={() => install} className="cursor-pointer">
        <Home />
        Add to home screen
      </Button>
    ))
    .render();
}
