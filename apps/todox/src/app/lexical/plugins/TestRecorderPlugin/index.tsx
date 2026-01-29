"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { IS_APPLE } from "@lexical/utils";
import * as Either from "effect/Either";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { BaseSelection, LexicalEditor } from "lexical";
import { $createParagraphNode, $createTextNode, $getRoot, getDOMSelection } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const copy = (text: string | null) => {
  const textArea = document.createElement("textarea");
  textArea.value = text || "";
  textArea.style.position = "absolute";
  textArea.style.opacity = "0";
  document.body?.appendChild(textArea);
  textArea.focus();
  textArea.select();
  Either.try(() => document.execCommand("copy")).pipe(
    Either.match({
      onLeft: (error) => console.error(error),
      onRight: (result) => console.log(result),
    })
  );
  document.body?.removeChild(textArea);
};

const download = (filename: string, text: string | null) => {
  const a = document.createElement("a");
  a.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(text || "")}`);
  a.setAttribute("download", filename);
  a.style.display = "none";
  document.body?.appendChild(a);
  a.click();
  document.body?.removeChild(a);
};

const formatStep = (step: Step) => {
  const formatOneStep = (name: string, value: Step["value"]) =>
    Match.value(name).pipe(
      Match.when("click", () => `      await page.mouse.click(${value.x}, ${value.y});`),
      Match.when("press", () => `      await page.keyboard.press('${value}');`),
      Match.when("keydown", () => `      await page.keyboard.keydown('${value}');`),
      Match.when("keyup", () => `      await page.keyboard.keyup('${value}');`),
      Match.when("type", () => `      await page.keyboard.type('${value}');`),
      Match.when("selectAll", () => `      await selectAll(page);`),
      Match.when(
        "snapshot",
        () => `      await assertHTMLSnapshot(page);
      await assertSelection(page, {
        anchorPath: [${value.anchorPath.toString()}],
        anchorOffset: ${value.anchorOffset},
        focusPath: [${value.focusPath.toString()}],
        focusOffset: ${value.focusOffset},
      });
`
      ),
      Match.orElse(() => ``)
    );

  const formattedStep = formatOneStep(step.name, step.value);

  return Match.value(step.count).pipe(
    Match.when(1, () => formattedStep),
    Match.when(2, () => [formattedStep, formattedStep].join(`\n`)),
    Match.orElse(
      () => `      await repeat(${step.count}, async () => {
  ${formattedStep}
      );`
    )
  );
};

export function isSelectAll(event: KeyboardEvent): boolean {
  return Str.toLowerCase(event.key) === "a" && (IS_APPLE ? event.metaKey : event.ctrlKey);
}

// stolen from LexicalSelection-test
function sanitizeSelection(selection: Selection) {
  const { anchorNode, focusNode } = selection;
  let { anchorOffset, focusOffset } = selection;
  if (anchorOffset !== 0) {
    anchorOffset--;
  }
  if (focusOffset !== 0) {
    focusOffset--;
  }
  return { anchorNode, anchorOffset, focusNode, focusOffset };
}

function getPathFromNodeToEditor(node: Node, rootElement: O.Option<HTMLElement>) {
  const root = O.getOrNull(rootElement);
  let currentNode: Node | null | undefined = node;
  const path: number[] = [];
  while (currentNode !== root) {
    if (currentNode !== null && currentNode !== undefined) {
      path.unshift(Array.from(currentNode?.parentNode?.childNodes ?? []).indexOf(currentNode as ChildNode));
    }
    currentNode = currentNode?.parentNode;
  }
  return path;
}

const keyPresses = HashSet.make(
  "Enter",
  "Backspace",
  "Delete",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown"
);

type Step = {
  // biome-ignore lint/suspicious/noExplicitAny: Step values can be any type from editor events
  readonly value: any;
  readonly count: number;
  readonly name: string;
};

type Steps = Step[];

function useTestRecorder(editor: LexicalEditor): [JSX.Element, JSX.Element | null] {
  const [steps, setSteps] = useState<Steps>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [, setCurrentInnerHTML] = useState("");
  const [templatedTest, setTemplatedTest] = useState("");
  const previousSelectionRef = useRef<BaseSelection | null>(null);
  const skipNextSelectionChangeRef = useRef(false);
  const preRef = useRef<HTMLPreElement>(null);

  const getCurrentEditor = useCallback(() => {
    return editor;
  }, [editor]);

  const generateTestContent = useCallback(() => {
    const rootElement = editor.getRootElement();
    const browserSelection = getDOMSelection(editor._window);

    if (
      rootElement == null ||
      browserSelection == null ||
      browserSelection.anchorNode == null ||
      browserSelection.focusNode == null ||
      !rootElement.contains(browserSelection.anchorNode) ||
      !rootElement.contains(browserSelection.focusNode)
    ) {
      return null;
    }

    return `


import {
  initializeE2E,
  assertHTMLSnapshot,
  assertSelection,
  repeat,
} from '../utils';
import {selectAll} from '../keyboardShortcuts';
import { RangeSelection } from 'lexical';
import { NodeSelection } from 'lexical';

describe('Test case', () => {
  initializeE2E((e2e) => {
    it('Should pass this test', async () => {
      const {page} = e2e;

      await page.focus('div[contenteditable="true"]');
${steps.map(formatStep).join(`\n`)}
    });
});
    `;
  }, [editor, steps]);

  // just a wrapper around inserting new actions so that we can
  // coalesce some actions like insertText/moveNativeSelection
  const pushStep = useCallback(
    (name: string, value: Step["value"]) => {
      setSteps((currentSteps) => {
        // trying to group steps
        const currentIndex = steps.length - 1;
        const lastStep = steps[currentIndex];
        if (lastStep) {
          if (lastStep.name === name) {
            if (name === "type") {
              // for typing events we just append the text
              return [...steps.slice(0, currentIndex), { ...lastStep, value: lastStep.value + value }];
            }
            // for other events we bump the counter if their values are the same
            if (lastStep.value === value) {
              return [...steps.slice(0, currentIndex), { ...lastStep, count: lastStep.count + 1 }];
            }
          }
        }
        // could not group, just append a new one
        return [...currentSteps, { count: 1, name, value }];
      });
    },
    [steps, setSteps]
  );

  useLayoutEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isRecording) {
        return;
      }
      const key = event.key;
      if (isSelectAll(event)) {
        pushStep("selectAll", "");
      } else if (HashSet.has(keyPresses, key)) {
        pushStep("press", event.key);
      } else if ([...key].length > 1) {
        pushStep("keydown", event.key);
      } else {
        pushStep("type", event.key);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!isRecording) {
        return;
      }
      const key = event.key;
      if (!HashSet.has(keyPresses, key) && [...key].length > 1) {
        pushStep("keyup", event.key);
      }
    };

    return editor.registerRootListener((rootElement: null | HTMLElement, prevRootElement: null | HTMLElement) => {
      if (prevRootElement !== null) {
        prevRootElement.removeEventListener("keydown", onKeyDown);
        prevRootElement.removeEventListener("keyup", onKeyUp);
      }
      if (rootElement !== null) {
        rootElement.addEventListener("keydown", onKeyDown);
        rootElement.addEventListener("keyup", onKeyUp);
      }
    });
  }, [editor, isRecording, pushStep]);

  useLayoutEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTo(0, preRef.current.scrollHeight);
    }
  }, [generateTestContent]);

  useEffect(() => {
    if (steps) {
      const testContent = generateTestContent();
      if (testContent !== null) {
        setTemplatedTest(testContent);
      }
      if (preRef.current) {
        preRef.current.scrollTo(0, preRef.current.scrollHeight);
      }
    }
  }, [generateTestContent, steps]);

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(({ editorState, dirtyLeaves, dirtyElements }) => {
      if (!isRecording) {
        return;
      }
      const currentSelection = editorState._selection;
      const previousSelection = previousSelectionRef.current;
      const skipNextSelectionChange = skipNextSelectionChangeRef.current;
      if (previousSelection !== currentSelection) {
        if (dirtyLeaves.size === 0 && dirtyElements.size === 0 && !skipNextSelectionChange) {
          const browserSelection = getDOMSelection(editor._window);
          if (browserSelection && (browserSelection.anchorNode == null || browserSelection.focusNode == null)) {
            return;
          }
        }
        previousSelectionRef.current = currentSelection;
      }
      skipNextSelectionChangeRef.current = false;
      const testContent = generateTestContent();
      if (testContent !== null) {
        setTemplatedTest(testContent);
      }
    });
    return removeUpdateListener;
  }, [editor, generateTestContent, isRecording, pushStep]);

  // save innerHTML
  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const removeUpdateListener = editor.registerUpdateListener(() => {
      const rootElement = editor.getRootElement();
      if (rootElement !== null) {
        setCurrentInnerHTML(rootElement?.innerHTML);
      }
    });
    return removeUpdateListener;
  }, [editor, isRecording]);

  // clear editor and start recording
  const toggleEditorSelection = useCallback(
    (currentEditor: LexicalEditor) => {
      if (!isRecording) {
        currentEditor.update(() => {
          const root = $getRoot();
          root.clear();
          const text = $createTextNode();
          root.append($createParagraphNode().append(text));
          text.select();
        });
        setSteps([]);
      }
      setIsRecording((currentIsRecording) => !currentIsRecording);
    },
    [isRecording]
  );

  const onSnapshotClick = useCallback(() => {
    if (!isRecording) {
      return;
    }
    const browserSelection = getDOMSelection(getCurrentEditor()._window);
    if (browserSelection === null || browserSelection.anchorNode == null || browserSelection.focusNode == null) {
      return;
    }
    const { anchorNode, anchorOffset, focusNode, focusOffset } = sanitizeSelection(browserSelection);
    const rootElement = O.fromNullable(getCurrentEditor().getRootElement());
    let anchorPath: number[] = [];
    if (anchorNode !== null) {
      anchorPath = getPathFromNodeToEditor(anchorNode, rootElement);
    }
    let focusPath: number[] = [];
    if (focusNode !== null) {
      focusPath = getPathFromNodeToEditor(focusNode, rootElement);
    }
    pushStep("snapshot", {
      anchorNode,
      anchorOffset,
      anchorPath,
      focusNode,
      focusOffset,
      focusPath,
    });
  }, [pushStep, isRecording, getCurrentEditor]);

  const onCopyClick = useCallback(() => {
    copy(generateTestContent());
  }, [generateTestContent]);

  const onDownloadClick = useCallback(() => {
    download("test.js", generateTestContent());
  }, [generateTestContent]);

  const button = (
    <button
      type="button"
      id="test-recorder-button"
      className={`editor-dev-button ${isRecording ? "active" : ""}`}
      onClick={() => toggleEditorSelection(getCurrentEditor())}
      title={isRecording ? "Disable test recorder" : "Enable test recorder"}
    />
  );
  const output = isRecording ? (
    <div className="test-recorder-output">
      <div className="test-recorder-toolbar">
        <button
          type="button"
          className="test-recorder-button"
          id="test-recorder-button-snapshot"
          title="Insert snapshot"
          onClick={onSnapshotClick}
        />
        <button
          type="button"
          className="test-recorder-button"
          id="test-recorder-button-copy"
          title="Copy to clipboard"
          onClick={onCopyClick}
        />
        <button
          type="button"
          className="test-recorder-button"
          id="test-recorder-button-download"
          title="Download as a file"
          onClick={onDownloadClick}
        />
      </div>
      <pre id="test-recorder" ref={preRef}>
        {templatedTest}
      </pre>
    </div>
  ) : null;

  return [button, output];
}

export default function TestRecorderPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [testRecorderButton, testRecorderOutput] = useTestRecorder(editor);

  return (
    <>
      {testRecorderButton}
      {testRecorderOutput}
    </>
  );
}
