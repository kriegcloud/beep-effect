"use client";

import type { JSX } from "react";

import "./ContentEditable.css";

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import * as React from "react";

type Props = {
  readonly className?: undefined | string;
  readonly placeholderClassName?: undefined | string;
  readonly placeholder: string;
};

export default function LexicalContentEditable({ className, placeholder, placeholderClassName }: Props): JSX.Element {
  return (
    <ContentEditable
      className={className ?? "ContentEditable__root"}
      aria-placeholder={placeholder}
      placeholder={<div className={placeholderClassName ?? "ContentEditable__placeholder"}>{placeholder}</div>}
    />
  );
}
