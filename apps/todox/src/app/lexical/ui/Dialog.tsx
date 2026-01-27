"use client";

import type { JSX } from "react";

import "./Dialog.css";

import type { ReactNode } from "react";
import * as React from "react";

type Props = Readonly<{
  "data-test-id"?: undefined | string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className="DialogButtonsList">{children}</div>;
}

export function DialogActions({ "data-test-id": dataTestId, children }: Props): JSX.Element {
  return (
    <div className="DialogActions" data-test-id={dataTestId}>
      {children}
    </div>
  );
}
