import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createForceHTTPSRedirectHeader, createHSTSHeaderValue } from "../src/secure-headers/force-https-redirect";

describe("createForceHTTPSRedirectHeader", () => {
  let headerValueCreatorMock: ReturnType<typeof mock<typeof createHSTSHeaderValue>>;
  beforeEach(() => {
    headerValueCreatorMock = mock(createHSTSHeaderValue);
  });

  it('should return "Strict-Transport-Security" as object\'s "name" property', () => {
    expect(createForceHTTPSRedirectHeader(undefined, headerValueCreatorMock)).toHaveProperty(
      "name",
      "Strict-Transport-Security"
    );
  });

  it('should call the second argument function and return a value from the function as object\'s "value" property', () => {
    const dummyOption: Parameters<typeof createForceHTTPSRedirectHeader>[0] = undefined;
    const dummyValue = "dummy-value";
    headerValueCreatorMock.mockReturnValue(dummyValue);

    expect(createForceHTTPSRedirectHeader(dummyOption, headerValueCreatorMock)).toHaveProperty("value", dummyValue);
    expect(headerValueCreatorMock).toBeCalledWith(dummyOption);
  });
});

describe("createHSTSHeaderValue", () => {
  const secondsOfTwoYears = 60 * 60 * 24 * 365 * 2;

  describe("when giving undefined", () => {
    it('should return "max-age" set two years', () => {
      expect(createHSTSHeaderValue()).toBe(`max-age=${secondsOfTwoYears}`);
      expect(createHSTSHeaderValue(null as any)).toBe(`max-age=${secondsOfTwoYears}`);
    });
  });

  describe("when giving false", () => {
    it("should return undefined", () => {
      expect(createHSTSHeaderValue(false)).toBeUndefined();
    });
  });

  describe("when giving true", () => {
    it('should return "max-age" set two years', () => {
      expect(createHSTSHeaderValue(true)).toBe(`max-age=${secondsOfTwoYears}`);
    });
  });

  describe("when giving an array without any options", () => {
    describe("giving false in the first element", () => {
      it("should raise error", () => {
        expect(() => createHSTSHeaderValue([false as any, {}])).toThrowError();
      });
    });

    describe("giving true in the first element", () => {
      it('should return "max-age" set two years', () => {
        expect(createHSTSHeaderValue([true, {}])).toBe(`max-age=${secondsOfTwoYears}`);
      });
    });
  });

  describe('when specifying "maxAge" option', () => {
    describe("the number is valid", () => {
      it('should return "max-age" set the number', () => {
        const dummyAge = 123;
        expect(createHSTSHeaderValue([true, { maxAge: dummyAge }])).toBe(`max-age=${dummyAge}`);
      });
    });

    describe("the number is invalid", () => {
      it("should raise error", () => {
        expect(() => createHSTSHeaderValue([true, { maxAge: Number.NaN }])).toThrow();
        expect(() => createHSTSHeaderValue([true, { maxAge: Number.POSITIVE_INFINITY }])).toThrow();
      });
    });
  });

  describe('when specifying "includeSubDomains" option', () => {
    describe("the option is false", () => {
      it('should return only "max-age"', () => {
        expect(createHSTSHeaderValue([true, { includeSubDomains: false }])).toBe(`max-age=${secondsOfTwoYears}`);
      });
    });

    describe("the option is true", () => {
      it('should return "max-age" and "includeSubDomains"', () => {
        expect(createHSTSHeaderValue([true, { includeSubDomains: true }])).toBe(
          `max-age=${secondsOfTwoYears}; includeSubDomains`
        );
      });
    });
  });

  describe('when specifying "preload" option', () => {
    describe("the option is false", () => {
      it('should return only "max-age"', () => {
        expect(createHSTSHeaderValue([true, { preload: false }])).toBe(`max-age=${secondsOfTwoYears}`);
      });
    });

    describe("the option is true", () => {
      it('should return "max-age" and "preload"', () => {
        expect(createHSTSHeaderValue([true, { preload: true }])).toBe(`max-age=${secondsOfTwoYears}; preload`);
      });
    });
  });

  describe("when specifying all options", () => {
    describe("the options are false", () => {
      it('should return only "max-age"', () => {
        expect(createHSTSHeaderValue([true, { includeSubDomains: false, preload: false }])).toBe(
          `max-age=${secondsOfTwoYears}`
        );

        const dummyAge = 123;
        expect(createHSTSHeaderValue([true, { maxAge: dummyAge, includeSubDomains: false, preload: false }])).toBe(
          `max-age=${dummyAge}`
        );
      });
    });

    describe("the options are true", () => {
      it('should return "max-age" and the options', () => {
        expect(createHSTSHeaderValue([true, { includeSubDomains: true, preload: true }])).toBe(
          `max-age=${secondsOfTwoYears}; includeSubDomains; preload`
        );

        const dummyAge = 123;
        expect(createHSTSHeaderValue([true, { maxAge: dummyAge, includeSubDomains: true, preload: true }])).toBe(
          `max-age=${dummyAge}; includeSubDomains; preload`
        );
      });
    });
  });

  describe("when giving invalid value", () => {
    it("should raise error", () => {
      expect(() => createHSTSHeaderValue("foo" as any)).toThrow();
      expect(() => createHSTSHeaderValue([] as any)).toThrow();
    });
  });
});
