import { BlockSelectionPlugin } from "@platejs/selection/react";
import { useTocElement, useTocElementState } from "@platejs/toc/react";
import { cva } from "class-variance-authority";
import { PlateElement, type PlateElementProps } from "platejs/react";

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

export function TocElement(props: PlateElementProps) {
  const { editor, element } = props;
  const state = useTocElementState();
  const { props: btnProps } = useTocElement(state);
  const { headingList } = state;

  return (
    <PlateElement {...props} className="my-1">
      <div contentEditable={false}>
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={headingItemVariants({ depth: item.depth as any })}
              onClick={(e) => btnProps.onClick(e, item, "smooth")}
              aria-current
            >
              {item.title}
            </Button>
          ))
        ) : (
          <div
            className="cursor-text px-1 py-[3px] text-sm text-muted-foreground/80 select-none"
            onClick={() => {
              editor.getApi(BlockSelectionPlugin).blockSelection.set(element.id as string);
            }}
            role="button"
          >
            Add headings to display the table of contents.
          </div>
        )}
      </div>
      {props.children}
    </PlateElement>
  );
}
