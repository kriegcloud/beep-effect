"use client";

import {Alert, AlertAction, AlertDescription, AlertTitle} from "@beep/todox/components/ui/alert";
import {Button} from "@beep/todox/components/ui/button";
import {AlertCircle, RefreshCw, X} from "lucide-react";

export interface ErrorAlertProps {
  readonly title?: undefined | string;
  readonly message: string;
  readonly onRetry?: undefined | (() => void);
  readonly onDismiss?: undefined | (() => void);
  readonly className?: undefined | string;
}

export function ErrorAlert({
                             title = "Something went wrong",
                             message,
                             onRetry,
                             onDismiss,
                             className,
                           }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="size-4"/>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="w-fit gap-2">
            <RefreshCw className="size-3"/>
            Try again
          </Button>
        )}
      </AlertDescription>
      {onDismiss && (
        <AlertAction>
          <Button variant="ghost" size="icon" onClick={onDismiss} className="size-6">
            <X className="size-3"/>
            <span className="sr-only">Dismiss</span>
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
