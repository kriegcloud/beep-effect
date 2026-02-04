"use client";

import { Button } from "@beep/ui/components/button";
import { Checkbox } from "@beep/ui/components/checkbox";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { Textarea } from "@beep/ui/components/textarea";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { JSX } from "react";
import { useCallback, useId, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EquationRenderError } from "../schema/errors";
import KatexRenderer from "./KatexRenderer";

type Props = {
  readonly initialEquation?: undefined | string;
  readonly onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({ onConfirm, initialEquation = "" }: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);
  const inlineId = useId();
  const equationId = useId();

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  return (
    <div className="grid gap-4 py-2">
      <div className="flex items-center gap-2">
        <Checkbox id={inlineId} checked={inline} onCheckedChange={(checked) => setInline(checked === true)} />
        <Label htmlFor={inlineId}>Inline equation</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={equationId}>Equation</Label>
        {inline ? (
          <Input
            id={equationId}
            value={equation}
            onChange={(event) => setEquation(event.target.value)}
            placeholder="E = mc^2"
          />
        ) : (
          <Textarea
            id={equationId}
            value={equation}
            onChange={(event) => setEquation(event.target.value)}
            placeholder="Enter your equation..."
            rows={4}
          />
        )}
      </div>
      <div className="grid gap-2">
        <Label>Preview</Label>
        <div className="min-h-[3rem] p-3 border border-border rounded-md bg-muted/50 flex items-center justify-center">
          <ErrorBoundary
            onError={(e) =>
              editor._onError(
                e instanceof EquationRenderError ? e : new EquationRenderError({ message: String(e), cause: e })
              )
            }
            fallback={null}
          >
            <KatexRenderer equation={equation} inline={false} onDoubleClick={() => null} />
          </ErrorBoundary>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClick}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
