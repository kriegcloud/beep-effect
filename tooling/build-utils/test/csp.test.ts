import {
  convertDocumentDirectiveToString,
  convertFetchDirectiveToString,
  convertNavigationDirectiveToString,
  convertReportingDirectiveToString,
  createContentSecurityPolicyHeader,
  createContentSecurityPolicyOptionHeaderValue,
  createDirectiveValue,
  getProperHeaderName,
} from "@beep/build-utils/secure-headers/content-security-policy";
import { wrapArray } from "@beep/build-utils/secure-headers/helpers";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import type { UnsafeTypes } from "@beep/types";
import { Effect, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

describe("createContentSecurityPolicyHeader", () => {
  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createContentSecurityPolicyHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createContentSecurityPolicyHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving an object", () => {
    const dummyOption: Parameters<typeof createContentSecurityPolicyOptionHeaderValue>[0] = {
      directives: { childSrc: "'self'", objectSrc: "https://example.com" },
    };

    let properHeaderNameGetterMock: ReturnType<typeof mock<typeof getProperHeaderName>>;
    let headerValueCreatorMock: ReturnType<typeof mock<typeof createContentSecurityPolicyOptionHeaderValue>>;

    beforeEach(() => {
      properHeaderNameGetterMock = mock(getProperHeaderName);
      headerValueCreatorMock = mock(createContentSecurityPolicyOptionHeaderValue);
    });

    it("should return Some with header name from the second argument function", async () => {
      const dummyName = "Content-Security-Policy" as const;
      properHeaderNameGetterMock.mockReturnValue(dummyName);
      headerValueCreatorMock.mockReturnValue("child-src 'self'");

      const result = await runEffect(
        createContentSecurityPolicyHeader(dummyOption, properHeaderNameGetterMock, headerValueCreatorMock)
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value.name).toBe(dummyName);
      }
    });

    it("should return Some with header value from the third argument function", async () => {
      const dummyValue = "child-src 'self'";
      headerValueCreatorMock.mockReturnValue(dummyValue);

      const result = await runEffect(createContentSecurityPolicyHeader(dummyOption, undefined, headerValueCreatorMock));

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value.value).toBe(dummyValue);
      }
    });
  });
});

describe("createContentSecurityPolicyOptionHeaderValue", () => {
  describe("when giving undefined", () => {
    it("should return undefined", () => {
      expect(createContentSecurityPolicyOptionHeaderValue()).toBeUndefined();
    });
  });

  describe("when giving false", () => {
    it("should return undefined", () => {
      expect(createContentSecurityPolicyOptionHeaderValue(false)).toBeUndefined();
    });
  });

  describe("when giving an object", () => {
    const dummyOption: Parameters<typeof createContentSecurityPolicyOptionHeaderValue>[0] = {
      directives: { childSrc: "'self'", objectSrc: "https://example.com" },
    };

    let fetchDirectiveToStringConverterMock: ReturnType<typeof mock<typeof convertFetchDirectiveToString>>;
    let documentDirectiveToStringConverterMock: ReturnType<typeof mock<typeof convertDocumentDirectiveToString>>;
    let navigationDirectiveToStringConverterMock: ReturnType<typeof mock<typeof convertNavigationDirectiveToString>>;
    let reportingDirectiveToStringConverterMock: ReturnType<typeof mock<typeof convertReportingDirectiveToString>>;

    beforeEach(() => {
      fetchDirectiveToStringConverterMock = mock(convertFetchDirectiveToString);
      documentDirectiveToStringConverterMock = mock(convertDocumentDirectiveToString);
      navigationDirectiveToStringConverterMock = mock(convertNavigationDirectiveToString);
      reportingDirectiveToStringConverterMock = mock(convertReportingDirectiveToString);
    });

    it("should call the second argument with directives", () => {
      createContentSecurityPolicyOptionHeaderValue(dummyOption, fetchDirectiveToStringConverterMock);

      expect(fetchDirectiveToStringConverterMock).toBeCalledWith(dummyOption.directives);
    });

    it("should call the third argument with directives", () => {
      createContentSecurityPolicyOptionHeaderValue(dummyOption, undefined, documentDirectiveToStringConverterMock);

      expect(documentDirectiveToStringConverterMock).toBeCalledWith(dummyOption.directives);
    });

    it("should call the fourth argument with directives", () => {
      createContentSecurityPolicyOptionHeaderValue(
        dummyOption,
        undefined,
        undefined,
        navigationDirectiveToStringConverterMock
      );

      expect(navigationDirectiveToStringConverterMock).toBeCalledWith(dummyOption.directives);
    });

    it("should call the fifth argument with directives", () => {
      createContentSecurityPolicyOptionHeaderValue(
        dummyOption,
        undefined,
        undefined,
        undefined,
        reportingDirectiveToStringConverterMock
      );

      expect(reportingDirectiveToStringConverterMock).toBeCalledWith(dummyOption.directives);
    });

    it('should join directive strings using "; "', () => {
      fetchDirectiveToStringConverterMock.mockReturnValue("dummy-value-1");
      documentDirectiveToStringConverterMock.mockReturnValue("");
      navigationDirectiveToStringConverterMock.mockReturnValue("dummy-value-4");
      reportingDirectiveToStringConverterMock.mockReturnValue("dummy-value-3");

      expect(
        createContentSecurityPolicyOptionHeaderValue(
          dummyOption,
          fetchDirectiveToStringConverterMock,
          documentDirectiveToStringConverterMock,
          navigationDirectiveToStringConverterMock,
          reportingDirectiveToStringConverterMock
        )
      ).toBe("dummy-value-1; dummy-value-4; dummy-value-3");
    });
  });
});

describe("getProperHeaderName", () => {
  describe("when calling without arguments", () => {
    it('should return "Content-Security-Policy"', () => {
      expect(getProperHeaderName()).toBe("Content-Security-Policy");
    });
  });

  describe("when giving false", () => {
    it('should return "Content-Security-Policy"', () => {
      expect(getProperHeaderName(false)).toBe("Content-Security-Policy");
    });
  });

  describe("when giving true", () => {
    it('should return "Content-Security-Policy-Report-Only"', () => {
      expect(getProperHeaderName(true)).toBe("Content-Security-Policy-Report-Only");
    });
  });
});

describe("createDirectiveValue", () => {
  it("should join arguments using one half-space", () => {
    const directiveName = "dummy-directive";
    const values = ["1", "2", "3"];

    expect(createDirectiveValue(directiveName, values)).toBe(`${directiveName} ${values.join(" ")}`);
    expect(createDirectiveValue(directiveName, values[0]!)).toBe(`${directiveName} ${values[0]}`);
  });

  it("should call the third argument with the second argument", () => {
    const arrayWrapperMock = mock(wrapArray<string>);
    const directiveName = "dummy-directive";
    const values = ["1", "2", "3"];
    createDirectiveValue(directiveName, values, arrayWrapperMock as typeof wrapArray);

    expect(arrayWrapperMock).toBeCalledWith(values);
  });
});

describe("convertFetchDirectiveToString", () => {
  describe("when giving undefined", () => {
    it("should return an empty string", () => {
      expect(convertFetchDirectiveToString()).toBe("");
    });
  });

  describe("when giving an empty object", () => {
    it("should return an empty string", () => {
      expect(convertFetchDirectiveToString({})).toBe("");
    });
  });

  describe('when giving an object which has "childSrc" property', () => {
    it('should return value which includes "child-src"', () => {
      expect(convertFetchDirectiveToString({ childSrc: "'self'" })).toBe("child-src 'self'");
      expect(
        convertFetchDirectiveToString({
          childSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("child-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "child-src": "'self'" })).toBe("child-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "child-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("child-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "connectSrc" property', () => {
    it('should return value which includes "connect-src"', () => {
      expect(convertFetchDirectiveToString({ connectSrc: "'self'" })).toBe("connect-src 'self'");
      expect(
        convertFetchDirectiveToString({
          connectSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("connect-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "connect-src": "'self'" })).toBe("connect-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "connect-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("connect-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "defaultSrc" property', () => {
    it('should return value which includes "default-src"', () => {
      expect(convertFetchDirectiveToString({ defaultSrc: "'self'" })).toBe("default-src 'self'");
      expect(
        convertFetchDirectiveToString({
          defaultSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("default-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "default-src": "'self'" })).toBe("default-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "default-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("default-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "fontSrc" property', () => {
    it('should return value which includes "font-src"', () => {
      expect(convertFetchDirectiveToString({ fontSrc: "'self'" })).toBe("font-src 'self'");
      expect(
        convertFetchDirectiveToString({
          fontSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("font-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "font-src": "'self'" })).toBe("font-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "font-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("font-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "frameSrc" property', () => {
    it('should return value which includes "frame-src"', () => {
      expect(convertFetchDirectiveToString({ frameSrc: "'self'" })).toBe("frame-src 'self'");
      expect(
        convertFetchDirectiveToString({
          frameSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("frame-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "frame-src": "'self'" })).toBe("frame-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "frame-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("frame-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "imgSrc" property', () => {
    it('should return value which includes "img-src"', () => {
      expect(convertFetchDirectiveToString({ imgSrc: "'self'" })).toBe("img-src 'self'");
      expect(
        convertFetchDirectiveToString({
          imgSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("img-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "img-src": "'self'" })).toBe("img-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "img-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("img-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "manifestSrc" property', () => {
    it('should return value which includes "manifest-src"', () => {
      expect(convertFetchDirectiveToString({ manifestSrc: "'self'" })).toBe("manifest-src 'self'");
      expect(
        convertFetchDirectiveToString({
          manifestSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("manifest-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "manifest-src": "'self'" })).toBe("manifest-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "manifest-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("manifest-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "mediaSrc" property', () => {
    it('should return value which includes "media-src"', () => {
      expect(convertFetchDirectiveToString({ mediaSrc: "'self'" })).toBe("media-src 'self'");
      expect(
        convertFetchDirectiveToString({
          mediaSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("media-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "media-src": "'self'" })).toBe("media-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "media-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("media-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "prefetchSrc" property', () => {
    it('should return value which includes "prefetch-src"', () => {
      expect(convertFetchDirectiveToString({ prefetchSrc: "'self'" })).toBe("prefetch-src 'self'");
      expect(
        convertFetchDirectiveToString({
          prefetchSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("prefetch-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "prefetch-src": "'self'" })).toBe("prefetch-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "prefetch-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("prefetch-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "objectSrc" property', () => {
    it('should return value which includes "object-src"', () => {
      expect(convertFetchDirectiveToString({ objectSrc: "'self'" })).toBe("object-src 'self'");
      expect(
        convertFetchDirectiveToString({
          objectSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("object-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "object-src": "'self'" })).toBe("object-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "object-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("object-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "scriptSrc" property', () => {
    it('should return value which includes "script-src"', () => {
      expect(convertFetchDirectiveToString({ scriptSrc: "'self'" })).toBe("script-src 'self'");
      expect(
        convertFetchDirectiveToString({
          scriptSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("script-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "script-src": "'self'" })).toBe("script-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "script-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("script-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "scriptSrcElem" property', () => {
    it('should return value which includes "script-src-elem"', () => {
      expect(convertFetchDirectiveToString({ scriptSrcElem: "'self'" })).toBe("script-src-elem 'self'");
      expect(
        convertFetchDirectiveToString({
          scriptSrcElem: ["'self'", "https://www.example.com/"],
        })
      ).toBe("script-src-elem 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "script-src-elem": "'self'" })).toBe("script-src-elem 'self'");
      expect(
        convertFetchDirectiveToString({
          "script-src-elem": ["'self'", "https://www.example.com/"],
        })
      ).toBe("script-src-elem 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "scriptSrcAttr" property', () => {
    it('should return value which includes "script-src-attr"', () => {
      expect(convertFetchDirectiveToString({ scriptSrcAttr: "'self'" })).toBe("script-src-attr 'self'");
      expect(
        convertFetchDirectiveToString({
          scriptSrcAttr: ["'self'", "https://www.example.com/"],
        })
      ).toBe("script-src-attr 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "script-src-attr": "'self'" })).toBe("script-src-attr 'self'");
      expect(
        convertFetchDirectiveToString({
          "script-src-attr": ["'self'", "https://www.example.com/"],
        })
      ).toBe("script-src-attr 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "styleSrc" property', () => {
    it('should return value which includes "style-src"', () => {
      expect(convertFetchDirectiveToString({ styleSrc: "'self'" })).toBe("style-src 'self'");
      expect(
        convertFetchDirectiveToString({
          styleSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("style-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "style-src": "'self'" })).toBe("style-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "style-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("style-src 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "styleSrcElem" property', () => {
    it('should return value which includes "style-src-elem"', () => {
      expect(convertFetchDirectiveToString({ styleSrcElem: "'self'" })).toBe("style-src-elem 'self'");
      expect(
        convertFetchDirectiveToString({
          styleSrcElem: ["'self'", "https://www.example.com/"],
        })
      ).toBe("style-src-elem 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "style-src-elem": "'self'" })).toBe("style-src-elem 'self'");
      expect(
        convertFetchDirectiveToString({
          "style-src-elem": ["'self'", "https://www.example.com/"],
        })
      ).toBe("style-src-elem 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "styleSrcAttr" property', () => {
    it('should return value which includes "style-src-attr"', () => {
      expect(convertFetchDirectiveToString({ styleSrcAttr: "'self'" })).toBe("style-src-attr 'self'");
      expect(
        convertFetchDirectiveToString({
          styleSrcAttr: ["'self'", "https://www.example.com/"],
        })
      ).toBe("style-src-attr 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "style-src-attr": "'self'" })).toBe("style-src-attr 'self'");
      expect(
        convertFetchDirectiveToString({
          "style-src-attr": ["'self'", "https://www.example.com/"],
        })
      ).toBe("style-src-attr 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "workerSrc" property', () => {
    it('should return value which includes "worker-src"', () => {
      expect(convertFetchDirectiveToString({ workerSrc: "'self'" })).toBe("worker-src 'self'");
      expect(
        convertFetchDirectiveToString({
          workerSrc: ["'self'", "https://www.example.com/"],
        })
      ).toBe("worker-src 'self' https://www.example.com/");

      expect(convertFetchDirectiveToString({ "worker-src": "'self'" })).toBe("worker-src 'self'");
      expect(
        convertFetchDirectiveToString({
          "worker-src": ["'self'", "https://www.example.com/"],
        })
      ).toBe("worker-src 'self' https://www.example.com/");
    });
  });

  describe("when giving an object which has dummy directives", () => {
    it("should ignore them", () => {
      expect(
        convertFetchDirectiveToString({
          childSrc: "'self'",
          styleSrc: "'self'",
          reportTo: "foobar",
        } as UnsafeTypes.UnsafeAny)
      ).toBe("child-src 'self'; style-src 'self'");

      expect(
        convertFetchDirectiveToString({
          "child-src": "'self'",
          "style-src": "'self'",
          "report-to": "foobar",
        } as UnsafeTypes.UnsafeAny)
      ).toBe("child-src 'self'; style-src 'self'");
    });
  });

  describe("when giving an object which has undefined", () => {
    it("should ignore the properties", () => {
      expect(
        convertFetchDirectiveToString({
          childSrc: undefined,
          objectSrc: undefined,
          styleSrc: "'self'",
        })
      ).toBe("style-src 'self'");

      expect(
        convertFetchDirectiveToString({
          "child-src": undefined,
          "object-src": undefined,
          "style-src": "'self'",
        })
      ).toBe("style-src 'self'");
    });
  });

  describe("when giving an object which has one or more properties", () => {
    it('should return value which includes their directive names joined "; "', () => {
      expect(
        convertFetchDirectiveToString({
          childSrc: "'self'",
          objectSrc: "https://example.com/",
          styleSrc: "'unsafe-inline'",
        })
      ).toBe("child-src 'self'; object-src https://example.com/; style-src 'unsafe-inline'");

      expect(
        convertFetchDirectiveToString({
          "child-src": "'self'",
          "object-src": "https://example.com/",
          "style-src": "'unsafe-inline'",
        })
      ).toBe("child-src 'self'; object-src https://example.com/; style-src 'unsafe-inline'");
    });
  });
});

describe("convertDocumentDirectiveToString", () => {
  describe("when giving undefined", () => {
    it("should return an empty string", () => {
      expect(convertDocumentDirectiveToString()).toBe("");
    });
  });

  describe("when giving an empty object", () => {
    it("should return an empty string", () => {
      expect(convertDocumentDirectiveToString({})).toBe("");
    });
  });

  describe('when giving an object which has "baseURI" property', () => {
    it('should return value which includes "base-uri"', () => {
      expect(convertDocumentDirectiveToString({ baseURI: "'self'" })).toBe("base-uri 'self'");
      expect(
        convertDocumentDirectiveToString({
          baseURI: ["'self'", "https://www.example.com/"],
        })
      ).toBe("base-uri 'self' https://www.example.com/");

      expect(convertDocumentDirectiveToString({ "base-uri": "'self'" })).toBe("base-uri 'self'");
      expect(
        convertDocumentDirectiveToString({
          "base-uri": ["'self'", "https://www.example.com/"],
        })
      ).toBe("base-uri 'self' https://www.example.com/");
    });
  });

  describe('when giving an object which has "pluginTypes" property', () => {
    it('should return value which includes "plugin-types"', () => {
      expect(convertDocumentDirectiveToString({ pluginTypes: "text/javascript" })).toBe("plugin-types text/javascript");
      expect(
        convertDocumentDirectiveToString({
          pluginTypes: ["text/javascript", "image/png"],
        })
      ).toBe("plugin-types text/javascript image/png");

      expect(convertDocumentDirectiveToString({ "plugin-types": "text/javascript" })).toBe(
        "plugin-types text/javascript"
      );
      expect(
        convertDocumentDirectiveToString({
          "plugin-types": ["text/javascript", "image/png"],
        })
      ).toBe("plugin-types text/javascript image/png");
    });
  });

  describe('when giving an object which has "sandbox" property', () => {
    it('should return value which includes "sandbox"', () => {
      expect(convertDocumentDirectiveToString({ sandbox: true })).toBe("sandbox");
      expect(convertDocumentDirectiveToString({ sandbox: "allow-forms" })).toBe("sandbox allow-forms");
    });
  });

  describe("when giving an object which has one or more properties", () => {
    it('should return value which includes their directive names joined "; "', () => {
      expect(
        convertDocumentDirectiveToString({
          baseURI: "'self'",
          pluginTypes: ["text/javascript", "image/png"],
          sandbox: true,
        })
      ).toBe("base-uri 'self'; plugin-types text/javascript image/png; sandbox");

      expect(
        convertDocumentDirectiveToString({
          "base-uri": "'self'",
          "plugin-types": ["text/javascript", "image/png"],
          sandbox: true,
        })
      ).toBe("base-uri 'self'; plugin-types text/javascript image/png; sandbox");
    });
  });
});

describe("convertReportingDirectiveToString", () => {
  describe("when giving undefined", () => {
    it("should return an empty string", () => {
      expect(convertReportingDirectiveToString()).toBe("");
    });
  });

  describe("when giving an empty object", () => {
    it("should return an empty string", () => {
      expect(convertReportingDirectiveToString({})).toBe("");
    });
  });

  describe('when giving an object which has "reportURI" property', () => {
    it('should return value which includes "report-uri"', () => {
      expect(convertReportingDirectiveToString({ reportURI: "https://example.com" })).toBe(
        "report-uri https://example.com/"
      );
      expect(
        convertReportingDirectiveToString({
          reportURI: ["https://example.com", new URL("https://www.example.com")],
        })
      ).toBe("report-uri https://example.com/ https://www.example.com/");

      expect(
        convertReportingDirectiveToString({
          "report-uri": "https://example.com",
        })
      ).toBe("report-uri https://example.com/");
      expect(
        convertReportingDirectiveToString({
          "report-uri": ["https://example.com", new URL("https://www.example.com")],
        })
      ).toBe("report-uri https://example.com/ https://www.example.com/");
    });
  });

  describe('when giving an object which has "reportTo" property', () => {
    it('should return value which includes "report-to"', () => {
      expect(convertReportingDirectiveToString({ reportTo: "endpoint-1" })).toBe("report-to endpoint-1");

      expect(convertReportingDirectiveToString({ "report-to": "endpoint-1" })).toBe("report-to endpoint-1");
    });
  });

  describe("when giving an object which has one or more properties", () => {
    it('should return value which includes their directive names joined "; "', () => {
      expect(
        convertReportingDirectiveToString({
          reportURI: new URL("https://example.com"),
          reportTo: "endpoint-1",
        })
      ).toBe("report-uri https://example.com/; report-to endpoint-1");

      expect(
        convertReportingDirectiveToString({
          "report-uri": new URL("https://example.com"),
          "report-to": "endpoint-1",
        })
      ).toBe("report-uri https://example.com/; report-to endpoint-1");
    });
  });
});

describe("convertNavigationDirectiveToString", () => {
  describe("when giving undefined", () => {
    it("should return an empty string", () => {
      expect(convertNavigationDirectiveToString()).toBe("");
    });
  });

  describe("when giving an empty object", () => {
    it("should return an empty string", () => {
      expect(convertNavigationDirectiveToString({})).toBe("");
    });
  });

  describe('when giving an object which has "formAction" property', () => {
    it('should return value which includes "form-action"', () => {
      expect(convertNavigationDirectiveToString({ formAction: "'self'" })).toBe("form-action 'self'");
      expect(
        convertNavigationDirectiveToString({
          formAction: ["'self'", "https://example.com"],
        })
      ).toBe("form-action 'self' https://example.com");
    });
  });

  describe('when giving an object which has "frameAncestors" property', () => {
    it('should return value which includes "frame-ancestors"', () => {
      expect(convertNavigationDirectiveToString({ frameAncestors: "'self'" })).toBe("frame-ancestors 'self'");
      expect(
        convertNavigationDirectiveToString({
          frameAncestors: ["'self'", "https://example.com"],
        })
      ).toBe("frame-ancestors 'self' https://example.com");
    });
  });

  describe('when giving an object which has "navigateTo" property', () => {
    it('should return value which includes "navigate-to"', () => {
      expect(convertNavigationDirectiveToString({ navigateTo: "'self'" })).toBe("navigate-to 'self'");
      expect(
        convertNavigationDirectiveToString({
          navigateTo: ["'self'", "https://example.com"],
        })
      ).toBe("navigate-to 'self' https://example.com");
    });
  });

  describe("when giving an object which has one or more properties", () => {
    it('should return value which includes their directive names joined "; "', () => {
      expect(
        convertNavigationDirectiveToString({
          formAction: "'self'",
          frameAncestors: ["'self'", "https://example.com"],
          navigateTo: "'self'",
        })
      ).toBe("form-action 'self'; frame-ancestors 'self' https://example.com; navigate-to 'self'");

      expect(
        convertNavigationDirectiveToString({
          "form-action": "'self'",
          "frame-ancestors": ["'self'", "https://example.com"],
          "navigate-to": "'self'",
        })
      ).toBe("form-action 'self'; frame-ancestors 'self' https://example.com; navigate-to 'self'");
    });
  });
});
