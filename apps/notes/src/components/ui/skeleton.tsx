"use client";

import { cn } from "@beep/notes/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/[.04]", className)} {...props} />;
}

export const WithSkeleton = ({
  children,
  className,
  isLoading,
  ...props
}: React.ComponentProps<"div"> & { readonly isLoading: boolean }) => {
  return (
    <div className={cn("relative w-fit", className)} {...props}>
      {children}
      {isLoading && (
        <>
          <div className={cn("absolute inset-0 bg-background", className)} />
          <Skeleton className={cn("absolute inset-0", className)} />
        </>
      )}
    </div>
  );
};
