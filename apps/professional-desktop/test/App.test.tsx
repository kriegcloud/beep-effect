import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "@/App";

describe.concurrent("Professional Desktop app", () => {
  afterEach(cleanup);

  it("renders the minimal bootstrap shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Professional Desktop" })).toBeInTheDocument();
    return waitFor(() => expect(screen.getByText("@beep/professional-desktop")).toBeInTheDocument()).then(() => {
      expect(screen.getAllByText("Preview mode is active in the web shell.").length).toBeGreaterThan(0);
      expect(screen.getAllByText("agent-capability").length).toBeGreaterThan(0);
      expect(screen.getAllByText("workspace").length).toBeGreaterThan(0);
    });
  });

  it("renders loader failures", () => {
    render(<App loadDesktopHealth={() => Promise.reject(new Error("desktop bridge offline"))} />);

    return waitFor(() => expect(screen.getByText("desktop bridge offline")).toBeInTheDocument());
  });
});
