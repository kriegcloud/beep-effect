"use client";

import type { JSX } from "react";
import { useId } from "react";

type Props = Readonly<{
  "data-test-id"?: undefined | string;
  accept?: undefined | string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

export default function FileInput({ accept, label, onChange, "data-test-id": dataTestId }: Props): JSX.Element {
  const id = useId();
  return (
    <div className="flex flex-row items-center mb-2.5 gap-3">
      <label className="flex flex-1 text-muted-foreground text-sm" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="flex flex-[2] border border-border rounded-md py-1.5 px-2.5 text-base min-w-0 bg-background file:border-0 file:bg-transparent file:text-sm file:font-medium"
        onChange={(e) => onChange(e.target.files)}
        data-test-id={dataTestId}
      />
    </div>
  );
}
