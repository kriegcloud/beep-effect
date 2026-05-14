import { Button } from "@beep/ui/components/ui/button";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import * as Result from "effect/Result";
import * as React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "../src/app/page.tsx";
import { OpipThemeProvider } from "../src/components/OpipThemeProvider.tsx";
import { decodeOpipSiteContentResult, launchReviewGates, opipSiteContent, ReviewStatus } from "../src/content/index.ts";
import { VERSION } from "../src/index.ts";

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

  it("exports the main page as a valid React element", () => {
    expect(React.isValidElement(<Home />)).toBe(true);
  });

  it("decodes the static OPIP launch content", () => {
    const result = decodeOpipSiteContentResult(opipSiteContent);

    expect(Result.isSuccess(result)).toBe(true);
  });

  it("renders the OPIP public headline and contact CTA", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /thirty years between a planter row/i })).toBeDefined();
    expect(screen.getByRole("link", { name: opipSiteContent.contact.email })).toBeDefined();
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
  });

  it("toggles the app theme without depending on MUI color-scheme context updates", () => {
    const { container } = render(<Home />);

    fireEvent.click(within(container).getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(window.localStorage.getItem("opip-theme-mode")).toBe("dark");
    expect(window.localStorage.getItem("mui-mode")).toBe("dark");
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
