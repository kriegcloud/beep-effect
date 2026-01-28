"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import type { NodeKey } from "lexical";
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $isParagraphNode,
  $isTextNode,
} from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as ReactDOM from "react-dom";

import useModal from "../../hooks/useModal";
import {
  ComponentPickerMenuItem,
  type ComponentPickerOption,
  getBaseOptions,
  getDynamicOptions,
} from "../ComponentPickerPlugin";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

type PickerState = {
  readonly insertBefore: boolean;
  readonly targetNodeKey: NodeKey;
};

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export default function DraggableBlockPlugin({
  anchorElem = document.body,
}: {
  readonly anchorElem?: undefined | HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(null);
  const [pickerState, setPickerState] = useState<PickerState | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [queryString, setQueryString] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [pickerPosition, setPickerPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");
    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) => regex.test(option.title) || option.keywords.some((keyword) => regex.test(keyword))
      ),
    ];
  }, [editor, queryString, showModal]);

  useEffect(() => {
    if (isPickerOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen || !options.length) {
      return;
    }
    setHighlightedIndex((current) => Math.min(current, Math.max(options.length - 1, 0)));
  }, [isPickerOpen, options.length]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (pickerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setIsPickerOpen(false);
      setPickerState(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  const selectOption = useCallback(
    (option: ComponentPickerOption) => {
      if (!pickerState) {
        setIsPickerOpen(false);
        return;
      }
      setIsPickerOpen(false);
      editor.update(() => {
        const node = $getNodeByKey(pickerState.targetNodeKey);
        if (!node) {
          return;
        }
        const placeholder = $createParagraphNode();
        const textNode = $createTextNode("");
        placeholder.append(textNode);
        if (pickerState.insertBefore) {
          node.insertBefore(placeholder);
        } else {
          node.insertAfter(placeholder);
        }
        textNode.select();
        option.onSelect(queryString);
        const latestPlaceholder = placeholder.getLatest();
        if ($isParagraphNode(latestPlaceholder)) {
          const onlyChild = latestPlaceholder.getFirstChild();
          if (
            $isTextNode(onlyChild) &&
            onlyChild.getTextContent().length === 0 &&
            latestPlaceholder.getChildrenSize() === 1
          ) {
            latestPlaceholder.remove();
          }
        }
      });
    },
    [editor, pickerState, queryString]
  );

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPickerOpen || !options.length) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((index) => (index + 1 >= options.length ? 0 : index + 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((index) => (index - 1 < 0 ? options.length - 1 : index - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const option = options[highlightedIndex];
        if (option) {
          selectOption(option);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setIsPickerOpen(false);
        setPickerState(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex, isPickerOpen, options, selectOption]);

  function openComponentPicker(e: React.MouseEvent) {
    if (!draggableElement || !editor) {
      return;
    }

    let targetNodeKey: NodeKey | null = null;
    editor.read(() => {
      const resolvedNode = $getNearestNodeFromDOMNode(draggableElement);
      if (resolvedNode) {
        targetNodeKey = resolvedNode.getKey();
      }
    });

    if (!targetNodeKey) {
      return;
    }

    const insertBefore = e.altKey || e.ctrlKey;
    const rect = menuRef.current?.getBoundingClientRect();
    setPickerPosition(
      rect
        ? {
            left: rect.left + rect.width + window.scrollX + 8,
            top: rect.top + window.scrollY,
          }
        : null
    );
    setPickerState({ insertBefore, targetNodeKey });
    setQueryString("");
    setHighlightedIndex(0);
    setIsPickerOpen(true);
  }

  return (
    <>
      {modal}
      {isPickerOpen && pickerPosition
        ? ReactDOM.createPortal(
            <div
              className="typeahead-popover component-picker-menu max-w-[260px]"
              ref={pickerRef}
              style={{
                left: pickerPosition.left,
                position: "absolute",
                top: pickerPosition.top,
                zIndex: 10,
              }}
            >
              <input
                className="component-picker-search w-full box-border py-2 px-2.5 border-0 outline-none text-sm rounded-t-lg"
                placeholder="Filter blocks..."
                value={queryString}
                ref={searchInputRef}
                onChange={(event) => setQueryString(event.target.value)}
              />
              <ul>
                {options.map((option, i: number) => (
                  <ComponentPickerMenuItem
                    index={i}
                    isSelected={highlightedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOption(option);
                    }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    key={option.key}
                    option={option}
                  />
                ))}
              </ul>
            </div>,
            document.body
          )
        : null}
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef}
        targetLineRef={targetLineRef}
        menuComponent={
          <div
            ref={menuRef}
            className="draggable-block-menu rounded p-0.5 cursor-grab opacity-0 absolute left-0 top-0 will-change-[transform,opacity] flex gap-0.5 transition-[transform,opacity] duration-150 ease-in-out active:cursor-grabbing"
          >
            <button
              type="button"
              title="Click to add below"
              className="w-4 h-4 inline-block border-none cursor-pointer bg-transparent bg-no-repeat bg-center hover:bg-gray-200 rounded"
              style={{
                backgroundImage: "url(/lexical/images/icons/plus.svg)",
                filter: "brightness(0) saturate(100%)",
              }}
              onClick={openComponentPicker}
            />
            <div
              className="w-4 h-4 opacity-50 bg-no-repeat bg-center hover:bg-gray-200 rounded"
              style={{
                backgroundImage: "url(/lexical/images/icons/draggable-block-menu.svg)",
                filter: "brightness(0) saturate(100%)",
              }}
            />
          </div>
        }
        targetLineComponent={
          <div
            ref={targetLineRef}
            className="pointer-events-none bg-sky-500 h-1 absolute left-0 top-0 opacity-0 will-change-transform"
          />
        }
        isOnMenu={isOnMenu}
        onElementChanged={setDraggableElement}
      />
    </>
  );
}
