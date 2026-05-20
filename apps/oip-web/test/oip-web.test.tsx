import { VERSION } from "@beep/oip-web";
import { contactRequestResponseWithSubmit } from "@beep/oip-web/app/api/contact/ContactRouteResponse";
import { POST } from "@beep/oip-web/app/api/contact/route";
import { ContactSubmissionResponse, decodeContactSubmission, submitContact } from "@beep/oip-web/contact";
import { decodeOipSiteContentResult, launchReviewGates, oipSiteContent, ReviewStatus } from "@beep/oip-web/content";
import { Button } from "@beep/ui/components/ui/button";
import { A } from "@beep/utils";
import { cleanup, render, screen } from "@testing-library/react";
import { Clock, ConfigProvider, Effect, Exit, Layer } from "effect";
import * as Result from "effect/Result";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../src/app/page.tsx";
import { OipThemeProvider } from "../src/components/OipThemeProvider.tsx";
import { oipRedirects } from "../src/config/OipRedirects.ts";

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
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => Response.json(body, init),
    redirect: (url: string | URL, status?: number) => Response.redirect(url, status),
  },
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

const contactFormData = (payload = validContactPayload()) => {
  const formData = new FormData();
  formData.set("email", payload.email);
  formData.set("message", payload.message);
  formData.set("name", payload.name);
  formData.set("submittedAt", `${payload.submittedAt}`);
  return formData;
};

const jsonRequestBody = (body: unknown) => Response.json(body).text();

const jsonContactRequest = (body: unknown) =>
  jsonRequestBody(body).then(
    (payload) =>
      new Request("https://oip.law/api/contact", {
        body: payload,
        headers: { "content-type": "application/json" },
        method: "POST",
      })
  );

const formContactRequest = (formData = contactFormData()) =>
  new Request("https://oip.law/api/contact", {
    body: formData,
    method: "POST",
  });

describe.sequential("@beep/oip-web", () => {
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

  it("decodes the static OIP launch content", () => {
    const result = decodeOipSiteContentResult(oipSiteContent);

    expect(Result.isSuccess(result)).toBe(true);
  });

  it("renders the OIP public headline and contact CTA", () =>
    Home({}).then((page) => {
      render(page);

      expect(screen.getByRole("heading", { name: /thirty years between a planter row/i })).toBeDefined();
      expect(screen.getByRole("link", { name: oipSiteContent.contact.email })).toBeDefined();
      expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeDefined();
    }));

  it("renders the progressive theme toggle hook for the static layout script", () =>
    Home({}).then((page) => {
      render(page);

      const toggles = screen.getAllByRole("button", { name: "Switch to dark mode" });
      const toggle = A.getUnsafe(toggles, A.length(toggles) - 1);

      expect(toggle.getAttribute("data-oip-theme-toggle")).toBe("");
      expect(toggle.getAttribute("data-theme-mode")).toBe("light");
      expect(toggle.getAttribute("aria-pressed")).toBe("false");
    }));

  it("provides an optional OIP MUI theme override provider", () => {
    render(
      <OipThemeProvider>
        <Button>OIP themed child</Button>
      </OipThemeProvider>
    );

    expect(screen.getByRole("button", { name: "OIP themed child" })).toBeDefined();
  });

  it("keeps launch-risk content review-gated", () => {
    expect(launchReviewGates.clientLogos.status).toBe(ReviewStatus.Enum.needs_review);
    expect(launchReviewGates.contact.status).toBe(ReviewStatus.Enum.needs_review);
    expect(A.every(oipSiteContent.clients, (client) => ReviewStatus.is.needs_review(client.review.status))).toBe(true);
    expect(A.every(oipSiteContent.matters, (matter) => ReviewStatus.is.needs_review(matter.review.status))).toBe(true);
  });

  it("pins the OPIP compatibility redirect table to canonical OIP domains", () =>
    Promise.resolve(oipRedirects()).then((redirects) => {
      expect(redirects).toContainEqual({
        destination: "/oip/:path*",
        permanent: true,
        source: "/opip/:path*",
      });
      expect(redirects).toContainEqual({
        destination: "https://oip.law/:path*",
        has: [{ type: "host", value: "opip.law" }],
        permanent: true,
        source: "/:path*",
      });
      expect(redirects).toContainEqual({
        destination: "https://oip.law/:path*",
        has: [{ type: "host", value: "www.opip.law" }],
        permanent: true,
        source: "/:path*",
      });
      expect(redirects).toContainEqual({
        destination: "https://oip.law/:path*",
        has: [{ type: "host", value: "www.oip.law" }],
        permanent: true,
        source: "/:path*",
      });
      expect(redirects).toContainEqual({
        destination: "https://staging.oip.law/:path*",
        has: [{ type: "host", value: "staging.opip.law" }],
        permanent: false,
        source: "/:path*",
      });
    }));

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

  it("returns a JSON accepted response for valid contact route submissions", () => {
    const submit = () =>
      Effect.succeed(
        new ContactSubmissionResponse({
          message: "Your note was received.",
          status: "accepted",
        })
      );

    return jsonContactRequest(validContactPayload())
      .then((request) => Effect.runPromise(contactRequestResponseWithSubmit(request, submit)))
      .then((response) =>
        response.json().then((body) => {
          expect(response.status).toBe(202);
          expect(body).toEqual({
            message: "Your note was received.",
            status: "accepted",
          });
        })
      );
  });

  it("returns a JSON rejected response for malformed contact route submissions", () =>
    jsonContactRequest({
      email: "not-an-email",
      message: "short",
      name: "",
      submittedAt: Number.POSITIVE_INFINITY,
    })
      .then(POST)
      .then((response) =>
        response.json().then((body) => {
          expect(response.status).toBe(400);
          expect(body).toEqual({
            message: "The submission could not be accepted.",
            status: "rejected",
          });
        })
      ));

  it("returns a JSON rejected response for unreadable contact route submissions", () =>
    Effect.runPromise(
      contactRequestResponseWithSubmit(
        new Request("https://oip.law/api/contact", {
          body: "{",
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        () =>
          Effect.succeed(
            new ContactSubmissionResponse({
              message: "Should not submit.",
              status: "accepted",
            })
          )
      )
    ).then((response) =>
      response.json().then((body) => {
        expect(response.status).toBe(400);
        expect(body).toEqual({
          message: "The submission could not be accepted.",
          status: "rejected",
        });
      })
    ));

  it("redirects browser form contact submissions back to the contact section", () =>
    POST(formContactRequest()).then((response) => {
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("https://oip.law/?contact=rejected#contact");
    }));
});
