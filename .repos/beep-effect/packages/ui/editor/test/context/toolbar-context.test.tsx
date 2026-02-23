import { describe, mock } from "bun:test";
import { assertTrue, live, strictEqual } from "@beep/testkit";
import { RegistryProvider } from "@effect-atom/atom-react";
import { act, renderHook } from "@testing-library/react";
import * as Effect from "effect/Effect";
import type { LexicalEditor } from "lexical";
import type { JSX, ReactNode } from "react";

import {
  ToolbarContext,
  useActiveEditor,
  useBlockType,
  useShowModal,
  useToolbarContext,
  useUpdateToolbar,
} from "../../src/context/toolbar-context";

/**
 * Creates a mock LexicalEditor for testing.
 */
const createMockEditor = (): LexicalEditor =>
  ({
    _key: "test-editor-key",
    getEditorState: mock(() => ({ read: mock((fn: () => void) => fn()) })),
    registerCommand: mock(() => () => {}),
    update: mock((fn: () => void) => fn()),
  }) as unknown as LexicalEditor;

/**
 * Default wrapper with RegistryProvider only.
 */
const wrapper = ({ children }: { children: ReactNode }) => <RegistryProvider>{children}</RegistryProvider>;

/**
 * Creates a test wrapper with ToolbarContext configured.
 */
const createToolbarWrapper = (
  mockEditor: LexicalEditor,
  props: {
    $updateToolbar?: () => void;
    blockType?: string;
    setBlockType?: (blockType: string) => void;
    showModal?: (title: string, content: (onClose: () => void) => JSX.Element) => void;
  } = {}
) => {
  return ({ children }: { children: ReactNode }) => (
    <RegistryProvider>
      <ToolbarContext
        activeEditor={mockEditor}
        $updateToolbar={props.$updateToolbar ?? (() => {})}
        blockType={props.blockType ?? "paragraph"}
        setBlockType={props.setBlockType ?? (() => {})}
        showModal={props.showModal ?? (() => {})}
      >
        {children}
      </ToolbarContext>
    </RegistryProvider>
  );
};

describe("ToolbarContext", () => {
  describe("useToolbarContext", () => {
    live(
      "should provide activeEditor from props",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const customWrapper = createToolbarWrapper(mockEditor);

        const { result } = renderHook(() => useToolbarContext(), { wrapper: customWrapper });

        strictEqual(result.current.activeEditor, mockEditor);
      })
    );

    live(
      "should provide blockType from props",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const customWrapper = createToolbarWrapper(mockEditor, { blockType: "heading" });

        const { result } = renderHook(() => useToolbarContext(), { wrapper: customWrapper });

        strictEqual(result.current.blockType, "heading");
      })
    );

    live(
      "should call setBlockType when invoked",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const setBlockTypeMock = mock((_blockType: string) => {});
        const customWrapper = createToolbarWrapper(mockEditor, { setBlockType: setBlockTypeMock });

        const { result } = renderHook(() => useToolbarContext(), { wrapper: customWrapper });

        act(() => {
          result.current.setBlockType("quote");
        });

        strictEqual(setBlockTypeMock.mock.calls.length, 1);
        strictEqual(setBlockTypeMock.mock.calls[0]?.[0], "quote");
      })
    );

    live(
      "should call $updateToolbar when invoked",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const updateToolbarMock = mock(() => {});
        const customWrapper = createToolbarWrapper(mockEditor, { $updateToolbar: updateToolbarMock });

        const { result } = renderHook(() => useToolbarContext(), { wrapper: customWrapper });

        act(() => {
          result.current.$updateToolbar();
        });

        strictEqual(updateToolbarMock.mock.calls.length, 1);
      })
    );

    live(
      "should call showModal with correct arguments",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const showModalMock = mock((_title: string, _content: (onClose: () => void) => JSX.Element) => {});
        const customWrapper = createToolbarWrapper(mockEditor, { showModal: showModalMock });

        const { result } = renderHook(() => useToolbarContext(), { wrapper: customWrapper });
        const modalContent = (_onClose: () => void) => <div>Modal</div>;

        act(() => {
          result.current.showModal("Test Title", modalContent);
        });

        strictEqual(showModalMock.mock.calls.length, 1);
        strictEqual(showModalMock.mock.calls[0]?.[0], "Test Title");
      })
    );

    live(
      "should update blockType when props change",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        let currentBlockType = "paragraph";

        // Dynamic wrapper that reads currentBlockType
        const DynamicWrapper = ({ children }: { children: ReactNode }) => (
          <RegistryProvider>
            <ToolbarContext
              activeEditor={mockEditor}
              $updateToolbar={() => {}}
              blockType={currentBlockType}
              setBlockType={() => {}}
              showModal={() => {}}
            >
              {children}
            </ToolbarContext>
          </RegistryProvider>
        );

        const { result, rerender } = renderHook(() => useToolbarContext(), { wrapper: DynamicWrapper });

        strictEqual(result.current.blockType, "paragraph");

        // Update the blockType value
        currentBlockType = "heading";

        // Re-render to pick up the new value
        rerender({});

        // The atom should have been updated
        strictEqual(result.current.blockType, "heading");
      })
    );
  });

  describe("useActiveEditor", () => {
    live(
      "should return the active editor",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const customWrapper = createToolbarWrapper(mockEditor);

        const { result } = renderHook(() => useActiveEditor(), { wrapper: customWrapper });

        strictEqual(result.current, mockEditor);
      })
    );

    live(
      "should return same editor instance on re-render",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const customWrapper = createToolbarWrapper(mockEditor);

        const { result, rerender } = renderHook(() => useActiveEditor(), { wrapper: customWrapper });

        const firstEditor = result.current;
        rerender({});
        const secondEditor = result.current;

        strictEqual(firstEditor, secondEditor);
      })
    );
  });

  describe("useBlockType", () => {
    live(
      "should return current blockType and setBlockType function",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const setBlockTypeMock = mock((_blockType: string) => {});
        const customWrapper = createToolbarWrapper(mockEditor, {
          blockType: "code",
          setBlockType: setBlockTypeMock,
        });

        const { result } = renderHook(() => useBlockType(), { wrapper: customWrapper });
        const [blockType, setBlockType] = result.current;

        strictEqual(blockType, "code");
        assertTrue(typeof setBlockType === "function");
      })
    );

    live(
      "should call setBlockType when invoked from hook",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const setBlockTypeMock = mock((_blockType: string) => {});
        const customWrapper = createToolbarWrapper(mockEditor, {
          blockType: "paragraph",
          setBlockType: setBlockTypeMock,
        });

        const { result } = renderHook(() => useBlockType(), { wrapper: customWrapper });

        act(() => {
          const [, setBlockType] = result.current;
          setBlockType("list");
        });

        strictEqual(setBlockTypeMock.mock.calls.length, 1);
        strictEqual(setBlockTypeMock.mock.calls[0]?.[0], "list");
      })
    );
  });

  describe("useUpdateToolbar", () => {
    live(
      "should return the $updateToolbar function",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const updateToolbarMock = mock(() => {});
        const customWrapper = createToolbarWrapper(mockEditor, { $updateToolbar: updateToolbarMock });

        const { result } = renderHook(() => useUpdateToolbar(), { wrapper: customWrapper });

        assertTrue(typeof result.current === "function");

        act(() => {
          result.current();
        });

        strictEqual(updateToolbarMock.mock.calls.length, 1);
      })
    );
  });

  describe("useShowModal", () => {
    live(
      "should return the showModal function",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const showModalMock = mock((_title: string, _content: (onClose: () => void) => JSX.Element) => {});
        const customWrapper = createToolbarWrapper(mockEditor, { showModal: showModalMock });

        const { result } = renderHook(() => useShowModal(), { wrapper: customWrapper });

        assertTrue(typeof result.current === "function");

        const modalContent = (_onClose: () => void) => <div>Test Modal Content</div>;

        act(() => {
          result.current("My Modal", modalContent);
        });

        strictEqual(showModalMock.mock.calls.length, 1);
        strictEqual(showModalMock.mock.calls[0]?.[0], "My Modal");
      })
    );
  });

  describe("singleton behavior", () => {
    live(
      "should use most recent context state (singleton design)",
      Effect.fn(function* () {
        const mockEditor1 = createMockEditor();
        const mockEditor2 = createMockEditor();

        // First context sets blockType to "heading"
        const wrapper1 = createToolbarWrapper(mockEditor1, { blockType: "heading" });
        const { result: result1 } = renderHook(() => useToolbarContext(), { wrapper: wrapper1 });
        strictEqual(result1.current.blockType, "heading");

        // Second context sets blockType to "code" - overwrites singleton state
        const wrapper2 = createToolbarWrapper(mockEditor2, { blockType: "code" });
        const { result: result2 } = renderHook(() => useToolbarContext(), { wrapper: wrapper2 });

        // Both hooks now read from the same singleton state (most recent value)
        strictEqual(result2.current.blockType, "code");
        strictEqual(result1.current.blockType, "code"); // Also "code" since it's a singleton
      })
    );
  });

  describe("function reference stability", () => {
    live(
      "should always call the latest function reference",
      Effect.fn(function* () {
        const mockEditor = createMockEditor();
        const updateToolbarMock1 = mock(() => {});
        const updateToolbarMock2 = mock(() => {});

        // Start with first mock
        let currentUpdateToolbar = updateToolbarMock1;
        const DynamicWrapper = ({ children }: { children: ReactNode }) => (
          <RegistryProvider>
            <ToolbarContext
              activeEditor={mockEditor}
              $updateToolbar={currentUpdateToolbar}
              blockType="paragraph"
              setBlockType={() => {}}
              showModal={() => {}}
            >
              {children}
            </ToolbarContext>
          </RegistryProvider>
        );

        const { result, rerender } = renderHook(() => useToolbarContext(), { wrapper: DynamicWrapper });

        // Call with first mock
        act(() => {
          result.current.$updateToolbar();
        });

        strictEqual(updateToolbarMock1.mock.calls.length, 1);
        strictEqual(updateToolbarMock2.mock.calls.length, 0);

        // Update to second mock
        currentUpdateToolbar = updateToolbarMock2;
        rerender({});

        // Call with second mock
        act(() => {
          result.current.$updateToolbar();
        });

        strictEqual(updateToolbarMock1.mock.calls.length, 1);
        strictEqual(updateToolbarMock2.mock.calls.length, 1);
      })
    );
  });
});
