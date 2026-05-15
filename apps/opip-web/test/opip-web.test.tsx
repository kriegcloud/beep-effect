import { Button } from "@beep/ui/components/ui/button";
import { cleanup, render, screen } from "@testing-library/react";
import * as Result from "effect/Result";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../src/app/page.tsx";
import { OpipThemeProvider } from "../src/components/OpipThemeProvider.tsx";
import { decodeOpipSiteContentResult, launchReviewGates, opipSiteContent, ReviewStatus } from "../src/content/index.ts";
import { VERSION } from "../src/index.ts";

vi.mock("next/image", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  type MockNextImageProps = React.ComponentProps<"img"> & {
    readonly fill?: boolean;
    readonly priority?: boolean;
    readonly quality?: number | string;
  };

  return {
    default: ({ fill: _fill, priority: _priority, quality: _quality, ...props }: MockNextImageProps) =>
      ReactModule.createElement("img", props),
  };
});

describe("@beep/opip-web", () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.style.colorScheme = "";
    window.localStorage.clear();
  });

  it("exposes the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("renders a shared @beep/ui button", () => {
    render(<Button>Shared UI Button</Button>);

    expect(screen.getByRole("button", { name: "Shared UI Button" })).toBeDefined();
  });

  it("exports the main page as a valid React element", async () => {
    expect(React.isValidElement(await Home({}))).toBe(true);
  });

  it("decodes the static OPIP launch content", () => {
    const result = decodeOpipSiteContentResult(opipSiteContent);

    expect(Result.isSuccess(result)).toBe(true);
  });

  it("renders the OPIP public headline and contact CTA", async () => {
    render(await Home({}));

    expect(screen.getByRole("heading", { name: /thirty years between a planter row/i })).toBeDefined();
    expect(screen.getByRole("link", { name: opipSiteContent.contact.email })).toBeDefined();
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
  });

  it("renders the progressive theme toggle hook for the static layout script", async () => {
    render(await Home({}));

    const toggle = screen.getAllByRole("button", { name: "Switch to dark mode" }).at(-1);

    expect(toggle?.getAttribute("data-opip-theme-toggle")).toBe("");
    expect(toggle?.getAttribute("data-theme-mode")).toBe("light");
    expect(toggle?.getAttribute("aria-pressed")).toBe("false");
  });

  it("provides an optional OPIP MUI theme override provider", () => {
    render(
      <OpipThemeProvider>
        <Button>OPIP themed child</Button>
      </OpipThemeProvider>
    );

    expect(screen.getByRole("button", { name: "OPIP themed child" })).toBeDefined();
  });

  it("keeps launch-risk content review-gated", () => {
    expect(launchReviewGates.clientLogos.status).toBe(ReviewStatus.Enum.needs_review);
    expect(launchReviewGates.contact.status).toBe(ReviewStatus.Enum.needs_review);
    expect(opipSiteContent.clients.every((client) => ReviewStatus.is.needs_review(client.review.status))).toBe(true);
    expect(opipSiteContent.matters.every((matter) => ReviewStatus.is.needs_review(matter.review.status))).toBe(true);
  });
});
