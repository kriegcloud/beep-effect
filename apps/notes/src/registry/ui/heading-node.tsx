"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { PathApi } from "platejs";
import type { PlateElementProps } from "platejs/react";
import { PlateElement } from "platejs/react";

const headingVariants = cva("relative mb-1 px-0.5 py-[3px] leading-[1.3]! font-semibold", {
  variants: {
    isFirstBlock: {
      false: "",
      true: "mt-0!",
    },
    variant: {
      h1: "mt-8 text-[1.875em]",
      h2: "mt-[1.4em] text-[1.5em]",
      h3: "mt-[1em] text-[1.25em]",
    },
  },
});

export function HeadingElement({
  attributes,
  variant = "h1",
  ...props
}: PlateElementProps & VariantProps<typeof headingVariants>) {
  const isFirstBlock = PathApi.equals(props.path, [0]);

  return (
    <PlateElement
      as={variant!}
      className={headingVariants({ isFirstBlock, variant })}
      attributes={{
        id: props.element.id as string,
        ...attributes,
      }}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export function H1Element(props: PlateElementProps) {
  return <HeadingElement variant="h1" {...props} />;
}

export function H2Element(props: PlateElementProps) {
  return <HeadingElement variant="h2" {...props} />;
}

export function H3Element(props: PlateElementProps) {
  return <HeadingElement variant="h3" {...props} />;
}
