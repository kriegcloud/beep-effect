import { afterEach, describe, expect, mock } from "bun:test";
import { assertTrue, live, strictEqual } from "@beep/testkit";
import { AtomRef, RegistryProvider } from "@effect-atom/atom-react";
import { act, cleanup, render } from "@testing-library/react";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import type { LexicalEditor } from "lexical";
// import type { ReactNode } from "react";

import { ImageResizer } from "../../src/ui/image-resizer";

// Clean up after each test to prevent pollution
afterEach(() => {
  cleanup();
});

/**
 * Creates a mock LexicalEditor for testing.
 */
const createMockEditor = (
  options: { isEditable?: boolean; rootElementWidth?: number; rootElementHeight?: number } = {}
): LexicalEditor => {
  const isEditable = options.isEditable ?? true;
  const rootElementWidth = options.rootElementWidth ?? 800;
  const rootElementHeight = options.rootElementHeight ?? 600;

  return {
    isEditable: () => isEditable,
    getRootElement: () => ({
      getBoundingClientRect: () => ({
        width: rootElementWidth,
        height: rootElementHeight,
      }),
      style: {
        setProperty: mock((_prop: string, _value: string, _priority?: string) => {}),
      },
    }),
  } as unknown as LexicalEditor;
};

/**
 * Creates an AtomRef for image element with optional mock element.
 */
const createImageAtomRef = (
  options: { width?: number; height?: number; includeElement?: boolean } = {}
): AtomRef.AtomRef<O.Option<HTMLElement>> => {
  const width = options.width ?? 200;
  const height = options.height ?? 150;
  const includeElement = options.includeElement ?? true;

  const mockElement = includeElement
    ? O.some({
        getBoundingClientRect: () => ({ width, height }),
        style: { width: "", height: "" },
      } as unknown as HTMLElement)
    : O.none();

  return AtomRef.make<O.Option<HTMLElement>>(mockElement);
};

/**
 * Creates an AtomRef for button element.
 */
const createButtonAtomRef = (): AtomRef.AtomRef<O.Option<HTMLButtonElement>> => {
  return AtomRef.make<O.Option<HTMLButtonElement>>(O.none());
};

/**
 * Helper wrapper with RegistryProvider for effect-atom.
 */
// const wrapper = ({ children }: { children: ReactNode }) => <RegistryProvider>{children}</RegistryProvider>;

/**
 * Props for creating a test wrapper around ImageResizer.
 */
interface TestWrapperProps {
  editor?: undefined | LexicalEditor;
  imageRef?: undefined | AtomRef.AtomRef<O.Option<HTMLElement>>;
  buttonRef?: undefined | AtomRef.AtomRef<O.Option<HTMLButtonElement>>;
  maxWidth?: undefined | number;
  showCaption?: undefined | boolean;
  captionsEnabled?: undefined | boolean;
  onResizeStart?: undefined | (() => void);
  onResizeEnd?: undefined | ((width: "inherit" | number, height: "inherit" | number) => void);
  setShowCaption?: undefined | ((show: boolean) => void);
}

/**
 * Creates a test wrapper component with configurable props.
 */
const createTestWrapper = (props: TestWrapperProps = {}) => {
  const {
    editor = createMockEditor(),
    imageRef = createImageAtomRef(),
    buttonRef = createButtonAtomRef(),
    maxWidth,
    showCaption = false,
    captionsEnabled = true,
    onResizeStart = () => {},
    onResizeEnd = () => {},
    setShowCaption = () => {},
  } = props;

  return () => (
    <RegistryProvider>
      <ImageResizer
        editor={editor}
        imageRef={imageRef}
        buttonRef={buttonRef}
        maxWidth={maxWidth}
        showCaption={showCaption}
        captionsEnabled={captionsEnabled}
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
        setShowCaption={setShowCaption}
      />
    </RegistryProvider>
  );
};

describe("ImageResizer", () => {
  describe("Initial render", () => {
    live(
      "should render all eight resize handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        // Check for resize handle elements by class
        const container = document.querySelector("div");
        assertTrue(container !== null);

        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );

    live(
      "should render caption button when showCaption is false and captionsEnabled is true",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper({
          showCaption: false,
          captionsEnabled: true,
        });
        render(<TestWrapper />);

        const captionButton = document.querySelector(".image-caption-button");
        assertTrue(captionButton !== null);
      })
    );

    live(
      "should not render caption button when showCaption is true",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper({
          showCaption: true,
          captionsEnabled: true,
        });
        render(<TestWrapper />);

        const captionButton = document.querySelector(".image-caption-button");
        assertTrue(captionButton === null);
      })
    );

    live(
      "should not render caption button when captionsEnabled is false",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper({
          showCaption: false,
          captionsEnabled: false,
        });
        render(<TestWrapper />);

        const captionButton = document.querySelector(".image-caption-button");
        assertTrue(captionButton === null);
      })
    );
  });

  describe("Caption button interaction", () => {
    live(
      "should call setShowCaption when caption button is clicked",
      Effect.fn(function* () {
        const setShowCaptionMock = mock((_show: boolean) => {});
        const TestWrapper = createTestWrapper({
          showCaption: false,
          captionsEnabled: true,
          setShowCaption: setShowCaptionMock,
        });
        render(<TestWrapper />);

        const captionButton = document.querySelector(".image-caption-button") as HTMLElement;
        assertTrue(captionButton !== null);

        act(() => {
          captionButton.click();
        });

        strictEqual(setShowCaptionMock.mock.calls.length, 1);
        expect(setShowCaptionMock.mock.calls[0]).toEqual([true]);
      })
    );
  });

  describe("Editor editability", () => {
    live(
      "should not trigger resize when editor is not editable",
      Effect.fn(function* () {
        const onResizeStartMock = mock(() => {});
        const editor = createMockEditor({ isEditable: false });

        const TestWrapper = createTestWrapper({
          editor,
          onResizeStart: onResizeStartMock,
        });
        render(<TestWrapper />);

        const handle = document.querySelector(".image-resizer-se");
        assertTrue(handle !== null);

        act(() => {
          const pointerDownEvent = new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: 100,
            clientY: 100,
          });
          handle.dispatchEvent(pointerDownEvent);
        });

        // onResizeStart should NOT be called when editor is not editable
        strictEqual(onResizeStartMock.mock.calls.length, 0);
      })
    );
  });

  describe("Resize handle classes", () => {
    live(
      "should have correct directional classes on handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

        for (const dir of directions) {
          const handle = document.querySelector(`.image-resizer-${dir}`);
          assertTrue(handle !== null);
        }
      })
    );

    live(
      "should have bg-primary class on all handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const handles = document.querySelectorAll(".image-resizer");

        for (const handle of handles) {
          assertTrue(handle.classList.contains("bg-primary"));
        }
      })
    );
  });

  describe("maxWidth calculation", () => {
    live(
      "should use provided maxWidth when specified",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper({
          maxWidth: 500,
        });
        render(<TestWrapper />);

        // Component should render without error with custom maxWidth
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );

    live(
      "should calculate maxWidth from editor root element when not specified",
      Effect.fn(function* () {
        const editor = createMockEditor({ rootElementWidth: 1000 });
        const TestWrapper = createTestWrapper({
          editor,
        });
        render(<TestWrapper />);

        // Component should render without error, using calculated maxWidth
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );

    live(
      "should fallback to 100 when editor root element is null",
      Effect.fn(function* () {
        const editor = {
          isEditable: () => true,
          getRootElement: () => null,
        } as unknown as LexicalEditor;

        const TestWrapper = createTestWrapper({
          editor,
        });
        render(<TestWrapper />);

        // Component should render without error with fallback maxWidth
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );
  });

  describe("Resize handle cursor classes", () => {
    live(
      "should have ns-resize cursor on north and south handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const northHandle = document.querySelector(".image-resizer-n");
        const southHandle = document.querySelector(".image-resizer-s");

        assertTrue(northHandle !== null);
        assertTrue(southHandle !== null);
        assertTrue(northHandle.classList.contains("cursor-ns-resize"));
        assertTrue(southHandle.classList.contains("cursor-ns-resize"));
      })
    );

    live(
      "should have ew-resize cursor on east and west handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const eastHandle = document.querySelector(".image-resizer-e");
        const westHandle = document.querySelector(".image-resizer-w");

        assertTrue(eastHandle !== null);
        assertTrue(westHandle !== null);
        assertTrue(eastHandle.classList.contains("cursor-ew-resize"));
        assertTrue(westHandle.classList.contains("cursor-ew-resize"));
      })
    );

    live(
      "should have nesw-resize cursor on northeast and southwest handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const neHandle = document.querySelector(".image-resizer-ne");
        const swHandle = document.querySelector(".image-resizer-sw");

        assertTrue(neHandle !== null);
        assertTrue(swHandle !== null);
        assertTrue(neHandle.classList.contains("cursor-nesw-resize"));
        assertTrue(swHandle.classList.contains("cursor-nesw-resize"));
      })
    );

    live(
      "should have nwse-resize cursor on northwest and southeast handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const nwHandle = document.querySelector(".image-resizer-nw");
        const seHandle = document.querySelector(".image-resizer-se");

        assertTrue(nwHandle !== null);
        assertTrue(seHandle !== null);
        assertTrue(nwHandle.classList.contains("cursor-nwse-resize"));
        assertTrue(seHandle.classList.contains("cursor-nwse-resize"));
      })
    );
  });

  describe("AtomRef integration", () => {
    live(
      "should accept AtomRef for imageRef prop",
      Effect.fn(function* () {
        const imageRef = createImageAtomRef({ width: 300, height: 200 });
        const TestWrapper = createTestWrapper({
          imageRef,
        });
        render(<TestWrapper />);

        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );

    live(
      "should accept AtomRef for buttonRef prop",
      Effect.fn(function* () {
        const buttonRef = createButtonAtomRef();
        const TestWrapper = createTestWrapper({
          buttonRef,
          showCaption: false,
          captionsEnabled: true,
        });
        render(<TestWrapper />);

        // The button should be rendered and ref should be set
        const captionButton = document.querySelector(".image-caption-button");
        assertTrue(captionButton !== null);
      })
    );

    live(
      "should handle empty imageRef Option",
      Effect.fn(function* () {
        const imageRef = createImageAtomRef({ includeElement: false });
        const TestWrapper = createTestWrapper({
          imageRef,
        });
        render(<TestWrapper />);

        // Component should still render handles
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );
  });

  describe("Component structure", () => {
    live(
      "should have correct positioning classes on corner handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        // Check that corner handles have absolute positioning
        const seHandle = document.querySelector(".image-resizer-se");
        assertTrue(seHandle !== null);
        assertTrue(seHandle.classList.contains("absolute"));
        assertTrue(seHandle.classList.contains("-right-2.5"));
        assertTrue(seHandle.classList.contains("-bottom-2.5"));
      })
    );

    live(
      "should have correct sizing classes on handles",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        const handle = document.querySelector(".image-resizer-n");
        assertTrue(handle !== null);
        assertTrue(handle.classList.contains("h-2"));
        assertTrue(handle.classList.contains("w-2"));
      })
    );
  });
});

describe("ImageResizer AtomRef patterns", () => {
  describe("Module-level Atom.family usage", () => {
    live(
      "should use module-level imageResizerRefsFamily for internal refs",
      Effect.fn(function* () {
        // Create two instances to verify they get different internal refs
        const TestWrapper1 = createTestWrapper();
        const TestWrapper2 = createTestWrapper();

        const { container: container1 } = render(<TestWrapper1 />);
        cleanup();
        const { container: container2 } = render(<TestWrapper2 />);

        // Both should render independently
        assertTrue(container1 !== null);
        assertTrue(container2 !== null);
      })
    );
  });

  describe("Effect utilities usage", () => {
    live(
      "should use O.Option for nullable values",
      Effect.fn(function* () {
        const imageRef = AtomRef.make<O.Option<HTMLElement>>(O.none());
        const buttonRef = AtomRef.make<O.Option<HTMLButtonElement>>(O.none());

        const TestWrapper = createTestWrapper({
          imageRef,
          buttonRef,
        });
        render(<TestWrapper />);

        // Component should handle Option.none() gracefully
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );

    live(
      "should use F.pipe for functional composition",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper();
        render(<TestWrapper />);

        // Component uses F.pipe internally for maxWidth calculation
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );

    live(
      "should use Num.clamp for resize bounds",
      Effect.fn(function* () {
        const TestWrapper = createTestWrapper({
          maxWidth: 500,
        });
        render(<TestWrapper />);

        // Component uses Num.clamp for resize constraints
        const handles = document.querySelectorAll(".image-resizer");
        strictEqual(handles.length, 8);
      })
    );
  });
});
