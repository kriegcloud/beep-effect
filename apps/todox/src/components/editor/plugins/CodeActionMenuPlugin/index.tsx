"use client";

import { $isCodeNode, CodeNode, getLanguageFriendlyName, normalizeCodeLang } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as Match from "effect/Match";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import { $getNearestNodeFromDOMNode, isHTMLElement } from "lexical";
import type * as React from "react";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CopyButton } from "./components/CopyButton";
import { canBePrettier, PrettierButton } from "./components/PrettierButton";
import { useDebounce } from "./utils";

const CODE_PADDING = 8;

interface Position {
  readonly top: string;
  readonly right: string;
}

function CodeActionMenuContainer({ anchorElem }: { readonly anchorElem: HTMLElement }): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const [lang, setLang] = useState("");
  const [isShown, setShown] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({
    right: "0",
    top: "0",
  });
  const codeSetRef = useRef(MutableHashSet.empty<string>());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);

  function getCodeDOMNode(): O.Option<HTMLElement> {
    return O.fromNullable(codeDOMNodeRef.current);
  }

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside) {
        setShown(false);
        return;
      }

      if (O.isNone(codeDOMNode)) {
        return;
      }

      const domNode = codeDOMNode.value;
      codeDOMNodeRef.current = domNode;

      let codeNode: CodeNode | null = null;
      let _lang = "";

      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(domNode);

        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() || "";
        }
      });

      if (codeNode) {
        const { y: editorElemY, right: editorElemRight } = anchorElem.getBoundingClientRect();
        const { y, right } = domNode.getBoundingClientRect();
        setLang(_lang);
        setShown(true);
        setPosition({
          right: `${editorElemRight - right + CODE_PADDING}px`,
          top: `${y - editorElemY}px`,
        });
      }
    },
    50,
    1000
  );

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }

    document.addEventListener("mousemove", debouncedOnMouseMove);

    return () => {
      setShown(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener("mousemove", debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            Match.value(type).pipe(
              Match.when("created", () => {
                MutableHashSet.add(codeSetRef.current, key);
              }),
              Match.when("destroyed", () => {
                MutableHashSet.remove(codeSetRef.current, key);
              }),
              Match.orElse(() => {})
            );
          }
        });
        setShouldListenMouseMove(MutableHashSet.size(codeSetRef.current) > 0);
      },
      { skipInitialization: false }
    );
  }, [editor]);

  const normalizedLang = normalizeCodeLang(lang);
  const codeFriendlyName = getLanguageFriendlyName(lang);

  return (
    <>
      {isShown ? (
        <div
          className="code-action-menu-container h-9 text-[10px] text-foreground/50 absolute flex items-center flex-row select-none"
          style={{ ...position }}
        >
          <div className="mr-1">{codeFriendlyName}</div>
          <CopyButton editor={editor} getCodeDOMNode={getCodeDOMNode} />
          {canBePrettier(normalizedLang) ? (
            <PrettierButton editor={editor} getCodeDOMNode={getCodeDOMNode} lang={normalizedLang} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function getMouseInfo(event: MouseEvent): {
  readonly codeDOMNode: O.Option<HTMLElement>;
  readonly isOutside: boolean;
} {
  const target = event.target;

  if (isHTMLElement(target)) {
    const codeDOMNode = target.closest<HTMLElement>("code.EditorTheme__code");
    const isOutside = !(codeDOMNode || target.closest<HTMLElement>("div.code-action-menu-container"));

    return { codeDOMNode: O.fromNullable(codeDOMNode), isOutside };
  }
  return { codeDOMNode: O.none(), isOutside: true };
}

export default function CodeActionMenuPlugin({
  anchorElem = document.body,
}: {
  readonly anchorElem?: undefined | HTMLElement;
}): React.ReactPortal | null {
  return createPortal(<CodeActionMenuContainer anchorElem={anchorElem} />, anchorElem);
}
