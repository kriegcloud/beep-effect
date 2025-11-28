"use client";

import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { EmojiInlineIndexSearch, insertEmoji } from "@platejs/emoji";
import { EmojiPlugin } from "@platejs/emoji/react";
import type { PlateElementProps } from "platejs/react";
import { PlateElement, usePluginOption } from "platejs/react";
import * as React from "react";

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";

export function EmojiInputElement(props: PlateElementProps) {
  const data = usePluginOption(EmojiPlugin, "data")!;
  const { children, editor, element } = props;
  const [value, setValue] = React.useState("");

  const debouncedValue = useDebounce(value, 100);
  const isPending = value !== debouncedValue;

  const filteredEmojis = React.useMemo(() => {
    if (debouncedValue.trim().length === 0) return [];

    return EmojiInlineIndexSearch.getInstance(data).search(debouncedValue.replace(/:$/, "")).get();
  }, [data, debouncedValue]);

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox value={value} element={element} filter={false} setValue={setValue} trigger=":" hideWhenNoValue>
        <InlineComboboxInput />

        <InlineComboboxContent variant="emoji">
          {!isPending && <InlineComboboxEmpty>No results</InlineComboboxEmpty>}

          <InlineComboboxGroup>
            {filteredEmojis.map((emoji) => (
              <InlineComboboxItem key={emoji.id} value={emoji.name} onClick={() => insertEmoji(editor, emoji)}>
                <div
                  style={{
                    fontFamily:
                      '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
                  }}
                >
                  {emoji.skins[0].native}
                </div>
                <div className="ml-1.5">{emoji.name}</div>
              </InlineComboboxItem>
            ))}
          </InlineComboboxGroup>
        </InlineComboboxContent>
      </InlineCombobox>

      {children}
    </PlateElement>
  );
}
