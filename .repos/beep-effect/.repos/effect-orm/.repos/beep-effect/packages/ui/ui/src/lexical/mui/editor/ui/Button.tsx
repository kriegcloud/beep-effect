import { css, Button as MUIButton } from "@mui/material";
import type { JSX, ReactNode } from "react";

import { joinClasses } from "../utils";

export const Button = ({
  "data-test-id": dataTestId,
  children,
  className,
  onClick,
  disabled,
  small,
  title,
}: {
  "data-test-id"?: undefined | string;
  children: ReactNode;
  className?: undefined | string;
  disabled?: undefined | boolean;
  onClick: () => void;
  small?: undefined | boolean;
  title?: undefined | string;
}): JSX.Element => {
  return (
    <MUIButton
      disabled={Boolean(disabled)}
      className={joinClasses("Button__root", disabled && "Button__disabled", small && "Button__small", className)}
      onClick={onClick}
      title={title}
      aria-label={title}
      {...(dataTestId && { "data-test-id": dataTestId })}
    >
      {children}
    </MUIButton>
  );
};

export const buttonStyles = css`
  .Button__root {
    padding: 10px 15px;
    border: 0;
    background-color: #eee;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  }

  .Button__root:hover {
    background-color: #ddd;
  }

  .Button__small {
    padding: 5px 10px;
    font-size: 13px;
  }

  .Button__disabled {
    cursor: not-allowed;
  }

  .Button__disabled:hover {
    background-color: #eee;
  }
`;
