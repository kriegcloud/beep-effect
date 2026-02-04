"use client";

import { Label } from "@beep/ui/components/label";
import { Switch } from "@beep/ui/components/switch";
import { CAN_USE_BEFORE_INPUT } from "@lexical/utils";
import type { JSX } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { useSettings } from "./context/SettingsContext";
import { INITIAL_SETTINGS, isDevPlayground } from "./settings";

function SettingSwitch({
  checked,
  onToggle,
  text,
}: Readonly<{
  readonly checked: boolean;
  readonly onToggle: () => void;
  readonly text: string;
}>): JSX.Element {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <Label htmlFor={id} className="text-sm cursor-pointer">
        {text}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

export default function Settings(): JSX.Element {
  const windowLocation = window.location;
  const {
    setOption,
    settings: {
      measureTypingPerf,
      isCollab,
      isRichText,
      hasNestedTables,
      isMaxLength,
      hasLinkAttributes,
      isCharLimit,
      isCharLimitUtf8,
      isAutocomplete,
      showTreeView,
      showNestedEditorTreeView,
      // disableBeforeInput,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      // tableHorizontalScroll,
      selectionAlwaysOnDisplay,
      isCodeHighlighted,
      isCodeShiki,
    },
  } = useSettings();
  useEffect(() => {
    if (INITIAL_SETTINGS.disableBeforeInput && CAN_USE_BEFORE_INPUT) {
      console.error(`Legacy events are enabled (disableBeforeInput) but CAN_USE_BEFORE_INPUT is true`);
    }
  }, []);
  const [showSettings, setShowSettings] = useState(false);
  const [isSplitScreen, search] = useMemo(() => {
    const parentWindow = window.parent;
    const _search = windowLocation.search;
    const _isSplitScreen = parentWindow && parentWindow.location.pathname === "/split/";
    return [_isSplitScreen, _search];
  }, [windowLocation]);

  return (
    <>
      <button
        type="button"
        id="options-button"
        data-test-id="options-button"
        className={`editor-dev-button ${showSettings ? "active" : ""}`}
        onClick={() => setShowSettings(!showSettings)}
      />
      {showSettings ? (
        <div className="switches">
          {isRichText && isDevPlayground && (
            <SettingSwitch
              onToggle={() => {
                setOption("isCollab", !isCollab);
                window.location.reload();
              }}
              checked={isCollab}
              text="Collaboration"
            />
          )}
          {isDevPlayground && (
            <SettingSwitch
              onToggle={() => {
                if (isSplitScreen) {
                  window.parent.location.href = `/${search}`;
                } else {
                  window.location.href = `/split/${search}`;
                }
              }}
              checked={isSplitScreen}
              text="Split Screen"
            />
          )}
          <SettingSwitch
            onToggle={() => setOption("measureTypingPerf", !measureTypingPerf)}
            checked={measureTypingPerf}
            text="Measure Perf"
          />
          <SettingSwitch
            onToggle={() => setOption("showTreeView", !showTreeView)}
            checked={showTreeView}
            text="Debug View"
          />
          <SettingSwitch
            onToggle={() => setOption("showNestedEditorTreeView", !showNestedEditorTreeView)}
            checked={showNestedEditorTreeView}
            text="Nested Editors Debug View"
          />
          <SettingSwitch
            onToggle={() => {
              setOption("isRichText", !isRichText);
              setOption("isCollab", false);
            }}
            checked={isRichText}
            text="Rich Text"
          />
          <SettingSwitch
            onToggle={() => {
              setOption("hasNestedTables", !hasNestedTables);
            }}
            checked={hasNestedTables}
            text="Nested Tables"
          />
          <SettingSwitch
            onToggle={() => setOption("isCharLimit", !isCharLimit)}
            checked={isCharLimit}
            text="Char Limit"
          />
          <SettingSwitch
            onToggle={() => setOption("isCharLimitUtf8", !isCharLimitUtf8)}
            checked={isCharLimitUtf8}
            text="Char Limit (UTF-8)"
          />
          <SettingSwitch
            onToggle={() => setOption("hasLinkAttributes", !hasLinkAttributes)}
            checked={hasLinkAttributes}
            text="Link Attributes"
          />
          <SettingSwitch
            onToggle={() => setOption("isMaxLength", !isMaxLength)}
            checked={isMaxLength}
            text="Max Length"
          />
          <SettingSwitch
            onToggle={() => setOption("isAutocomplete", !isAutocomplete)}
            checked={isAutocomplete}
            text="Autocomplete"
          />
          {/* <SettingSwitch
            onToggle={() => {
              setOption('disableBeforeInput', !disableBeforeInput);
              setTimeout(() => window.location.reload(), 500);
            }}
            checked={disableBeforeInput}
            text="Legacy Events"
          /> */}
          <SettingSwitch
            onToggle={() => {
              setOption("showTableOfContents", !showTableOfContents);
            }}
            checked={showTableOfContents}
            text="Table Of Contents"
          />
          <SettingSwitch
            onToggle={() => {
              setOption("shouldUseLexicalContextMenu", !shouldUseLexicalContextMenu);
            }}
            checked={shouldUseLexicalContextMenu}
            text="Use Lexical Context Menu"
          />
          <SettingSwitch
            onToggle={() => {
              setOption("shouldPreserveNewLinesInMarkdown", !shouldPreserveNewLinesInMarkdown);
            }}
            checked={shouldPreserveNewLinesInMarkdown}
            text="Preserve newlines in Markdown"
          />
          {/* <SettingSwitch
            onToggle={() => {
              setOption('tableHorizontalScroll', !tableHorizontalScroll);
            }}
            checked={tableHorizontalScroll}
            text="Tables have horizontal scroll"
          /> */}
          <SettingSwitch
            onToggle={() => {
              setOption("selectionAlwaysOnDisplay", !selectionAlwaysOnDisplay);
            }}
            checked={selectionAlwaysOnDisplay}
            text="Retain selection"
          />
          <SettingSwitch
            onToggle={() => {
              setOption("isCodeHighlighted", !isCodeHighlighted);
            }}
            checked={isCodeHighlighted}
            text="Enable Code Highlighting"
          />
          <SettingSwitch
            onToggle={() => {
              setOption("isCodeShiki", !isCodeShiki);
            }}
            checked={isCodeShiki}
            text="Use Shiki for Code Highlighting"
          />
        </div>
      ) : null}
    </>
  );
}
