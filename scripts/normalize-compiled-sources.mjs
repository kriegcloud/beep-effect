#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const COMPILED_DIR = path.join(
  REPO_ROOT,
  "specs/pending/repo-codegraph-JSDoc/outputs/compiled_sources",
);
const SOURCE_LIST_PATH = path.join(
  REPO_ROOT,
  "specs/pending/repo-codegraph-JSDoc/outputs/sources_to_markdownify.md",
);

const sourceMap = loadSourceMap(SOURCE_LIST_PATH);
const files = readdirSync(COMPILED_DIR)
  .filter((name) => name.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b));

const report = [];

for (const name of files) {
  const absolutePath = path.join(COMPILED_DIR, name);
  const title = name.slice(0, -3);
  const sourceUrl = sourceMap.get(title) ?? null;
  const original = readFileSync(absolutePath, "utf8");
  const classification = classifyDocument(original);

  let cleaned = original;
  let conversionMode = "none";
  let fallbackUsed = false;
  let recoveredFromPdf = false;

  if (classification.htmlHeavy) {
    const preferredMode = classification.family === "framer-like" ? "plain" : "gfm-raw_html";
    conversionMode = preferredMode;

    const primaryResult = runPandoc(absolutePath, preferredMode);
    if (primaryResult !== null) {
      cleaned = cleanupConvertedText(primaryResult, title, sourceUrl);

      const quality = qualityMetrics(cleaned);
      const shouldFallbackToPlain =
        preferredMode !== "plain" &&
        (quality.htmlTagCount > 25 ||
          (quality.nonEmptyLines > 200 && quality.shortLineRatio > 0.5));

      if (shouldFallbackToPlain) {
        const fallbackResult = runPandoc(absolutePath, "plain");
        if (fallbackResult !== null) {
          cleaned = cleanupConvertedText(fallbackResult, title, sourceUrl);
          conversionMode = "plain";
          fallbackUsed = true;
        }
      }
    }
  } else {
    cleaned = cleanupMarkdownLike(original, title, sourceUrl);
  }

  const preRecoveryQuality = qualityMetrics(cleaned);
  const needsRecovery =
    /\bLoading\b/i.test(cleaned) ||
    (preRecoveryQuality.nonEmptyLines > 120 && preRecoveryQuality.shortLineRatio > 0.6);

  if (needsRecovery && sourceUrl !== null) {
    const recovered = recoverFromPdf(title, sourceUrl);
    if (recovered !== null) {
      const recoveredQuality = qualityMetrics(recovered);
      const recoveredIsBetter =
        recoveredQuality.nonEmptyLines >= Math.max(40, preRecoveryQuality.nonEmptyLines * 2) &&
        (/\bLoading\b/i.test(cleaned) ||
          recoveredQuality.shortLineRatio < preRecoveryQuality.shortLineRatio ||
          recovered.length > cleaned.length * 2);

      if (recoveredIsBetter) {
        cleaned = cleanupMarkdownLike(recovered, title, sourceUrl);
        recoveredFromPdf = true;
      }
    }
  }

  cleaned = ensureTrailingNewline(cleaned);

  if (cleaned.trim().length === 0) {
    cleaned = ensureTrailingNewline(cleanupMarkdownLike(original, title, sourceUrl));
  }

  if (cleaned !== original) {
    writeFileSync(absolutePath, cleaned, "utf8");
  }

  const originalSize = Buffer.byteLength(original, "utf8");
  const cleanedSize = statSync(absolutePath).size;
  const ratio = originalSize > 0 ? cleanedSize / originalSize : 1;

  report.push({
    file: name,
    family: classification.family,
    htmlHeavy: classification.htmlHeavy,
    mode: conversionMode,
    fallbackUsed,
    recoveredFromPdf,
    originalSize,
    cleanedSize,
    ratio,
  });
}

for (const entry of report) {
  const ratioText = entry.ratio.toFixed(3).padStart(6, " ");
  const flags = [
    entry.htmlHeavy ? "html" : "md",
    entry.mode,
    entry.fallbackUsed ? "fallback" : "",
    entry.recoveredFromPdf ? "pdf-recover" : "",
  ]
    .filter((token) => token.length > 0)
    .join(",");

  process.stdout.write(
    `${String(entry.originalSize).padStart(8, " ")} -> ${String(entry.cleanedSize).padStart(8, " ")} (${ratioText}) [${flags}] ${entry.file}\n`,
  );
}

function loadSourceMap(sourceListPath) {
  const map = new Map();

  try {
    const text = readFileSync(sourceListPath, "utf8");
    for (const rawLine of text.split(/\n/)) {
      const line = rawLine.trim();
      const match = line.match(/^- \[(.+?)\]\((.+?)\)$/);
      if (match) {
        map.set(match[1], match[2]);
      }
    }
  } catch {
    // Keep an empty map when source list is unavailable.
  }

  return map;
}

function classifyDocument(text) {
  const htmlTagCount = countMatches(text, /<\/?[a-zA-Z][^>\n]*>/g);
  const classAttrCount = countMatches(text, /\bclass="[^"]*"/g);
  const styleAttrCount = countMatches(text, /\bstyle="[^"]*"/g);
  const scriptTagCount = countMatches(text, /<script\b/gi);

  const hasHtmlEnvelope = /<!doctype html|<html\b/i.test(text);
  const htmlHeavy =
    hasHtmlEnvelope ||
    htmlTagCount > 150 ||
    classAttrCount > 20 ||
    styleAttrCount > 20 ||
    scriptTagCount > 2;

  let family = "markdown-like";
  if (htmlHeavy) {
    if (/framer-|framerusercontent|framer-hydrate/i.test(text)) {
      family = "framer-like";
    } else if (/ltx_|arxiv\.org\/html\//i.test(text)) {
      family = "arxiv-like";
    } else if (/sourcegraph\.com\/blog|sourcegraph\.com/i.test(text)) {
      family = "sourcegraph-like";
    } else if (/docusaurus|schema-sidebar|Code Property Graph Specification Website/i.test(text)) {
      family = "docusaurus-like";
    } else if (/falkordb/i.test(text)) {
      family = "falkordb-like";
    } else {
      family = "other-html";
    }
  }

  return { htmlHeavy, family };
}

function countMatches(text, pattern) {
  const matches = text.match(pattern);
  return matches === null ? 0 : matches.length;
}

function runPandoc(filePath, target) {
  const result = spawnSync(
    "pandoc",
    ["-f", "html", "-t", target, "--wrap=none", filePath],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 512,
    },
  );

  if (result.error || result.status !== 0 || result.stdout.length === 0) {
    process.stderr.write(
      `WARN pandoc failed for ${path.basename(filePath)} with target ${target}: ${
        result.stderr?.trim() ?? "unknown error"
      }\n`,
    );
    return null;
  }

  return result.stdout;
}

function recoverFromPdf(title, sourceUrl) {
  const pdfUrl = extractPdfUrl(sourceUrl);
  if (pdfUrl === null) {
    return null;
  }

  const safeName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
  const tempPdfPath = `/tmp/compiled-source-${safeName || "source"}-${Date.now()}.pdf`;

  const curl = spawnSync("curl", ["-L", "-fsS", pdfUrl, "-o", tempPdfPath], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });

  if (curl.error || curl.status !== 0) {
    process.stderr.write(`WARN pdf download failed for ${title}: ${pdfUrl}\n`);
    return null;
  }

  const extract = spawnSync("pdftotext", [tempPdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 256,
  });

  rmSync(tempPdfPath, { force: true });

  if (extract.error || extract.status !== 0 || extract.stdout.length === 0) {
    process.stderr.write(`WARN pdftotext failed for ${title}\n`);
    return null;
  }

  const text = extract.stdout.replace(/\f/g, "\n\n").replace(/\r\n?/g, "\n");
  if (text.trim().length < 800) {
    return null;
  }

  return text;
}

function extractPdfUrl(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.hostname === "docs.google.com" && parsed.pathname.includes("/viewerng/viewer")) {
      const wrapped = parsed.searchParams.get("url");
      if (wrapped !== null && wrapped.length > 0) {
        return wrapped;
      }
    }
  } catch {
    return null;
  }

  if (/\.pdf(\?|$)/i.test(sourceUrl)) {
    return sourceUrl;
  }

  return null;
}

function cleanupConvertedText(input, title, sourceUrl) {
  let text = input.replace(/\r\n?/g, "\n");

  text = text
    .replace(/<script\b[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "\n")
    .replace(/<!--[\s\S]*?-->/g, "\n")
    .replace(/<!doctype[^>]*>/gi, "\n")
    .replace(/!\[[^\]]*\]\(data:image[^)]*\)/gi, "")
    .replace(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g, "")
    .replace(/<\/?[^>\n]+>/g, "");

  text = decodeHtmlEntities(text);

  let lines = text
    .split("\n")
    .map((line) =>
      line
        .replace(/\u00A0/g, " ")
        .replace(/\u200B/g, "")
        .replace(/\uFEFF/g, "")
        .trimEnd(),
    );

  const start = findTitleStart(lines, title);
  if (start > 0) {
    lines = lines.slice(start);
  }

  lines = lines.filter((line) => {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      return true;
    }

    if (trimmed === "[]") {
      return false;
    }

    if (/^\[Refer to caption\]$/i.test(trimmed)) {
      return false;
    }

    if (/^(Skip to content|Back to blog|Open main menu|Close menu|Menu)$/i.test(trimmed)) {
      return false;
    }

    if (
      /^(Sign Up ?→?|Get started|Book a demo|Schedule a Demo|Contact Sales)$/i.test(trimmed)
    ) {
      return false;
    }

    if (
      /^(Subscribe for the latest code AI news and product updates|Ready to accelerate how you build\s*software\?|Use Sourcegraph to industrialize your software development)$/i.test(
        trimmed,
      )
    ) {
      return false;
    }

    if (trimmed.includes("data:image/")) {
      return false;
    }

    if (trimmed.length > 5000 && /(base64|[A-Za-z0-9+/=]{300,})/i.test(trimmed)) {
      return false;
    }

    if (/^Loading…!?$/i.test(trimmed)) {
      return false;
    }

    return true;
  });

  lines = normalizeDocumentStructure(lines, title, sourceUrl);
  lines = removeRedundantTitleHeadings(lines, title);
  lines = normalizeSectionHeadings(lines);
  lines = stripDataLinks(lines);
  lines = lines.map((line) => line.replace(/^(\s*[-*]\s*)•\s+/g, "$1"));
  lines = lines.map((line) => line.replace(/^\s*•\s+/g, "- "));
  lines = dedupeNearDuplicateHeadings(lines);

  const recommendedBlogsIndex = lines.findIndex((line) =>
    /Recommended Blogs/i.test(line.trim()),
  );
  if (recommendedBlogsIndex >= 0) {
    lines = lines.slice(0, recommendedBlogsIndex);
  }

  lines = collapseBlankLines(lines);

  return lines.join("\n").trim() + "\n";
}

function cleanupMarkdownLike(input, title, sourceUrl) {
  let text = input
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\uFEFF/g, "")
    .replace(/!\[[^\]]*\]\(data:image[^)]*\)/gi, "")
    .replace(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g, "");

  let lines = text.split("\n").map((line) => line.trimEnd());

  lines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      return true;
    }
    if (/^<!doctype html|^<html\b|^<head\b|^<body\b|^<script\b|^<style\b/i.test(trimmed)) {
      return false;
    }
    return true;
  });

  lines = normalizeDocumentStructure(lines, title, sourceUrl);
  lines = removeRedundantTitleHeadings(lines, title);
  lines = stripDataLinks(lines);
  lines = dedupeNearDuplicateHeadings(lines);

  const recommendedBlogsIndex = lines.findIndex((line) =>
    /Recommended Blogs/i.test(line.trim()),
  );
  if (recommendedBlogsIndex >= 0) {
    lines = lines.slice(0, recommendedBlogsIndex);
  }

  lines = collapseBlankLines(lines);

  return lines.join("\n").trim() + "\n";
}

function normalizeDocumentStructure(linesInput, title, sourceUrl) {
  const lines = [...linesInput];

  while (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift();
  }

  if (lines.length === 0) {
    lines.push(`# ${title}`);
  }

  const normalizedTitle = normalizeForMatch(title);
  const first = lines[0].trim();

  if (first.startsWith("#")) {
    const headingText = first.replace(/^#+\s*/, "").trim();
    if (normalizeForMatch(headingText) !== normalizedTitle) {
      lines.unshift("", `# ${title}`);
    }
  } else if (normalizeForMatch(first).includes(normalizedTitle)) {
    lines[0] = `# ${title}`;
  } else {
    lines.unshift(`## ${first}`);
    lines.unshift(`# ${title}`, "");
  }

  while (
    lines.length > 1 &&
    normalizeForMatch(lines[1]) === normalizedTitle &&
    lines[1].trim().length > 0
  ) {
    lines.splice(1, 1);
  }

  if (sourceUrl !== null) {
    const topBlock = lines.slice(0, 10).join("\n");
    if (!/^Source:\s+/m.test(topBlock)) {
      lines.splice(1, 0, "", `Source: ${sourceUrl}`, "");
    }
  }

  return lines;
}

function normalizeSectionHeadings(linesInput) {
  const lines = [...linesInput];

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (trimmed.length === 0) {
      continue;
    }

    const prevBlank = index === 0 || lines[index - 1].trim().length === 0;
    const nextBlank = index === lines.length - 1 || lines[index + 1].trim().length === 0;

    if (/^Abstract\.?$/i.test(trimmed) && prevBlank) {
      lines[index] = "## Abstract";
      continue;
    }

    const sectionMatch = trimmed.match(/^(\d+(?:\.\d+){0,4})\.?\s+(.+)$/);
    if (sectionMatch !== null && prevBlank && nextBlank) {
      const depth = Math.min(6, sectionMatch[1].split(".").length + 1);
      lines[index] = `${"#".repeat(depth)} ${sectionMatch[1]} ${sectionMatch[2]}`;
      continue;
    }

    if (
      prevBlank &&
      nextBlank &&
      /^[A-Z][A-Za-z0-9 ,:&'()-]{4,120}$/.test(trimmed) &&
      !trimmed.startsWith("#")
    ) {
      lines[index] = `## ${trimmed}`;
    }
  }

  return lines;
}

function stripDataLinks(linesInput) {
  return linesInput
    .map((line) =>
      line
        .replace(/\[[^\]]*\]\(data:[^)]+\)/gi, "")
        .replace(/!\[[^\]]*\]\([^)]*viewerng\/thumb[^)]*\)/gi, "")
        .replace(
          /!\[[^\]]*\]\(https?:\/\/[^)]*(framerusercontent|cdn\.prod\.website-files)\.[^)]*\)/gi,
          "",
        ),
    )
    .filter((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        return true;
      }
      if (/^!\[[^\]]*\]\([^)]*\)$/i.test(trimmed)) {
        return false;
      }
      if (/^Loading…!?\s*!\[[^\]]*\]\([^)]*\)$/i.test(trimmed)) {
        return false;
      }
      if (/^Try Potpie ?→?$/i.test(trimmed)) {
        return false;
      }
      return true;
    });
}

function removeRedundantTitleHeadings(linesInput, title) {
  const normalizedTitle = normalizeForMatch(title);
  return linesInput.filter((line, index) => {
    if (index < 4) {
      return true;
    }
    const trimmed = line.trim();
    if (!/^#{1,6}\s+/.test(trimmed)) {
      return true;
    }
    const headingText = trimmed.replace(/^#{1,6}\s+/, "");
    return normalizeForMatch(headingText) !== normalizedTitle;
  });
}

function dedupeNearDuplicateHeadings(linesInput) {
  const output = [];
  let lastNonEmptyNormalized = "";
  let lastWasHeading = false;

  for (const line of linesInput) {
    const trimmed = line.trim();
    const normalized = normalizeForMatch(trimmed);
    const isHeading = /^#{1,6}\s+/.test(trimmed);

    if (
      isHeading &&
      lastWasHeading &&
      normalized.length > 0 &&
      normalized === lastNonEmptyNormalized
    ) {
      continue;
    }

    output.push(line);

    if (trimmed.length > 0) {
      lastNonEmptyNormalized = normalized;
      lastWasHeading = isHeading;
    }
  }

  return output;
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function collapseBlankLines(lines) {
  const output = [];
  let previousBlank = false;

  for (const line of lines) {
    const blank = line.trim().length === 0;
    if (blank && previousBlank) {
      continue;
    }
    output.push(blank ? "" : line);
    previousBlank = blank;
  }

  while (output.length > 0 && output[output.length - 1].trim().length === 0) {
    output.pop();
  }

  return output;
}

function findTitleStart(lines, title) {
  const normalizedTitle = normalizeForMatch(title);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.length === 0) {
      continue;
    }

    const normalized = normalizeForMatch(line.replace(/^#+\s*/, ""));

    if (normalized === normalizedTitle) {
      return index;
    }

    if (normalized.includes(normalizedTitle) && normalized.length <= normalizedTitle.length + 40) {
      return index;
    }
  }

  return 0;
}

function normalizeForMatch(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function ensureTrailingNewline(text) {
  return text.endsWith("\n") ? text : `${text}\n`;
}

function qualityMetrics(text) {
  const lines = text.split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  const shortLines = nonEmpty.filter((line) => line.trim().length <= 2).length;
  const shortLineRatio = nonEmpty.length > 0 ? shortLines / nonEmpty.length : 0;
  const htmlTagCount = countMatches(text, /<\/?[a-zA-Z][^>\n]*>/g);

  return {
    nonEmptyLines: nonEmpty.length,
    shortLineRatio,
    htmlTagCount,
  };
}
