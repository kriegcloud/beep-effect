import { afterEach, describe, expect, expectTypeOf, it, vi } from "bun:test";
import {
  formatSize,
  type IecBitUnit,
  type IecByteUnit,
  type SiBitUnit,
  type SiByteUnit,
} from "@beep/schema/integrations/files";

/** Useful unit catalogs for parsing/assertions in tests */
const SI_BYTE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;
const IEC_BYTE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"] as const;
const SI_BIT_UNITS = ["b", "kbit", "Mbit", "Gbit", "Tbit", "Pbit", "Ebit", "Zbit", "Ybit"] as const;
const IEC_BIT_UNITS = ["b", "kibit", "Mibit", "Gibit", "Tibit", "Pibit", "Eibit", "Zibit", "Yibit"] as const;

const ALL_UNITS = [...SI_BYTE_UNITS, ...IEC_BYTE_UNITS, ...SI_BIT_UNITS, ...IEC_BIT_UNITS] as const;

/** Match one of the known units at the end */
const UNIT_RE = new RegExp(`(${ALL_UNITS.join("|")})$`);

/** Parse output of formatSize into { numberPart, unit } */
function splitOut(s: string): { numberPart: string; unit: (typeof ALL_UNITS)[number] } {
  const m = s.match(UNIT_RE);
  expect(m).not.toBeNull();
  const unit = m![0] as (typeof ALL_UNITS)[number];
  const numberPart = s.slice(0, m!.index!).trim();
  return { numberPart, unit };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("formatSize — basic decimal bytes (SI)", () => {
  it("formats 1337 → '1.34 kB'", () => {
    expect(formatSize(1337)).toBe("1.34 kB");
  });

  it("formats 100 → '100 B'", () => {
    expect(formatSize(100)).toBe("100 B");
  });

  it("rounds to 3 significant digits by default", () => {
    expect(formatSize(123456)).toBe("123 kB"); // 123456 / 1000 = 123.456 → "123"
  });

  it("handles values < 1 without scaling", () => {
    expect(formatSize(0.5)).toBe("0.5 B");
  });

  it("negative values", () => {
    expect(formatSize(-42)).toBe("-42 B");
  });
});

describe("formatSize — signed formatting and spacing", () => {
  it("signed positive", () => {
    expect(formatSize(42, { signed: true })).toBe("+42 B");
  });

  it("signed zero uses alignment space with default spacing", () => {
    expect(formatSize(0, { signed: true })).toBe(" 0 B");
  });

  it("signed zero uses alignment space with space: false", () => {
    expect(formatSize(0, { signed: true, space: false })).toBe(" 0B");
  });

  it("space:false removes the separator", () => {
    expect(formatSize(1920, { space: false })).toBe("1.92kB");
  });
});

describe("formatSize — bits mode (SI)", () => {
  it("1337 bits → '1.34 kbit'", () => {
    expect(formatSize(1337, { bits: true })).toBe("1.34 kbit");
  });

  it("preserves unit base when bits = true", () => {
    expect(formatSize(100, { bits: true })).toBe("100 b");
  });
});

describe("formatSize — IEC (binary) bytes", () => {
  it("1024 → '1 KiB'", () => {
    expect(formatSize(1024, { binary: true })).toBe("1 KiB");
  });

  it("1536 → '1.5 KiB'", () => {
    expect(formatSize(1536, { binary: true })).toBe("1.5 KiB");
  });
});

describe("formatSize — IEC (binary) bits", () => {
  it("1024 bits binary → '1 kibit'", () => {
    expect(formatSize(1024, { bits: true, binary: true })).toBe("1 kibit");
  });

  it("1500 bits binary → '1.46 kibit' (3 sig figs default)", () => {
    expect(formatSize(1500, { bits: true, binary: true })).toBe("1.46 kibit");
  });
});

describe("formatSize — fraction digit options", () => {
  it("minimumFractionDigits: 3", () => {
    expect(formatSize(1900, { minimumFractionDigits: 3 })).toBe("1.900 kB");
  });

  it("maximumFractionDigits: 1", () => {
    expect(formatSize(1920, { maximumFractionDigits: 1 })).toBe("1.9 kB");
  });
});

describe("formatSize — locale handling (spy Number#toLocaleString)", () => {
  it("calls toLocaleString with a specific BCP 47 tag when locale is a string", () => {
    const spy = vi.spyOn(Number.prototype, "toLocaleString");
    const out = formatSize(1337, { locale: "de" });
    // we don't assert exact output (environment/ICU dependent)
    expect(spy).toHaveBeenCalledTimes(1);
    const [locale, opts] = spy.mock.calls[0]!;
    expect(locale).toBe("de");
    expect(opts).toBeUndefined();
    expect(splitOut(out).unit).toBe("kB");
  });

  it("uses system locale when locale=true OR when fraction options are present", () => {
    const spy = vi.spyOn(Number.prototype, "toLocaleString");
    formatSize(1900, { minimumFractionDigits: 2 });
    expect(spy).toHaveBeenCalledTimes(1);
    const [locale, opts] = spy.mock.calls[0]!;
    expect(locale).toBeUndefined();
    expect(opts).toMatchObject({ minimumFractionDigits: 2 });
  });
});

describe("formatSize — BigInt support", () => {
  it("BigInt decimal → '1.02 kB' (1024 B)", () => {
    expect(formatSize(1024n)).toBe("1.02 kB");
  });

  it("BigInt binary → '1 KiB'", () => {
    expect(formatSize(1024n, { binary: true })).toBe("1 KiB");
  });

  it("BigInt negative", () => {
    expect(formatSize(-42n)).toBe("-42 B");
  });

  it("BigInt signed zero", () => {
    expect(formatSize(0n, { signed: true })).toBe(" 0 B");
  });
});

describe("formatSize — exponent edges and unit selection", () => {
  it("SI byte units across exponents (BigInt for precision)", () => {
    for (let i = 0; i < SI_BYTE_UNITS.length; i++) {
      const value = 1000n ** BigInt(i); // exact BigInt scaling
      const out = formatSize(value);
      const { numberPart, unit } = splitOut(out);
      expect(unit).toBe(SI_BYTE_UNITS[i]!);
      // For exact powers, we expect a clean "1"
      expect(numberPart).toBe("1");
    }
  });

  it("IEC byte units across exponents (BigInt for precision)", () => {
    for (let i = 0; i < IEC_BYTE_UNITS.length; i++) {
      const value = 1024n ** BigInt(i);
      const out = formatSize(value, { binary: true });
      const { numberPart, unit } = splitOut(out);
      expect(unit).toBe(IEC_BYTE_UNITS[i]!);
      expect(numberPart).toBe("1");
    }
  });

  it("SI bit units across exponents (BigInt for precision)", () => {
    for (let i = 0; i < SI_BIT_UNITS.length; i++) {
      const value = 1000n ** BigInt(i);
      const out = formatSize(value, { bits: true });
      const { numberPart, unit } = splitOut(out);
      expect(unit).toBe(SI_BIT_UNITS[i]!);
      expect(numberPart).toBe("1");
    }
  });

  it("IEC bit units across exponents (BigInt for precision)", () => {
    for (let i = 0; i < IEC_BIT_UNITS.length; i++) {
      const value = 1024n ** BigInt(i);
      const out = formatSize(value, { bits: true, binary: true });
      const { numberPart, unit } = splitOut(out);
      expect(unit).toBe(IEC_BIT_UNITS[i]!);
      expect(numberPart).toBe("1");
    }
  });
});

describe("formatSize — error handling", () => {
  it("throws on non-finite numbers", () => {
    expect(() => formatSize(Number.NaN)).toThrow(/Expected a finite number/);
    expect(() => formatSize(Number.POSITIVE_INFINITY)).toThrow(/Expected a finite number/);
    expect(() => formatSize(Number.NEGATIVE_INFINITY)).toThrow(/Expected a finite number/);
  });
});

/* --------------------------------------------------------------------------------
 * TYPE TESTS (compile-time) — these will fail to compile if types drift
 * -------------------------------------------------------------------------------- */

describe("formatSize — return types reflect options (template literal accuracy)", () => {
  it("default options → `${string} ${SiByteUnit}`", () => {
    const out = formatSize(1);
    expectTypeOf(out).toMatchTypeOf<`${string} ${SiByteUnit}`>();
  });

  it("binary bytes → `${string} ${IecByteUnit}`", () => {
    const out = formatSize(1, { binary: true } as const);
    expectTypeOf(out).toMatchTypeOf<`${string} ${IecByteUnit}`>();
  });

  it("bits (SI) → `${string} ${SiBitUnit}`", () => {
    const out = formatSize(1, { bits: true } as const);
    expectTypeOf(out).toMatchTypeOf<`${string} ${SiBitUnit}`>();
  });

  it("bits (IEC) → `${string} ${IecBitUnit}`", () => {
    const out = formatSize(1, { bits: true, binary: true } as const);
    expectTypeOf(out).toMatchTypeOf<`${string} ${IecBitUnit}`>();
  });

  it("space: false removes separator in the type", () => {
    const out = formatSize(1, { space: false } as const);
    // no space before unit at the type level
    expectTypeOf(out).toMatchTypeOf<`${string}${SiByteUnit}`>();
  });
});
