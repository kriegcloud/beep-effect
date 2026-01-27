"use client";

import type { JSX, ReactNode } from "react";

type Props = Readonly<{
  "data-test-id"?: undefined | string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className="flex flex-col justify-end mt-5 [&>button]:mb-5">{children}</div>;
}

export function DialogActions({ "data-test-id": dataTestId, children }: Props): JSX.Element {
  return (
    <div className="flex flex-row justify-end mt-5 gap-2" data-test-id={dataTestId}>
      {children}
    </div>
  );
}
