"use client";
import { type ReactNode, useCallback, useMemo, useState } from "react";

import { ModalWrapper as Modal } from "../../components/ui/Modal";

export const useModal = () => {
  const [modalContent, setModalContent] = useState<{
    readonly content: ReactNode;
    readonly title: string;
  } | null>(null);

  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const { title, content } = modalContent;
    return (
      <Modal onClose={onClose} title={title} open={!!modalContent}>
        {content}
      </Modal>
    );
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (title: string, getContent: (onClose: () => void) => ReactNode) => {
      setModalContent({
        content: getContent(onClose),
        title,
      });
    },
    [onClose]
  );

  return [modal, showModal];
};
