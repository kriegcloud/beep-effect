"use client";

import { Alert, AlertDescription, AlertTitle } from "@beep/todox/components/ui/alert";
import { LightbulbIcon } from "@phosphor-icons/react";

interface DemoCalloutProps {
  readonly title?: string;
  readonly message: string;
}

export function DemoCallout({ title, message }: DemoCalloutProps) {
  return (
    <Alert className="mb-6 bg-blue-500/10 border-blue-500/20">
      <LightbulbIcon className="size-4 text-blue-500" weight="fill" />
      {title && <AlertTitle className="text-blue-600 dark:text-blue-400">{title}</AlertTitle>}
      <AlertDescription className="text-sm text-muted-foreground">{message}</AlertDescription>
    </Alert>
  );
}
