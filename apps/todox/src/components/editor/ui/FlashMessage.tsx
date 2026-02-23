"use client";

import type { JSX, ReactNode } from "react";
import { createPortal } from "react-dom";

export interface FlashMessageProps {
  readonly children: ReactNode;
}

export default function FlashMessage({ children }: FlashMessageProps): JSX.Element {
  return createPortal(
    <div className="flex justify-center items-center fixed inset-0 pointer-events-none z-50" role="dialog">
      <p className="bg-black/80 text-white text-2xl rounded-2xl py-2 px-6" role="alert">
        {children}
      </p>
    </div>,
    document.body
  );
}
