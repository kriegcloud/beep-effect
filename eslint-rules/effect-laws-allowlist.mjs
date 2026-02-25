import fs from "node:fs";
import path from "node:path";
import { parse } from "jsonc-parser";

const ALLOWLIST_PATH = "standards/effect-laws.allowlist.jsonc";

let cached = null;

const isString = (value) => typeof value === "string";

const validateAllowlist = (raw) => {
  const diagnostics = [];

  if (raw === null || typeof raw !== "object") {
    diagnostics.push("Allowlist root must be an object.");
    return { entries: [], diagnostics };
  }

  const version = raw.version;
  if (!Number.isInteger(version) || version !== 1) {
    diagnostics.push("Allowlist version must be integer 1.");
  }

  const entries = raw.entries;
  if (!Array.isArray(entries)) {
    diagnostics.push("Allowlist entries must be an array.");
    return { entries: [], diagnostics };
  }

  const normalized = [];

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    const prefix = `entries[${index}]`;

    if (entry === null || typeof entry !== "object") {
      diagnostics.push(`${prefix} must be an object.`);
      continue;
    }

    const rule = entry.rule;
    const file = entry.file;
    const kind = entry.kind;
    const reason = entry.reason;
    const owner = entry.owner;
    const issue = entry.issue;
    const expiresOn = entry.expiresOn;

    if (!isString(rule) || rule.length === 0) {
      diagnostics.push(`${prefix}.rule must be a non-empty string.`);
    }
    if (!isString(file) || file.length === 0) {
      diagnostics.push(`${prefix}.file must be a non-empty string.`);
    }
    if (!isString(kind) || kind.length === 0) {
      diagnostics.push(`${prefix}.kind must be a non-empty string.`);
    }
    if (!isString(reason) || reason.length === 0) {
      diagnostics.push(`${prefix}.reason must be a non-empty string.`);
    }
    if (!isString(owner) || owner.length === 0) {
      diagnostics.push(`${prefix}.owner must be a non-empty string.`);
    }
    if (!isString(issue) || issue.length === 0) {
      diagnostics.push(`${prefix}.issue must be a non-empty string.`);
    }

    if (expiresOn !== undefined) {
      const matchesDate = isString(expiresOn) && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(expiresOn);
      if (!matchesDate) {
        diagnostics.push(`${prefix}.expiresOn must be YYYY-MM-DD when provided.`);
      }
    }

    if (
      isString(rule) &&
      isString(file) &&
      isString(kind) &&
      isString(reason) &&
      isString(owner) &&
      isString(issue) &&
      rule.length > 0 &&
      file.length > 0 &&
      kind.length > 0 &&
      reason.length > 0 &&
      owner.length > 0 &&
      issue.length > 0
    ) {
      normalized.push({
        rule,
        file: file.replaceAll("\\", "/"),
        kind,
        reason,
        owner,
        issue,
        expiresOn,
      });
    }
  }

  return { entries: normalized, diagnostics };
};

const loadAllowlist = () => {
  if (cached !== null) {
    return cached;
  }

  const absolutePath = path.resolve(process.cwd(), ALLOWLIST_PATH);

  if (!fs.existsSync(absolutePath)) {
    cached = {
      path: absolutePath,
      entries: [],
      diagnostics: [`Allowlist file not found: ${ALLOWLIST_PATH}`],
    };
    return cached;
  }

  const text = fs.readFileSync(absolutePath, "utf8");
  const parseErrors = [];
  const parsed = parse(text, parseErrors, { allowTrailingComma: true, disallowComments: false });

  if (parseErrors.length > 0) {
    cached = {
      path: absolutePath,
      entries: [],
      diagnostics: parseErrors.map((error) => `Allowlist JSONC parse error at offset ${error.offset}.`),
    };
    return cached;
  }

  const validated = validateAllowlist(parsed);
  cached = {
    path: absolutePath,
    entries: validated.entries,
    diagnostics: validated.diagnostics,
  };

  return cached;
};

export const getAllowlistDiagnostics = () => loadAllowlist().diagnostics;

export const isViolationAllowlisted = ({ ruleId, filePath, kind }) => {
  const allowlist = loadAllowlist();
  const normalizedFilePath = filePath.replaceAll("\\", "/");

  return allowlist.entries.some(
    (entry) => entry.rule === ruleId && entry.file === normalizedFilePath && entry.kind === kind
  );
};
