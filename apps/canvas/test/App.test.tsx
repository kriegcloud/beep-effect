import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "@/App";
import { CanvasCommandError, makePreviewCanvasCommandBridge } from "@/commandBridge";

describe("Canvas app", { concurrent: false }, () => {
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
    render(<App loadBridge={Effect.fail(CanvasCommandError.make({ message: "canvas bridge offline" }))} />);

    return waitFor(() => expect(screen.getByText("canvas bridge offline")).toBeInTheDocument());
  });
});
