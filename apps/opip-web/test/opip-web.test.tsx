import { VERSION } from "@beep/opip-web";
import { decodeContactSubmission, submitContact } from "@beep/opip-web/contact";
import { decodeOpipSiteContentResult, launchReviewGates, opipSiteContent, ReviewStatus } from "@beep/opip-web/content";
import { Button } from "@beep/ui/components/ui/button";
import { cleanup, render, screen } from "@testing-library/react";
import { ConfigProvider, Effect, Exit } from "effect";
import * as Result from "effect/Result";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../src/app/page.tsx";
import { OpipThemeProvider } from "../src/components/OpipThemeProvider.tsx";

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

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-nonce": "test-nonce" }),
}));

const validContactPayload = () => ({
  email: "TOM@EXAMPLE.COM",
  message: "I would like help protecting a new machine design.",
  name: " Thomas Oppold ",
  submittedAt: 0,
});

const withContactConfig = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.provide(
    effect,
    ConfigProvider.layer(
      ConfigProvider.fromUnknown({
        CRM_HUBSPOT_ACCOUNT_ID: "12345",
        CRM_HUBSPOT_SERVICE_KEY: "hubspot-service-key",
      })
    )
  );

const withoutContactConfig = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.provide(effect, ConfigProvider.layer(ConfigProvider.fromUnknown({})));

const hubSpotResponse = (body: unknown, status = 200): Response =>
  Response.json(body, {
    headers: {
      "content-type": "application/json",
    },
    status,
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

  it("rejects malformed contact payloads at the schema boundary", async () => {
    const emailExit = await Effect.runPromiseExit(
      decodeContactSubmission({
        ...validContactPayload(),
        email: "not-an-email",
      })
    );
    const messageExit = await Effect.runPromiseExit(
      decodeContactSubmission({
        ...validContactPayload(),
        message: "short",
      })
    );
    const submittedAtExit = await Effect.runPromiseExit(
      decodeContactSubmission({
        ...validContactPayload(),
        submittedAt: Number.POSITIVE_INFINITY,
      })
    );

    expect(Exit.isFailure(emailExit)).toBe(true);
    expect(Exit.isFailure(messageExit)).toBe(true);
    expect(Exit.isFailure(submittedAtExit)).toBe(true);
  });

  it("normalizes accepted contact payload fields before provider submission", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(hubSpotResponse({ results: [{ id: "contact-id" }] }));

    const response = await Effect.runPromise(withContactConfig(submitContact(validContactPayload())));

    expect(response.status).toBe("accepted");
    fetchSpy.mockRestore();
  });

  it("rejects contact submissions when HubSpot config is absent", async () => {
    const response = await Effect.runPromise(withoutContactConfig(submitContact(validContactPayload())));

    expect(response.status).toBe("rejected");
    expect(response.message).toBe("Contact intake is not configured.");
  });

  it("rejects contact submissions when spam controls fail", async () => {
    const response = await Effect.runPromise(
      withContactConfig(
        submitContact({
          ...validContactPayload(),
          website: "https://example.test",
        })
      )
    );

    expect(response.status).toBe("rejected");
  });

  it("logs and rejects contact submissions when the provider fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubSpotResponse({ message: "unavailable" }, 503));

    const response = await Effect.runPromise(withContactConfig(submitContact(validContactPayload())));

    expect(response.status).toBe("rejected");
    fetchSpy.mockRestore();
  });
});
