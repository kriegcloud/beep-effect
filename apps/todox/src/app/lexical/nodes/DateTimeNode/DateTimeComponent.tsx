"use client";

import type { JSX } from "react";

import "react-day-picker/style.css";

import { cn } from "@beep/todox/lib/utils";
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { setHours, setMinutes } from "date-fns";
import { $getNodeByKey, type NodeKey } from "lexical";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

import { $isDateTimeNode, type DateTimeNodeInterface } from "./datetime-utils";

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function DateTimeComponent({
  dateTime,
  nodeKey,
}: {
  readonly dateTime: Date | undefined;
  readonly nodeKey: NodeKey;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [selected, setSelected] = useState(dateTime);
  const [includeTime, setIncludeTime] = useState(() => {
    if (dateTime === undefined) {
      return false;
    }
    const hours = dateTime?.getHours();
    const minutes = dateTime?.getMinutes();
    return hours !== 0 || minutes !== 0;
  });
  const [timeValue, setTimeValue] = useState(() => {
    if (dateTime === undefined) {
      return "00:00";
    }
    const hours = dateTime?.getHours();
    const minutes = dateTime?.getMinutes();
    if (hours !== 0 || minutes !== 0) {
      return `${hours?.toString().padStart(2, "0")}:${minutes?.toString().padStart(2, "0")}`;
    }
    return "00:00";
  });

  const [isNodeSelected, _setNodeSelected, _clearNodeSelection] = useLexicalNodeSelection(nodeKey);

  const { refs, floatingStyles, context } = useFloating({
    elements: {
      reference: ref.current,
    },
    middleware: [
      offset(5),
      flip({
        fallbackPlacements: ["top-start"],
      }),
      shift({ padding: 10 }),
    ],
    onOpenChange: setIsOpen,
    open: isOpen,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const role = useRole(context, { role: "dialog" });
  const dismiss = useDismiss(context);

  const { getFloatingProps } = useInteractions([role, dismiss]);

  useEffect(() => {
    const dateTimePillRef = ref.current as HTMLElement | null;
    function onClick(e: MouseEvent) {
      e.preventDefault();
      setIsOpen(true);
    }

    if (dateTimePillRef) {
      dateTimePillRef.addEventListener("click", onClick);
    }

    return () => {
      if (dateTimePillRef) {
        dateTimePillRef.removeEventListener("click", onClick);
      }
    };
  }, [refs, editor]);

  const withDateTimeNode = (cb: (node: DateTimeNodeInterface) => void, onUpdate?: () => void): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if ($isDateTimeNode(node)) {
          cb(node);
        }
      },
      { onUpdate }
    );
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    withDateTimeNode((node) => {
      if (e.target.checked) {
        setIncludeTime(true);
      } else {
        if (selected) {
          const newSelectedDate = setHours(setMinutes(selected, 0), 0);
          node.setDateTime(newSelectedDate);
        }
        setIncludeTime(false);
        setTimeValue("00:00");
      }
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    withDateTimeNode((node) => {
      const time = e.target.value;
      if (!selected) {
        setTimeValue(time);
        return;
      }
      const [hours = 0, minutes = 0] = time.split(":").map((str: string) => Number.parseInt(str, 10));
      const newSelectedDate = setHours(setMinutes(selected, minutes), hours);
      setSelected(newSelectedDate);
      node.setDateTime(newSelectedDate);
      setTimeValue(time);
    });
  };

  const handleDaySelect = (date: Date | undefined) => {
    withDateTimeNode((node) => {
      if (!timeValue || !date) {
        setSelected(date);
        return;
      }
      const [hours, minutes] = timeValue.split(":").map((str) => Number.parseInt(str, 10));
      const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
      node.setDateTime(newDate);
      setSelected(newDate);
    });
  };

  return (
    <div
      className={cn(
        "bg-muted border border-border rounded-lg px-1 cursor-pointer w-fit hover:bg-muted/50",
        isNodeSelected && "outline outline-2 outline-blue-400"
      )}
      ref={ref}
    >
      {dateTime?.toDateString() + (includeTime ? ` ${timeValue}` : "") || "Invalid Date"}
      {isOpen && (
        <FloatingPortal>
          <FloatingOverlay lockScroll={true}>
            <FloatingFocusManager context={context} initialFocus={-1}>
              <div
                className="bg-background border border-border shadow-lg rounded-lg py-0 px-1.5 pr-2.5"
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
              >
                <DayPicker
                  captionLayout="dropdown"
                  navLayout="after"
                  fixedWeeks={false}
                  showOutsideDays={false}
                  mode="single"
                  selected={selected}
                  required={true}
                  // timeZone="BST" TODO: Support time zone selection
                  onSelect={handleDaySelect}
                  startMonth={new Date(1925, 0)}
                  endMonth={new Date(2042, 7)}
                />
                <form style={{ marginBlockEnd: "1em" }}>
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "300px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="option1"
                      name="option1"
                      value="value1"
                      checked={includeTime}
                      onChange={handleCheckboxChange}
                    />
                    <label>
                      <input type="time" value={timeValue} onChange={handleTimeChange} disabled={!includeTime} />
                    </label>
                    <span> {userTimeZone}</span>
                  </div>
                </form>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </div>
  );
}
