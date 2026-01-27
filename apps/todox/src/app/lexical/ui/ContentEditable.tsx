"use client";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import type { JSX } from "react";

type Props = {
  readonly className?: undefined | string;
  readonly placeholderClassName?: undefined | string;
  readonly placeholder: string;
};

export default function LexicalContentEditable({ className, placeholder, placeholderClassName }: Props): JSX.Element {
  return (
    <ContentEditable
      className={
        className ?? "border-0 text-[15px] block relative outline-none py-2 pb-10 px-2 lg:px-[46px] min-h-[150px]"
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            "text-[15px] text-muted-foreground overflow-hidden absolute text-ellipsis top-2 left-2 lg:left-[46px] right-2 lg:right-7 select-none whitespace-nowrap inline-block pointer-events-none"
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
