"use client";

import type * as React from "react";
import type { JSX } from "react";
import { useMemo } from "react";

export default function Switch({
  checked,
  onClick,
  text,
  id,
}: Readonly<{
  readonly checked: boolean;
  readonly id?: undefined | string;
  readonly onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  readonly text: string;
}>): JSX.Element {
  const buttonId = useMemo(() => "id_" + Math.floor(Math.random() * 10000), []);
  return (
    <div className="switch" id={id}>
      <label htmlFor={buttonId}>{text}</label>
      <button role="switch" aria-checked={checked} id={buttonId} onClick={onClick}>
        <span />
      </button>
    </div>
  );
}
