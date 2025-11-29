"use client";

import { commentPlugin } from "@beep/notes/registry/components/editor/plugins/comment-kit";
import { getBlockType, setBlockType } from "@beep/notes/registry/components/editor/transforms";
import { backgroundColorItems, ColorIcon, textColorItems } from "@beep/notes/registry/ui/font-color-toolbar-button";
import { turnIntoItems } from "@beep/notes/registry/ui/turn-into-toolbar-button";
import { AIChatPlugin } from "@platejs/ai/react";
import { showCaption } from "@platejs/caption/react";
import { getDraftCommentKey } from "@platejs/comment";
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
  useBlockSelectionFragmentProp,
  useBlockSelectionNodes,
} from "@platejs/selection/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaptionsIcon,
  FilesIcon,
  type LucideProps,
  MessageSquareText,
  PaintRoller,
  RefreshCwIcon,
  Trash2,
} from "lucide-react";
import { KEYS, type TElement } from "platejs";
import { type PlateEditor, useEditorRef, useHotkeys } from "platejs/react";
import * as React from "react";

import { Input } from "./input";
import {
  type Action,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  filterMenuGroups,
  filterMenuItems,
  Menu,
  MenuContent,
  type MenuContentProps,
  MenuGroup,
  MenuItem,
  type MenuProps,
  MenuTrigger,
  useComboboxValueState,
} from "./menu";

export function BlockMenu({
  id,
  animateZoom,
  children,
  getAnchorRect,
  open: openProp,
  placement,
  store,
}: Pick<MenuProps, "open" | "placement" | "store"> &
  Pick<MenuContentProps, "animateZoom" | "getAnchorRect"> & {
    id?: undefined | string;
    children?: undefined | React.ReactNode;
  }) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const menuProps: Record<string, unknown> = {
    open: openProp ?? open,
    onOpenChange: (open: boolean) => {
      setOpen(open);

      if (!open) {
        editor.getApi(BlockMenuPlugin).blockMenu.hide();
      } else if (id) {
        editor.getApi(BlockMenuPlugin).blockMenu.show(id);
      }
    },
  };

  if (placement !== undefined) {
    menuProps.placement = placement;
  }
  if (store !== undefined) {
    menuProps.store = store;
  }
  if (children) {
    menuProps.trigger = <MenuTrigger>{children}</MenuTrigger>;
  }

  const contentProps: Record<string, unknown> = {
    autoFocusOnHide: false,
    preventBodyScroll: !children,
    portal: true,
  };

  if (animateZoom !== undefined) {
    contentProps.animateZoom = animateZoom;
  }
  if (getAnchorRect !== undefined) {
    contentProps.getAnchorRect = getAnchorRect;
  }

  return (
    <Menu {...(menuProps as any)}>
      <MenuContent {...(contentProps as any)}>
        <ComboboxContent>
          <BlockMenuInput
            onHide={() => {
              setOpen(false);
              editor.getApi(BlockMenuPlugin).blockMenu.hide();
            }}
          />
        </ComboboxContent>

        <ComboboxList>
          <ComboboxEmpty />

          <BlockMenuItems />
        </ComboboxList>
      </MenuContent>
    </Menu>
  );
}

function BlockMenuInput({ onHide }: { onHide: () => void }) {
  const editor = useEditorRef();
  const blockSelectionTf = editor.getTransforms(BlockSelectionPlugin).blockSelection;
  const [value] = useComboboxValueState();

  useHotkeys(
    "backspace",
    (e) => {
      if (value.length === 0) {
        e.preventDefault();
        blockSelectionTf.removeNodes();
        onHide();
      }
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "meta+d",
    (e) => {
      if (value.length === 0) {
        e.preventDefault();
        blockSelectionTf.duplicate();
        onHide();
      }
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "meta+j",
    () => {
      onHide();
    },
    { enableOnFormTags: true }
  );

  return (
    <ComboboxInput>
      <Input placeholder="Search actions..." />
    </ComboboxInput>
  );
}

function AIIcon(props: LucideProps) {
  return (
    <svg aria-hidden="true" fill="url(#myGradient)" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="myGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#6EB6F2" />
          <stop offset="15%" stopColor="#6EB6F2" />
          <stop offset="40%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      <path d="M161.15 362.26a40.902 40.902 0 0 0 23.78 7.52v-.11a40.989 40.989 0 0 0 37.75-24.8l17.43-53.02a81.642 81.642 0 0 1 51.68-51.53l50.57-16.44a41.051 41.051 0 0 0 20.11-15.31 40.964 40.964 0 0 0 7.32-24.19 41.077 41.077 0 0 0-8.23-23.89 41.051 41.051 0 0 0-20.68-14.54l-49.92-16.21a81.854 81.854 0 0 1-51.82-51.85L222.7 27.33A41.11 41.11 0 0 0 183.63.01c-8.54.07-16.86 2.8-23.78 7.81A41.152 41.152 0 0 0 145 27.97l-16.58 50.97c-4 11.73-10.61 22.39-19.33 31.19s-19.33 15.5-31.01 19.61l-50.54 16.24a41.131 41.131 0 0 0-15.89 10.14 41.059 41.059 0 0 0-9.69 16.17 41.144 41.144 0 0 0-1.44 18.8c.98 6.29 3.42 12.27 7.11 17.46a41.312 41.312 0 0 0 20.39 15.19l49.89 16.18a82.099 82.099 0 0 1 32.11 19.91c2.42 2.4 4.68 4.96 6.77 7.65a81.567 81.567 0 0 1 12.94 24.38l16.44 50.49a40.815 40.815 0 0 0 14.98 19.91zm218.06 143.57c-5.42-3.86-9.5-9.32-11.66-15.61l-9.33-28.64a37.283 37.283 0 0 0-8.9-14.48c-4.05-4.06-9-7.12-14.45-8.93l-28.19-9.19a32.655 32.655 0 0 1-16.24-12.06 32.062 32.062 0 0 1-5.97-18.74c.01-6.76 2.13-13.35 6.06-18.86 3.91-5.53 9.46-9.68 15.87-11.86l28.61-9.27a37.013 37.013 0 0 0 14.08-9.01c3.95-4.04 6.91-8.93 8.67-14.29l9.22-28.22a32.442 32.442 0 0 1 11.72-15.87 32.476 32.476 0 0 1 18.74-6.17c6.74-.07 13.33 1.96 18.86 5.81 5.53 3.84 9.74 9.31 12.03 15.64l9.36 28.84a36.832 36.832 0 0 0 8.94 14.34c4.05 4.03 8.97 7.06 14.39 8.87l28.22 9.19a32.44 32.44 0 0 1 16.29 11.52 32.465 32.465 0 0 1 6.47 18.87 32.458 32.458 0 0 1-21.65 31.19l-28.84 9.36a37.384 37.384 0 0 0-14.36 8.93c-4.05 4.06-7.1 9.01-8.9 14.45l-9.16 28.13A32.492 32.492 0 0 1 417 505.98a32.005 32.005 0 0 1-18.74 6.03 32.508 32.508 0 0 1-19.05-6.18z" />
    </svg>
  );
}

const GROUP = {
  ALIGN: "align",
  BACKGROUND: "background",
  COLOR: "color",
  TURN_INTO: "turn_into",
} as const;

export const blockMenuItems = {
  askAI: {
    focusEditor: false,
    icon: <AIIcon />,
    keywords: ["generate", "help", "chat"],
    label: "Ask AI",
    shortcut: "⌘+J",
    value: "askAI",
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getApi(AIChatPlugin).aiChat.show();
    },
  },
  caption: {
    icon: <CaptionsIcon />,
    keywords: ["alt"],
    label: "Caption",
    value: "caption",
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      const firstBlock = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()[0];
      if (!firstBlock) return;
      showCaption(editor, firstBlock[0] as TElement);
      editor.getApi(BlockSelectionPlugin).blockSelection.clear();
    },
  },
  comment: {
    icon: <MessageSquareText />,
    keywords: ["note", "feedback", "annotation"],
    label: "Comment",
    shortcut: "⌘+Shift+M",
    value: "comment",
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      setTimeout(() => {
        editor.getTransforms(BlockSelectionPlugin).blockSelection.select();
        editor.getTransforms(commentPlugin).comment.setDraft();
        editor.tf.collapse();
        editor.setOption(commentPlugin, "activeId", getDraftCommentKey());
        const focusPath = editor.selection?.focus.path.slice(0, 1);
        editor.setOption(commentPlugin, "commentingBlock", focusPath ?? null);
      }, 0);
    },
  },
  delete: {
    icon: <Trash2 />,
    keywords: ["remove"],
    label: "Delete",
    shortcut: "Del or Ctrl+D",
    value: "delete",
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.removeNodes();
    },
  },
  duplicate: {
    focusEditor: false,
    icon: <FilesIcon />,
    keywords: ["copy"],
    label: "Duplicate",
    shortcut: "⌘+D",
    value: "duplicate",
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.duplicate();

      editor.getApi(BlockSelectionPlugin).blockSelection.focus();
    },
  },
  [GROUP.ALIGN]: {
    component: AlignMenuItem,
    filterItems: true,
    icon: <AlignLeft />,
    items: [
      { icon: <AlignLeft />, label: "Left", value: "left" },
      { icon: <AlignCenter />, label: "Center", value: "center" },
      { icon: <AlignRight />, label: "Right", value: "right" },
    ],
    label: "Align",
    value: GROUP.ALIGN,
  },
  [GROUP.COLOR]: {
    component: ColorMenuItem,
    filterItems: true,
    icon: <PaintRoller />,
    items: [
      { group: GROUP.COLOR, items: textColorItems, label: "Text color" },
      {
        group: GROUP.BACKGROUND,
        items: backgroundColorItems,
        label: "Background color",
      },
    ],
    keywords: ["highlight", "background"],
    label: "Color",
    value: GROUP.COLOR,
  },
  [GROUP.TURN_INTO]: {
    component: TurnIntoMenuItem,
    filterItems: true,
    icon: <RefreshCwIcon />,
    items: turnIntoItems,
    label: "Turn into",
    value: GROUP.TURN_INTO,
  },
};

const orderedMenuItems = [
  {
    items: [blockMenuItems.comment],
  },
  {
    items: [blockMenuItems.askAI, blockMenuItems.delete, blockMenuItems.duplicate, blockMenuItems[GROUP.TURN_INTO]],
  },
  {
    items: [blockMenuItems[GROUP.COLOR]],
  },
];

const mediaMenuItems = [
  {
    items: [blockMenuItems.comment, blockMenuItems.caption],
  },
  {
    items: [blockMenuItems[GROUP.ALIGN]],
  },
  {
    items: [blockMenuItems.delete, blockMenuItems.duplicate],
  },
];

function BlockMenuItems() {
  const [searchValue] = useComboboxValueState();
  const selectedBlocks = useBlockSelectionNodes();
  const editor = useEditorRef();

  const menuGroups = React.useMemo(() => {
    const isMedia =
      selectedBlocks.length === 1 &&
      selectedBlocks.some((item) =>
        [KEYS.audio, KEYS.file, KEYS.img, KEYS.mediaEmbed, KEYS.video].includes(item[0].type as any)
      );

    const items = isMedia ? mediaMenuItems : orderedMenuItems;

    return filterMenuGroups(items, searchValue) || items;
  }, [selectedBlocks, searchValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <MenuGroup key={index} label={group.label}>
          {group.items?.map((item: Action) => {
            if (!item.value) return null;
            const menuItem = blockMenuItems[item.value as keyof typeof blockMenuItems];
            if (!menuItem) return null;

            if ("component" in menuItem && menuItem.component) {
              const ItemComponent = menuItem.component;

              return <ItemComponent key={item.value} />;
            }

            if ("onSelect" in menuItem) {
              const hasShortcut = "shortcut" in menuItem;
              const hasFocusEditor = "focusEditor" in menuItem;

              return (
                <MenuItem
                  key={item.value}
                  onClick={() => {
                    menuItem.onSelect?.({ editor });

                    if (!hasFocusEditor || menuItem.focusEditor !== false) {
                      editor.tf.focus();
                    }
                  }}
                  label={menuItem.label}
                  icon={menuItem.icon}
                  shortcut={hasShortcut ? menuItem.shortcut : undefined}
                />
              );
            }

            return null;
          })}
        </MenuGroup>
      ))}
    </>
  );
}

function ColorMenuItem() {
  const [searchValue] = useComboboxValueState();
  const editor = useEditorRef();

  const color = useBlockSelectionFragmentProp({
    key: KEYS.color,
    defaultValue: "inherit",
    mode: "text",
  });
  const background = useBlockSelectionFragmentProp({
    key: KEYS.backgroundColor,
    defaultValue: "transparent",
  });

  const handleColorChange = (group: string, value: string) => {
    if (group === GROUP.COLOR) {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.setNodes({ color: value });
    } else if (group === GROUP.BACKGROUND) {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.setNodes({ backgroundColor: value });
    }

    editor.getApi(BlockSelectionPlugin).blockSelection.focus();
  };

  const menuGroups = React.useMemo(() => {
    return filterMenuGroups(blockMenuItems[GROUP.COLOR].items, searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuGroups.map((menuGroup) => (
        <MenuGroup key={menuGroup.group} label={menuGroup.label}>
          {menuGroup.items?.map((item, index) => {
            if (!item.value || !menuGroup.group) return null;
            return (
              <MenuItem
                key={index}
                checked={menuGroup.group === GROUP.COLOR ? color === item.value : background === item.value}
                onClick={() => handleColorChange(menuGroup.group!, item.value!)}
                label={item.label}
                icon={<ColorIcon value={item.value} group={menuGroup.group} />}
              />
            );
          })}
        </MenuGroup>
      ))}
    </>
  );

  if (searchValue) return content;

  return (
    <Menu
      placement="right"
      trigger={<MenuTrigger label={blockMenuItems[GROUP.COLOR].label} icon={blockMenuItems[GROUP.COLOR].icon} />}
    >
      <MenuContent portal>{content}</MenuContent>
    </Menu>
  );
}

function AlignMenuItem() {
  const [searchValue] = useComboboxValueState();
  const editor = useEditorRef();
  const value = useBlockSelectionFragmentProp({
    key: "align",
    defaultValue: "left",
  });

  const menuItems = React.useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.ALIGN], searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuItems.map((item) => {
        if (!item.value) return null;
        return (
          <MenuItem
            key={item.value}
            checked={value === item.value}
            onClick={() => {
              editor.getTransforms(BlockSelectionPlugin).blockSelection.setNodes({ align: item.value });
              editor.tf.focus();
            }}
            label={item.label}
            icon={item.icon}
          />
        );
      })}
    </>
  );

  if (searchValue) return <MenuGroup label={blockMenuItems[GROUP.ALIGN].label}>{content}</MenuGroup>;

  return (
    <Menu
      placement="right"
      trigger={<MenuTrigger label={blockMenuItems[GROUP.ALIGN].label} icon={blockMenuItems[GROUP.ALIGN].icon} />}
    >
      <MenuContent portal>
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}

function TurnIntoMenuItem() {
  const editor = useEditorRef();
  const [searchValue] = useComboboxValueState();

  const value = useBlockSelectionFragmentProp({
    defaultValue: KEYS.p,
    getProp: (node) => getBlockType(node as any),
  });

  const handleTurnInto = (value: string) => {
    editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes()
      .forEach(([, path]) => {
        setBlockType(editor, value, { at: path });
      });
    editor.getApi(BlockSelectionPlugin).blockSelection.focus();
  };

  const menuItems = React.useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.TURN_INTO], searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuItems.map((item) => {
        if (!item.value) return null;
        return (
          <MenuItem
            key={item.value}
            checked={value === item.value}
            onClick={() => item.value && handleTurnInto(item.value)}
            label={item.label}
            icon={
              <div className="flex size-5 items-center justify-center rounded-sm border border-foreground/15 bg-white p-0.5 text-subtle-foreground [&_svg]:size-3">
                {item.icon}
              </div>
            }
          />
        );
      })}
    </>
  );

  if (searchValue) return <MenuGroup label={blockMenuItems[GROUP.TURN_INTO].label}>{content}</MenuGroup>;

  return (
    <Menu
      placement="right"
      trigger={
        <MenuTrigger label={blockMenuItems[GROUP.TURN_INTO].label} icon={blockMenuItems[GROUP.TURN_INTO].icon} />
      }
    >
      <MenuContent portal>
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}
