import type { DialogProps } from "@mui/material/Dialog";
import type { FormControlLabelProps } from "@mui/material/FormControlLabel";
import React from "react";
import ConfirmationDialog from "./ConfirmationDialog";
import ConfirmContext, { type ConfirmContextValue } from "./ConfirmContext";
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

const buildOptions = (defaultOptions: ConfirmOptions, options: ConfirmOptions): ResolvedConfirmOptions => {
  const dialogProps = {
    ...(defaultOptions.dialogProps ?? DEFAULT_OPTIONS.dialogProps),
    ...(options.dialogProps ?? {}),
  };
  const dialogActionsProps = {
    ...(defaultOptions.dialogActionsProps ?? DEFAULT_OPTIONS.dialogActionsProps),
    ...(options.dialogActionsProps ?? {}),
  };
  const confirmationButtonProps = {
    ...(defaultOptions.confirmationButtonProps ?? DEFAULT_OPTIONS.confirmationButtonProps),
    ...(options.confirmationButtonProps ?? {}),
  };
  const cancellationButtonProps = {
    ...(defaultOptions.cancellationButtonProps ?? DEFAULT_OPTIONS.cancellationButtonProps),
    ...(options.cancellationButtonProps ?? {}),
  };
  const titleProps = {
    ...(defaultOptions.titleProps ?? DEFAULT_OPTIONS.titleProps),
    ...(options.titleProps ?? {}),
  };
  const contentProps = {
    ...(defaultOptions.contentProps ?? DEFAULT_OPTIONS.contentProps),
    ...(options.contentProps ?? {}),
  };
  const confirmationKeywordTextFieldProps = {
    ...(defaultOptions.confirmationKeywordTextFieldProps ?? DEFAULT_OPTIONS.confirmationKeywordTextFieldProps),
    ...(options.confirmationKeywordTextFieldProps ?? {}),
  };
  const acknowledgementFormControlLabelProps = {
    ...(defaultOptions.acknowledgementFormControlLabelProps ?? DEFAULT_OPTIONS.acknowledgementFormControlLabelProps),
    ...(options.acknowledgementFormControlLabelProps ?? {}),
  };
  const acknowledgementCheckboxProps = {
    ...(defaultOptions.acknowledgementCheckboxProps ?? DEFAULT_OPTIONS.acknowledgementCheckboxProps),
    ...(options.acknowledgementCheckboxProps ?? {}),
  };

  return {
    ...DEFAULT_OPTIONS,
    ...defaultOptions,
    ...options,
    dialogProps,
    dialogActionsProps,
    confirmationButtonProps,
    cancellationButtonProps,
    titleProps,
    contentProps,
    confirmationKeywordTextFieldProps,
    acknowledgementFormControlLabelProps,
    acknowledgementCheckboxProps,
  };
};

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
      <ConfirmationDialog
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
