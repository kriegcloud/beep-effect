import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const start = "2026-05-05T23:11:33-05:00";
const timeZone = "America/Chicago";
const rolloverHour = 6;
const hourlyRateUsd = 200;

const outputPath = resolve(__dirname, "legal-ai-time-inventory.csv");
const markdownOutputPath = resolve(__dirname, "legal-ai-time-inventory.md");

const allowedIdentityPatterns = [
  /(?:^|\b)elpresidank(?:\b|$)/i,
  /kriegcloud/i,
  /benjamin@krieg\.cloud/i,
  /\bcodex\b/i,
  /\bclaude\b/i,
];

const categoryRules = [
  {
    label: "OIP public website and launch content",
    test: (file, subject) =>
      /^(apps\/(?:op-ip-web|opip-web|oip-web)|(?:initiatives|goals)\/(?:opip-web|oip-web)-launch)/.test(file) ||
      /\b(?:op-ip-web|opip-web|oip-web|opip|oip)\b/i.test(subject),
  },
  {
    label: "OIP production hardening, deployment, and DNS infrastructure",
    test: (file, subject) =>
      /^(infra\/(?:opip-web|oip-web)|infra\/src\/(?:OpipWeb|OipWeb)\.ts|infra\/src\/internal\/(?:opip-web|oip-web)-entry\.ts|infra\/test\/(?:OpipWeb|OipWeb)\.test\.ts|(?:initiatives|goals)\/(?:opip-web|oip-web)-production-hardening)/.test(file) ||
      /\b(?:vercel|dns|production hardening|route exports|cutover)\b/i.test(subject),
  },
  {
    label: "HubSpot/Sanity intake and CMS drivers",
    test: (file, subject) =>
      /^packages\/drivers\/(?:hubspot|sanity)\//.test(file) ||
      /\b(?:hubspot|sanity|contact|cms)\b/i.test(subject),
  },
  {
    label: "Agentic professional runtime and domain models",
    test: (file, subject) =>
      /^(goals\/agentic-professional-runtime|packages\/(?:law-practice|wealth-management|workspace|agent-capability)|apps\/professional-runtime-proof)/.test(file) ||
      /\bprofessional runtime\b/i.test(subject),
  },
  {
    label: "Professional desktop shell",
    test: (file, subject) =>
      /^apps\/professional-desktop\//.test(file) ||
      /\bprofessional desktop\b/i.test(subject),
  },
  {
    label: "IP knowledge graph, Sidecar, NLP, and file-processing planning",
    test: (file, subject) =>
      /^(goals\/ip-law-knowledge-graph|goals\/file-processing-capability|PRD-ambient-billing-copilot\.md|packages\/foundation\/capability\/(?:nlp|semantic-web))/.test(file) ||
      /\b(?:ip-law|sidecar|file processing|nlp|semantic)\b/i.test(subject),
  },
  {
    label: "Stack installer/onboarding support",
    test: (file, subject) =>
      /^goals\/stack-installer\//.test(file) ||
      /\bstack-installer\b/i.test(subject),
  },
  {
    label: "Effect v4 subtree, dependency updates, and package releases",
    test: (file, subject) =>
      /^(?:\.repos\/effect-v4|bun\.lock|package\.json|\.changeset\/|changeset\/)/.test(file) ||
      /\b(?:effect-v4|dependencies|deps|release|version packages|bump)\b/i.test(subject),
  },
  {
    label: "repo CLI, automation, and developer workflow tooling",
    test: (file, subject) =>
      /^packages\/tooling\/tool\/cli\//.test(file) ||
      /^scripts\//.test(file) ||
      /\b(?:repo-cli|yeet|quality|tsconfig|version-sync|codex|automation|cli)\b/i.test(subject),
  },
  {
    label: "architecture standards, repo-law inventories, and documentation",
    test: (file, subject) =>
      /^(?:standards\/|goals\/|docs\/|\.claude\/skills\/|\.agents\/skills\/)/.test(file) ||
      /\b(?:architecture|goal packet|standards|inventory|grill|docs?)\b/i.test(subject),
  },
  {
    label: "foundation libraries, schema/modeling, and Effect-first migrations",
    test: (file, subject) =>
      /^packages\/foundation\//.test(file) ||
      /^packages\/shared\//.test(file) ||
      /\b(?:schema|modeling|effect-native|effect-first|literal|jsdoc|annotation)\b/i.test(subject),
  },
  {
    label: "drivers and external service integrations",
    test: (file, subject) =>
      /^packages\/drivers\//.test(file) ||
      /\b(?:driver|hubspot|sanity|box|acp|venice|xai)\b/i.test(subject),
  },
  {
    label: "frontend apps and shared UI",
    test: (file, subject) =>
      /^apps\//.test(file) ||
      /^packages\/foundation\/ui-system\//.test(file) ||
      /\b(?:app|web|desktop|ui|frontend|theme|component)\b/i.test(subject),
  },
  {
    label: "scratchpad research, prototypes, and migration experiments",
    test: (file, subject) =>
      /^scratchpad\//.test(file) ||
      /\b(?:scratch|prototype|migration|experiment|proof)\b/i.test(subject),
  },
  {
    label: "quality gates, schema cleanup, generated docs, and repo integration",
    test: (_file, subject) =>
      /\b(?:quality|schema|docgen|release|review|merge|sync|generated|tsgo|lint|law violations|pr feedback)\b/i.test(subject),
  },
];

const gitLog = execFileSync(
  "git",
  [
    "log",
    "--all",
    `--since=${start}`,
    "--date=iso-strict",
    "--format=@@COMMIT@@%H%x1f%at%x1f%aI%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%s",
    "--name-only",
  ],
  {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 200,
  },
);

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function localParts(date) {
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function localDateTime(date) {
  const parts = localParts(date);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function previousDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day) - 24 * 60 * 60 * 1000);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function serviceDate(date) {
  const parts = localParts(date);
  return parts.hour < rolloverHour
    ? previousDate(parts.year, parts.month, parts.day)
    : `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function parseCommits(log) {
  const commits = [];
  let current = undefined;

  for (const line of log.split(/\r?\n/)) {
    if (line.startsWith("@@COMMIT@@")) {
      if (current) commits.push(current);
      const [hash, unixSeconds, authorIso, authorName, authorEmail, committerName, committerEmail, subject] = line
        .slice("@@COMMIT@@".length)
        .split("\x1f");
      current = {
        hash,
        unixSeconds: Number(unixSeconds),
        authorIso,
        authorName,
        authorEmail,
        committerName,
        committerEmail,
        subject,
        files: [],
      };
      continue;
    }

    if (current && line.trim().length > 0) {
      current.files.push(line.trim());
    }
  }

  if (current) commits.push(current);
  return commits;
}

function isAutomaticCheckpoint(commit) {
  return /^t3 checkpoint\b/i.test(commit.subject);
}

function isStashCommit(commit) {
  return (
    /^git stash$/i.test(commit.authorName) ||
    /^git stash$/i.test(commit.committerName) ||
    /^WIP on /i.test(commit.subject) ||
    /^index on /i.test(commit.subject)
  );
}

function isAllowedIdentity(commit) {
  const identityText = [
    commit.authorName,
    commit.authorEmail,
    commit.committerName,
    commit.committerEmail,
  ].join(" ");
  return allowedIdentityPatterns.some((pattern) => pattern.test(identityText));
}

function isIncluded(commit) {
  if (isAutomaticCheckpoint(commit)) return false;
  if (isStashCommit(commit)) return false;
  return isAllowedIdentity(commit);
}

function uniq(values) {
  return [...new Set(values)];
}

function categoriesFor(commits) {
  return uniq(
    categoryRules
      .filter((rule) =>
        commits.some((commit) =>
          commit.files.some((file) => rule.test(file, commit.subject)) || rule.test("", commit.subject),
        ),
      )
      .map((rule) => rule.label),
  );
}

function meaningfulSubjects(commits) {
  return uniq(
    commits
      .map((commit) => commit.subject)
      .filter((subject) => !/^saving$/i.test(subject))
      .filter((subject) => !/^merged? in main$/i.test(subject))
      .filter((subject) => !/^Merge remote-tracking branch/i.test(subject))
      .filter((subject) => !/^Merge origin\/main/i.test(subject))
      .slice(0, 8),
  );
}

function describe(commits) {
  const categories = categoriesFor(commits);
  const subjects = meaningfulSubjects(commits);
  const categoryText = categories.length > 0 ? categories.join("; ") : "Legal AI/OIP stack work";
  const subjectText = subjects.length > 0 ? ` Source work: ${subjects.join("; ")}.` : "";
  return `${categoryText}.${subjectText}`;
}

function identitiesFor(commits) {
  return uniq(
    commits.map(
      (commit) =>
        `${commit.authorName} <${commit.authorEmail}> via ${commit.committerName} <${commit.committerEmail}>`,
    ),
  ).join("; ");
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function markdownCell(value) {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function money(amount) {
  return `$${amount.toFixed(2)}`;
}

function shortSubject(subject) {
  return subject.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

const commitByHash = new Map();
for (const commit of parseCommits(gitLog)) {
  commitByHash.set(commit.hash, commit);
}

const includedCommits = [...commitByHash.values()]
  .filter(isIncluded)
  .sort((a, b) => a.unixSeconds - b.unixSeconds || a.hash.localeCompare(b.hash));

const groups = new Map();
for (const commit of includedCommits) {
  const date = new Date(commit.unixSeconds * 1000);
  const key = serviceDate(date);
  const group = groups.get(key) ?? [];
  group.push(commit);
  groups.set(key, group);
}

const header = [
  "service_date",
  "start_at_local",
  "end_at_local",
  "first_commit_local",
  "last_commit_local",
  "billable_hours",
  "rate_usd_per_hour",
  "amount_usd",
  "commit_count",
  "included_identities",
  "source_commits",
  "description",
  "estimation_rule",
];

const rows = [header];
const entries = [];

for (const [date, commits] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  commits.sort((a, b) => a.unixSeconds - b.unixSeconds || a.hash.localeCompare(b.hash));
  const first = commits[0];
  const last = commits.at(-1);
  const startAt = new Date(first.unixSeconds * 1000 - 60 * 60 * 1000);
  const endAt = new Date(last.unixSeconds * 1000 + 60 * 60 * 1000);
  const hours = (endAt.getTime() - startAt.getTime()) / (60 * 60 * 1000);
  const amount = hours * hourlyRateUsd;
  const categories = categoriesFor(commits);
  const subjects = meaningfulSubjects(commits);
  const identityText = identitiesFor(commits);
  const sourceCommits = commits.map((commit) => commit.hash.slice(0, 12)).join(" ");
  const description = describe(commits);
  const estimationRule = `Repo commits since ${start} authored or committed by kriegcloud/elpresidank, Codex, or Claude; GitHub Actions, T3 checkpoints, and stash refs excluded; grouped by ${timeZone} service date with ${rolloverHour}:00 rollover; start = first included commit - 1 hour; end = last included commit + 1 hour.`;

  entries.push({
    amount,
    categories,
    commits,
    date,
    description,
    endAt,
    first,
    hours,
    identityText,
    last,
    sourceCommits,
    startAt,
    subjects,
  });

  rows.push([
    date,
    localDateTime(startAt),
    localDateTime(endAt),
    localDateTime(new Date(first.unixSeconds * 1000)),
    localDateTime(new Date(last.unixSeconds * 1000)),
    hours.toFixed(2),
    hourlyRateUsd.toFixed(2),
    amount.toFixed(2),
    commits.length,
    identityText,
    sourceCommits,
    description,
    estimationRule,
  ]);
}

writeFileSync(outputPath, `${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);

const totalHours = rows.slice(1).reduce((sum, row) => sum + Number(row[5]), 0);
const totalAmount = totalHours * hourlyRateUsd;

const markdown = [
  "# Legal AI Stack Time Inventory",
  "",
  "## Summary",
  "",
  `- Source: git commits in this repository starting at ${start}`,
  `- Included identities: kriegcloud/elpresidank, Codex, and Claude commits`,
  "- Excluded identities/events: GitHub Actions release commits, T3 checkpoints, and stash refs",
  `- Rollover: commits before ${rolloverHour}:00 AM ${timeZone} count toward the previous service date`,
  "- Estimate rule: daily start is first included commit minus 1 hour; daily end is last included commit plus 1 hour",
  `- Rate: ${money(hourlyRateUsd)} per hour`,
  "",
  "| Service Date | Work Window | Hours | Amount | Commits | Summary |",
  "| --- | --- | ---: | ---: | ---: | --- |",
  ...entries.map((entry) => {
    const subjects = entry.subjects.slice(0, 3).join("; ");
    const summary = subjects.length > 0 ? subjects : entry.categories.slice(0, 3).join("; ");
    return [
      entry.date,
      `${localDateTime(entry.startAt)} to ${localDateTime(entry.endAt)}`,
      entry.hours.toFixed(2),
      money(entry.amount),
      entry.commits.length,
      markdownCell(summary),
    ].join(" | ");
  }).map((line) => `| ${line} |`),
  "",
  `**Total:** ${totalHours.toFixed(2)} hours at ${money(hourlyRateUsd)}/hr = **${money(totalAmount)}**`,
  "",
  "## Daily Entries",
  "",
  ...entries.flatMap((entry) => [
    `### ${entry.date} - ${entry.hours.toFixed(2)} hours - ${money(entry.amount)}`,
    "",
    `- Work window: ${localDateTime(entry.startAt)} to ${localDateTime(entry.endAt)}`,
    `- Commit evidence: ${entry.commits.length} included commits, from ${entry.first.hash.slice(0, 12)} at ${localDateTime(new Date(entry.first.unixSeconds * 1000))} to ${entry.last.hash.slice(0, 12)} at ${localDateTime(new Date(entry.last.unixSeconds * 1000))}`,
    `- Identities: ${entry.identityText}`,
    `- Focus areas: ${entry.categories.slice(0, 8).join("; ")}`,
    "- Representative work:",
    ...(entry.subjects.length > 0
      ? entry.subjects.slice(0, 8).map((subject) => `  - ${shortSubject(subject)}`)
      : ["  - Commit subjects were generic save/merge checkpoints; see source commits in the CSV for the audit trail."]),
    "",
  ]),
].join("\n");

writeFileSync(markdownOutputPath, `${markdown}\n`);

console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${markdownOutputPath}`);
console.log(`Rows: ${rows.length - 1}`);
console.log(`Total hours: ${totalHours.toFixed(2)}`);
console.log(`Total amount: $${totalAmount.toFixed(2)}`);
