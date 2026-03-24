import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ResponseState = "loading" | "completed" | "error";

type ResponseCardProps = {
  title: string;
  state?: ResponseState;
  children: React.ReactNode;
  className?: string;
};

const stateStyles = {
  loading: {
    container: "border-primary/30 bg-primary/10",
    dot: "bg-primary",
    badge: "border-primary/30 bg-primary/10 text-primary",
  },
  completed: {
    container: "border-primary/30 bg-primary/10",
    dot: "bg-primary",
    badge: "border-primary/30 bg-primary/10 text-primary",
  },
  error: {
    container: "border-destructive/40 bg-destructive/10",
    dot: "bg-destructive",
    badge: "border-destructive/40 bg-destructive/10 text-destructive",
  },
} as const;

const stateLabels = {
  loading: "Event Received",
  completed: "Success",
  error: "Error",
} as const;

export function ResponseCard({
  title,
  state,
  children,
  className,
}: ResponseCardProps) {
  return (
    <Card className={cn("min-h-42", className)}>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        {state && (
          <CardAction>
            <Badge
              variant={state === "error" ? "destructive" : "outline"}
              className={stateStyles[state].badge}
            >
              {stateLabels[state]}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {state ? (
          <div
            className={cn(
              "rounded-none border p-4",
              stateStyles[state].container,
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-1.5 h-2 w-2 rounded-full",
                  stateStyles[state].dot,
                )}
              />
              <div className="flex-1 text-xs text-foreground">{children}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
