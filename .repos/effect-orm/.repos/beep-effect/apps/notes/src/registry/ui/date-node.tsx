"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DateElement(props: PlateElementProps) {
  const { editor, element } = props;

  return (
    <PlateElement className="inline-block" {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <span className="w-fit cursor-pointer text-primary/65" contentEditable={false} draggable>
            <span className="font-semibold text-primary/45">@</span>
            {element.date ? (
              (() => {
                const today = new Date();
                const elementDate = new Date(element.date as string);
                const isToday =
                  elementDate.getDate() === today.getDate() &&
                  elementDate.getMonth() === today.getMonth() &&
                  elementDate.getFullYear() === today.getFullYear();

                const isYesterday =
                  new Date(today.setDate(today.getDate() - 1)).toDateString() === elementDate.toDateString();
                const isTomorrow =
                  new Date(today.setDate(today.getDate() + 2)).toDateString() === elementDate.toDateString();

                if (isToday) return "Today";
                if (isYesterday) return "Yesterday";
                if (isTomorrow) return "Tomorrow";

                return elementDate.toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              })()
            ) : (
              <span>Pick a date</span>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            selected={new Date(element.date as string)}
            onSelect={(date) => {
              if (!date) return;

              editor.tf.setNodes({ date: date.toDateString() }, { at: element });
            }}
            mode="single"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {props.children}
    </PlateElement>
  );
}
