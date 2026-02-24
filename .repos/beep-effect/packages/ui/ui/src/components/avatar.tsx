"use client";

import { cn } from "@beep/ui-core/utils";
import * as React from "react";

interface AvatarProps extends React.ComponentPropsWithoutRef<"span"> {
  readonly children?: undefined | React.ReactNode;
}

function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {children}
    </span>
  );
}

interface AvatarImageProps extends Omit<React.ComponentPropsWithoutRef<"img">, "src"> {
  readonly src?: string | undefined;
  readonly onLoadingStatusChange?: ((status: "idle" | "loading" | "loaded" | "error") => void) | undefined;
}

function AvatarImage({ className, src, alt, onLoadingStatusChange, ...props }: AvatarImageProps) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "loaded" | "error">("idle");
  const callbackRef = React.useRef(onLoadingStatusChange);
  callbackRef.current = onLoadingStatusChange;

  React.useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    let cancelled = false;
    const img = new globalThis.Image();
    img.src = src;
    img.onload = () => {
      if (!cancelled) {
        setStatus("loaded");
        callbackRef.current?.("loaded");
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setStatus("error");
        callbackRef.current?.("error");
      }
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (status !== "loaded") {
    return null;
  }

  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      src={src}
      alt={alt}
      {...props}
    />
  );
}

function AvatarFallback({ className, children, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full text-sm font-medium", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
