import type { StringTypes } from "@beep/types";
import type { CheckboxProps, FormControlLabelProps } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import type { DialogProps } from "@mui/material/Dialog";
import type { DialogActionsProps } from "@mui/material/DialogActions";
import type { DialogContentProps } from "@mui/material/DialogContent";
import type { DialogTitleProps } from "@mui/material/DialogTitle";
import type { TextFieldProps } from "@mui/material/TextField";
import type { ReactNode } from "react";

export type ConfirmButtonType = "cancel" | "confirm";

export interface ConfirmOptions {
  readonly title?: ReactNode | undefined;
  readonly titleProps?: DialogTitleProps | undefined;
  readonly description?: ReactNode | undefined;
  readonly content?: ReactNode | null | undefined;
  readonly contentProps?: DialogContentProps | undefined;
  readonly confirmationText?: ReactNode | undefined;
  readonly cancellationText?: ReactNode | undefined;
  readonly dialogProps?: Omit<DialogProps, "open"> | undefined;
  readonly dialogActionsProps?: DialogActionsProps | undefined;
  readonly confirmationButtonProps?: ButtonProps | undefined;
  readonly cancellationButtonProps?: ButtonProps | undefined;
  readonly allowClose?: boolean | undefined;
  readonly confirmationKeyword?: string | undefined;
  readonly confirmationKeywordTextFieldProps?: TextFieldProps | undefined;
  readonly hideCancelButton?: boolean | undefined;
  readonly buttonOrder?: ConfirmButtonType[] | undefined;
  readonly acknowledgement?: string | undefined;
  readonly acknowledgementFormControlLabelProps?: FormControlLabelProps | undefined;
  readonly acknowledgementCheckboxProps?: CheckboxProps | undefined;
}

export interface ConfirmProviderProps {
  readonly children: ReactNode;
  readonly defaultOptions?: ConfirmOptions | undefined;
  readonly useLegacyReturn?: boolean | undefined;
}

export type ConfirmResultReason = "confirm" | "cancel" | "natural" | "unmount";

type ConfirmResultMember<Reason extends StringTypes.NonEmptyString> = {
  readonly confirmed: boolean;
  readonly reason: Reason;
};

export type ConfirmResult =
  | ConfirmResultMember<"confirm">
  | ConfirmResultMember<"cancel">
  | ConfirmResultMember<"natural">
  | ConfirmResultMember<"unmount">;

export type ConfirmFunc = (options?: ConfirmOptions) => Promise<ConfirmResult>;

export type ResolvedConfirmOptions = ConfirmOptions & {
  readonly dialogProps: NonNullable<ConfirmOptions["dialogProps"]>;
  readonly dialogActionsProps: NonNullable<ConfirmOptions["dialogActionsProps"]>;
  readonly confirmationButtonProps: NonNullable<ConfirmOptions["confirmationButtonProps"]>;
  readonly cancellationButtonProps: NonNullable<ConfirmOptions["cancellationButtonProps"]>;
  readonly titleProps: NonNullable<ConfirmOptions["titleProps"]>;
  readonly contentProps: NonNullable<ConfirmOptions["contentProps"]>;
  readonly confirmationKeywordTextFieldProps: NonNullable<ConfirmOptions["confirmationKeywordTextFieldProps"]>;
  readonly acknowledgementFormControlLabelProps: NonNullable<ConfirmOptions["acknowledgementFormControlLabelProps"]>;
  readonly acknowledgementCheckboxProps: NonNullable<ConfirmOptions["acknowledgementCheckboxProps"]>;
  readonly buttonOrder: NonNullable<ConfirmOptions["buttonOrder"]>;
  readonly allowClose: NonNullable<ConfirmOptions["allowClose"]>;
  readonly hideCancelButton: NonNullable<ConfirmOptions["hideCancelButton"]>;
};
