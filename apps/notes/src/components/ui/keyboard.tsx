"use client";

import { cn } from "@beep/notes/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@beep/notes/registry/ui/tooltip";
import { defaultsDeep } from "lodash";
import { createContext, type HTMLProps, type ReactNode, useContext } from "react";

import { ClientOnly } from "./client-only";

/*
Example Usage:

<ShortcutsProvider os="mac">
  <h3 className="font-semibold">Keyboard Shortcuts</h3>
  <div className="flex justify-between">
    <p>Undo</p>
    <KeyCombo keyNames={[Keys.Command, "z"]} />
  </div>
  <div className="flex justify-between">
    <p>Redo</p>
    <KeyCombo keyNames={[Keys.Command, Keys.Shift, "z"]} />
  </div>
  <div className="flex justify-between">
    <p>Clear Selection</p>
    <KeySymbol keyName={Keys.Escape} />
  </div>
</ShortcutsProvider>;
*/

const Keys = {
  Alt: "Alt",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  Backspace: "Backspace",
  CapsLock: "CapsLock",
  Command: "Command",
  Control: "Control",
  Delete: "Delete",
  End: "End",
  Enter: "Enter",
  Escape: "Escape",
  Fn: "Fn",
  Home: "Home",
  Insert: "Insert",
  PageDown: "PageDown",
  PageUp: "PageUp",
  Pause: "Pause",
  PrintScreen: "PrintScreen",
  Shift: "Shift",
  Space: "Space",
  Tab: "Tab",
} as const;

interface KeyData {
  label: string;
  symbols: {
    default: string;
    mac?: string;
    windows?: string;
  };
}

export const DEFAULT_KEY_MAPPINGS = {
  [Keys.Alt]: {
    label: "Alt/Option",
    symbols: { default: "Alt", mac: "⌥" },
  },
  [Keys.ArrowDown]: {
    label: "Arrow Down",
    symbols: { default: "↓" },
  },
  [Keys.ArrowLeft]: {
    label: "Arrow Left",
    symbols: { default: "←" },
  },
  [Keys.ArrowRight]: {
    label: "Arrow Right",
    symbols: { default: "→" },
  },
  [Keys.ArrowUp]: {
    label: "Arrow Up",
    symbols: { default: "↑" },
  },
  [Keys.Backspace]: {
    label: "Backspace",
    symbols: { default: "⟵", mac: "⌫" },
  },
  [Keys.CapsLock]: {
    label: "Caps Lock",
    symbols: { default: "⇪" },
  },
  [Keys.Command]: {
    label: "Command",
    symbols: { default: "Command", mac: "⌘", windows: "⊞ Win" },
  },
  [Keys.Control]: {
    label: "Control",
    symbols: { default: "Ctrl", mac: "⌃" },
  },
  [Keys.Delete]: {
    label: "Delete",
    symbols: { default: "Del", mac: "⌦" },
  },
  [Keys.End]: {
    label: "End",
    symbols: { default: "End", mac: "↘" },
  },
  [Keys.Enter]: {
    label: "Enter",
    symbols: { default: "↵", mac: "↩" },
  },
  [Keys.Escape]: {
    label: "Escape",
    symbols: { default: "Esc", mac: "⎋" },
  },
  [Keys.Fn]: {
    label: "Fn",
    symbols: { default: "Fn" }, // mac symbol for Fn not universally recognized
  },
  [Keys.Home]: {
    label: "Home",
    symbols: { default: "Home", mac: "↖" },
  },
  [Keys.Insert]: {
    label: "Insert",
    symbols: { default: "Ins" },
  },
  [Keys.PageDown]: {
    label: "Page Down",
    symbols: { default: "PgDn", mac: "⇟" },
  },
  [Keys.PageUp]: {
    label: "Page Up",
    symbols: { default: "PgUp", mac: "⇞" },
  },
  [Keys.Pause]: {
    label: "Pause/Break",
    symbols: { default: "Pause", mac: "⎉" },
  },
  [Keys.PrintScreen]: {
    label: "Print Screen",
    symbols: { default: "PrtSc" },
  },
  [Keys.Shift]: {
    label: "Shift",
    symbols: { default: "Shift", mac: "⇧" },
  },
  [Keys.Space]: {
    label: "Space",
    symbols: { default: "␣" },
  },
  [Keys.Tab]: {
    label: "Tab",
    symbols: { default: "⭾", mac: "⇥" },
  },
};

interface ShortcutsContextData {
  keyMappings: Record<string, KeyData>;
  os: "mac" | "windows";
}

const ShortcutsContext = createContext<ShortcutsContextData>({
  keyMappings: DEFAULT_KEY_MAPPINGS,
  os: "mac",
});

const useShortcutsContext = () => {
  return useContext(ShortcutsContext);
};

interface ShortcutsProviderProps {
  children: ReactNode;
  keyMappings?: Record<
    string,
    {
      label?: string;
      symbols?: {
        default?: string;
        mac?: string;
        windows?: string;
      };
    }
  >;
  os?: ShortcutsContextData["os"];
}

export const ShortcutsProvider = ({ children, keyMappings = {}, os = "mac" }: ShortcutsProviderProps) => {
  const keyMappingsWithDefaults = defaultsDeep({}, keyMappings, DEFAULT_KEY_MAPPINGS);

  return (
    <TooltipProvider>
      <ShortcutsContext.Provider value={{ keyMappings: keyMappingsWithDefaults, os }}>
        {children}
      </ShortcutsContext.Provider>
    </TooltipProvider>
  );
};

interface KeySymbolProps extends HTMLProps<HTMLDivElement> {
  keyName: string;
  disableTooltip?: boolean;
}

export const KeySymbol = ({ className, disableTooltip = false, keyName, ...otherProps }: KeySymbolProps) => {
  const context = useShortcutsContext();
  const keyMappings = context.keyMappings;
  const os = context.os || "default";
  const keyData = keyMappings[keyName];
  const symbol = keyData?.symbols?.[os] ?? keyData?.symbols?.default ?? keyName;
  const label = keyData?.label ?? keyName;

  const trigger = (
    <div
      className={cn(
        "flex h-5 w-fit min-w-5 items-center justify-center rounded-md border border-foreground/20 px-1 text-xs text-subtle-foreground",
        className
      )}
      {...otherProps}
    >
      <span>{symbol}</span>
    </div>
  );

  return (
    <ClientOnly fallback={trigger}>
      <Tooltip delayDuration={300}>
        <TooltipTrigger>{trigger}</TooltipTrigger>

        {!disableTooltip && label !== symbol && <TooltipContent className="px-2 py-1">{label}</TooltipContent>}
      </Tooltip>
    </ClientOnly>
  );
};

interface KeyComboProps extends HTMLProps<HTMLDivElement> {
  keyNames: string[];
  disableTooltips?: boolean;
}

export const KeyCombo = ({ className, disableTooltips = false, keyNames, ...otherProps }: KeyComboProps) => {
  return (
    <div className={cn("flex gap-1", className)} {...otherProps}>
      {keyNames.map((keyName) => (
        <KeySymbol key={keyName} disableTooltip={disableTooltips} keyName={keyName} />
      ))}
    </div>
  );
};
