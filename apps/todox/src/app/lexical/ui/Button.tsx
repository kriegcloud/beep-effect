"use client";

import type { JSX } from "react";

import "./Button.css";

import type { ReactNode } from "react";
import * as React from "react";

import joinClasses from "../utils/joinClasses";

export default function Button({
  "data-test-id": dataTestId,
  children,
  className,
  onClick,
  disabled,
  small,
  title,
}: {
  readonly "data-test-id"?: undefined | string;
  readonly children: ReactNode;
  readonly className?: undefined | string;
  readonly disabled?: undefined | boolean;
  readonly onClick: () => void;
  readonly small?: undefined | boolean;
  readonly title?: undefined | string;
}): JSX.Element {
  return (
    <button
      disabled={disabled}
      className={joinClasses("Button__root", disabled && "Button__disabled", small && "Button__small", className)}
      onClick={onClick}
      title={title}
      aria-label={title}
      {...(dataTestId && { "data-test-id": dataTestId })}
    >
      {children}
    </button>
  );
}
