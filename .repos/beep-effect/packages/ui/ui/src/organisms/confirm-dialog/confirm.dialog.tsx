import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import type { DialogProps } from "@mui/material/Dialog";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import React from "react";
import type { ResolvedConfirmOptions } from "./types";

interface ConfirmationDialogProps {
  readonly open: boolean;
  readonly options: ResolvedConfirmOptions;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly onClose: NonNullable<DialogProps["onClose"]>;
}

const ConfirmDialog: React.FC<ConfirmationDialogProps> = ({ open, options, onCancel, onConfirm, onClose }) => {
  const {
    title,
    description,
    content,
    confirmationText,
    cancellationText,
    dialogProps,
    dialogActionsProps,
    confirmationButtonProps,
    cancellationButtonProps,
    titleProps,
    contentProps,
    allowClose,
    confirmationKeyword,
    confirmationKeywordTextFieldProps,
    hideCancelButton,
    buttonOrder,
    acknowledgement,
    acknowledgementFormControlLabelProps,
    acknowledgementCheckboxProps,
  } = options;

  const [confirmationKeywordValue, setConfirmationKeywordValue] = React.useState("");
  const [isAcknowledged, setIsAcknowledged] = React.useState(false);

  const confirmationButtonDisabled = Boolean(
    (confirmationKeyword && confirmationKeywordValue !== confirmationKeyword) || (acknowledgement && !isAcknowledged)
  );

  const acknowledgementNode = acknowledgement ? (
    <FormControlLabel
      {...acknowledgementFormControlLabelProps}
      control={
        <Checkbox
          {...acknowledgementCheckboxProps}
          checked={isAcknowledged}
          onChange={(_, checked) => setIsAcknowledged(checked)}
        />
      }
      label={acknowledgement}
    />
  ) : null;

  const confirmationContent = confirmationKeyword ? (
    <TextField
      onChange={(event) => setConfirmationKeywordValue(event.target.value)}
      value={confirmationKeywordValue}
      fullWidth
      {...confirmationKeywordTextFieldProps}
    />
  ) : null;

  const dialogActions = F.pipe(
    buttonOrder,
    A.map((buttonType) =>
      Match.value(buttonType).pipe(
        Match.when("cancel", () =>
          hideCancelButton ? null : (
            <Button key="cancel" {...cancellationButtonProps} onClick={onCancel}>
              {cancellationText}
            </Button>
          )
        ),
        Match.when("confirm", () => (
          <Button
            key="confirm"
            color="primary"
            disabled={confirmationButtonDisabled}
            {...confirmationButtonProps}
            onClick={onConfirm}
          >
            {confirmationText}
          </Button>
        )),
        Match.exhaustive
      )
    )
  );

  return (
    <Dialog fullWidth {...dialogProps} open={open} onClose={allowClose ? onClose : undefined}>
      {title && <DialogTitle {...titleProps}>{title}</DialogTitle>}
      {content ? (
        <DialogContent {...contentProps}>
          {content}
          {confirmationContent}
          {acknowledgementNode}
        </DialogContent>
      ) : description ? (
        <DialogContent {...contentProps}>
          <DialogContentText>{description}</DialogContentText>
          {confirmationContent}
          {acknowledgementNode}
        </DialogContent>
      ) : (
        (confirmationKeyword || acknowledgementNode) && (
          <DialogContent {...contentProps}>
            {confirmationContent}
            {acknowledgementNode}
          </DialogContent>
        )
      )}
      <DialogActions {...dialogActionsProps}>{dialogActions}</DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
