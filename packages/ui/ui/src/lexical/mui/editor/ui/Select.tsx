import { css } from "@mui/material";
import type { JSX } from "react";

type SelectIntrinsicProps = JSX.IntrinsicElements["select"];

interface ISelectProps extends SelectIntrinsicProps {
  label: string;
}

export const Select = ({ children, label, className, ...other }: ISelectProps): JSX.Element => {
  return (
    <div className="Input__wrapper">
      <label style={{ marginTop: "-1em" }} className="Input__label">
        {label}
      </label>
      <select {...other} className={className || "select"}>
        {children}
      </select>
    </div>
  );
};

export const lexicalSelectStyles = css`
  select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-color: transparent;
    border: none;
    padding: 0 1em 0 0;
    margin: 0;
    font-family: inherit;
    font-size: inherit;
    cursor: inherit;
    line-height: inherit;

    z-index: 1;
    outline: none;
  }

  .select {
    min-width: 160px;
    max-width: 290px;
    border: 1px solid #393939;
    border-radius: 0.25em;
    padding: 0.25em 0.5em;
    font-size: 1rem;
    cursor: pointer;
    line-height: 1.4;
    background: linear-gradient(to bottom, #ffffff 0%, #e5e5e5 100%);
  }
`;
