import { it } from "@beep/test-runner";
import { expect } from "@effect/vitest";
import { createRoot } from "react-dom/client";
import { describe, vi } from "vitest";

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

describe("browser startup", () => {
  it("mounts only when the root element exists", async ({ onTestFinished }) => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.replaceChildren();

    await import("../src/main.tsx");
    expect(createRoot).not.toHaveBeenCalled();

    const container = document.createElement("div");
    container.id = "root";
    document.body.append(container);
    onTestFinished(() => container.remove());
    vi.resetModules();

    await import("../src/main.tsx");

    expect(createRoot).toHaveBeenCalledExactlyOnceWith(container);
    expect(vi.mocked(createRoot).mock.results[0]?.value.render).toHaveBeenCalledExactlyOnceWith(expect.anything());
  });
});
