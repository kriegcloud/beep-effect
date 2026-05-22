import * as O from "effect/Option";
import type * as S from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";
import { schemaPathToFieldPath } from "./Path.ts";

export type ErrorSource = "field" | "refinement";

export interface ErrorEntry {
  readonly message: string;
  readonly source: ErrorSource;
}

interface IssueSourceEntry {
  readonly issue: SchemaIssue.Issue;
  readonly path: ReadonlyArray<PropertyKey>;
  readonly source: ErrorSource;
}

const collectIssueSources = (error: S.SchemaError): ReadonlyArray<IssueSourceEntry> => {
  const entries: Array<IssueSourceEntry> = [];

  const walk = (issue: SchemaIssue.Issue, path: ReadonlyArray<PropertyKey>, source: ErrorSource): void => {
    switch (issue._tag) {
      case "Filter":
        walk(issue.issue, path, path.length === 0 ? "refinement" : source);
        break;
      case "Pointer": {
        walk(issue.issue, [...path, ...issue.path], source);
        break;
      }
      case "Composite": {
        for (const sub of issue.issues) {
          walk(sub, path, source);
        }
        break;
      }
      case "Encoding":
        walk(issue.issue, path, path.length === 0 ? "refinement" : source);
        break;
      case "AnyOf":
        if (issue.issues.length === 0) {
          entries.push({ path, source, issue });
        } else {
          for (const sub of issue.issues) {
            walk(sub, path, source);
          }
        }
        break;
      default:
        entries.push({ path, source, issue });
        break;
    }
  };

  walk(error.issue, [], "field");
  return entries;
};

const getIssueMessage = (issue: SchemaIssue.Issue): string | undefined => {
  const formatted = SchemaIssue.makeFormatterStandardSchemaV1()(issue).issues;
  return formatted[0]?.message;
};

export const extractFirstError = (error: S.SchemaError): O.Option<string> => {
  const issues = SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues
  if (issues.length === 0) {
    return O.none();
  }
  return O.some(issues[0].message);
};

export const routeErrors = (error: S.SchemaError): Map<string, string> => {
  const result = new Map<string, string>();
  const issues = SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues

  for (const issue of issues) {
    const fieldPath = schemaPathToFieldPath(issue.path);
    if (fieldPath !== "" && !result.has(fieldPath)) {
      result.set(fieldPath, issue.message);
    }
  }

  return result;
};

export const routeErrorsWithSource = (error: S.SchemaError): Map<string, ErrorEntry> => {
  const result = new Map<string, ErrorEntry>();
  const formattedIssues = SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues;
  const issueSources = collectIssueSources(error);
  const messageSources = new Map<string, ErrorSource>();
  const refinementPaths = new Set<string>();

  for (const entry of issueSources) {
    const fieldPath = schemaPathToFieldPath(entry.path);
    const message = getIssueMessage(entry.issue);
    if (message !== undefined) {
      const messageKey = `${fieldPath}::${message}`;
      const existing = messageSources.get(messageKey);
      if (existing === undefined || (existing === "field" && entry.source === "refinement")) {
        messageSources.set(messageKey, entry.source);
      }
    }
    if (entry.source === "refinement") {
      refinementPaths.add(fieldPath);
    }
  }

  for (const issue of formattedIssues) {
    const fieldPath = schemaPathToFieldPath(issue.path);
    if (result.has(fieldPath)) continue;
    const preferredSource: ErrorSource = refinementPaths.has(fieldPath) ? "refinement" : "field";
    const messageKey = `${fieldPath}::${issue.message}`;
    const issueSource = messageSources.get(messageKey) ?? "field";
    if (preferredSource === "refinement" && issueSource !== "refinement") {
      continue;
    }
    result.set(fieldPath, { message: issue.message, source: issueSource });
  }

  if (result.size < formattedIssues.length) {
    for (const issue of formattedIssues) {
      const fieldPath = schemaPathToFieldPath(issue.path);
      if (result.has(fieldPath)) continue;
      const messageKey = `${fieldPath}::${issue.message}`;
      const issueSource = messageSources.get(messageKey) ?? "field";
      result.set(fieldPath, { message: issue.message, source: issueSource });
    }
  }

  return result;
};
