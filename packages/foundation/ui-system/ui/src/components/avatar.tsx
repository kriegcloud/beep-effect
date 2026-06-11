"use client";

import { useAtomSubscribe, useAtomValue } from "@effect/atom-react";
import * as P from "effect/Predicate";
import { Atom } from "effect/unstable/reactivity";
import { cn } from "../lib/index.ts";
import type * as React from "react";

interface AvatarProps extends React.ComponentPropsWithoutRef<"span"> {
  readonly children?: undefined | React.ReactNode;
}

/**
 * Avatar component.
 *
 * @example
 * ```tsx
 * import { Avatar } from "@beep/ui/components/avatar"
 *
 * console.log(Avatar)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
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
  readonly onLoadingStatusChange?: ((status: "idle" | "loading" | "loaded" | "error") => void) | undefined;
  readonly src?: string | undefined;
}

type AvatarImageStatus = "idle" | "loading" | "loaded" | "error";

const avatarImageStatusAtom = Atom.family((src: string | undefined) =>
  Atom.make((get): AvatarImageStatus => {
    if (!P.isString(src) || src.length === 0) {
      return "error";
    }

    if (!P.isFunction(globalThis.Image)) {
      return "idle";
    }

    const image = new globalThis.Image();
    let disposed = false;

    image.onload = () => {
      if (!disposed) {
        get.setSelf("loaded");
      }
    };
    image.onerror = () => {
      if (!disposed) {
        get.setSelf("error");
      }
    };
    image.src = src;
    get.addFinalizer(() => {
      disposed = true;
    });

    return "loading";
  })
);

/**
 * Avatar image component.
 *
 * @example
 * ```tsx
 * import { AvatarImage } from "@beep/ui/components/avatar"
 *
 * console.log(AvatarImage)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AvatarImage({ className, src, alt, onLoadingStatusChange, ...props }: AvatarImageProps) {
  const statusAtom = avatarImageStatusAtom(src);
  const status = useAtomValue(statusAtom);

  useAtomSubscribe(statusAtom, (nextStatus) => {
    if (nextStatus === "loaded" || nextStatus === "error") {
      onLoadingStatusChange?.(nextStatus);
    }
  });

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

/**
 * Avatar fallback component.
 *
 * @example
 * ```tsx
 * import { AvatarFallback } from "@beep/ui/components/avatar"
 *
 * console.log(AvatarFallback)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
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

/**
 * @category components
 * @since 0.0.0
 */
export { Avatar, AvatarFallback, AvatarImage };
