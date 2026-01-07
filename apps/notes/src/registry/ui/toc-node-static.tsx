import { BaseTocPlugin, type Heading, isHeading } from "@platejs/toc";
import { cva } from "class-variance-authority";
import { KEYS, NodeApi, type SlateEditor, type TElement } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";

import { Button } from "./button";

const headingItemVariants = cva(
  "block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-muted-foreground",
  {
    variants: {
      depth: {
        1: "pl-0.5",
        2: "pl-[26px]",
        3: "pl-[50px]",
      },
    },
  }
);

export function TocElementStatic(props: SlateElementProps) {
  const { editor } = props;
  const headingList = getHeadingList(editor);

  return (
    <SlateElement {...props} className="mb-1 p-0">
      <div>
        {headingList.length > 0 ? (
          headingList.map((item) => (
            {/* biome-ignore lint/suspicious/noExplicitAny: CVA depth variant type mismatch */}
            <Button key={item.title} variant="ghost" className={headingItemVariants({ depth: item.depth as any })}>
              {item.title}
            </Button>
          ))
        ) : (
          <div className="text-sm text-gray-500">Create a heading to display the table of contents.</div>
        )}
      </div>
      {props.children}
    </SlateElement>
  );
}

const headingLevels = {
  [KEYS.h1]: 1,
  [KEYS.h2]: 2,
  [KEYS.h3]: 3,
  [KEYS.h4]: 4,
  [KEYS.h5]: 5,
  [KEYS.h6]: 6,
};

const getHeadingList = (editor?: SlateEditor) => {
  if (!editor) return [];

  const options = editor.getOptions(BaseTocPlugin);

  if (options.queryHeading) {
    return options.queryHeading(editor);
  }

  const headingList: Heading[] = [];

  const values = editor.api.nodes({
    at: [],
    match: (n) => isHeading(n),
  });

  if (!values) return [];

  Array.from(values, ([node, path]) => {
    const { type } = node as TElement;
    const title = NodeApi.string(node);
    const depth = headingLevels[type as keyof typeof headingLevels]!;
    const id = node.id as string;
    title && headingList.push({ id, depth, path, title, type });
  });

  return headingList;
};
