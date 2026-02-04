"use client";

import { Button } from "@beep/ui/components/button";
import { Input } from "@beep/ui/components/input";
import { CircleNotchIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

interface QueryInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly isLoading: boolean;
  readonly placeholder?: undefined | string;
}

export default function QueryInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Ask a question about extracted entities...",
}: QueryInputProps) {
  const isSubmitDisabled = isLoading || !value.trim();

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !isLoading && value.trim()) {
            event.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1"
      />
      <Button onClick={onSubmit} disabled={isSubmitDisabled}>
        {isLoading ? (
          <>
            <CircleNotchIcon className="mr-2 size-4 animate-spin" />
            Searching
          </>
        ) : (
          <>
            <MagnifyingGlassIcon className="mr-2 size-4" />
            Search
          </>
        )}
      </Button>
    </div>
  );
}
