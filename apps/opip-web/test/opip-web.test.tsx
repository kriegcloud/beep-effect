import { VERSION } from "@beep/opip-web";
import { decodeContactSubmission, submitContact } from "@beep/opip-web/contact";
import { decodeOpipSiteContentResult, launchReviewGates, opipSiteContent, ReviewStatus } from "@beep/opip-web/content";
import { Button } from "@beep/ui/components/ui/button";
import { A } from "@beep/utils";
import { cleanup, render, screen } from "@testing-library/react";
import { Clock, ConfigProvider, Effect, Exit, Layer } from "effect";
import * as Result from "effect/Result";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../src/app/page.tsx";
import { OpipThemeProvider } from "../src/components/OpipThemeProvider.tsx";

vi.mock("next/image", () =>
  vi.importActual<typeof import("react")>("react").then((ReactModule) => {
    type MockNextImageProps = React.ComponentProps<"img"> & {
      readonly fill?: boolean;
      readonly priority?: boolean;
      readonly quality?: number | string;
    };

    return {
      default: ({ fill: _fill, priority: _priority, quality: _quality, ...props }: MockNextImageProps) =>
        ReactModule.createElement("img", props),
    };
  })
);

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ "x-nonce": "test-nonce" })),
}));

vi.mock("next/server", () => ({
  connection: () => Promise.resolve(undefined),
}));

const validContactPayload = () => ({
  email: "TOM@EXAMPLE.COM",
  message: "I would like help protecting a new machine design.",
  name: " Thomas Oppold ",
  submittedAt: Effect.runSync(Clock.currentTimeMillis) - 5_000,
});

const withContactConfig = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.scoped(
    Layer.build(
      ConfigProvider.layer(
        ConfigProvider.fromUnknown({
          CRM_HUBSPOT_ACCOUNT_ID: "12345",
          CRM_HUBSPOT_SERVICE_KEY: "hubspot-service-key",
        })
      )
    ).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context))))
  );

const withoutContactConfig = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.scoped(
    Layer.build(ConfigProvider.layer(ConfigProvider.fromUnknown({}))).pipe(
      Effect.flatMap((context) => effect.pipe(Effect.provide(context)))
    )
  );

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

  it("exports the main page as a valid React element", () =>
    Home({}).then((page) => {
      expect(React.isValidElement(page)).toBe(true);
    }));

  it("decodes the static OPIP launch content", () => {
    const result = decodeOpipSiteContentResult(opipSiteContent);

    expect(Result.isSuccess(result)).toBe(true);
  });

  it("renders the OPIP public headline and contact CTA", () =>
    Home({}).then((page) => {
      render(page);

      expect(screen.getByRole("heading", { name: /thirty years between a planter row/i })).toBeDefined();
      expect(screen.getByRole("link", { name: opipSiteContent.contact.email })).toBeDefined();
      expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
    }));

  it("renders the progressive theme toggle hook for the static layout script", () =>
    Home({}).then((page) => {
      render(page);

      const toggles = screen.getAllByRole("button", { name: "Switch to dark mode" });
      const toggle = A.getUnsafe(toggles, A.length(toggles) - 1);

      expect(toggle.getAttribute("data-opip-theme-toggle")).toBe("");
      expect(toggle.getAttribute("data-theme-mode")).toBe("light");
      expect(toggle.getAttribute("aria-pressed")).toBe("false");
    }));

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
    expect(A.every(opipSiteContent.clients, (client) => ReviewStatus.is.needs_review(client.review.status))).toBe(true);
    expect(A.every(opipSiteContent.matters, (matter) => ReviewStatus.is.needs_review(matter.review.status))).toBe(true);
  });

  it("rejects malformed contact payloads at the schema boundary", () =>
    Promise.all([
      Effect.runPromiseExit(
        decodeContactSubmission({
          ...validContactPayload(),
          email: "not-an-email",
        })
      ),
      Effect.runPromiseExit(
        decodeContactSubmission({
          ...validContactPayload(),
          message: "short",
        })
      ),
      Effect.runPromiseExit(
        decodeContactSubmission({
          ...validContactPayload(),
          submittedAt: Number.POSITIVE_INFINITY,
        })
      ),
    ]).then(([emailExit, messageExit, submittedAtExit]) => {
      expect(Exit.isFailure(emailExit)).toBe(true);
      expect(Exit.isFailure(messageExit)).toBe(true);
      expect(Exit.isFailure(submittedAtExit)).toBe(true);
    }));

  it("normalizes accepted contact payload fields before provider submission", () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(hubSpotResponse({ results: [{ id: "contact-id" }] }));

    return Effect.runPromise(withContactConfig(submitContact(validContactPayload())))
      .then((response) => {
        expect(response.status).toBe("accepted");
      })
      .finally(() => fetchSpy.mockRestore());
  });

  it("rejects contact submissions when HubSpot config is absent", () =>
    Effect.runPromise(withoutContactConfig(submitContact(validContactPayload()))).then((response) => {
      expect(response.status).toBe("rejected");
      expect(response.message).toBe("The submission could not be accepted.");
    }));

  it("rejects contact submissions when spam controls fail", () =>
    Promise.all([
      Effect.runPromise(
        withContactConfig(
          submitContact({
            ...validContactPayload(),
            website: "https://example.test",
          })
        )
      ),
      Effect.runPromise(
        withContactConfig(
          submitContact({
            ...validContactPayload(),
            submittedAt: 0,
          })
        )
      ),
    ]).then(([honeypotResponse, timestampResponse]) => {
      expect(honeypotResponse.status).toBe("rejected");
      expect(timestampResponse.status).toBe("rejected");
    }));

  it("rejects contact submissions that are too fast", () =>
    Effect.runPromise(
      withContactConfig(
        submitContact({
          ...validContactPayload(),
          submittedAt: Effect.runSync(Clock.currentTimeMillis) - 1_000,
        })
      )
    ).then((response) => {
      expect(response.status).toBe("rejected");
    }));

  it("logs and rejects contact submissions when the provider fails", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(hubSpotResponse({ message: "unavailable" }, 503));

    return Effect.runPromise(withContactConfig(submitContact(validContactPayload())))
      .then((response) => {
        expect(response.status).toBe("rejected");
      })
      .finally(() => fetchSpy.mockRestore());
  });
});
