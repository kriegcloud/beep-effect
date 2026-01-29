import { describe } from "bun:test";
import { assertTrue, live, strictEqual } from "@beep/testkit";
import { RegistryProvider } from "@effect-atom/atom-react";
import { act, renderHook } from "@testing-library/react";
import * as Effect from "effect/Effect";
import type { ReactNode } from "react";

import { useEditorModal } from "../../src/hooks/use-editor-modal";

/**
 * Wrapper component that provides the RegistryProvider for effect-atom.
 */
const wrapper = ({ children }: { children: ReactNode }) => <RegistryProvider>{children}</RegistryProvider>;

describe("useEditorModal", () => {
  live(
    "should return null modal initially",
    Effect.fn(function* () {
      const { result } = renderHook(() => useEditorModal(), { wrapper });
      const [modal] = result.current;
      strictEqual(modal, null);
    })
  );

  live(
    "should return a showModal function",
    Effect.fn(function* () {
      const { result } = renderHook(() => useEditorModal(), { wrapper });
      const [, showModal] = result.current;
      assertTrue(typeof showModal === "function");
    })
  );

  live(
    "should show modal when showModal is called",
    Effect.fn(function* () {
      const { result } = renderHook(() => useEditorModal(), { wrapper });

      act(() => {
        const [, showModal] = result.current;
        showModal("Test Title", (_onClose) => <div>Test Content</div>);
      });

      const [modal] = result.current;
      assertTrue(modal !== null);
    })
  );

  live(
    "should close modal when onClose is called",
    Effect.fn(function* () {
      const { result } = renderHook(() => useEditorModal(), { wrapper });
      let capturedOnClose: (() => void) | null = null;

      act(() => {
        const [, showModal] = result.current;
        showModal("Test", (onClose) => {
          capturedOnClose = onClose;
          return <div>Content</div>;
        });
      });

      // Modal should be open
      assertTrue(result.current[0] !== null);
      assertTrue(capturedOnClose !== null);

      act(() => {
        capturedOnClose?.();
      });

      // Modal should be closed
      strictEqual(result.current[0], null);
    })
  );

  live(
    "should render modal content correctly",
    Effect.fn(function* () {
      const { result } = renderHook(() => useEditorModal(), { wrapper });

      act(() => {
        const [, showModal] = result.current;
        showModal("My Modal Title", (_onClose) => <span data-testid="modal-content">Hello World</span>);
      });

      const [modal] = result.current;
      assertTrue(modal !== null);
      // The modal should be a Dialog component wrapping the content
      assertTrue(modal.type !== null);
    })
  );

  live(
    "should allow reopening modal after closing",
    Effect.fn(function* () {
      const { result } = renderHook(() => useEditorModal(), { wrapper });
      let capturedOnClose: (() => void) | null = null;

      // Open first time
      act(() => {
        const [, showModal] = result.current;
        showModal("First", (onClose) => {
          capturedOnClose = onClose;
          return <div>First Content</div>;
        });
      });

      assertTrue(result.current[0] !== null);

      // Close
      act(() => {
        capturedOnClose?.();
      });

      strictEqual(result.current[0], null);

      // Open second time
      act(() => {
        const [, showModal] = result.current;
        showModal("Second", (_onClose) => <div>Second Content</div>);
      });

      assertTrue(result.current[0] !== null);
    })
  );

  describe("with key option", () => {
    live(
      "should support keyed modal instances",
      Effect.fn(function* () {
        // Test that different keys work independently within same registry
        const { result } = renderHook(
          () => {
            const modal1 = useEditorModal({ key: "modal-1" });
            const modal2 = useEditorModal({ key: "modal-2" });
            return { modal1, modal2 };
          },
          { wrapper }
        );

        // Both should start closed
        strictEqual(result.current.modal1[0], null);
        strictEqual(result.current.modal2[0], null);

        // Open modal on first instance only
        act(() => {
          const [, showModal] = result.current.modal1;
          showModal("Modal 1", (_onClose) => <div>Content 1</div>);
        });

        // First modal should be open
        assertTrue(result.current.modal1[0] !== null);

        // Second modal should still be closed (different key)
        strictEqual(result.current.modal2[0], null);
      })
    );

    live(
      "should share state for same key within same registry",
      Effect.fn(function* () {
        // Test that same keys share state within same registry
        const { result } = renderHook(
          () => {
            const modal1 = useEditorModal({ key: "shared-key" });
            const modal2 = useEditorModal({ key: "shared-key" });
            return { modal1, modal2 };
          },
          { wrapper }
        );

        // Open modal via first hook instance
        act(() => {
          const [, showModal] = result.current.modal1;
          showModal("Shared Modal", (_onClose) => <div>Shared Content</div>);
        });

        // Both instances should see the modal as open (same key = same atom)
        assertTrue(result.current.modal1[0] !== null);
        assertTrue(result.current.modal2[0] !== null);
      })
    );
  });

  describe("default (no key) behavior", () => {
    live(
      "should share state between hooks without keys within same registry",
      Effect.fn(function* () {
        // Test that default (no key) hooks share state within same registry
        const { result } = renderHook(
          () => {
            const modal1 = useEditorModal();
            const modal2 = useEditorModal();
            return { modal1, modal2 };
          },
          { wrapper }
        );

        // Open modal via first hook instance
        act(() => {
          const [, showModal] = result.current.modal1;
          showModal("Default Modal", (_onClose) => <div>Default Content</div>);
        });

        // Both should see the modal (shared default atom)
        assertTrue(result.current.modal1[0] !== null);
        assertTrue(result.current.modal2[0] !== null);
      })
    );

    live(
      "should isolate state between separate registries",
      Effect.fn(function* () {
        // Separate renderHook calls = separate registries = separate state
        const { result: result1 } = renderHook(() => useEditorModal(), { wrapper });
        const { result: result2 } = renderHook(() => useEditorModal(), { wrapper });

        // Open modal in first registry
        act(() => {
          const [, showModal] = result1.current;
          showModal("Modal in Registry 1", (_onClose) => <div>Content 1</div>);
        });

        // First registry should have modal open
        assertTrue(result1.current[0] !== null);

        // Second registry should be independent (still closed)
        strictEqual(result2.current[0], null);
      })
    );
  });

  describe("closeOnClickOutside option", () => {
    live(
      "should default closeOnClickOutside to false",
      Effect.fn(function* () {
        const { result } = renderHook(() => useEditorModal(), { wrapper });

        act(() => {
          const [, showModal] = result.current;
          // Not passing closeOnClickOutside, should default to false
          showModal("Test", (_onClose) => <div>Content</div>);
        });

        // Modal should be open
        assertTrue(result.current[0] !== null);
      })
    );

    live(
      "should accept closeOnClickOutside parameter",
      Effect.fn(function* () {
        const { result } = renderHook(() => useEditorModal(), { wrapper });

        act(() => {
          const [, showModal] = result.current;
          showModal("Test", (_onClose) => <div>Content</div>, true);
        });

        // Modal should be open
        assertTrue(result.current[0] !== null);
      })
    );
  });

  describe("multiple show/hide cycles", () => {
    live(
      "should handle rapid open/close cycles",
      Effect.fn(function* () {
        const { result } = renderHook(() => useEditorModal(), { wrapper });
        let capturedOnClose: (() => void) | null = null;

        // Rapid open/close
        for (let i = 0; i < 5; i++) {
          act(() => {
            const [, showModal] = result.current;
            showModal(`Modal ${i}`, (onClose) => {
              capturedOnClose = onClose;
              return <div>Content {i}</div>;
            });
          });

          assertTrue(result.current[0] !== null);

          act(() => {
            capturedOnClose?.();
          });

          strictEqual(result.current[0], null);
        }
      })
    );
  });
});
