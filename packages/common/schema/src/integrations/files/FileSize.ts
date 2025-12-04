import type * as S from "effect/Schema";
import { StringLiteralKit } from "../../derived";

/* ────────────────────────────────────────────────────────────────────────── *
 *  BYTE (SI / DECIMAL)
 *  1 kB = 1,000 B
 * ────────────────────────────────────────────────────────────────────────── */

export class ByteUnit extends StringLiteralKit("B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB").annotations({
  schemaId: Symbol.for("@beep/schema/integrations/files/ByteUnit"),
  identifier: "ByteUnit",
  title: "Byte Unit — SI (Decimal, base‑10)",
  description:
    "Byte units using SI decimal prefixes for file sizes: B, kB, MB, GB, TB, PB, EB, ZB, YB. Uses powers of 10 (1 kB = 1,000 B; 1 MB = 1,000,000 B). Prefer for storage/device specs and end‑user file size displays. Case‑sensitive: 'B' means byte (8 bits).",
}) {}

export declare namespace ByteUnit {
  export type Type = S.Schema.Type<typeof ByteUnit>;
  export type Encoded = S.Schema.Encoded<typeof ByteUnit>;
}

/* ────────────────────────────────────────────────────────────────────────── *
 *  BYTE (IEC / BINARY)
 *  1 KiB = 1,024 B
 * ────────────────────────────────────────────────────────────────────────── */

export class BiByteUnit extends StringLiteralKit(
  "B",
  "KiB",
  "MiB",
  "GiB",
  "TiB",
  "PiB",
  "EiB",
  "ZiB",
  "YiB"
).annotations({
  schemaId: Symbol.for("@beep/schema/integrations/files/BiByteUnit"),
  identifier: "BiByteUnit",
  title: "Byte Unit — IEC (Binary, base‑2)",
  description:
    "Byte units using IEC binary prefixes: B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB. Uses powers of 2 (1 KiB = 1,024 B; 1 MiB = 1,024 KiB). Prefer for memory sizes and contexts requiring exact powers‑of‑two semantics. Case‑sensitive: 'B' means byte (8 bits).",
}) {}

export declare namespace BiByteUnit {
  export type Type = S.Schema.Type<typeof BiByteUnit>;
  export type Encoded = S.Schema.Encoded<typeof BiByteUnit>;
}

/* ────────────────────────────────────────────────────────────────────────── *
 *  BIT (SI / DECIMAL)
 *  1 kbit = 1,000 b
 * ────────────────────────────────────────────────────────────────────────── */

export class BitUnit extends StringLiteralKit(
  "b",
  "kbit",
  "Mbit",
  "Gbit",
  "Tbit",
  "Pbit",
  "Ebit",
  "Zbit",
  "Ybit"
).annotations({
  schemaId: Symbol.for("@beep/schema/integrations/files/BitUnit"),
  identifier: "BitUnit",
  title: "Bit Unit — SI (Decimal, base‑10)",
  description:
    "Bit units with SI decimal prefixes, commonly used for data rates: b, kbit, Mbit, Gbit, Tbit, Pbit, Ebit, Zbit, Ybit. Uses powers of 10 (1 kbit = 1,000 b). Case‑sensitive: 'b' means bit; 8 bits = 1 byte. Practical rule of thumb: MB/s ≈ Mb/s ÷ 8.",
}) {}

export declare namespace BitUnit {
  export type Type = S.Schema.Type<typeof BitUnit>;
  export type Encoded = S.Schema.Encoded<typeof BitUnit>;
}

/* ────────────────────────────────────────────────────────────────────────── *
 *  BIT (IEC / BINARY)
 *  1 kibit = 1,024 b
 * ────────────────────────────────────────────────────────────────────────── */

export class BiBitUnit extends StringLiteralKit(
  "b",
  "kibit",
  "Mibit",
  "Gibit",
  "Tibit",
  "Pibit",
  "Eibit",
  "Zibit",
  "Yibit"
).annotations({
  schemaId: Symbol.for("@beep/schema/integrations/files/BiBitUnit"),
  identifier: "BiBitUnit",
  title: "Bit Unit — IEC (Binary, base‑2)",
  description:
    "Bit units with IEC binary prefixes: b, kibit, Mibit, Gibit, Tibit, Pibit, Eibit, Zibit, Yibit. Uses powers of 2 (1 kibit = 1,024 b). Less common than decimal bit units; use when exact base‑2 bit counts are required. Case‑sensitive: 'b' means bit.",
}) {}

export declare namespace BiBitUnit {
  export type Type = S.Schema.Type<typeof BiBitUnit>;
  export type Encoded = S.Schema.Encoded<typeof BiBitUnit>;
}
