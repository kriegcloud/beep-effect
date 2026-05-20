import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App.js";

describe.sequential("Professional Desktop app", () => {
  afterEach(cleanup);

  it("renders the minimal bootstrap shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Professional Desktop" })).toBeInTheDocument();
    return waitFor(() => expect(screen.getByText("@beep/professional-desktop")).toBeInTheDocument()).then(() => {
      expect(screen.getByText("Preview mode is active in the web shell.")).toBeInTheDocument();
      expect(screen.getByText("agent-capability")).toBeInTheDocument();
      expect(screen.getByText("workspace")).toBeInTheDocument();
    });
  });

  it("renders loader failures", () => {
    render(<App loadDesktopHealth={() => Promise.reject(new Error("desktop bridge offline"))} />);

    return waitFor(() => expect(screen.getByText("desktop bridge offline")).toBeInTheDocument());
  });
});
