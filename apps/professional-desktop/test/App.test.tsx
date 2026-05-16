import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App.js";

describe.sequential("Professional Desktop app", () => {
  afterEach(cleanup);

  it("renders the minimal bootstrap shell", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Professional Desktop" })).toBeDefined();
    await waitFor(() => expect(screen.getByText("@beep/professional-desktop")).toBeDefined());
    expect(screen.getByText("agent-capability")).toBeDefined();
    expect(screen.getByText("workspace")).toBeDefined();
  });

  it("renders loader failures", async () => {
    render(<App loadDesktopHealth={() => Promise.reject(new Error("desktop bridge offline"))} />);

    await waitFor(() => expect(screen.getByText("desktop bridge offline")).toBeDefined());
  });
});
