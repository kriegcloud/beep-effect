import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App.js";

const loadHealthMock = vi.fn();
const runRepairMock = vi.fn();

const repairRequiredHealth = {
  dependency: {
    detectedVersion: "1.3.11",
    id: "bun",
    installHint: "Run the focused Bun repair flow from the desktop app.",
    kind: "runtime",
    name: "Bun",
    requiredVersion: "1.3.14",
    status: "present",
  },
  state: "repair-required",
  summary: "Bun 1.3.11 is older than the required version 1.3.14.",
};

const healthyRepairResult = {
  after: {
    dependency: {
      detectedVersion: "1.3.14",
      id: "bun",
      installHint: "Run the focused Bun repair flow from the desktop app.",
      kind: "runtime",
      name: "Bun",
      requiredVersion: "1.3.14",
      status: "present",
    },
    state: "healthy",
    summary: "Bun 1.3.14 satisfies the required version 1.3.14.",
  },
  before: repairRequiredHealth,
  changed: true,
  command: "bun upgrade",
  summary: "Bun repair completed. Bun 1.3.14 satisfies the required version 1.3.14.",
};

const healthyHealth = healthyRepairResult.after;

describe.sequential("Stack Installer app", () => {
  beforeEach(() => {
    loadHealthMock.mockReset();
    runRepairMock.mockReset();
    loadHealthMock.mockResolvedValue(repairRequiredHealth);
  });

  afterEach(cleanup);

  it("renders the focused Bun repair flow", async () => {
    render(<App loadBunRuntimeHealth={loadHealthMock} runBunRuntimeRepair={runRepairMock} />);

    expect(screen.getByRole("heading", { name: "Bun Repair" })).toBeDefined();
    await waitFor(() => expect(screen.getAllByText("Repair Needed").length).toBeGreaterThan(0));
    expect(screen.getByText("Bun 1.3.11 is older than the required version 1.3.14.")).toBeDefined();
  });

  it("runs the repair action and renders the before and after state", async () => {
    let resolveRepair: ((value: typeof healthyRepairResult) => void) | undefined;
    runRepairMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRepair = resolve;
        })
    );
    render(<App loadBunRuntimeHealth={loadHealthMock} runBunRuntimeRepair={runRepairMock} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Approve Repair" })).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: "Approve Repair" }));

    await waitFor(() => expect(runRepairMock).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Repair in progress")).toBeDefined());
    expect(
      screen.getAllByText("Approval was received. The installer is running the Bun repair workflow now.").length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Repairing Bun" })).toBeDefined();

    resolveRepair?.(healthyRepairResult);

    await waitFor(() => expect(screen.getByText("Repair complete")).toBeDefined());
    expect(screen.getByText("Executed command: bun upgrade")).toBeDefined();
    expect(screen.getAllByText("1.3.14").length).toBeGreaterThan(0);
  });

  it("renders inspection errors", async () => {
    loadHealthMock.mockRejectedValueOnce(new Error("inspection unavailable"));
    render(<App loadBunRuntimeHealth={loadHealthMock} runBunRuntimeRepair={runRepairMock} />);

    await waitFor(() => expect(screen.getByText("inspection unavailable")).toBeDefined());
  });

  it("renders repair errors", async () => {
    runRepairMock.mockRejectedValueOnce(new Error("upgrade failed"));
    render(<App loadBunRuntimeHealth={loadHealthMock} runBunRuntimeRepair={runRepairMock} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Approve Repair" })).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: "Approve Repair" }));

    await waitFor(() => expect(screen.getByText("upgrade failed")).toBeDefined());
  });

  it("shows a clear no-op state when Bun is already healthy", async () => {
    loadHealthMock.mockResolvedValueOnce(healthyHealth);
    render(<App loadBunRuntimeHealth={loadHealthMock} runBunRuntimeRepair={runRepairMock} />);

    await waitFor(() => expect(screen.getAllByText("Healthy").length).toBeGreaterThan(0));
    expect(screen.getByRole("button", { name: "Already Healthy" }).getAttribute("disabled")).not.toBeNull();
    expect(
      screen.getByText("No repair action is available because Bun already satisfies the required version.")
    ).toBeDefined();
  });
});
