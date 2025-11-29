"use client";

import { getBlockType, setBlockType } from "@beep/notes/registry/components/editor/transforms";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import {
  ChevronDownIcon,
  Code2Icon,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LightbulbIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef, useSelectionFragmentProp } from "platejs/react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export const turnIntoItems = [
  {
    icon: <PilcrowIcon />,
    keywords: ["paragraph"],
    label: "Text",
    value: KEYS.p,
  },
  {
    icon: <Heading1Icon />,
    keywords: ["title", "h1"],
    label: "Heading 1",
    value: KEYS.h1,
  },
  {
    icon: <Heading2Icon />,
    keywords: ["subtitle", "h2"],
    label: "Heading 2",
    value: KEYS.h2,
  },
  {
    icon: <Heading3Icon />,
    keywords: ["subtitle", "h3"],
    label: "Heading 3",
    value: KEYS.h3,
  },
  {
    icon: <SquareIcon />,
    keywords: ["checklist", "task", "checkbox", "[]"],
    label: "To-do list",
    value: KEYS.listTodo,
  },
  {
    icon: <ListIcon />,
    keywords: ["unordered", "ul", "-"],
    label: "Bulleted list",
    value: KEYS.ul,
  },
  {
    icon: <ListOrderedIcon />,
    keywords: ["ordered", "ol", "1"],
    label: "Numbered list",
    value: KEYS.ol,
  },
  {
    icon: <ChevronDownIcon />,
    keywords: ["collapsible", "expandable"],
    label: "Toggle list",
    value: KEYS.toggle,
  },
  {
    icon: <Code2Icon />,
    keywords: ["```"],
    label: "Code",
    value: KEYS.codeBlock,
  },
  {
    icon: <QuoteIcon />,
    keywords: ["citation", "blockquote", ">"],
    label: "Quote",
    value: KEYS.blockquote,
  },
  {
    icon: <LightbulbIcon />,
    keywords: ["highlight", "note", "important"],
    label: "Callout",
    value: KEYS.callout,
  },
  {
    icon: <Columns3Icon />,
    label: "3 columns",
    value: "action_three_columns",
  },
];

export function TurnIntoToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const value = useSelectionFragmentProp({
    defaultValue: KEYS.p,
    getProp: (node) => getBlockType(node as any),
  });
  const selectedItem = React.useMemo(
    () => turnIntoItems.find((item) => item.value === (value ?? KEYS.p)) ?? turnIntoItems[0],
    [value]
  );

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Turn into" isDropdown>
          {selectedItem?.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent className="ignore-click-outside/toolbar min-w-0" data-plate-prevent-overlay align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Turn into</DropdownMenuLabel>

            <DropdownMenuRadioGroup
              className="flex flex-col gap-0.5"
              {...(selectedItem?.value ? { value: selectedItem.value } : {})}
              onValueChange={(type) => {
                setBlockType(editor, type);
                editor.tf.focus();
              }}
            >
              {turnIntoItems.map(({ icon, label, value: itemValue }) => (
                <DropdownMenuRadioItem key={itemValue} className="min-w-[180px]" value={itemValue}>
                  <div className="mr-2 flex size-5 items-center justify-center rounded-sm border border-foreground/15 bg-white p-0.5 text-subtle-foreground [&_svg]:size-3">
                    {icon}
                  </div>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
