"use client";

import type { JSX } from "react";

import "./Input.css";

import type { HTMLInputTypeAttribute } from "react";
import * as React from "react";

type Props = Readonly<{
  "data-test-id"?: undefined | string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: undefined | string;
  value: string;
  type?: undefined | HTMLInputTypeAttribute;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  "data-test-id": dataTestId,
  type = "text",
}: Props): JSX.Element {
  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>
      <input
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
}
