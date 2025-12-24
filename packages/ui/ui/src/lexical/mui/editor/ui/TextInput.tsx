import { css } from "@mui/material";
import type { HTMLInputTypeAttribute, JSX } from "react";

type Props = Readonly<{
  readonly "data-test-id"?: undefined | string;
  readonly label: string;
  readonly onChange: (val: string) => void;
  readonly placeholder?: undefined | string;
  readonly value: string;
  readonly type?: undefined | HTMLInputTypeAttribute;
}>;

let textInputIdCounter = 0;

export const TextInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}: Props): JSX.Element => {
  const id = `text-input-${++textInputIdCounter}`;
  return (
    <div className="Input__wrapper">
      <label htmlFor={id} className="Input__label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="Input__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        data-test-id={dataTestId}
      />
    </div>
  );
};

export const lexicalTextInputStyles = css`
  .Input__wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
  }

  .Input__label {
    display: flex;
    flex: 1;
    color: #666;
  }

  .Input__input {
    display: flex;
    flex: 2;
    border: 1px solid #999;
    padding: 7px 10px;
    font-size: 16px;
    border-radius: 5px;
    min-width: 0;
  }
`;
