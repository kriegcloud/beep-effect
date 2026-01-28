"use client";

import { Button } from "@beep/todox/components/ui/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { JSX } from "react";
import { useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import KatexRenderer from "./KatexRenderer";

type Props = {
  readonly initialEquation?: undefined | string;
  readonly onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({ onConfirm, initialEquation = "" }: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <>
      <div className="flex flex-row my-2.5 justify-between overflow-hidden">
        Inline
        <input type="checkbox" checked={inline} onChange={onCheckboxChange} />
      </div>
      <div className="flex flex-row my-2.5 justify-between overflow-hidden">Equation </div>
      <div className="flex flex-row my-2.5 justify-center overflow-hidden">
        {inline ? (
          <input
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="w-full resize-none p-1.5 border border-border rounded bg-background"
          />
        ) : (
          <textarea
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="w-full resize-none p-1.5 border border-border rounded bg-background"
          />
        )}
      </div>
      <div className="flex flex-row my-2.5 justify-between overflow-hidden">Visualization </div>
      <div className="flex flex-row my-2.5 justify-center overflow-hidden">
        <ErrorBoundary onError={(e) => editor._onError(e instanceof Error ? e : new Error(String(e)))} fallback={null}>
          <KatexRenderer equation={equation} inline={false} onDoubleClick={() => null} />
        </ErrorBoundary>
      </div>
      <div className="flex flex-row overflow-hidden mt-5 mb-0 justify-end gap-2">
        <Button onClick={onClick}>Confirm</Button>
      </div>
    </>
  );
}
