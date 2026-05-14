import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App.js";

describe("Stack Installer app", () => {
  it("renders the P1A workbench", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Install Workbench" })).toBeDefined();
    expect(screen.getByText("Claude Provider")).toBeDefined();
    expect(screen.getByText("Discord is represented as the only v1 channel.")).toBeDefined();
  });
});
