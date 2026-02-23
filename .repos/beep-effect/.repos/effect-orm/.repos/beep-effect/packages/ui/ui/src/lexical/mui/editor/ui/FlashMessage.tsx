import { css } from "@mui/material";
import type { JSX, ReactNode } from "react";
import { createPortal } from "react-dom";

export interface IFlashMessageProps {
  children: ReactNode;
}

export const FlashMessage = ({ children }: IFlashMessageProps): JSX.Element => {
  return createPortal(
    <div className="FlashMessage__overlay" role="dialog">
      <p className="FlashMessage__alert" role="alert">
        {children}
      </p>
    </div>,
    document.body
  );
};

export const lexicalFlashMessageStyles = css`
  .FlashMessage__overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    pointer-events: none;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }

  .FlashMessage__alert {
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 1.5rem;
    border-radius: 1em;
    padding: 0.5em 1.5em;
  }
`;
