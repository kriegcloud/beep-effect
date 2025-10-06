import { CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import type React from "react";
import { useFormContext } from "./useAppForm";

export type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  children?: React.ReactNode;
};

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit] as const}>
      {([isSubmitting, canSubmit]) => (
        <Button {...props} type={"submit"} disabled={!canSubmit}>
          {isSubmitting ? (
            <CircularProgress size={16} sx={{ color: "inherit" }} />
          ) : props.children ? (
            props.children
          ) : (
            "Submit"
          )}
        </Button>
      )}
    </form.Subscribe>
  );
};

export default SubmitButton;
