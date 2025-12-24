import type { JSX } from "react";
import { useCallback, useMemo, useState } from "react";

import type { UseModalReturn } from "./useModal.types";

export const useModal = (): UseModalReturn => {
  const [modalContent, setModalContent] = useState<null | {
    closeOnClickOutside: boolean;
    content: JSX.Element;
    title: string;
  }>(null);

  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { title, content, closeOnClickOutside } = modalContent;
    // Lazy import to avoid circular dependency
    const { Modal } = require("../ui/Modal") as typeof import("../ui/Modal");
    return (
      <Modal onClose={onClose} title={title} closeOnClickOutside={closeOnClickOutside}>
        {content}
      </Modal>
    );
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (title: string, getContent: (onClose: () => void) => JSX.Element, closeOnClickOutside = false) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title,
      });
    },
    [onClose]
  );

  return [modal, showModal];
};
