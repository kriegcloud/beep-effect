"use client";

import type { JSX } from "react";

import "./FlashMessage.css";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export interface FlashMessageProps {
  readonly children: ReactNode;
}

export default function FlashMessage({ children }: FlashMessageProps): JSX.Element {
  return createPortal(
    <div className="FlashMessage__overlay" role="dialog">
      <p className="FlashMessage__alert" role="alert">
        {children}
      </p>
    </div>,
    document.body
  );
}
