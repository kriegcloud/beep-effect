import { css } from "@mui/material";
import type { JSX, ReactNode } from "react";

type Props = Readonly<{
  "data-test-id"?: undefined | string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className="DialogButtonsList">{children}</div>;
}

export function DialogActions({ "data-test-id": dataTestId, children }: Props): JSX.Element {
  return (
    <div className="DialogActions" data-test-id={dataTestId}>
      {children}
    </div>
  );
}

export const lexicalDialogStyles = css`
  .DialogActions {
    display: flex;
    flex-direction: row;
    justify-content: right;
    margin-top: 20px;
  }

  .DialogButtonsList {
    display: flex;
    flex-direction: column;
    justify-content: right;
    margin-top: 20px;
  }

  .DialogButtonsList button {
    margin-bottom: 20px;
  }
`;
