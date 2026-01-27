"use client";
import { cn } from "@beep/todox/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import { TableOfContentsPlugin as LexicalTableOfContentsPlugin } from "@lexical/react/LexicalTableOfContentsPlugin";
import type { HeadingTagType } from "@lexical/rich-text";
import type { NodeKey } from "lexical";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

const MARGIN_ABOVE_EDITOR = 624;
const HEADING_WIDTH = 9;

function indent(tagName: HeadingTagType) {
  if (tagName === "h2") {
    return "ml-2.5";
  }
  if (tagName === "h3") {
    return "ml-5";
  }
}

function isHeadingAtTheTopOfThePage(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0]?.y;
  if (elementYPosition === undefined) return false;
  return elementYPosition >= MARGIN_ABOVE_EDITOR && elementYPosition <= MARGIN_ABOVE_EDITOR + HEADING_WIDTH;
}
function isHeadingAboveViewport(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0]?.y;
  if (elementYPosition === undefined) return false;
  return elementYPosition < MARGIN_ABOVE_EDITOR;
}
function isHeadingBelowTheTopOfThePage(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0]?.y;
  if (elementYPosition === undefined) return false;
  return elementYPosition >= MARGIN_ABOVE_EDITOR + HEADING_WIDTH;
}

function TableOfContentsList({
  tableOfContents,
}: {
  readonly tableOfContents: Array<TableOfContentsEntry>;
}): JSX.Element {
  const [selectedKey, setSelectedKey] = useState("");
  const selectedIndex = useRef(0);
  const [editor] = useLexicalComposerContext();

  function scrollToNode(key: NodeKey, currIndex: number) {
    editor.getEditorState().read(() => {
      const domElement = editor.getElementByKey(key);
      if (domElement !== null) {
        domElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setSelectedKey(key);
        selectedIndex.current = currIndex;
      }
    });
  }

  useEffect(() => {
    function scrollCallback() {
      if (tableOfContents.length !== 0 && selectedIndex.current < tableOfContents.length - 1) {
        let currentHeading = editor.getElementByKey(tableOfContents[selectedIndex.current]![0]);
        if (currentHeading !== null) {
          if (isHeadingBelowTheTopOfThePage(currentHeading)) {
            //On natural scroll, user is scrolling up
            while (
              currentHeading !== null &&
              isHeadingBelowTheTopOfThePage(currentHeading) &&
              selectedIndex.current > 0
            ) {
              const prevHeading = editor.getElementByKey(tableOfContents[selectedIndex.current - 1]![0]);
              if (
                prevHeading !== null &&
                (isHeadingAboveViewport(prevHeading) || isHeadingBelowTheTopOfThePage(prevHeading))
              ) {
                selectedIndex.current--;
              }
              currentHeading = prevHeading;
            }
            const prevHeadingKey = tableOfContents[selectedIndex.current]![0];
            setSelectedKey(prevHeadingKey);
          } else if (isHeadingAboveViewport(currentHeading)) {
            //On natural scroll, user is scrolling down
            while (
              currentHeading !== null &&
              isHeadingAboveViewport(currentHeading) &&
              selectedIndex.current < tableOfContents.length - 1
            ) {
              const nextHeading = editor.getElementByKey(tableOfContents[selectedIndex.current + 1]![0]);
              if (
                nextHeading !== null &&
                (isHeadingAtTheTopOfThePage(nextHeading) || isHeadingAboveViewport(nextHeading))
              ) {
                selectedIndex.current++;
              }
              currentHeading = nextHeading;
            }
            const nextHeadingKey = tableOfContents[selectedIndex.current]![0];
            setSelectedKey(nextHeadingKey);
          }
        }
      } else {
        selectedIndex.current = 0;
      }
    }
    let timerId: ReturnType<typeof setTimeout>;

    function debounceFunction(func: () => void, delay: number) {
      clearTimeout(timerId);
      timerId = setTimeout(func, delay);
    }

    function onScroll(): void {
      debounceFunction(scrollCallback, 10);
    }

    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [tableOfContents, editor]);

  return (
    <div className="text-muted-foreground fixed top-[200px] -right-9 p-2.5 w-[250px] flex flex-row justify-start z-[1] h-[300px]">
      <ul className="list-none mt-0 ml-2.5 p-0 overflow-y-auto overflow-x-hidden w-[200px] h-[220px] scrollbar-none relative before:content-[''] before:absolute before:h-[220px] before:w-1 before:-right-[10px] before:mt-1.5 before:bg-muted-foreground/30 before:rounded">
        {tableOfContents.map(([key, text, tag], index) => {
          if (index === 0) {
            return (
              <div className="ml-8 relative" key={key}>
                <div
                  className="text-foreground font-bold cursor-pointer"
                  onClick={() => scrollToNode(key, index)}
                  role="button"
                  tabIndex={0}
                >
                  {`${text}`.length > 20 ? `${text.substring(0, 20)}...` : text}
                </div>
                <br />
              </div>
            );
          }
          return (
            <div
              className={cn(
                "ml-8 relative",
                selectedKey === key &&
                  "before:content-[''] before:absolute before:inline-block before:-left-[30px] before:top-1 before:z-10 before:h-1 before:w-1 before:bg-blue-500 before:border-4 before:border-white before:rounded-full"
              )}
              key={key}
            >
              <div onClick={() => scrollToNode(key, index)} role="button" className={indent(tag)} tabIndex={0}>
                <li
                  className={cn("cursor-pointer leading-5 text-base", selectedKey === key && "text-blue-500 relative")}
                >
                  {`${text}`.length > 27 ? `${text.substring(0, 27)}...` : text}
                </li>
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
}

export default function TableOfContentsPlugin() {
  return (
    <LexicalTableOfContentsPlugin>
      {(tableOfContents) => {
        return <TableOfContentsList tableOfContents={tableOfContents} />;
      }}
    </LexicalTableOfContentsPlugin>
  );
}
