import { CrossOriginEmbedderPolicyHeader } from "@beep/schema/http/headers/CrossOriginEmbedderPolicy";
import { CrossOriginOpenerPolicyHeader } from "@beep/schema/http/headers/CrossOriginOpenerPolicy";
import { CrossOriginResourcePolicyHeader } from "@beep/schema/http/headers/CrossOriginResourcePolicy";
import { ContentSecurityPolicyHeader, type ContentSecurityPolicyOption } from "@beep/schema/http/headers/Csp";
import { ExpectCTHeader } from "@beep/schema/http/headers/ExpectCT";
import { ForceHttpsRedirectHeader } from "@beep/schema/http/headers/ForceHttpsRedirect";
import { FrameGuardHeader } from "@beep/schema/http/headers/FrameGuard";
import { NoOpenHeader } from "@beep/schema/http/headers/NoOpen";
import { NoSniffHeader } from "@beep/schema/http/headers/NoSniff";
import { PermissionsPolicyHeader } from "@beep/schema/http/headers/PermissionsPolicy";
import { PermittedCrossDomainPoliciesHeader } from "@beep/schema/http/headers/PermittedCrossDomainPolicies";
import { ReferrerPolicyHeader } from "@beep/schema/http/headers/ReferrerPolicy";
import { createHeadersObject, createSecureHeaders } from "@beep/schema/http/headers/SecureHeaderOptions";
import { XSSProtectionHeader } from "@beep/schema/http/headers/XSSProtection";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

type HeaderLike = {
  readonly name: string;
  readonly value: O.Option<string>;
};

const run = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(effect);
const runExit = <A, E>(effect: Effect.Effect<A, E>) => Effect.runSyncExit(effect);

const expectHeader = (header: HeaderLike, name: string, value: string | undefined) => {
  expect(header.name).toBe(name);
  expect(O.getOrUndefined(header.value)).toBe(value);
};

const expectSomeHeader = (header: O.Option<HeaderLike>, name: string, value: string) => {
  expect(O.isSome(header)).toBe(true);

  if (O.isSome(header)) {
    expectHeader(header.value, name, value);
  }
};

const crossOriginCases = [
  {
    label: "COEP",
    headerName: "Cross-Origin-Embedder-Policy",
    header: CrossOriginEmbedderPolicyHeader,
    validValue: "require-corp",
    decodeValid: () => S.decodeUnknownSync(CrossOriginEmbedderPolicyHeader)("require-corp"),
    createValueValid: () => CrossOriginEmbedderPolicyHeader.createValue("require-corp"),
    createValid: () => CrossOriginEmbedderPolicyHeader.create("require-corp"),
    createInvalid: () => CrossOriginEmbedderPolicyHeader.createValue("invalid" as never),
  },
  {
    label: "COOP",
    headerName: "Cross-Origin-Opener-Policy",
    header: CrossOriginOpenerPolicyHeader,
    validValue: "same-origin",
    decodeValid: () => S.decodeUnknownSync(CrossOriginOpenerPolicyHeader)("same-origin"),
    createValueValid: () => CrossOriginOpenerPolicyHeader.createValue("same-origin"),
    createValid: () => CrossOriginOpenerPolicyHeader.create("same-origin"),
    createInvalid: () => CrossOriginOpenerPolicyHeader.createValue("invalid" as never),
  },
  {
    label: "CORP",
    headerName: "Cross-Origin-Resource-Policy",
    header: CrossOriginResourcePolicyHeader,
    validValue: "same-origin",
    decodeValid: () => S.decodeUnknownSync(CrossOriginResourcePolicyHeader)("same-origin"),
    createValueValid: () => CrossOriginResourcePolicyHeader.createValue("same-origin"),
    createValid: () => CrossOriginResourcePolicyHeader.create("same-origin"),
    createInvalid: () => CrossOriginResourcePolicyHeader.createValue("invalid" as never),
  },
] as const;

describe("Secure header schemas", () => {
  for (const testCase of crossOriginCases) {
    describe(testCase.label, () => {
      it("decodes undefined and false to a disabled header", () => {
        expectHeader(S.decodeUnknownSync(testCase.header)(undefined), testCase.headerName, undefined);
        expectHeader(S.decodeUnknownSync(testCase.header)(false), testCase.headerName, undefined);
      });

      it("decodes valid input and creates a matching header", async () => {
        expectHeader(testCase.decodeValid(), testCase.headerName, testCase.validValue);
        await expect(run(testCase.createValueValid())).resolves.toEqual(O.some(testCase.validValue));
        expectSomeHeader(await run(testCase.createValid()), testCase.headerName, testCase.validValue);
      });

      it("fails on invalid createValue input", () => {
        expect(Exit.isFailure(runExit(testCase.createInvalid()))).toBe(true);
      });
    });
  }

  it("formats Expect-CT tuple options including enforce and report-uri", async () => {
    const option = [
      true,
      {
        maxAge: 123,
        enforce: true,
        reportURI: new URL("https://example.com/report"),
      },
    ] as const;

    expectHeader(
      S.decodeUnknownSync(ExpectCTHeader)(option),
      "Expect-CT",
      "max-age=123, enforce, report-uri=https://example.com/report"
    );
    await expect(run(ExpectCTHeader.createValue(option))).resolves.toEqual(
      O.some("max-age=123, enforce, report-uri=https://example.com/report")
    );
  });

  it("formats HSTS defaults and tuple options", async () => {
    expectHeader(
      S.decodeUnknownSync(ForceHttpsRedirectHeader)(undefined),
      "Strict-Transport-Security",
      "max-age=63072000"
    );
    await expect(
      run(ForceHttpsRedirectHeader.createValue([true, { maxAge: 120, includeSubDomains: true, preload: true }]))
    ).resolves.toEqual(O.some("max-age=120; includeSubDomains; preload"));
    await expect(run(ForceHttpsRedirectHeader.createValue(false))).resolves.toEqual(O.none());
  });

  it("formats Frame-Guard allow-from values", async () => {
    const option = ["allow-from", { uri: "https://example.com/frame" }] as const;

    expectHeader(
      S.decodeUnknownSync(FrameGuardHeader)(option),
      "X-Frame-Options",
      "allow-from https://example.com/frame"
    );
    await expect(run(FrameGuardHeader.createValue(option))).resolves.toEqual(
      O.some("allow-from https://example.com/frame")
    );
  });

  it("uses secure defaults for NoOpen, NoSniff, and permitted cross-domain policies", async () => {
    expectHeader(S.decodeUnknownSync(NoOpenHeader)(undefined), "X-Download-Options", "noopen");
    expectHeader(S.decodeUnknownSync(NoSniffHeader)(undefined), "X-Content-Type-Options", "nosniff");
    expectHeader(
      S.decodeUnknownSync(PermittedCrossDomainPoliciesHeader)(undefined),
      "X-Permitted-Cross-Domain-Policies",
      "none"
    );

    await expect(run(NoOpenHeader.createValue())).resolves.toEqual(O.some("noopen"));
    await expect(run(NoSniffHeader.createValue())).resolves.toEqual(O.some("nosniff"));
    await expect(run(PermittedCrossDomainPoliciesHeader.createValue())).resolves.toEqual(O.some("none"));
  });

  it("formats permissions policy directives and rejects invalid directive names", async () => {
    const option = {
      directives: {
        camera: "none",
        microphone: "self",
        geolocation: '"https://example.com"',
      },
    } as const;

    expectHeader(
      S.decodeUnknownSync(PermissionsPolicyHeader)(option),
      "Permissions-Policy",
      'camera=(), microphone=(self), geolocation=("https://example.com")'
    );
    await expect(run(PermissionsPolicyHeader.createValue(option))).resolves.toEqual(
      O.some('camera=(), microphone=(self), geolocation=("https://example.com")')
    );
    expect(
      Exit.isFailure(
        runExit(
          PermissionsPolicyHeader.createValue({
            directives: {
              "invalid-directive": "none",
            } as never,
          })
        )
      )
    ).toBe(true);
  });

  it("joins multiple referrer-policy values and rejects unsafe-url", async () => {
    const option = ["no-referrer", "origin", "strict-origin-when-cross-origin"] as const;

    expectHeader(
      S.decodeUnknownSync(ReferrerPolicyHeader)(option),
      "Referrer-Policy",
      "no-referrer, origin, strict-origin-when-cross-origin"
    );
    await expect(run(ReferrerPolicyHeader.createValue(option))).resolves.toEqual(
      O.some("no-referrer, origin, strict-origin-when-cross-origin")
    );
    expect(Exit.isFailure(runExit(ReferrerPolicyHeader.createValue("unsafe-url" as never)))).toBe(true);
  });

  it("renders X-XSS-Protection modes including report", async () => {
    const reportOption = ["report", { uri: "https://example.com/report" }] as const;

    expectHeader(S.decodeUnknownSync(XSSProtectionHeader)(undefined), "X-XSS-Protection", "1");
    expectHeader(S.decodeUnknownSync(XSSProtectionHeader)(false), "X-XSS-Protection", "0");
    expectHeader(
      S.decodeUnknownSync(XSSProtectionHeader)(reportOption),
      "X-XSS-Protection",
      "1; report=https://example.com/report"
    );

    await expect(run(XSSProtectionHeader.createValue(false))).resolves.toEqual(O.some("0"));
    await expect(run(XSSProtectionHeader.createValue(reportOption))).resolves.toEqual(
      O.some("1; report=https://example.com/report")
    );
  });

  it("renders CSP values and switches to the report-only header name", async () => {
    const option: ContentSecurityPolicyOption = {
      directives: {
        scriptSrc: "'self'",
        reportURI: "https://example.com/csp",
      },
      reportOnly: true,
    };

    expectHeader(
      S.decodeUnknownSync(ContentSecurityPolicyHeader)(option),
      "Content-Security-Policy-Report-Only",
      "script-src 'self'; report-uri https://example.com/csp"
    );
    await expect(run(ContentSecurityPolicyHeader.createValue(option))).resolves.toEqual(
      O.some("script-src 'self'; report-uri https://example.com/csp")
    );
    expectSomeHeader(
      await run(ContentSecurityPolicyHeader.create(option)),
      "Content-Security-Policy-Report-Only",
      "script-src 'self'; report-uri https://example.com/csp"
    );
  });
});

describe("Secure header aggregates", () => {
  it("creates the default secure headers object", async () => {
    await expect(run(createHeadersObject())).resolves.toEqual({
      "Strict-Transport-Security": "max-age=63072000",
      "X-Frame-Options": "deny",
      "X-Download-Options": "noopen",
      "X-Content-Type-Options": "nosniff",
      "X-Permitted-Cross-Domain-Policies": "none",
      "X-XSS-Protection": "1",
    });
  });

  it("creates customized secure headers and omits disabled values", async () => {
    const result = await run(
      createHeadersObject({
        frameGuard: "sameorigin",
        referrerPolicy: "same-origin",
        noopen: false,
        nosniff: false,
        contentSecurityPolicy: {
          directives: {
            scriptSrc: "'self'",
          },
        },
        expectCT: [true, { maxAge: 123, enforce: true }],
      })
    );

    expect(result["X-Frame-Options"]).toBe("sameorigin");
    expect(result["Referrer-Policy"]).toBe("same-origin");
    expect(result["Content-Security-Policy"]).toBe("script-src 'self'");
    expect(result["Expect-CT"]).toBe("max-age=123, enforce");
    expect("X-Download-Options" in result).toBe(false);
    expect("X-Content-Type-Options" in result).toBe(false);
  });

  it("creates secure headers in key/value form", async () => {
    const result = await run(createSecureHeaders({ frameGuard: "sameorigin" }));
    const plain = pipe(
      result,
      A.map((header) => ({
        key: header.key,
        value: header.value,
      }))
    );

    expect(plain).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=63072000",
    });
    expect(plain).toContainEqual({
      key: "X-Frame-Options",
      value: "sameorigin",
    });
    expect(plain).toContainEqual({
      key: "X-Permitted-Cross-Domain-Policies",
      value: "none",
    });
  });
});
