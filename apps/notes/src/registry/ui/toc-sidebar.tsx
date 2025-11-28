"use client";

import { cn } from "@beep/notes/lib/utils";

import { type TocSideBarProps, useTocSideBar, useTocSideBarState } from "@platejs/toc/react";
import { cva } from "class-variance-authority";

import { Button } from "./button";
import { popoverVariants } from "./popover";

const tocSidebarButtonVariants = cva("block h-auto w-full rounded-sm p-0 text-left", {
  variants: {
    active: {
      false: "text-muted-foreground hover:text-foreground",
      true: "text-brand hover:text-brand",
    },
    depth: {
      1: "pl-0",
      2: "pl-3",
      3: "pl-6",
    },
  },
});

export function TocSidebar({
  className,
  maxShowCount = 20,
  ...props
}: TocSideBarProps & { className?: string; maxShowCount?: number }) {
  const state = useTocSideBarState({
    ...props,
  });
  const { activeContentId, headingList, open } = state;
  const { navProps, onContentClick } = useTocSideBar(state);

  return (
    <div className={cn("sticky top-0 right-0 z-5", className)}>
      <div className={cn("group absolute top-0 right-0 z-10 max-h-[400px]")}>
        <div className="relative z-10 mr-2.5 flex flex-col justify-center pr-2 pb-3">
          <div className={cn("flex flex-col gap-3 pb-3 pl-5")}>
            {headingList.slice(0, maxShowCount).map((item) => (
              <div key={item.id}>
                <div
                  className={cn("h-0.5 rounded-xs bg-primary/20", activeContentId === item.id && "bg-primary")}
                  style={{
                    marginLeft: `${4 * (item.depth - 1)}px`,
                    width: `${16 - 4 * (item.depth - 1)}px`,
                  }}
                />
              </div>
            ))}
          </div>

          <nav
            className={cn(
              "absolute -top-2.5 right-0 px-2.5 transition-all duration-300",
              "pointer-events-none translate-x-[10px] opacity-0",
              "group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100",
              "touch:opacity-100 touch:translate-x-0 touch:pointer-events-auto",
              headingList.length === 0 && "hidden"
            )}
            aria-label="Table of contents"
            {...navProps}
          >
            <div
              id="toc_wrap"
              className={cn(popoverVariants(), "-mr-2.5 max-h-96 w-[242px] scroll-m-1 overflow-auto rounded-2xl p-3")}
            >
              <div className={cn("relative z-10 p-1.5", !open && "hidden")}>
                {headingList.map((item, index) => {
                  const isActive = activeContentId ? activeContentId === item.id : index === 0;

                  return (
                    <Button
                      id={isActive ? "toc_item_active" : "toc_item"}
                      key={index}
                      variant="ghost"
                      className={cn(
                        tocSidebarButtonVariants({
                          active: isActive,
                          depth: item.depth as any,
                        })
                      )}
                      onClick={(e) => onContentClick(e, item, "smooth")}
                      aria-current={isActive}
                    >
                      <div className="p-1">{item.title}</div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
