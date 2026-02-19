import { css } from "@mui/material";
import { isDOMNode } from "lexical";
import type { JSX } from "react";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const PortalImpl = ({
  onClose,
  children,
  title,
  closeOnClickOutside,
}: {
  readonly children: ReactNode;
  readonly closeOnClickOutside: boolean;
  readonly onClose: () => void;
  readonly title: string;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (modalRef.current !== null && isDOMNode(target) && !modalRef.current.contains(target) && closeOnClickOutside) {
        onClose();
      }
    };
    const modelElement = modalRef.current;
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener("click", clickOutsideHandler);
      }
    }

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onClose]);

  return (
    <div className="Modal__overlay" role="dialog">
      <div className="Modal__modal" tabIndex={-1} ref={modalRef}>
        <h2 className="Modal__title">{title}</h2>
        <button className="Modal__closeButton" aria-label="Close modal" type="button" onClick={onClose}>
          X
        </button>
        <div className="Modal__content">{children}</div>
      </div>
    </div>
  );
};

export const Modal = ({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}: {
  children: ReactNode;
  closeOnClickOutside?: undefined | boolean;
  onClose: () => void;
  title: string;
}): JSX.Element => {
  return createPortal(
    <PortalImpl onClose={onClose} title={title} closeOnClickOutside={closeOnClickOutside}>
      {children}
    </PortalImpl>,
    document.body
  );
};

export const lexicalModalStyles = css`
  .Modal__overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    flex-direction: column;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(40, 40, 40, 0.6);
    flex-grow: 0;
    flex-shrink: 1;
    z-index: 100;
  }

  .Modal__modal {
    padding: 20px;
    min-height: 100px;
    min-width: 300px;
    display: flex;
    flex-grow: 0;
    background-color: #fff;
    flex-direction: column;
    position: relative;
    box-shadow: 0 0 20px 0 #444;
    border-radius: 10px;
  }

  .Modal__title {
    color: #444;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #ccc;
  }

  .Modal__closeButton {
    border: 0;
    position: absolute;
    right: 20px;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    display: flex;
    width: 30px;
    height: 30px;
    text-align: center;
    cursor: pointer;
    background-color: #eee;
  }

  .Modal__closeButton:hover {
    background-color: #ddd;
  }

  .Modal__content {
    padding-top: 20px;
  }
`;
