import type { DialogProps } from "@mui/material/Dialog";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";
import { create } from "mutative";
import React from "react";
import ConfirmContext, { type ConfirmContextValue } from "./confirm.context.ts";
import ConfirmDialog from "./confirm.dialog.tsx";
import type { ConfirmFunc, ConfirmOptions, ConfirmProviderProps, ConfirmResult, ResolvedConfirmOptions } from "./types";

type ConfirmState = {
  readonly resolve: (result: ConfirmResult) => void;
  readonly parentId: string;
};

const DEFAULT_OPTIONS: ResolvedConfirmOptions = {
  title: "Are you sure?",
  description: "",
  content: null,
  confirmationText: "Ok",
  cancellationText: "Cancel",
  dialogProps: {},
  dialogActionsProps: {},
  confirmationButtonProps: {},
  cancellationButtonProps: {},
  titleProps: {},
  contentProps: {},
  allowClose: true,
  confirmationKeywordTextFieldProps: {},
  hideCancelButton: false,
  buttonOrder: ["cancel", "confirm"] as const,
  acknowledgement: undefined,
  acknowledgementFormControlLabelProps: {} as FormControlLabelProps,
  acknowledgementCheckboxProps: {},
};

const buildOptions = (defaultOptions: ConfirmOptions, options: ConfirmOptions): ResolvedConfirmOptions =>
  create(DEFAULT_OPTIONS, (draft) => {
    const mergeInto = (target: object, source: object | undefined): void => {
      if (source !== undefined) {
        Object.assign(target, source);
      }
    };

    const applyOptions = (source: ConfirmOptions): void => {
      if (source.title !== undefined) {
        draft.title = source.title;
      }
      if (source.description !== undefined) {
        draft.description = source.description;
      }
      if (source.content !== undefined) {
        draft.content = source.content;
      }
      if (source.confirmationText !== undefined) {
        draft.confirmationText = source.confirmationText;
      }
      if (source.cancellationText !== undefined) {
        draft.cancellationText = source.cancellationText;
      }
      if (source.allowClose !== undefined) {
        draft.allowClose = source.allowClose;
      }
      if (source.confirmationKeyword !== undefined) {
        draft.confirmationKeyword = source.confirmationKeyword;
      }
      if (source.hideCancelButton !== undefined) {
        draft.hideCancelButton = source.hideCancelButton;
      }
      if (source.buttonOrder !== undefined) {
        draft.buttonOrder = source.buttonOrder;
      }
      if (source.acknowledgement !== undefined) {
        draft.acknowledgement = source.acknowledgement;
      }

      mergeInto(draft.dialogProps, source.dialogProps);
      mergeInto(draft.dialogActionsProps, source.dialogActionsProps);
      mergeInto(draft.confirmationButtonProps, source.confirmationButtonProps);
      mergeInto(draft.cancellationButtonProps, source.cancellationButtonProps);
      mergeInto(draft.titleProps, source.titleProps);
      mergeInto(draft.contentProps, source.contentProps);
      mergeInto(draft.confirmationKeywordTextFieldProps, source.confirmationKeywordTextFieldProps);
      mergeInto(draft.acknowledgementFormControlLabelProps, source.acknowledgementFormControlLabelProps);
      mergeInto(draft.acknowledgementCheckboxProps, source.acknowledgementCheckboxProps);
    };

    applyOptions(defaultOptions);
    applyOptions(options);
  });

let confirmGlobal: ConfirmFunc = () => Promise.reject<ConfirmResult>(new Error("Missing ConfirmProvider"));

const ConfirmProvider: React.FC<ConfirmProviderProps> = ({
  children,
  defaultOptions = {},
  useLegacyReturn = false,
}) => {
  // State that we clear on close (to avoid dangling references to resolve and
  // reject). If this is null, the dialog is closed.
  const [state, setState] = React.useState<ConfirmState | null>(null);
  // Options for rendering the dialog, which aren't reset on close so that we
  // keep rendering the same modal during close animation
  const [options, setOptions] = React.useState<ConfirmOptions>({});
  const [key, setKey] = React.useState<number>(0);

  const confirmBase = React.useCallback<ConfirmContextValue["confirmBase"]>(
    (parentId, optionsArg = {}) => {
      const promise = new Promise<ConfirmResult>((resolve) => {
        setKey((currentKey) => currentKey + 1);
        setOptions(optionsArg);
        setState({ resolve, parentId });
      });

      // Converts the promise into the legacy promise from v3
      if (useLegacyReturn) {
        return new Promise<ConfirmResult>((resolve, reject) => {
          promise.then((result) => {
            const { confirmed, reason } = result;

            if (confirmed && reason === "confirm") {
              resolve(result);
            }

            if (!confirmed && reason === "cancel") {
              reject(result);
            }
          });
        });
      }

      return promise;
    },
    [useLegacyReturn]
  );

  const closeOnParentUnmount = React.useCallback<ConfirmContextValue["closeOnParentUnmount"]>((parentId) => {
    setState((currentState) => {
      if (currentState && currentState.parentId === parentId) {
        currentState.resolve({ confirmed: false, reason: "unmount" });
        return null;
      }

      return currentState;
    });
  }, []);

  const handleClose = React.useCallback<NonNullable<DialogProps["onClose"]>>((_event, _reason) => {
    setState((currentState) => {
      if (currentState) {
        currentState.resolve({ confirmed: false, reason: "natural" });
      }

      return null;
    });
  }, []);

  const handleCancel = React.useCallback(() => {
    setState((currentState) => {
      if (currentState) {
        currentState.resolve({ confirmed: false, reason: "cancel" });
      }

      return null;
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    setState((currentState) => {
      if (currentState) {
        currentState.resolve({ confirmed: true, reason: "confirm" });
      }

      return null;
    });
  }, []);

  confirmGlobal = React.useCallback<ConfirmFunc>((optionsArg) => confirmBase("global", optionsArg), [confirmBase]);

  return (
    <>
      <ConfirmContext.Provider value={{ confirmBase, closeOnParentUnmount }}>{children}</ConfirmContext.Provider>
      <ConfirmDialog
        key={key}
        open={state !== null}
        options={buildOptions(defaultOptions, options ?? {})}
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default ConfirmProvider;
export { confirmGlobal as confirm };
