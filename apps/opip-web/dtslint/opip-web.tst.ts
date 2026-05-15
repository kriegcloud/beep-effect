import { VERSION } from "@beep/opip-web";
import {
  type ContactSubmission,
  ContactSubmissionResponse,
  ContactSubmissionStatus,
  contactResponseBody,
  decodeContactSubmission,
  submitContact,
} from "@beep/opip-web/contact";
import { loadOpipSiteContent, type OpipSiteContent, opipSiteContent } from "@beep/opip-web/content";
import type { Effect } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/opip-web", () => {
  it("exposes the typed package version", () => {
    expect(VERSION).type.toBe<"0.0.0">();
  });

  it("exposes typed contact schema and workflow contracts", () => {
    expect(ContactSubmissionStatus.Type).type.toBe<"accepted" | "rejected">();
    expect(decodeContactSubmission({})).type.toBeAssignableTo<Effect.Effect<ContactSubmission, unknown>>();
    expect(submitContact({})).type.toBe<Effect.Effect<ContactSubmissionResponse>>();
    expect(
      contactResponseBody(
        new ContactSubmissionResponse({
          message: "ok",
          status: "accepted",
        })
      )
    ).type.toBe<typeof ContactSubmissionResponse.Encoded>();
  });

  it("exposes typed content schema and runtime contracts", () => {
    expect(opipSiteContent).type.toBe<OpipSiteContent>();
    expect(loadOpipSiteContent).type.toBe<Effect.Effect<OpipSiteContent>>();
  });
});
