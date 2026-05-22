import "@testing-library/jest-dom/vitest";
import { App, CanvasCommandError, makePreviewCanvasCommandBridge } from "@beep/canvas";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";

describe.sequential("Canvas app", () => {
  afterEach(cleanup);

  it("renders the functional shell and loads bridge health", () => {
    render(<App loadBridge={makePreviewCanvasCommandBridge} />);

    expect(screen.getByRole("heading", { name: "Canvas" })).toBeInTheDocument();
    return waitFor(() => expect(screen.getByText("@beep/canvas")).toBeInTheDocument()).then(() => {
      expect(screen.getByRole("button", { name: "Create Scene" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Load" })).toBeInTheDocument();
    });
  });

  it("renders bridge failures", () => {
    render(<App loadBridge={() => Effect.fail(new CanvasCommandError({ message: "canvas bridge offline" }))} />);

    return waitFor(() => expect(screen.getByText("canvas bridge offline")).toBeInTheDocument());
  });
});
