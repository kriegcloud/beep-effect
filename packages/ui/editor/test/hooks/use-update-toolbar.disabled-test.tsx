// import { describe, mock, spyOn } from "bun:test";
// import { assertTrue, live, strictEqual } from "@beep/testkit";
// import { RegistryProvider } from "@effect-atom/atom-react";
// import { act, renderHook } from "@testing-library/react";
// import * as Duration from "effect/Duration";
// import * as Effect from "effect/Effect";
// import type { BaseSelection, LexicalEditor } from "lexical";
// import * as lexical from "lexical";
// import type { JSX, ReactNode } from "react";
//
// import { ToolbarContext } from "../../src/context/toolbar-context";
// import {type MinimalEditor, useUpdateToolbarHandlerWithEditor} from "../../src/hooks/use-update-toolbar";
//
// /**
//  * Helper to create a delay Effect using Effect.sleep.
//  */
// // const delay = (ms: number) => Effect.sleep(Duration.millis(ms));
//
// /**
//  * Mock selection for $getSelection
//  */
// // const mockSelection = {
// //   type: "text",
// //   anchor: { key: "test", offset: 0 },
// //   focus: { key: "test", offset: 0 },
// // } as unknown as BaseSelection;
//
// /**
//  * Creates a mock LexicalEditor for testing.
//  * Sets up $getSelection mock to return our mock selection.
//  */
// // const createMockEditor = (): {
// //   editor: MinimalEditor;
// //   registerCommandMock: ReturnType<typeof mock>;
// //   unregisterMock: ReturnType<typeof mock>;
// //   getSelectionSpy: ReturnType<typeof spyOn>;
// // } => {
// //   const unregisterMock = mock(() => {});
// //   const registerCommandMock = mock((_command: unknown, _handler: () => boolean, _priority: number) => unregisterMock);
// //
// //   // Mock $getSelection to return our mock selection
// //   const getSelectionSpy = spyOn(lexical, "$getSelection").mockImplementation(() => mockSelection);
// //
// //   const editor = {
// //     _key: `test-editor-${Math.random().toString(36).slice(2)}`,
// //     getEditorState: mock(() => ({
// //       read: mock((fn: () => void) => fn()),
// //     })),
// //     registerCommand: registerCommandMock,
// //   } as unknown as LexicalEditor;
// //
// //   return { editor, registerCommandMock, unregisterMock, getSelectionSpy };
// // };
// //
// // /**
// //  * Creates a test wrapper with ToolbarContext configured.
// //  */
// // const createTestWrapper = (
// //   mockEditor: LexicalEditor,
// //   props: {
// //     $updateToolbar?: () => void;
// //     blockType?: string;
// //     setBlockType?: (blockType: string) => void;
// //     showModal?: (title: string, content: (onClose: () => void) => JSX.Element) => void;
// //   } = {}
// // ) => {
// //   return ({ children }: { children: ReactNode }) => (
// //     <RegistryProvider>
// //       <ToolbarContext
// //         activeEditor={mockEditor}
// //         $updateToolbar={props.$updateToolbar ?? (() => {})}
// //         blockType={props.blockType ?? "paragraph"}
// //         setBlockType={props.setBlockType ?? (() => {})}
// //         showModal={props.showModal ?? (() => {})}
// //       >
// //         {children}
// //       </ToolbarContext>
// //     </RegistryProvider>
// //   );
// // };
//
// describe("useUpdateToolbarHandlerWithEditor", () => {
//   // live(
//   //   "should register command on mount",
//   //   Effect.fn(function* () {
//   //     const { editor, registerCommandMock, getSelectionSpy } = createMockEditor();
//   //     const callback = mock((_selection: BaseSelection) => {});
//   //     const wrapper = createTestWrapper(editor);
//   //
//   //     renderHook(() => useUpdateToolbarHandlerWithEditor(editor, callback), { wrapper });
//   //
//   //     // registerCommand should have been called
//   //     assertTrue(registerCommandMock.mock.calls.length >= 1);
//   //
//   //     // Cleanup spy
//   //     getSelectionSpy.mockRestore();
//   //   })
//   // );
//
//   // live(
//   //   "should call callback during initial read",
//   //   Effect.fn(function* () {
//   //     const { editor, getSelectionSpy } = createMockEditor();
//   //     const callback = mock((_selection: BaseSelection) => {});
//   //     const wrapper = createTestWrapper(editor);
//   //
//   //     renderHook(() => useUpdateToolbarHandlerWithEditor(editor, callback), { wrapper });
//   //
//   //     // The callback should be called during initial read with our mock selection
//   //     assertTrue(callback.mock.calls.length >= 1);
//   //
//   //     // Cleanup spy
//   //     getSelectionSpy.mockRestore();
//   //   })
//   // );
//
//   // live(
//   //   "should only register command once per editor",
//   //   Effect.fn(function* () {
//   //     const { editor, registerCommandMock, getSelectionSpy } = createMockEditor();
//   //     const callback = mock((_selection: BaseSelection) => {});
//   //     const wrapper = createTestWrapper(editor);
//   //
//   //     const { rerender } = renderHook(() => useUpdateToolbarHandlerWithEditor(editor, callback), { wrapper });
//   //
//   //     const initialCallCount = registerCommandMock.mock.calls.length;
//   //
//   //     // Re-render multiple times
//   //     rerender({});
//   //     rerender({});
//   //     rerender({});
//   //
//   //     // registerCommand should not have been called again
//   //     strictEqual(registerCommandMock.mock.calls.length, initialCallCount);
//   //
//   //     // Cleanup spy
//   //     getSelectionSpy.mockRestore();
//   //   })
//   // );
//
//   // live(
//   //   "should register SELECTION_CHANGE_COMMAND with CRITICAL priority",
//   //   Effect.fn(function* () {
//   //     const { editor, registerCommandMock, getSelectionSpy } = createMockEditor();
//   //     const callback = mock((_selection: BaseSelection) => {});
//   //     const wrapper = createTestWrapper(editor);
//   //
//   //     renderHook(() => useUpdateToolbarHandlerWithEditor(editor, callback), { wrapper });
//   //
//   //     // Check the registerCommand call
//   //     assertTrue(registerCommandMock.mock.calls.length >= 1);
//   //
//   //     // The priority should be COMMAND_PRIORITY_CRITICAL (value: 4)
//   //     const [_command, _handler, priority] = registerCommandMock.mock.calls[0] ?? [];
//   //     strictEqual(priority, 4); // COMMAND_PRIORITY_CRITICAL = 4
//   //
//   //     // Cleanup spy
//   //     getSelectionSpy.mockRestore();
//   //   })
//   // );
//
//   // live(
//   //   "should handle multiple editors with separate subscriptions",
//   //   Effect.fn(function* () {
//   //     const editor1Data = createMockEditor();
//   //     const editor2Data = createMockEditor();
//   //     const callback1 = mock((_selection: BaseSelection) => {});
//   //     const callback2 = mock((_selection: BaseSelection) => {});
//   //
//   //     const wrapper1 = createTestWrapper(editor1Data.editor);
//   //     const wrapper2 = createTestWrapper(editor2Data.editor);
//   //
//   //     renderHook(() => useUpdateToolbarHandlerWithEditor(editor1Data.editor, callback1), { wrapper: wrapper1 });
//   //     renderHook(() => useUpdateToolbarHandlerWithEditor(editor2Data.editor, callback2), { wrapper: wrapper2 });
//   //
//   //     // Both editors should have registered commands
//   //     assertTrue(editor1Data.registerCommandMock.mock.calls.length >= 1);
//   //     assertTrue(editor2Data.registerCommandMock.mock.calls.length >= 1);
//   //
//   //     // Cleanup spies
//   //     editor1Data.getSelectionSpy.mockRestore();
//   //     editor2Data.getSelectionSpy.mockRestore();
//   //   })
//   // );
//
//   describe("callback update behavior", () => {
//   //   live(
//   //     "should update callback ref without re-registering command",
//   //     Effect.fn(function* () {
//   //       const { editor, registerCommandMock, getSelectionSpy } = createMockEditor();
//   //       const callback1 = mock((_selection: BaseSelection) => {});
//   //       const callback2 = mock((_selection: BaseSelection) => {});
//   //       const wrapper = createTestWrapper(editor);
//   //
//   //       const { rerender } = renderHook(({ cb }) => useUpdateToolbarHandlerWithEditor(editor, cb), {
//   //         wrapper,
//   //         initialProps: { cb: callback1 },
//   //       });
//   //
//   //       const initialRegisterCount = registerCommandMock.mock.calls.length;
//   //
//   //       // Update to new callback
//   //       rerender({ cb: callback2 });
//   //
//   //       // registerCommand should NOT have been called again
//   //       strictEqual(registerCommandMock.mock.calls.length, initialRegisterCount);
//   //
//   //       // Cleanup spy
//   //       getSelectionSpy.mockRestore();
//   //     })
//   //   );
//   // });
//
//   // describe("selection change handler behavior", () => {
//   //   live(
//   //     "should call latest callback when selection changes",
//   //     Effect.fn(function* () {
//   //       let selectionHandler: (() => boolean) | null = null;
//   //
//   //       const unregisterMock = mock(() => {});
//   //       const registerCommandMock = mock((_command: unknown, handler: () => boolean, _priority: number) => {
//   //         selectionHandler = handler;
//   //         return unregisterMock;
//   //       });
//   //
//   //       const getSelectionSpy = spyOn(lexical, "$getSelection").mockImplementation(() => mockSelection);
//   //
//   //       const editor = {
//   //         _key: `test-editor-${Math.random().toString(36).slice(2)}`,
//   //         getEditorState: mock(() => ({
//   //           read: mock((fn: () => void) => fn()),
//   //         })),
//   //         registerCommand: registerCommandMock,
//   //       } as unknown as LexicalEditor;
//   //
//   //       const callback1 = mock((_selection: BaseSelection) => {});
//   //       const callback2 = mock((_selection: BaseSelection) => {});
//   //       const wrapper = createTestWrapper(editor);
//   //
//   //       const { rerender } = renderHook(({ cb }) => useUpdateToolbarHandlerWithEditor(editor, cb), {
//   //         wrapper,
//   //         initialProps: { cb: callback1 },
//   //       });
//   //
//   //       // Clear initial calls from mount
//   //       callback1.mockReset();
//   //
//   //       // Update to callback2
//   //       rerender({ cb: callback2 });
//   //
//   //       // Simulate a selection change by calling the handler
//   //       if (selectionHandler) {
//   //         selectionHandler();
//   //       }
//   //
//   //       // callback2 should have been called (it's the current callback in the ref)
//   //       // callback1 should NOT have been called after the rerender
//   //       assertTrue(callback2.mock.calls.length >= 1);
//   //       strictEqual(callback1.mock.calls.length, 0);
//   //
//   //       // Cleanup spy
//   //       getSelectionSpy.mockRestore();
//   //     })
//   //   );
//   // });
//
//   // describe("cleanup behavior", () => {
//   //   live(
//   //     "should unregister command via atom finalizer on unmount",
//   //     Effect.fn(function* () {
//   //       const { editor, unregisterMock, getSelectionSpy } = createMockEditor();
//   //       const callback = mock((_selection: BaseSelection) => {});
//   //       const wrapper = createTestWrapper(editor);
//   //
//   //       const { unmount } = renderHook(() => useUpdateToolbarHandlerWithEditor(editor, callback), { wrapper });
//   //
//   //       // Unmount to trigger cleanup
//   //       act(() => {
//   //         unmount();
//   //       });
//   //
//   //       // Wait for async cleanup
//   //       yield* delay(100);
//   //
//   //       // Note: The unregister may or may not be called depending on atom lifecycle
//   //       // This test verifies the unmount doesn't throw
//   //       assertTrue(true);
//   //
//   //       // Cleanup spy
//   //       getSelectionSpy.mockRestore();
//   //     })
//   //   );
//   });
// });
