import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App.js";

const runProofMock = vi.fn();

const submitProofForm = () => {
  const runButton = screen.getAllByRole("button", { name: "Run Proof" })[0];
  const form = runButton?.closest("form");

  expect(form).toBeDefined();
  if (form === null) {
    return;
  }

  fireEvent.submit(form);
};

describe.sequential("Stack Installer app", () => {
  beforeEach(() => {
    runProofMock.mockReset();
  });

  afterEach(cleanup);

  it("renders the P1 workbench", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Install Workbench" })).toBeDefined();
    expect(screen.getByText("Claude Provider")).toBeDefined();
    expect(screen.getByText("Discord is represented as the only v1 channel.")).toBeDefined();
    expect(screen.queryByRole("option", { name: "Linux" })).toBeNull();
  });

  it("rejects plaintext Discord bot tokens before invoking the desktop proof runner", () => {
    render(<App runP1ManualProof={runProofMock} />);

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
    submitProofForm();

    expect(screen.getAllByText("Discord bot token must be a 1Password reference.").length).toBeGreaterThan(0);
    expect(runProofMock).not.toHaveBeenCalled();
  });

  it("runs the Tauri P1 proof command with sanitized form values", () => {
    runProofMock.mockResolvedValueOnce("sanitized proof output");
    render(<App runP1ManualProof={runProofMock} />);

    fireEvent.change(screen.getAllByLabelText("Guild ID")[0], {
      target: { value: "guild-1" },
    });
    fireEvent.change(screen.getAllByLabelText("Channel ID")[0], {
      target: { value: "channel-1" },
    });
    fireEvent.change(screen.getAllByLabelText("Operator")[0], {
      target: { value: "operator-macos-001" },
    });
    submitProofForm();

    return waitFor(() => expect(runProofMock).toHaveBeenCalled()).then(() =>
      waitFor(() => expect(screen.getByText("sanitized proof output")).toBeDefined()).then(() => {
        expect(runProofMock).toHaveBeenCalledWith({
          discordBotTokenReference: "op://Private/Discord Bot/token",
          discordChannelDisplayName: "ai-stack-installer",
          discordChannelId: "channel-1",
          discordGuildId: "guild-1",
          operatorLabel: "operator-macos-001",
          targetPlatform: "macos",
          testMessageContent: "Stack Installer P1 Manual Mode proof",
        });
      })
    );
  });

  it("renders string Tauri proof errors", () => {
    runProofMock.mockRejectedValueOnce("proof rejected");
    render(<App runP1ManualProof={runProofMock} />);

    submitProofForm();

    return waitFor(() => expect(screen.getByText("proof rejected")).toBeDefined());
  });

  it("renders object Tauri proof errors", () => {
    runProofMock.mockRejectedValueOnce(new Error("provider auth missing"));
    render(<App runP1ManualProof={runProofMock} />);

    submitProofForm();

    return waitFor(() => expect(screen.getByText("provider auth missing")).toBeDefined());
  });

  it("falls back for unknown Tauri proof errors", () => {
    runProofMock.mockRejectedValueOnce({ reason: "opaque" });
    render(<App runP1ManualProof={runProofMock} />);

    submitProofForm();

    return waitFor(() =>
      expect(screen.getByText("P1 proof failed before sanitized output was returned.")).toBeDefined()
    );
  });
});
