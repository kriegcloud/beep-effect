import { cn } from "@beep/notes/lib/utils";

import type { TCodeBlockElement } from "platejs";

import { SlateElement, type SlateElementProps, SlateLeaf, type SlateLeafProps } from "platejs/static";

export function CodeBlockElementStatic(props: SlateElementProps<TCodeBlockElement>) {
  return (
    <SlateElement
      className={cn(
        "py-1",
        "**:[.hljs-comment,.hljs-code,.hljs-formula]:text-[#6a737d]",
        "**:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_]:text-[#d73a49]",
        "**:[.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_]:text-[#6f42c1]",
        "**:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-[#005cc5]",
        "**:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-[#032f62]",
        "**:[.hljs-built_in,.hljs-symbol]:text-[#e36209]",
        "**:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-[#22863a]",
        "**:[.hljs-emphasis]:italic",
        "**:[.hljs-strong]:font-bold",
        "**:[.hljs-section]:font-bold **:[.hljs-section]:text-[#005cc5]",
        "**:[.hljs-bullet]:text-[#735c0f]",
        "**:[.hljs-addition]:bg-[#f0fff4] **:[.hljs-addition]:text-[#22863a]",
        "**:[.hljs-deletion]:bg-[#ffeef0] **:[.hljs-deletion]:text-[#b31d28]"
      )}
      {...props}
    >
      <pre className="overflow-x-auto rounded-md bg-muted pt-[34px] pr-4 pb-8 pl-8 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
        <code>{props.children}</code>
      </pre>
    </SlateElement>
  );
}

export function CodeLineElementStatic(props: SlateElementProps) {
  return <SlateElement {...props} />;
}

export function CodeSyntaxLeafStatic(props: SlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return <SlateLeaf {...props} className={tokenClassName} />;
}
