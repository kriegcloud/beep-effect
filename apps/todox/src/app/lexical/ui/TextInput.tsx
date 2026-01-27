"use client";

import type { HTMLInputTypeAttribute, JSX } from "react";
import { useId } from "react";

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
  const id = useId();
  return (
    <div className="flex flex-row items-center mb-2.5 gap-3">
      <label className="flex flex-1 text-muted-foreground text-sm" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="flex flex-[2] border border-border rounded-md py-1.5 px-2.5 text-base min-w-0 bg-background"
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
