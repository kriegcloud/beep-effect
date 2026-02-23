import * as Effect from "effect/Effect";
import React from "react";
import ConfirmContext from "./ConfirmContext";
import type { ConfirmFunc, ConfirmOptions } from "./types";

let idCounter = 0;

const useConfirmId = (): string => {
  const id = React.useMemo<number>(() => {
    return idCounter++;
  }, []);

  return `confirm-${id}`;
};

export const useConfirm = (): ConfirmFunc => {
  const parentId = useConfirmId();
  const { confirmBase, closeOnParentUnmount } = React.useContext(ConfirmContext);

  const confirm = React.useCallback<ConfirmFunc>((options) => confirmBase(parentId, options), [confirmBase, parentId]);

  // When the component calling useConfirm is unmounted, we automatically
  // close the associated confirmation dialog. Note that we use a
  // unique id per each useConfirm usage, so that we don't close the
  // dialog when an unrelated component unmounts
  React.useEffect(() => {
    return () => {
      closeOnParentUnmount(parentId);
    };
  }, [closeOnParentUnmount, parentId]);

  return confirm;
};

export const useConfirmEffect = () => {
  const confirm = useConfirm();
  return (opts: ConfirmOptions) =>
    Effect.tryPromise({
      try: () => confirm(opts),
      catch: (e) => Effect.fail(new Error(`useConfirmEffect: Error while confirming: ${e}`)),
    });
};
