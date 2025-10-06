import { PathBuilder } from "@beep/constants/paths/utils";
import { describe, expect, it } from "@effect/vitest";

describe("PathBuilder", () => {
  it("allows query strings in generated paths", () => {
    const paths = PathBuilder.collection({
      auth: {
        verification: {
          email: {
            verify: (token: string) => `/auth/verify-email?token=${token}` as const,
          },
        },
      },
    } as const);

    expect(paths.auth.verification.email.verify("abc.def")).toBe("/auth/verify-email?token=abc.def");
  });
});
