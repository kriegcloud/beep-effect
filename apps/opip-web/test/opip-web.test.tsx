import { Button } from "@beep/ui/components/ui/button";
import { render, screen } from "@testing-library/react";
import * as Result from "effect/Result";
import * as React from "react";
import { describe, expect, it } from "vitest";
import Home from "../src/app/page.tsx";
import { decodeOpipSiteContentResult, launchReviewGates, opipSiteContent, ReviewStatus } from "../src/content/index.ts";
import { VERSION } from "../src/index.ts";

describe("@beep/opip-web", () => {
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
  });

  it("keeps launch-risk content review-gated", () => {
    expect(launchReviewGates.clientLogos.status).toBe(ReviewStatus.Enum.needs_review);
    expect(launchReviewGates.contact.status).toBe(ReviewStatus.Enum.needs_review);
    expect(opipSiteContent.clients.every((client) => ReviewStatus.is.needs_review(client.review.status))).toBe(true);
    expect(opipSiteContent.matters.every((matter) => ReviewStatus.is.needs_review(matter.review.status))).toBe(true);
  });
});
