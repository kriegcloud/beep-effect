"use client";

import type { JSX } from "react";

import "./Select.css";

import * as React from "react";

type SelectIntrinsicProps = JSX.IntrinsicElements["select"];
interface SelectProps extends SelectIntrinsicProps {
  readonly label: string;
}

export default function Select({ children, label, className, ...other }: SelectProps): JSX.Element {
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
}
