import { CrossOriginEmbedderPolicyHeader } from "@beep/schema/http/headers/CrossOriginEmbedderPolicy";
import { CrossOriginOpenerPolicyHeader } from "@beep/schema/http/headers/CrossOriginOpenerPolicy";
import { CrossOriginResourcePolicyHeader } from "@beep/schema/http/headers/CrossOriginResourcePolicy";
import {
  ContentSecurityPolicyHeader,
  type ContentSecurityPolicyOption,
  createContentSecurityPolicyOptionHeaderValue,
  createDirectiveValue,
  DocumentDirective,
  FetchDirective,
  getProperHeaderName,
  NavigationDirective,
  ReportingDirective,
} from "@beep/schema/http/headers/Csp";
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
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, pipe } from "effect";
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

type CrossOriginCase = {
  readonly label: string;
  readonly headerName: string;
  readonly validValue: string;
  readonly decodeDisabled: (input: false | undefined) => HeaderLike;
  readonly decodeValid: () => HeaderLike;
  readonly createValueValid: () => Effect.Effect<O.Option<string>, unknown>;
  readonly createValid: () => Effect.Effect<O.Option<HeaderLike>, unknown>;
  readonly createInvalid: () => Effect.Effect<O.Option<string>, unknown>;
};

const crossOriginCases: ReadonlyArray<CrossOriginCase> = [
  {
    label: "COEP",
    headerName: "Cross-Origin-Embedder-Policy",
    validValue: "require-corp",
    decodeDisabled: (input) => S.decodeUnknownSync(CrossOriginEmbedderPolicyHeader)(input),
    decodeValid: () => S.decodeUnknownSync(CrossOriginEmbedderPolicyHeader)("require-corp"),
    createValueValid: () => CrossOriginEmbedderPolicyHeader.createValue("require-corp"),
    createValid: () => CrossOriginEmbedderPolicyHeader.create("require-corp"),
    createInvalid: () => CrossOriginEmbedderPolicyHeader.createValue("invalid" as never),
  },
  {
    label: "COOP",
    headerName: "Cross-Origin-Opener-Policy",
    validValue: "same-origin",
    decodeDisabled: (input) => S.decodeUnknownSync(CrossOriginOpenerPolicyHeader)(input),
    decodeValid: () => S.decodeUnknownSync(CrossOriginOpenerPolicyHeader)("same-origin"),
    createValueValid: () => CrossOriginOpenerPolicyHeader.createValue("same-origin"),
    createValid: () => CrossOriginOpenerPolicyHeader.create("same-origin"),
    createInvalid: () => CrossOriginOpenerPolicyHeader.createValue("invalid" as never),
  },
  {
    label: "CORP",
    headerName: "Cross-Origin-Resource-Policy",
    validValue: "same-origin",
    decodeDisabled: (input) => S.decodeUnknownSync(CrossOriginResourcePolicyHeader)(input),
    decodeValid: () => S.decodeUnknownSync(CrossOriginResourcePolicyHeader)("same-origin"),
    createValueValid: () => CrossOriginResourcePolicyHeader.createValue("same-origin"),
    createValid: () => CrossOriginResourcePolicyHeader.create("same-origin"),
    createInvalid: () => CrossOriginResourcePolicyHeader.createValue("invalid" as never),
  },
];

describe("Secure header schemas", () => {
  for (const testCase of crossOriginCases) {
    describe(testCase.label, () => {
      it("decodes undefined and false to a disabled header", () => {
        expectHeader(testCase.decodeDisabled(undefined), testCase.headerName, undefined);
        expectHeader(testCase.decodeDisabled(false), testCase.headerName, undefined);
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

  it("handles Expect-CT disabled and default-enabled forms", async () => {
    expectHeader(S.decodeUnknownSync(ExpectCTHeader)(undefined), "Expect-CT", undefined);
    expectHeader(S.decodeUnknownSync(ExpectCTHeader)(false), "Expect-CT", undefined);
    expectHeader(S.decodeUnknownSync(ExpectCTHeader)(true), "Expect-CT", "max-age=86400");
    expectHeader(S.decodeUnknownSync(ExpectCTHeader)([true, {}]), "Expect-CT", "max-age=86400");
    expectHeader(S.decodeUnknownSync(ExpectCTHeader)([true, { enforce: false }]), "Expect-CT", "max-age=86400");

    await expect(run(ExpectCTHeader.createValue())).resolves.toEqual(O.none());
    await expect(run(ExpectCTHeader.createValue(false))).resolves.toEqual(O.none());
    await expect(run(ExpectCTHeader.createValue(true))).resolves.toEqual(O.some("max-age=86400"));
    expect(O.isNone(await run(ExpectCTHeader.create(false)))).toBe(true);
    expect(Exit.isFailure(runExit(ExpectCTHeader.createValue([true, { reportURI: "not-a-url" }] as const)))).toBe(true);
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

  it("handles HSTS direct, disabled, and sparse tuple forms", async () => {
    expectHeader(S.decodeUnknownSync(ForceHttpsRedirectHeader)(false), "Strict-Transport-Security", undefined);
    expectHeader(S.decodeUnknownSync(ForceHttpsRedirectHeader)(true), "Strict-Transport-Security", "max-age=63072000");
    expectHeader(
      S.decodeUnknownSync(ForceHttpsRedirectHeader)([true, {}]),
      "Strict-Transport-Security",
      "max-age=63072000"
    );
    expectHeader(
      S.decodeUnknownSync(ForceHttpsRedirectHeader)([true, { maxAge: 120 }]),
      "Strict-Transport-Security",
      "max-age=120"
    );

    await expect(run(ForceHttpsRedirectHeader.createValue())).resolves.toEqual(O.some("max-age=63072000"));
    await expect(run(ForceHttpsRedirectHeader.createValue(true))).resolves.toEqual(O.some("max-age=63072000"));
    expect(O.isNone(await run(ForceHttpsRedirectHeader.create(false)))).toBe(true);
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

  it("handles Frame-Guard default, direct, disabled, and invalid allow-from forms", async () => {
    expectHeader(S.decodeUnknownSync(FrameGuardHeader)(undefined), "X-Frame-Options", "deny");
    expectHeader(S.decodeUnknownSync(FrameGuardHeader)(false), "X-Frame-Options", undefined);
    expectHeader(S.decodeUnknownSync(FrameGuardHeader)("deny"), "X-Frame-Options", "deny");
    expectHeader(S.decodeUnknownSync(FrameGuardHeader)("sameorigin"), "X-Frame-Options", "sameorigin");

    await expect(run(FrameGuardHeader.createValue())).resolves.toEqual(O.some("deny"));
    await expect(run(FrameGuardHeader.createValue(false))).resolves.toEqual(O.none());
    await expect(run(FrameGuardHeader.createValue("sameorigin"))).resolves.toEqual(O.some("sameorigin"));
    expect(O.isNone(await run(FrameGuardHeader.create(false)))).toBe(true);
    expect(Exit.isFailure(runExit(FrameGuardHeader.createValue(["allow-from", { uri: "not-a-url" }] as never)))).toBe(
      true
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

  it("disables and validates one-value security headers", async () => {
    expectHeader(S.decodeUnknownSync(NoOpenHeader)(false), "X-Download-Options", undefined);
    expectHeader(S.decodeUnknownSync(NoSniffHeader)(false), "X-Content-Type-Options", undefined);
    expectHeader(
      S.decodeUnknownSync(PermittedCrossDomainPoliciesHeader)(false),
      "X-Permitted-Cross-Domain-Policies",
      undefined
    );
    expectHeader(S.decodeUnknownSync(NoOpenHeader)("noopen"), "X-Download-Options", "noopen");
    expectHeader(S.decodeUnknownSync(NoSniffHeader)("nosniff"), "X-Content-Type-Options", "nosniff");
    expectHeader(
      S.decodeUnknownSync(PermittedCrossDomainPoliciesHeader)("master-only"),
      "X-Permitted-Cross-Domain-Policies",
      "master-only"
    );

    await expect(run(NoOpenHeader.createValue(false))).resolves.toEqual(O.none());
    await expect(run(NoSniffHeader.createValue(false))).resolves.toEqual(O.none());
    await expect(run(PermittedCrossDomainPoliciesHeader.createValue(false))).resolves.toEqual(O.none());
    expect(O.isNone(await run(NoOpenHeader.create(false)))).toBe(true);
    expect(O.isNone(await run(NoSniffHeader.create(false)))).toBe(true);
    expect(O.isNone(await run(PermittedCrossDomainPoliciesHeader.create(false)))).toBe(true);
    await expect(run(PermittedCrossDomainPoliciesHeader.createValue("all"))).resolves.toEqual(O.some("all"));

    expect(Exit.isFailure(runExit(NoOpenHeader.createValue("invalid" as never)))).toBe(true);
    expect(Exit.isFailure(runExit(NoSniffHeader.createValue("invalid" as never)))).toBe(true);
    expect(Exit.isFailure(runExit(PermittedCrossDomainPoliciesHeader.createValue("invalid" as never)))).toBe(true);
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

  it("handles permissions policy disabled, empty, wildcard, and origin-list values", async () => {
    const option = {
      directives: {
        autoplay: "*",
        fullscreen: ["self", '"https://example.com"'],
        payment: '"https://pay.example"',
      },
    } as const;

    expectHeader(S.decodeUnknownSync(PermissionsPolicyHeader)(undefined), "Permissions-Policy", undefined);
    expectHeader(S.decodeUnknownSync(PermissionsPolicyHeader)(false), "Permissions-Policy", undefined);
    expectHeader(S.decodeUnknownSync(PermissionsPolicyHeader)({ directives: {} }), "Permissions-Policy", undefined);
    expectHeader(
      S.decodeUnknownSync(PermissionsPolicyHeader)(option),
      "Permissions-Policy",
      'autoplay=*, fullscreen=(self "https://example.com"), payment=("https://pay.example")'
    );

    await expect(run(PermissionsPolicyHeader.createValue())).resolves.toEqual(O.none());
    await expect(run(PermissionsPolicyHeader.createValue(false))).resolves.toEqual(O.none());
    await expect(run(PermissionsPolicyHeader.createValue({ directives: {} }))).resolves.toEqual(O.none());
    await expect(run(PermissionsPolicyHeader.createValue(option))).resolves.toEqual(
      O.some('autoplay=*, fullscreen=(self "https://example.com"), payment=("https://pay.example")')
    );
    expect(O.isNone(await run(PermissionsPolicyHeader.create({ directives: {} })))).toBe(true);
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

  it("renders CSP directive helpers across fetch, document, navigation, and reporting directives", () => {
    expect(getProperHeaderName()).toBe("Content-Security-Policy");
    expect(getProperHeaderName(true)).toBe("Content-Security-Policy-Report-Only");
    expect(createDirectiveValue("script-src", ["'self'", "https:"])).toBe("script-src 'self' https:");
    expect(createDirectiveValue(["'self'"])("style-src")).toBe("style-src 'self'");
    expect(FetchDirective.convertToString()).toBe("");
    expect(DocumentDirective.convertToString()).toBe("");
    expect(NavigationDirective.convertToString()).toBe("");
    expect(ReportingDirective.convertToString()).toBe("");

    expect(
      FetchDirective.convertToString({
        defaultSrc: O.some("'self'"),
        "img-src": ["https:"],
        scriptSrc: undefined,
        unknown: "'none'",
      } as never)
    ).toBe("default-src 'self'; img-src https:");
    expect(
      DocumentDirective.convertToString({
        "base-uri": "'self'",
        "plugin-types": ["application/pdf"],
        sandbox: true,
      })
    ).toBe("base-uri 'self'; plugin-types application/pdf; sandbox");
    expect(DocumentDirective.convertToString({ sandbox: "allow-scripts" })).toBe("sandbox allow-scripts");
    expect(
      NavigationDirective.convertToString({
        "form-action": "'self'",
        frameAncestors: ["'none'"],
        "navigate-to": "https://example.com",
      })
    ).toBe("form-action 'self'; frame-ancestors 'none'; navigate-to https://example.com");
    expect(
      ReportingDirective.convertToString({
        "report-uri": [new URL("https://example.com/csp"), "https://example.com/local-report"],
        reportTo: "default-endpoint",
      })
    ).toBe("report-uri https://example.com/csp https://example.com/local-report; report-to default-endpoint");
  });

  it("handles disabled and empty CSP options", async () => {
    expect(createContentSecurityPolicyOptionHeaderValue()).toBeUndefined();
    expect(createContentSecurityPolicyOptionHeaderValue(false)).toBeUndefined();
    expect(createContentSecurityPolicyOptionHeaderValue({ directives: { sandbox: true } })).toBe("sandbox");
    expectHeader(S.decodeUnknownSync(ContentSecurityPolicyHeader)(undefined), "Content-Security-Policy", undefined);
    expectHeader(S.decodeUnknownSync(ContentSecurityPolicyHeader)(false), "Content-Security-Policy", undefined);
    await expect(run(ContentSecurityPolicyHeader.createValue())).resolves.toEqual(O.none());
    await expect(run(ContentSecurityPolicyHeader.createValue(false))).resolves.toEqual(O.none());
    expect(O.isNone(await run(ContentSecurityPolicyHeader.create()))).toBe(true);
    expect(O.isNone(await run(ContentSecurityPolicyHeader.create(false)))).toBe(true);

    const emptyDecode = runExit(S.decodeUnknownEffect(ContentSecurityPolicyHeader)({ directives: {} }));
    expect(Exit.isFailure(emptyDecode)).toBe(true);
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

  it("creates default secure headers in key/value form", async () => {
    const result = await run(createSecureHeaders());
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
      value: "deny",
    });
  });
});
