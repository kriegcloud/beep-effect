import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import React from "react";
import ConfirmContext from "./confirm.context.ts";
import type { ConfirmFunc, ConfirmOptions } from "./types";

let idCounter = 0;

const useConfirmId = (): string => {
  const id = React.useMemo<number>(() => {
    return idCounter++;
  }, []);

  return `confirm-${id}`;
};

export const useConfirmHook = (): ConfirmFunc => {
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

/** Tagged error for confirmation dialog failures. */
class ConfirmError extends Data.TaggedError("ConfirmError")<{
  readonly message: string;
}> {}

export const useConfirmEffect = () => {
  const confirm = useConfirmHook();
  return (opts: ConfirmOptions) =>
    Effect.tryPromise({
      try: () => confirm(opts),
      catch: (e) => new ConfirmError({ message: `useConfirmEffect: Error while confirming: ${e}` }),
    });
};
