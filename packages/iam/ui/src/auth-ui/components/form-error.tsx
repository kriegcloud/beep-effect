"use client";

// import { cn } from "@beep/ui-core/utils"
// import type { AuthFormClassNames } from "./auth/auth-form"
import { Alert, AlertDescription, AlertTitle } from "@beep/ui/components/alert";
import { useForm } from "@tanstack/react-form";
import { AlertCircle } from "lucide-react";

export interface FormErrorProps {
  title?: string;
  // classNames?: AuthFormClassNames
}

export function FormError({
  title,
  //                          classNames
}: FormErrorProps) {
  const { state } = useForm();

  if (!state.errors.length) return null;

  return (
    <Alert
      variant="destructive"
      //   className={cn(classNames?.error)}
    >
      <AlertCircle className="self-center" />
      <AlertTitle>{title || "Error"}</AlertTitle>
      <AlertDescription>{state.errors[0]}</AlertDescription>
    </Alert>
  );
}
