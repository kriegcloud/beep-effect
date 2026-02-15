import { createHash } from "node:crypto";
import type { BadArgument, PlatformError, SystemError } from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import PostalMime, { type Address, addressParser, type Email } from "postal-mime";
import { EnronEmail } from "./schemas.js";

const FALLBACK_FOLDER = "unknown";
const FALLBACK_USER = "unknown";
const NO_SUBJECT = "(No Subject)";

const STRONG_SIGNATURE_PATTERNS = [/^--\s*$/, /^__+$/, /^sent from my/i] as const;
const SIGNATURE_CLOSING_PATTERNS = [
  /^thanks[!,\s]*$/i,
  /^best[!,\s]*$/i,
  /^regards[!,\s]*$/i,
  /^sincerely[!,\s]*$/i,
] as const;
const QUOTED_REPLY_PATTERNS = [/^on .+wrote:\s*$/i, /^-{2,}\s*original message\s*-{2,}$/i, /^from:\s.+/i] as const;

export class EnronParseError extends S.TaggedError<EnronParseError>()("EnronParseError", {
  message: S.String,
  cause: S.optional(S.String),
}) {}

export class EnronFileError extends S.TaggedError<EnronFileError>()("EnronFileError", {
  path: S.String,
  message: S.String,
  cause: S.optional(S.String),
}) {}

export interface ParseEmailOptions {
  readonly folder?: string;
  readonly user?: string;
}

export interface CsvEmailRecord {
  readonly file: string;
  readonly message: string;
}

const normalizeWhitespace = (value: string): string => F.pipe(value, Str.replaceAll(/\s+/g, " "), Str.trim);

export const normalizeMessageId = (raw: string): string => {
  const trimmed = F.pipe(raw, Str.trim);
  if (Str.isEmpty(trimmed)) {
    throw new Error("Message-ID is empty");
  }

  const unwrapped = trimmed.replace(/^<+/, "").replace(/>+$/, "").trim().toLowerCase();
  if (Str.isEmpty(unwrapped)) {
    throw new Error("Message-ID did not contain a token");
  }

  return `<${unwrapped}>`;
};

const normalizeMessageIdOption = (raw: string): O.Option<string> =>
  F.pipe(
    Either.try({
      try: () => normalizeMessageId(raw),
      catch: () => "invalid message id",
    }),
    Either.match({ onLeft: () => O.none<string>(), onRight: O.some })
  );

export const makeDeterministicId = (namespace: "email" | "thread", seedMessageId: string): string => {
  const normalized = normalizeMessageId(seedMessageId);
  const digest = createHash("sha256").update(normalized, "utf8").digest("hex");
  return `${namespace}:${digest}`;
};

export const makeDeterministicEmailId = (seedMessageId: string): string => makeDeterministicId("email", seedMessageId);

const extractHeader = (email: Email, name: string): O.Option<string> => {
  const lowered = Str.toLowerCase(name);
  return F.pipe(
    email.headers,
    A.findFirst((header) => header.key === lowered),
    O.map((header) => header.value)
  );
};

const normalizeAddress = (value: string): O.Option<string> => {
  const normalized = F.pipe(value, Str.trim, Str.toLowerCase);
  if (Str.isEmpty(normalized) || !Str.includes("@")(normalized)) {
    return O.none();
  }
  return O.some(normalized);
};

const flattenAddress = (address: Address): ReadonlyArray<string> => {
  if ("group" in address && A.isArray(address.group)) {
    return F.pipe(
      address.group,
      A.flatMap((entry) => flattenAddress(entry))
    );
  }

  if ("address" in address && typeof address.address === "string") {
    return F.pipe(normalizeAddress(address.address), O.match({ onNone: A.empty<string>, onSome: (email) => [email] }));
  }

  return A.empty<string>();
};

const parseAddressHeader = (value: string | undefined): ReadonlyArray<string> => {
  if (value === undefined) {
    return A.empty<string>();
  }

  return F.pipe(
    Either.try({
      try: () => addressParser(value, { flatten: true }),
      catch: () => A.empty<Address>(),
    }),
    Either.getOrElse(() => A.empty<Address>()),
    A.flatMap((address) => flattenAddress(address)),
    A.dedupe
  );
};

const parseAddressCollection = (
  values: ReadonlyArray<Address> | undefined,
  fallbackHeaderValue: string | undefined
): ReadonlyArray<string> => {
  const fromValues = F.pipe(
    O.fromNullable(values),
    O.map((addresses) =>
      F.pipe(
        addresses,
        A.flatMap((address) => flattenAddress(address)),
        A.dedupe
      )
    )
  );

  return F.pipe(
    fromValues,
    O.getOrElse(() => parseAddressHeader(fallbackHeaderValue))
  );
};

const parseSender = (email: Email, fromHeaderValue: string | undefined): O.Option<string> => {
  const fromField = F.pipe(
    O.fromNullable(email.from),
    O.flatMap((address) => F.pipe(flattenAddress(address), A.head))
  );

  const fromHeader = F.pipe(parseAddressHeader(fromHeaderValue), A.head);
  return F.pipe(
    fromField,
    O.orElse(() => fromHeader)
  );
};

const parseMessageIds = (rawValue: string | undefined): ReadonlyArray<string> => {
  if (rawValue === undefined) {
    return A.empty<string>();
  }

  const fromAngles = rawValue.match(/<[^>]+>/g);
  if (fromAngles !== null) {
    return F.pipe(
      fromAngles,
      A.filterMap((value) => normalizeMessageIdOption(value)),
      A.dedupe
    );
  }

  return F.pipe(
    rawValue.split(/\s+/g),
    A.filterMap((value) => normalizeMessageIdOption(value)),
    A.dedupe
  );
};

const parseSingleMessageId = (rawValue: string | undefined): O.Option<string> =>
  F.pipe(
    parseMessageIds(rawValue),
    A.head,
    O.orElse(() =>
      F.pipe(
        O.fromNullable(rawValue),
        O.map(normalizeWhitespace),
        O.filter((value) => !Str.isEmpty(value)),
        O.flatMap((value) => normalizeMessageIdOption(value))
      )
    )
  );

const stripHtml = (html: string): string =>
  F.pipe(
    html,
    Str.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, ""),
    Str.replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, ""),
    Str.replaceAll(/<[^>]+>/g, " "),
    Str.replaceAll(/&nbsp;/g, " "),
    Str.replaceAll(/&amp;/g, "&"),
    Str.replaceAll(/&lt;/g, "<"),
    Str.replaceAll(/&gt;/g, ">"),
    Str.replaceAll(/&quot;/g, '"'),
    Str.replaceAll(/&#39;/g, "'"),
    Str.replaceAll(/\s+/g, " "),
    Str.trim
  );

const findQuotedReplyStart = (lines: ReadonlyArray<string>): number => {
  for (let index = 0; index < lines.length; index += 1) {
    const line = F.pipe(lines[index] ?? "", Str.trim);
    if (Str.startsWith(">")(line)) {
      return index;
    }

    for (const pattern of QUOTED_REPLY_PATTERNS) {
      if (pattern.test(line)) {
        return index;
      }
    }
  }

  return lines.length;
};

const findSignatureStart = (lines: ReadonlyArray<string>): number => {
  const scanStart = Math.max(lines.length - 12, 0);

  for (let index = scanStart; index < lines.length; index += 1) {
    const line = F.pipe(lines[index] ?? "", Str.trim);

    for (const pattern of STRONG_SIGNATURE_PATTERNS) {
      if (pattern.test(line)) {
        return index;
      }
    }

    const nearTail = lines.length - index <= 5;
    if (nearTail) {
      for (const pattern of SIGNATURE_CLOSING_PATTERNS) {
        if (pattern.test(line)) {
          return index;
        }
      }
    }
  }

  return lines.length;
};

export const normalizeEmailBody = (input: string): string => {
  const normalized = F.pipe(
    input,
    Str.replaceAll(/\r\n/g, "\n"),
    Str.replaceAll(/\r/g, "\n"),
    Str.replaceAll(/\u0000/g, "")
  );

  if (Str.isEmpty(Str.trim(normalized))) {
    return Str.empty;
  }

  const lines = normalized.split("\n");
  const withoutQuotedReplies = lines.slice(0, findQuotedReplyStart(lines));
  const withoutSignature = withoutQuotedReplies.slice(0, findSignatureStart(withoutQuotedReplies));

  const trimmedTrailing = [...withoutSignature];
  while (trimmedTrailing.length > 0 && Str.isEmpty(Str.trim(trimmedTrailing[trimmedTrailing.length - 1] ?? ""))) {
    trimmedTrailing.pop();
  }

  return F.pipe(trimmedTrailing.join("\n"), Str.replaceAll(/\n{3,}/g, "\n\n"), Str.trim);
};

const parseDateHeader = (rawDate: string | undefined): Effect.Effect<Date, EnronParseError> =>
  Effect.try({
    try: () => {
      if (rawDate === undefined || Str.isEmpty(Str.trim(rawDate))) {
        throw new Error("Missing Date header");
      }

      const parsed = new Date(rawDate);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Invalid Date header: ${rawDate}`);
      }

      return parsed;
    },
    catch: (cause) =>
      new EnronParseError({
        message: "Failed to parse Date header",
        cause: String(cause),
      }),
  });

const decodeEmail = (input: unknown): Effect.Effect<EnronEmail, EnronParseError> =>
  S.decodeUnknown(EnronEmail)(input).pipe(
    Effect.mapError(
      (cause) =>
        new EnronParseError({
          message: "Parsed email failed schema validation",
          cause: String(cause),
        })
    )
  );

const parsePostalMime = (raw: string): Effect.Effect<Email, EnronParseError> =>
  Effect.tryPromise({
    try: () => PostalMime.parse(raw),
    catch: (cause) =>
      new EnronParseError({
        message: "Failed to parse RFC 2822 email",
        cause: String(cause),
      }),
  });

const decodeMessageId = (rawMessageId: string | undefined): Effect.Effect<string, EnronParseError> =>
  Effect.try({
    try: () => {
      if (rawMessageId === undefined) {
        throw new Error("Missing Message-ID");
      }
      return normalizeMessageId(rawMessageId);
    },
    catch: (cause) =>
      new EnronParseError({
        message: "Failed to normalize Message-ID",
        cause: String(cause),
      }),
  });

export const parseEmail = (raw: string, options?: ParseEmailOptions): Effect.Effect<EnronEmail, EnronParseError> =>
  Effect.gen(function* () {
    const parsed = yield* parsePostalMime(raw);

    const fromHeader = extractHeader(parsed, "from").pipe(O.getOrUndefined);
    const toHeader = extractHeader(parsed, "to").pipe(O.getOrUndefined);
    const ccHeader = extractHeader(parsed, "cc").pipe(O.getOrUndefined);
    const bccHeader = extractHeader(parsed, "bcc").pipe(O.getOrUndefined);
    const dateHeader = extractHeader(parsed, "date").pipe(O.getOrUndefined);
    const subjectHeader = extractHeader(parsed, "subject").pipe(O.getOrUndefined);
    const messageIdHeader = extractHeader(parsed, "message-id").pipe(O.getOrUndefined);
    const inReplyToHeader = extractHeader(parsed, "in-reply-to").pipe(O.getOrUndefined);
    const referencesHeader = extractHeader(parsed, "references").pipe(O.getOrUndefined);

    const sender = yield* F.pipe(
      parseSender(parsed, fromHeader),
      O.match({
        onNone: () =>
          Effect.fail(
            new EnronParseError({
              message: "Email is missing a valid From address",
            })
          ),
        onSome: Effect.succeed,
      })
    );

    const date = yield* parseDateHeader(parsed.date ?? dateHeader);

    const messageId = yield* decodeMessageId(parsed.messageId ?? messageIdHeader);
    const references = parseMessageIds(parsed.references ?? referencesHeader);
    const inReplyTo = F.pipe(parseSingleMessageId(parsed.inReplyTo ?? inReplyToHeader), O.getOrUndefined);

    const bodySource = parsed.text ?? (parsed.html === undefined ? Str.empty : stripHtml(parsed.html));
    const body = normalizeEmailBody(bodySource);

    const email = {
      from: sender,
      to: parseAddressCollection(parsed.to, toHeader),
      cc: parseAddressCollection(parsed.cc, ccHeader),
      bcc: parseAddressCollection(parsed.bcc, bccHeader),
      date: date.toISOString(),
      subject: normalizeWhitespace(subjectHeader ?? parsed.subject ?? NO_SUBJECT),
      messageId,
      inReplyTo,
      references,
      body,
      folder: options?.folder ?? FALLBACK_FOLDER,
      user: options?.user ?? FALLBACK_USER,
    };

    return yield* decodeEmail(email);
  });

const listMaildirFiles = (
  dirPath: string
): Effect.Effect<ReadonlyArray<string>, EnronFileError | PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exists = yield* fs.exists(dirPath);
    if (!exists) {
      return yield* Effect.fail(
        new EnronFileError({
          path: dirPath,
          message: `Directory not found: ${dirPath}`,
        })
      );
    }

    const entries = yield* fs.readDirectory(dirPath).pipe(
      Effect.mapError(
        (cause) =>
          new EnronFileError({
            path: dirPath,
            message: "Failed to read directory",
            cause: String(cause),
          })
      )
    );

    const nested = yield* Effect.forEach(
      entries,
      (entryName) =>
        Effect.gen(function* () {
          const fullPath = `${dirPath}/${entryName}`;
          const stat = yield* fs.stat(fullPath).pipe(
            Effect.mapError(
              (cause) =>
                new EnronFileError({
                  path: fullPath,
                  message: "Failed to stat path",
                  cause: String(cause),
                })
            )
          );

          if (stat.type === "Directory") {
            return yield* listMaildirFiles(fullPath);
          }

          if (stat.type === "File") {
            return [fullPath] as ReadonlyArray<string>;
          }

          return A.empty<string>();
        }),
      { concurrency: "unbounded" }
    );

    return A.flatten(nested);
  });

const parseCsvRows = (csvContent: string): Effect.Effect<ReadonlyArray<CsvEmailRecord>, EnronFileError> =>
  Effect.try({
    try: () => {
      const rows: Array<Array<string>> = [];
      let currentRow: Array<string> = [];
      let currentField = "";
      let inQuotes = false;

      const pushRow = () => {
        currentRow.push(currentField);
        currentField = "";

        const hasContent = currentRow.some((field) => !Str.isEmpty(field));
        if (hasContent) {
          rows.push(currentRow);
        }

        currentRow = [];
      };

      for (let index = 0; index < csvContent.length; index += 1) {
        const char = csvContent[index] ?? "";
        const next = csvContent[index + 1] ?? "";

        if (char === '"') {
          if (inQuotes && next === '"') {
            currentField += '"';
            index += 1;
            continue;
          }

          inQuotes = !inQuotes;
          continue;
        }

        if (char === "," && !inQuotes) {
          currentRow.push(currentField);
          currentField = "";
          continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
          if (char === "\r" && next === "\n") {
            index += 1;
          }

          pushRow();
          continue;
        }

        currentField += char;
      }

      if (currentField.length > 0 || currentRow.length > 0) {
        pushRow();
      }

      if (rows.length === 0) {
        return A.empty<CsvEmailRecord>();
      }

      const header = rows[0] ?? [];
      const fileIndex = header.findIndex((column) => Str.toLowerCase(Str.trim(column)) === "file");
      const messageIndex = header.findIndex((column) => Str.toLowerCase(Str.trim(column)) === "message");

      if (fileIndex === -1 || messageIndex === -1) {
        throw new Error("CSV requires file and message columns");
      }

      return F.pipe(
        rows.slice(1),
        A.filterMap((row) => {
          const file = row[fileIndex] ?? "";
          const message = row[messageIndex] ?? "";
          if (Str.isEmpty(Str.trim(message))) {
            return O.none<CsvEmailRecord>();
          }
          return O.some({ file, message });
        })
      );
    },
    catch: (cause) =>
      new EnronFileError({
        path: "<csv-content>",
        message: "Failed to parse CSV rows",
        cause: String(cause),
      }),
  });

const splitMaildirPath = (relativeFilePath: string): { readonly user: string; readonly folder: string } => {
  const parts = relativeFilePath.split("/");
  const user = parts[0] === undefined || Str.isEmpty(parts[0]) ? FALLBACK_USER : parts[0];
  const folder = parts.length <= 2 ? FALLBACK_FOLDER : parts.slice(1, -1).join("/");
  return { user, folder };
};

export const parseCsvContent = (
  csvContent: string
): Effect.Effect<ReadonlyArray<EnronEmail>, EnronParseError | EnronFileError> =>
  Effect.gen(function* () {
    const rows = yield* parseCsvRows(csvContent);

    return yield* Effect.forEach(
      rows,
      (row) => {
        const metadata = splitMaildirPath(row.file);
        return parseEmail(row.message, metadata);
      },
      { concurrency: "unbounded" }
    );
  });

export const parseCsvFile = (
  csvPath: string
): Effect.Effect<ReadonlyArray<EnronEmail>, EnronParseError | EnronFileError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const csvContent = yield* fs.readFileString(csvPath).pipe(
      Effect.mapError(
        (cause) =>
          new EnronFileError({
            path: csvPath,
            message: "Failed to read CSV file",
            cause: String(cause),
          })
      )
    );

    return yield* parseCsvContent(csvContent);
  });

export const parseMaildir = (
  dirPath: string
): Effect.Effect<
  ReadonlyArray<EnronEmail>,
  EnronParseError | BadArgument | SystemError | EnronFileError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const files = yield* listMaildirFiles(dirPath);

    return yield* Effect.forEach(
      files,
      (absolutePath) =>
        Effect.gen(function* () {
          const raw = yield* fs.readFileString(absolutePath).pipe(
            Effect.mapError(
              (cause) =>
                new EnronFileError({
                  path: absolutePath,
                  message: "Failed to read maildir message",
                  cause: String(cause),
                })
            )
          );

          const prefix = `${dirPath}/`;
          const relativePath = absolutePath.startsWith(prefix) ? absolutePath.slice(prefix.length) : absolutePath;
          const metadata = splitMaildirPath(relativePath);

          return yield* parseEmail(raw, metadata);
        }),
      { concurrency: "unbounded" }
    );
  });
