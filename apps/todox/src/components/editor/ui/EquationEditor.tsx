"use client";

import { isHTMLElement } from "lexical";
import type { JSX, Ref, RefObject } from "react";
import { type ChangeEvent, forwardRef } from "react";

type BaseEquationEditorProps = {
  readonly equation: string;
  readonly inline: boolean;
  readonly setEquation: (equation: string) => void;
};

function EquationEditor(
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>
): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };

  return inline && isHTMLElement(forwardedRef) ? (
    <span className="bg-muted">
      <span className="text-left text-muted-foreground">$</span>
      <input
        className="p-0 m-0 border-0 outline-none text-purple-700 bg-inherit resize-none"
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
      <span className="text-left text-muted-foreground">$</span>
    </span>
  ) : (
    <div className="bg-muted">
      <span className="text-left text-muted-foreground">{"$$\n"}</span>
      <textarea
        className="p-0 m-0 border-0 outline-none text-purple-700 bg-inherit resize-none w-full"
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLTextAreaElement>}
      />
      <span className="text-left text-muted-foreground">{"\n$$"}</span>
    </div>
  );
}

export default forwardRef(EquationEditor);
