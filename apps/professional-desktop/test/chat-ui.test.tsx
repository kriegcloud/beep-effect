/**
 * jsdom render tests for the desktop chat UI.
 *
 * These exercise the render side only: the chat atoms require a live rpc
 * sidecar to resolve, so the timeline/thread-list queries stay in their pending
 * (loading) state here. The tests assert the shell, the streaming-block
 * renderer, and the persisted-message viewer render without throwing — live
 * send/edit/stream behavior is covered by the in-memory chat-contract test and,
 * end-to-end, requires the sidecar.
 */
import "@testing-library/jest-dom/vitest";
import * as Md from "@beep/md/Md.model";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChatApp } from "@/chat/ui/ChatApp";
import { MessageView } from "@/chat/ui/MessageView";
import { StreamingBlocks } from "@/chat/ui/StreamingBlocks";
import type { AssistantBlock } from "@beep/agents-domain/values/AssistantContent";

afterEach(cleanup);

describe("StreamingBlocks", () => {
  it("renders the v1 block vocabulary to the expected tags", () => {
    const blocks: ReadonlyArray<AssistantBlock> = [
      { type: "heading", level: "h2", children: [{ type: "text", text: "Title" }] },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "bold", bold: true },
          { type: "text", text: " and " },
          { type: "text", text: "italic", italic: true },
          { type: "link", url: "https://example.com", text: "link" },
        ],
      },
      { type: "quote", children: [{ type: "text", text: "a quote" }] },
      { type: "list", listType: "bullet", items: [{ children: [{ type: "text", text: "one" }] }] },
      { type: "list", listType: "number", items: [{ children: [{ type: "text", text: "two" }] }] },
      { type: "code", code: "console.log('beep')" },
    ];

    const { container } = render(<StreamingBlocks blocks={blocks} />);

    expect(container.querySelector("h2")).toHaveTextContent("Title");
    expect(container.querySelector("p")).toBeInTheDocument();
    expect(container.querySelector("strong")).toHaveTextContent("bold");
    expect(container.querySelector("em")).toHaveTextContent("italic");
    expect(container.querySelector("a")).toHaveAttribute("href", "https://example.com");
    expect(container.querySelector("blockquote")).toHaveTextContent("a quote");
    expect(container.querySelector("ul")).toHaveTextContent("one");
    expect(container.querySelector("ol")).toHaveTextContent("two");
    expect(container.querySelector("pre code")).toHaveTextContent("console.log('beep')");
  });

  it("renders nothing problematic for an empty block array", () => {
    const { container } = render(<StreamingBlocks blocks={[]} />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});

describe("MessageView", () => {
  it("renders a persisted Md.Document's text", () => {
    const document = Md.Document.make({
      children: [Md.P.make({ children: [Md.Text.make({ value: "hello from a persisted message" })] })],
    });

    const { getByText, unmount } = render(<MessageView content={document} />);

    expect(getByText("hello from a persisted message")).toBeInTheDocument();
    unmount();
  });
});

describe("ChatApp", () => {
  it("renders the chat shell in its empty/loading state without a live server", () => {
    const { getByTestId, unmount } = render(<ChatApp />);

    // shell chrome: sidebar (with the New thread control) and the app frame.
    expect(getByTestId("chat-app")).toBeInTheDocument();
    expect(getByTestId("sidebar")).toBeInTheDocument();
    expect(getByTestId("sidebar-new")).toBeInTheDocument();
    // with no live server and no selection, no thread is active yet.
    expect(getByTestId("chat-no-thread")).toBeInTheDocument();
    unmount();
  });
});
