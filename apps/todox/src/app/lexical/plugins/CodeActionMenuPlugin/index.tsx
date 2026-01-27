"use client";

import { $isCodeNode, CodeNode, getLanguageFriendlyName, normalizeCodeLang } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
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
  const codeSetRef = useRef<Set<string>>(new Set());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);

  function getCodeDOMNode(): HTMLElement | null {
    return codeDOMNodeRef.current;
  }

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside) {
        setShown(false);
        return;
      }

      if (!codeDOMNode) {
        return;
      }

      codeDOMNodeRef.current = codeDOMNode;

      let codeNode: CodeNode | null = null;
      let _lang = "";

      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() || "";
        }
      });

      if (codeNode) {
        const { y: editorElemY, right: editorElemRight } = anchorElem.getBoundingClientRect();
        const { y, right } = codeDOMNode.getBoundingClientRect();
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
            switch (type) {
              case "created":
                codeSetRef.current.add(key);
                break;

              case "destroyed":
                codeSetRef.current.delete(key);
                break;

              default:
                break;
            }
          }
        });
        setShouldListenMouseMove(codeSetRef.current.size > 0);
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
  readonly codeDOMNode: HTMLElement | null;
  readonly isOutside: boolean;
} {
  const target = event.target;

  if (isHTMLElement(target)) {
    const codeDOMNode = target.closest<HTMLElement>("code.PlaygroundEditorTheme__code");
    const isOutside = !(codeDOMNode || target.closest<HTMLElement>("div.code-action-menu-container"));

    return { codeDOMNode, isOutside };
  }
  return { codeDOMNode: null, isOutside: true };
}

export default function CodeActionMenuPlugin({
  anchorElem = document.body,
}: {
  readonly anchorElem?: undefined | HTMLElement;
}): React.ReactPortal | null {
  return createPortal(<CodeActionMenuContainer anchorElem={anchorElem} />, anchorElem);
}
