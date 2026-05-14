import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App.js";

describe("Stack Installer app", () => {
  afterEach(cleanup);

  it("renders the P1 workbench", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Install Workbench" })).toBeDefined();
    expect(screen.getByText("Claude Provider")).toBeDefined();
    expect(screen.getByText("Discord is represented as the only v1 channel.")).toBeDefined();
  });

  it("rejects plaintext Discord bot tokens before invoking the desktop proof runner", () => {
    render(<App />);

    const tokenInput = screen.getAllByLabelText("Bot Token Reference")[0];
    const runButton = screen.getAllByRole("button", { name: "Run Proof" })[0];

    expect(tokenInput).toBeDefined();
    expect(runButton).toBeDefined();
    if (tokenInput === undefined || runButton === undefined) {
      return;
    }

    fireEvent.change(tokenInput, {
      target: { value: "plaintext-token" },
    });
    fireEvent.click(runButton);

    expect(screen.getAllByText("Discord bot token must be a 1Password reference.").length).toBeGreaterThan(0);
  });
});
