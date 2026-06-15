import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "@/App";

describe("Professional Desktop app", () => {
  afterEach(cleanup);

  it("mounts the chat shell", () => {
    const { getByTestId, unmount } = render(<App />);

    // the app is now a thin wrapper over the chat surface: the sidebar,
    // composer-creation control, and chat frame render in the empty/loading
    // state without a live sidecar.
    expect(getByTestId("chat-app")).toBeInTheDocument();
    expect(getByTestId("sidebar")).toBeInTheDocument();
    expect(getByTestId("sidebar-new")).toBeInTheDocument();
    unmount();
  });

  it("renders the empty no-thread state when no thread is selected and no server is reachable", () => {
    const { getByTestId, getByText, unmount } = render(<App />);

    expect(getByTestId("chat-no-thread")).toBeInTheDocument();
    expect(getByText("Create a thread to get started.")).toBeInTheDocument();
    unmount();
  });
});
