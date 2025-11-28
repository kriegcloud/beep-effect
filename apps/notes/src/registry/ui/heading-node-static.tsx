import { cva } from "class-variance-authority";
import { PathApi } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";

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

export function HeadingElementStatic({
  children,
  variant = "h1",
  ...props
}: SlateElementProps & {
  variant?: "h1" | "h2" | "h3";
}) {
  const isFirstBlock = PathApi.equals(props.api.findPath(props.element)!, [0]);

  return (
    <SlateElement as={variant} className={headingVariants({ isFirstBlock, variant })} {...props}>
      {children}
    </SlateElement>
  );
}

export function H1ElementStatic(props: SlateElementProps) {
  return <HeadingElementStatic variant="h1" {...props} />;
}

export function H2ElementStatic(props: SlateElementProps) {
  return <HeadingElementStatic variant="h2" {...props} />;
}

export function H3ElementStatic(props: SlateElementProps) {
  return <HeadingElementStatic variant="h3" {...props} />;
}
