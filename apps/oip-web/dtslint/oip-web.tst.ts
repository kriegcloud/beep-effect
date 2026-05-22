import { VERSION } from "@beep/oip-web";
import {
  type ContactSubmission,
  ContactSubmissionResponse,
  ContactSubmissionStatus,
  contactResponseBody,
  decodeContactSubmission,
  submitContact,
} from "@beep/oip-web/contact";
import { loadOipSiteContent, type OipSiteContent, oipSiteContent } from "@beep/oip-web/content";
import type { Effect } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/oip-web", () => {
  it("exposes the typed package version", () => {
    expect(VERSION).type.toBe<"0.0.0">();
  });

  it("exposes typed contact schema and workflow contracts", () => {
    expect(ContactSubmissionStatus.Type).type.toBe<"accepted" | "rejected">();
    expect(decodeContactSubmission({})).type.toBeAssignableTo<Effect.Effect<ContactSubmission, unknown>>();
    expect(submitContact({})).type.toBe<Effect.Effect<ContactSubmissionResponse>>();
    expect(
      contactResponseBody(
        ContactSubmissionResponse.make({
          message: "ok",
          status: "accepted",
        })
      )
    ).type.toBe<typeof ContactSubmissionResponse.Encoded>();
  });

  it("exposes typed content schema and runtime contracts", () => {
    expect(oipSiteContent).type.toBe<OipSiteContent>();
    expect(loadOipSiteContent).type.toBe<Effect.Effect<OipSiteContent>>();
  });
});
