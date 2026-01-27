"use client";

import type { JSX } from "react";

import "./Input.css";

import * as React from "react";

type Props = Readonly<{
  "data-test-id"?: undefined | string;
  accept?: undefined | string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

export default function FileInput({ accept, label, onChange, "data-test-id": dataTestId }: Props): JSX.Element {
  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>
      <input
        type="file"
        accept={accept}
        className="Input__input"
        onChange={(e) => onChange(e.target.files)}
        data-test-id={dataTestId}
      />
    </div>
  );
}
