/**
 * `/` slash and `@` mention typeahead menus, both built on Lexical's official
 * {@link LexicalTypeaheadMenuPlugin} (the canonical trigger-character primitive
 * that underlies both). The shared {@link LexicalMenu} delegate already supplies
 * the WAI-ARIA combobox keyboard contract (Down/Up/Enter/Escape with focus
 * staying in the editor and the active option tracked via `aria-activedescendant`
 * on the editor root). Each rendered option carries `role="option"` and the
 * `typeahead-item-${index}` id the delegate points `aria-activedescendant` at.
 * {@link ComboboxAriaPlugin} completes the pattern by marking the editor root as
 * `role="combobox"`.
 *
 * Per the repo atom-first law the per-editor query/options/request state and the
 * combobox-ARIA root-listener registration are `@effect/atom` families keyed by
 * the `LexicalEditor` (no `useState`/`useEffect`/`useMemo`/`useRef`); the
 * menu-open booleans are written into the shared {@link menusOpenAtom}.
 *
 * @packageDocumentation \@beep/editor/chat/typeahead
 * @since 0.0.0
 */

import { cn } from "@beep/ui/lib/utils";
import { A } from "@beep/utils";
import { RegistryContext, useAtom, useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { Atom } from "effect/unstable/reactivity";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";
import { useContext } from "react";
import { createPortal } from "react-dom";
import { anyMenuOpenAtom, menusOpenAtom } from "./atoms.ts";
import type { MenuRenderFn } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { LexicalEditor } from "lexical";
import type { ReactNode, RefObject } from "react";
import type { MentionOption, MentionSource, SlashItem } from "./config.ts";

class SlashMenuOption extends MenuOption {
  readonly item: SlashItem;
  constructor(item: SlashItem) {
    super(item.key);
    this.item = item;
  }
}

class MentionMenuOption extends MenuOption {
  readonly option: MentionOption;
  constructor(option: MentionOption) {
    super(option.id);
    this.option = option;
  }
}

// Whether a slash item matches the (already trimmed + lowercased) query across
// its label, hint, or keywords. Extracted so the filter predicate reads as one
// named match rather than an inline conditional chain.
const slashItemMatchesQuery = (item: SlashItem, q: string): boolean =>
  item.label.toLowerCase().includes(q) ||
  (item.hint?.toLowerCase().includes(q) ?? false) ||
  A.some(item.keywords ?? [], (keyword) => keyword.toLowerCase().includes(q));

const filterSlashItems = (items: ReadonlyArray<SlashItem>, query: string): ReadonlyArray<SlashItem> => {
  const q = query.trim().toLowerCase();
  if (q === "") return items;
  return A.filter(items, (item) => slashItemMatchesQuery(item, q));
};

// Per-editor `/` query text. Writable; the typeahead writes the live query.
const slashQueryAtom = Atom.family((_editor: LexicalEditor) => Atom.make<string>(""));

// Per-editor `@` mention options resolved from the app source.
const mentionOptionsAtom = Atom.family((_editor: LexicalEditor) => Atom.make<ReadonlyArray<MentionMenuOption>>([]));

// Per-editor monotonic mention-request id, so stale async responses are dropped.
const mentionRequestIdAtom = Atom.family((_editor: LexicalEditor) => Atom.make<number>(0));

interface MenuListProps<TOption extends MenuOption> {
  readonly anchorElementRef: RefObject<HTMLElement | null>;
  readonly options: Array<TOption>;
  readonly renderItem: (option: TOption) => ReactNode;
  readonly selectedIndex: number | null;
  readonly selectOptionAndCleanUp: (option: TOption) => void;
  readonly setHighlightedIndex: (index: number) => void;
}

/**
 * Renders the open typeahead as a `listbox` portal anchored under the trigger.
 * Each row is a `role="option"` with the `typeahead-item-${index}` id the
 * Lexical menu delegate references through `aria-activedescendant`, and registers
 * its element via `option.setRefElement` so scroll-into-view works. `mousedown`
 * is prevented so clicking an option never steals focus from the editor.
 */
function TypeaheadMenuList<TOption extends MenuOption>({
  anchorElementRef,
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
  renderItem,
}: MenuListProps<TOption>): ReactNode {
  if (anchorElementRef.current === null || A.isReadonlyArrayEmpty(options)) {
    return null;
  }
  return createPortal(
    <div
      role="listbox"
      className="bg-popover text-popover-foreground z-50 mt-1 max-h-72 w-64 overflow-auto rounded-md border p-1 shadow-md"
    >
      {A.map(options, (option, index) => (
        <div
          key={option.key}
          id={`typeahead-item-${index}`}
          role="option"
          aria-selected={selectedIndex === index}
          ref={(element) => option.setRefElement(element)}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
            selectedIndex === index ? "bg-accent text-accent-foreground" : "text-foreground"
          )}
          onMouseEnter={() => setHighlightedIndex(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => selectOptionAndCleanUp(option)}
        >
          {renderItem(option)}
        </div>
      ))}
    </div>,
    anchorElementRef.current
  );
}

interface SlashPluginProps {
  readonly items: ReadonlyArray<SlashItem>;
}

/**
 * The `/` command typeahead. Items are app-injected; on select the typed
 * `/query` text is removed and the item mutates the current selection. Tracks
 * its open state in the shared {@link menusOpenAtom}.
 *
 * @example
 * ```tsx
 * import { SlashPlugin, defaultChatSlashItems } from "@beep/editor/chat"
 *
 * function SlashCommands() {
 *   return <SlashPlugin items={defaultChatSlashItems} />
 * }
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function SlashPlugin({ items }: SlashPluginProps): ReactNode {
  const [editor] = useLexicalComposerContext();
  const [query, setQuery] = useAtom(slashQueryAtom(editor));
  const setMenus = useAtomSet(menusOpenAtom(editor));
  const triggerFn = useBasicTypeaheadTriggerMatch("/", { minLength: 0 });

  const options = A.map(filterSlashItems(items, query), (item) => new SlashMenuOption(item));

  const onSelectOption = (
    selectedOption: SlashMenuOption,
    nodeToRemove: ReturnType<typeof $createTextNode> | null,
    closeMenu: () => void
  ): void => {
    editor.update(() => nodeToRemove?.remove());
    selectedOption.item.onSelect(editor);
    closeMenu();
  };

  const menuRenderFn: MenuRenderFn<SlashMenuOption> = (anchorElementRef, itemProps) => (
    <TypeaheadMenuList
      anchorElementRef={anchorElementRef}
      options={itemProps.options}
      selectedIndex={itemProps.selectedIndex}
      selectOptionAndCleanUp={itemProps.selectOptionAndCleanUp}
      setHighlightedIndex={itemProps.setHighlightedIndex}
      renderItem={(option) => (
        <>
          {option.item.icon}
          <span className="flex-1 truncate">{option.item.label}</span>
          {option.item.hint !== undefined ? (
            <span className="text-muted-foreground text-xs">{option.item.hint}</span>
          ) : null}
        </>
      )}
    />
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashMenuOption>
      options={options}
      onQueryChange={(matching) => setQuery(matching ?? "")}
      onSelectOption={onSelectOption}
      onOpen={() => setMenus((s) => ({ ...s, slash: true }))}
      onClose={() => setMenus((s) => ({ ...s, slash: false }))}
      triggerFn={triggerFn}
      menuRenderFn={menuRenderFn}
    />
  );
}

interface MentionPluginProps {
  readonly source: MentionSource;
}

/**
 * The `@` mention typeahead. Candidates come from an app-injected source; on
 * select the mention is inserted as ephemeral plain text (`@label`), never a
 * persisted node, so the emitted state stays within the v1 schema vocabulary.
 * Tracks its open state in the shared {@link menusOpenAtom}.
 *
 * @example
 * ```tsx
 * import { MentionOption, MentionPlugin } from "@beep/editor/chat"
 *
 * function PeopleMentions() {
 *   return (
 *     <MentionPlugin
 *       source={(query) => [MentionOption.make({ id: query, label: query })]}
 *     />
 *   )
 * }
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function MentionPlugin({ source }: MentionPluginProps): ReactNode {
  const [editor] = useLexicalComposerContext();
  const registry = useContext(RegistryContext);
  const options = useAtomValue(mentionOptionsAtom(editor));
  const setOptions = useAtomSet(mentionOptionsAtom(editor));
  const setRequestId = useAtomSet(mentionRequestIdAtom(editor));
  const setMenus = useAtomSet(menusOpenAtom(editor));
  const triggerFn = useBasicTypeaheadTriggerMatch("@", { minLength: 0 });

  const onQueryChange = (matching: string | null): void => {
    // Allocate the next request id off the latest committed value (read via the
    // registry) so rapid keystrokes never reuse an id (replaces the original
    // `useRef` counter). Neither the allocation nor the staleness check is a side
    // effect inside an atom updater.
    const id = registry.get(mentionRequestIdAtom(editor)) + 1;
    setRequestId(id);
    const isLatest = (): boolean => id === registry.get(mentionRequestIdAtom(editor));
    // Invoke `source` *inside* the chain so a synchronous throw rejects the
    // promise (and hits `.catch`) instead of escaping the interaction path.
    Promise.resolve()
      .then(() => source(matching ?? ""))
      .then((results) => {
        // Drop a stale response: only the most-recent request wins.
        if (isLatest()) setOptions(A.map(results, (option) => new MentionMenuOption(option)));
      })
      .catch(() => {
        if (isLatest()) setOptions([]);
      });
  };

  const onSelectOption = (
    selectedOption: MentionMenuOption,
    nodeToReplace: ReturnType<typeof $createTextNode> | null,
    closeMenu: () => void
  ): void => {
    editor.update(() => {
      const textNode = $createTextNode(`@${selectedOption.option.label} `);
      if (nodeToReplace !== null) {
        nodeToReplace.replace(textNode);
      } else {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) selection.insertNodes([textNode]);
      }
      textNode.selectEnd();
    });
    closeMenu();
  };

  const menuRenderFn: MenuRenderFn<MentionMenuOption> = (anchorElementRef, itemProps) => (
    <TypeaheadMenuList
      anchorElementRef={anchorElementRef}
      options={itemProps.options}
      selectedIndex={itemProps.selectedIndex}
      selectOptionAndCleanUp={itemProps.selectOptionAndCleanUp}
      setHighlightedIndex={itemProps.setHighlightedIndex}
      renderItem={(option) => (
        <>
          {option.option.icon}
          <span className="flex flex-1 flex-col">
            <span className="truncate">{option.option.label}</span>
            {option.option.hint !== undefined ? (
              <span className="text-muted-foreground text-xs">{option.option.hint}</span>
            ) : null}
          </span>
        </>
      )}
    />
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionMenuOption>
      options={[...options]}
      onQueryChange={onQueryChange}
      onSelectOption={onSelectOption}
      onOpen={() => setMenus((s) => ({ ...s, mention: true }))}
      onClose={() => setMenus((s) => ({ ...s, mention: false }))}
      triggerFn={triggerFn}
      menuRenderFn={menuRenderFn}
    />
  );
}

// Per-editor combobox-ARIA root-listener registration. Subscribes to
// anyMenuOpenAtom so it re-registers (re-applies aria-expanded) whenever the
// open state changes; torn down via the atom finalizer.
const comboboxAriaAtom = Atom.family((editor: LexicalEditor) =>
  Atom.make((get) => {
    const open = get(anyMenuOpenAtom(editor));
    get.addFinalizer(
      editor.registerRootListener((rootElement) => {
        if (rootElement === null) return;
        rootElement.setAttribute("role", "combobox");
        rootElement.setAttribute("aria-haspopup", "listbox");
        rootElement.setAttribute("aria-autocomplete", "list");
        rootElement.setAttribute("aria-expanded", open ? "true" : "false");
      })
    );
    return undefined;
  })
);

/**
 * Marks the editor root as a WAI-ARIA combobox while slash/mention typeahead menus
 * are enabled, toggling `aria-expanded` as the menu opens/closes. The Lexical
 * menu delegate already adds `aria-controls` and `aria-activedescendant`; this
 * completes the combobox pattern (`role`, `aria-haspopup`, `aria-autocomplete`).
 * Reads the open state from the shared {@link anyMenuOpenAtom}.
 *
 * @example
 * ```tsx
 * import { ComboboxAriaPlugin } from "@beep/editor/chat"
 *
 * function TypeaheadAccessibility() {
 *   return <ComboboxAriaPlugin />
 * }
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function ComboboxAriaPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useAtomMount(comboboxAriaAtom(editor));
  return null;
}
