"use client";

import { Button } from "@beep/ui/components/button";
import { Calendar } from "@beep/ui/components/calendar";
import { Checkbox } from "@beep/ui/components/checkbox";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/ui/components/popover";
import { cn } from "@beep/todox/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { $getNodeByKey, type NodeKey } from "lexical";
import type * as React from "react";
import type { JSX } from "react";
import { useState } from "react";

import { $isDateTimeNode, type DateTimeNodeInterface } from "./datetime-utils";

// Helper to convert DateTime.Utc to JS Date for react-day-picker
const toJsDate = (dt: DateTime.Utc): Date => new Date(DateTime.toEpochMillis(dt));

// Helper to convert JS Date to DateTime.Utc
const fromJsDate = (date: Date): DateTime.Utc => O.getOrThrow(O.map(DateTime.make(date.toISOString()), DateTime.toUtc));

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function DateTimeComponent({
  dateTime,
  nodeKey,
}: {
  readonly dateTime: DateTime.Utc | undefined;
  readonly nodeKey: NodeKey;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(dateTime);
  const [includeTime, setIncludeTime] = useState(() => {
    if (dateTime === undefined) {
      return false;
    }
    const hours = DateTime.getPartUtc(dateTime, "hours");
    const minutes = DateTime.getPartUtc(dateTime, "minutes");
    return hours !== 0 || minutes !== 0;
  });
  const [timeValue, setTimeValue] = useState(() => {
    if (dateTime === undefined) {
      return "00:00";
    }
    const hours = DateTime.getPartUtc(dateTime, "hours");
    const minutes = DateTime.getPartUtc(dateTime, "minutes");
    if (hours !== 0 || minutes !== 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
    return "00:00";
  });

  const [isNodeSelected] = useLexicalNodeSelection(nodeKey);

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

  const handleCheckboxChange = (checked: boolean) => {
    withDateTimeNode((node) => {
      if (checked) {
        setIncludeTime(true);
      } else {
        if (selected) {
          // Reset to start of day (midnight)
          const newSelectedDate = DateTime.startOf("day")(selected);
          node.setDateTime(newSelectedDate);
          setSelected(newSelectedDate);
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
      const [hours = 0, minutes = 0] = A.map(Str.split(time, ":"), (str: string) => Number.parseInt(str, 10));
      // Create new DateTime with updated hours and minutes
      const newSelectedDate = DateTime.mutate(selected, (d) => {
        d.setUTCHours(hours, minutes, 0, 0);
      });
      setSelected(newSelectedDate);
      node.setDateTime(newSelectedDate);
      setTimeValue(time);
    });
  };

  const handleDaySelect = (date: Date | undefined) => {
    withDateTimeNode((node) => {
      if (!timeValue || !date) {
        if (date) {
          const dt = fromJsDate(date);
          setSelected(dt);
        } else {
          setSelected(undefined);
        }
        return;
      }
      const [hours = 0, minutes = 0] = A.map(Str.split(timeValue, ":"), (str) => Number.parseInt(str, 10));
      // Convert JS Date to DateTime, then set hours/minutes
      const baseDt = fromJsDate(date);
      const newDt = DateTime.mutate(DateTime.startOf("day")(baseDt), (d) => {
        d.setUTCHours(hours, minutes, 0, 0);
      });
      node.setDateTime(newDt);
      setSelected(newDt);
    });
  };

  // Convert DateTime to JS Date for display with date-fns format
  const displayText = dateTime
    ? includeTime
      ? format(toJsDate(dateTime), "PPP") + ` ${timeValue}`
      : format(toJsDate(dateTime), "PPP")
    : "Pick a date";

  // Convert DateTime to JS Date for Calendar component
  const selectedJsDate = selected ? toJsDate(selected) : undefined;

  // Static date range bounds
  const startMonthDate = O.getOrThrow(O.map(DateTime.make({ year: 1925, month: 1, day: 1 }), DateTime.toUtc));
  const endMonthDate = O.getOrThrow(O.map(DateTime.make({ year: 2042, month: 8, day: 1 }), DateTime.toUtc));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-fit justify-start text-left font-normal",
              !dateTime && "text-muted-foreground",
              isNodeSelected && "ring-2 ring-primary"
            )}
          >
            <CalendarBlankIcon className="mr-2 size-4" />
            {displayText}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          captionLayout="dropdown"
          showOutsideDays={false}
          mode="single"
          selected={selectedJsDate}
          required={true}
          onSelect={handleDaySelect}
          startMonth={toJsDate(startMonthDate)}
          endMonth={toJsDate(endMonthDate)}
        />
        <div className="flex items-center gap-3 p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Checkbox id="include-time" checked={includeTime} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="include-time" className="text-sm cursor-pointer">
              Time
            </Label>
          </div>
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={!includeTime}
            className="w-auto h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">{userTimeZone}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
