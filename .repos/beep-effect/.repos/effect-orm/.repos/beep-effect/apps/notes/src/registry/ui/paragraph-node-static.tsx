import { SlateElement, type SlateElementProps } from "platejs/static";

export function ParagraphElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      className="my-px px-0.5 py-[3px]"
      style={{
        backgroundColor: props.element.backgroundColor as any,
      }}
    >
      {props.children}
    </SlateElement>
  );
}
