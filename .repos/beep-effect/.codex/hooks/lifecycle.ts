#!/usr/bin/env bun

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { appendFile } from "node:fs/promises";
import { basename, join } from "node:path";

type HookEvent = "SessionStart" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "SubagentStop";
type PatternAction = "context" | "ask" | "deny";
type PatternLevel = "critical" | "high" | "medium" | "warning" | "info";

interface PatternDefinition {
  readonly name: string;
  readonly description: string;
  readonly event: "PreToolUse" | "PostToolUse";
  readonly tool: string;
  readonly pattern: string;
  readonly action: PatternAction;
  readonly level: PatternLevel;
  readonly tag?: string;
  readonly body: string;
  readonly filePath: string;
}

interface HookLogEvent {
  readonly ts: string;
  readonly event: HookEvent;
  readonly sessionId: string;
  readonly status: "pass" | "warn" | "deny" | "error";
  readonly detail: Record<string, unknown>;
}

const projectDir = process.env.CODEX_PROJECT_DIR ?? process.cwd();
const codexDir = join(projectDir, ".codex");
const runtimeDir = join(codexDir, "runtime");
const logPath = join(runtimeDir, "hook-events.jsonl");
const statePath = join(codexDir, ".hook-state.json");
const patternsRoot = join(codexDir, "patterns");

const LEVEL_ORDER: Record<PatternLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  warning: 3,
  info: 4,
};

const ensureRuntimeDir = () => {
  if (!existsSync(runtimeDir)) {
    mkdirSync(runtimeDir, { recursive: true });
  }
};

const appendHookLog = async (entry: HookLogEvent) => {
  ensureRuntimeDir();
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
};

const readState = (): Record<string, unknown> => {
  try {
    return JSON.parse(readFileSync(statePath, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const writeState = (state: Record<string, unknown>) => {
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
};

const parseFrontmatter = (content: string): Record<string, string> => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  const lines = frontmatterMatch[1].split("\n");
  const pairs = lines
    .map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*["']?(.+?)["']?$/))
    .filter((match): match is RegExpMatchArray => Boolean(match));
  return Object.fromEntries(pairs.map((match) => [match[1], match[2]]));
};

const extractBody = (content: string): string => content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();

const walkPatternFiles = (dirPath: string, out: string[]) => {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkPatternFiles(fullPath, out);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(fullPath);
    }
  }
};

const parsePattern = (filePath: string): PatternDefinition | undefined => {
  const content = readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter.name || !frontmatter.description || !frontmatter.pattern) return;
  const event = frontmatter.event === "PreToolUse" ? "PreToolUse" : "PostToolUse";
  const action = (frontmatter.action ?? "context") as PatternAction;
  const level = (frontmatter.level ?? "info") as PatternLevel;
  return {
    name: frontmatter.name,
    description: frontmatter.description,
    event,
    tool: frontmatter.tool ?? ".*",
    pattern: frontmatter.pattern,
    action,
    level,
    tag: frontmatter.tag,
    body: extractBody(content),
    filePath,
  };
};

const loadPatterns = (): PatternDefinition[] => {
  if (!existsSync(patternsRoot)) return [];
  const files: string[] = [];
  walkPatternFiles(patternsRoot, files);
  return files
    .map((filePath) => parsePattern(filePath))
    .filter((pattern): pattern is PatternDefinition => Boolean(pattern));
};

const regexMatch = (value: string, pattern: string): boolean => {
  try {
    return new RegExp(pattern).test(value);
  } catch {
    return false;
  }
};

const findPatternMatches = (
  event: "PreToolUse" | "PostToolUse",
  toolName: string,
  content: string
): PatternDefinition[] =>
  loadPatterns().filter(
    (pattern) => pattern.event === event && regexMatch(toolName, pattern.tool) && regexMatch(content, pattern.pattern)
  );

const getArgValue = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return;
  return process.argv[index + 1];
};

const getSessionId = (): string => getArgValue("--session-id") ?? `codex-${Date.now()}`;

const hasFlag = (flag: string): boolean => process.argv.includes(flag);

const denyListReason = (command: string): string | undefined => {
  const denyRules: Array<{ readonly name: string; readonly pattern: RegExp; readonly reason: string }> = [
    {
      name: "rm-root",
      pattern: /\brm\s+-rf\s+\/(\s|$)/,
      reason: "Blocked by deny list: rm -rf /",
    },
    {
      name: "rm-root-wildcard",
      pattern: /\brm\s+-rf\s+\/\*(\s|$)/,
      reason: "Blocked by deny list: rm -rf /*",
    },
    {
      name: "force-push-main",
      pattern: /\bgit\s+push\s+--force(?:\s+\S+)?\s+main(\s|$)/,
      reason: "Blocked by deny list: git push --force origin main",
    },
    {
      name: "force-push-master",
      pattern: /\bgit\s+push\s+--force(?:\s+\S+)?\s+master(\s|$)/,
      reason: "Blocked by deny list: git push --force origin master",
    },
  ];
  for (const denyRule of denyRules) {
    if (denyRule.pattern.test(command)) return denyRule.reason;
  }
};

const runSessionStart = async (sessionId: string) => {
  const requiredFiles = ["AGENTS.md", ".codex/context-index.md"];
  const missing = requiredFiles.filter((path) => !existsSync(join(projectDir, path)));
  const state = readState();
  writeState({
    ...state,
    lastSessionStartAt: new Date().toISOString(),
    lastSessionId: sessionId,
    hookRuntime: "codex-lifecycle",
  });
  const status = missing.length === 0 ? "pass" : "warn";
  await appendHookLog({
    ts: new Date().toISOString(),
    event: "SessionStart",
    sessionId,
    status,
    detail: {
      requiredFiles,
      missing,
    },
  });
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext:
          missing.length === 0
            ? "SessionStart checks passed."
            : `Missing required session-start files: ${missing.join(", ")}`,
      },
    })
  );
};

const runUserPromptSubmit = async (sessionId: string, prompt: string) => {
  const hint = /spec|handoff|phase|parity|rubric/i.test(prompt)
    ? "Spec-related prompt detected. Keep outputs and handoffs in sync."
    : "Prompt recorded for hook trace.";
  await appendHookLog({
    ts: new Date().toISOString(),
    event: "UserPromptSubmit",
    sessionId,
    status: "pass",
    detail: { promptChars: prompt.length, hint },
  });
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: hint,
      },
    })
  );
};

const runPreToolUse = async (sessionId: string, toolName: string, content: string, approveAsks: boolean) => {
  const denyReason = denyListReason(content);
  if (denyReason) {
    await appendHookLog({
      ts: new Date().toISOString(),
      event: "PreToolUse",
      sessionId,
      status: "deny",
      detail: { toolName, content, reason: denyReason, source: "deny-list" },
    });
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: denyReason,
        },
      })
    );
    return { allowed: false, exitCode: 2 };
  }

  const matches = findPatternMatches("PreToolUse", toolName, content);
  const permissionMatches = matches.filter((pattern) => pattern.action !== "context");
  if (permissionMatches.length === 0) {
    await appendHookLog({
      ts: new Date().toISOString(),
      event: "PreToolUse",
      sessionId,
      status: "pass",
      detail: { toolName, content, matched: [] },
    });
    return { allowed: true, exitCode: 0 };
  }

  const primary = permissionMatches.sort((left, right) => LEVEL_ORDER[left.level] - LEVEL_ORDER[right.level])[0];
  const decision = primary.action === "deny" ? "deny" : approveAsks ? "allow" : "deny";
  const reason =
    primary.action === "ask" && !approveAsks
      ? `Blocked pending approval (${primary.name}): ${primary.description}`
      : primary.body;

  await appendHookLog({
    ts: new Date().toISOString(),
    event: "PreToolUse",
    sessionId,
    status: decision === "allow" ? "warn" : "deny",
    detail: {
      toolName,
      content,
      matched: permissionMatches.map((pattern) => ({
        name: pattern.name,
        action: pattern.action,
        level: pattern.level,
      })),
      primary: {
        name: primary.name,
        action: primary.action,
        level: primary.level,
      },
      approveAsks,
    },
  });

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    })
  );
  return { allowed: decision === "allow", exitCode: decision === "allow" ? 0 : 3 };
};

const runPostToolUse = async (
  sessionId: string,
  toolName: string,
  content: string,
  exitCode: number,
  commandStdout: string,
  commandStderr: string
) => {
  const contextMatches = findPatternMatches("PostToolUse", toolName, content).filter(
    (pattern) => pattern.action === "context"
  );
  const blocks = contextMatches.map((pattern) => {
    const tag = pattern.tag ?? basename(pattern.filePath, ".md");
    return `<${tag}>\n${pattern.body}\n</${tag}>`;
  });

  await appendHookLog({
    ts: new Date().toISOString(),
    event: "PostToolUse",
    sessionId,
    status: "pass",
    detail: {
      toolName,
      content,
      exitCode,
      contextCount: contextMatches.length,
      commandStdoutChars: commandStdout.length,
      commandStderrChars: commandStderr.length,
    },
  });

  if (blocks.length > 0) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: blocks.join("\n\n"),
        },
      })
    );
  }
};

const runSubagentStop = async (
  sessionId: string,
  agentType: string,
  outcome: "success" | "partial" | "failed",
  durationMs: number
) => {
  await appendHookLog({
    ts: new Date().toISOString(),
    event: "SubagentStop",
    sessionId,
    status: "pass",
    detail: { agentType, outcome, durationMs },
  });
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SubagentStop",
        additionalContext: `Recorded subagent completion for ${agentType} (${outcome}, ${durationMs}ms).`,
      },
    })
  );
};

const runWithHooks = async (sessionId: string, command: string, approveAsks: boolean) => {
  const pre = await runPreToolUse(sessionId, "Bash", command, approveAsks);
  if (!pre.allowed) return pre.exitCode;

  const startMs = Date.now();
  const child = Bun.spawnSync(["bash", "-lc", command], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = new TextDecoder().decode(child.stdout);
  const stderr = new TextDecoder().decode(child.stderr);
  if (stdout.length > 0) process.stdout.write(stdout);
  if (stderr.length > 0) process.stderr.write(stderr);

  const exitCode = child.exitCode ?? 1;
  await runPostToolUse(sessionId, "Bash", command, exitCode, stdout, stderr);
  await appendHookLog({
    ts: new Date().toISOString(),
    event: "SubagentStop",
    sessionId,
    status: exitCode === 0 ? "pass" : "warn",
    detail: {
      agentType: "shell",
      outcome: exitCode === 0 ? "success" : "failed",
      durationMs: Date.now() - startMs,
    },
  });
  return exitCode;
};

const main = async (): Promise<number> => {
  const command = process.argv[2];
  const sessionId = getSessionId();

  if (!command) {
    console.error("Usage: bun run .codex/hooks/lifecycle.ts <command>");
    return 1;
  }

  switch (command) {
    case "session-start": {
      await runSessionStart(sessionId);
      return 0;
    }
    case "user-prompt-submit": {
      const prompt = getArgValue("--prompt") ?? "";
      await runUserPromptSubmit(sessionId, prompt);
      return 0;
    }
    case "pre-tool-use": {
      const toolName = getArgValue("--tool") ?? "Bash";
      const content = getArgValue("--content") ?? "";
      const result = await runPreToolUse(sessionId, toolName, content, hasFlag("--approve-asks"));
      return result.exitCode;
    }
    case "post-tool-use": {
      const toolName = getArgValue("--tool") ?? "Bash";
      const content = getArgValue("--content") ?? "";
      const exitCodeRaw = getArgValue("--exit-code") ?? "0";
      const exitCode = Number.parseInt(exitCodeRaw, 10);
      await runPostToolUse(sessionId, toolName, content, Number.isNaN(exitCode) ? 1 : exitCode, "", "");
      return 0;
    }
    case "subagent-stop": {
      const agentType = getArgValue("--agent-type") ?? "shell";
      const outcomeRaw = getArgValue("--outcome");
      const outcome: "success" | "partial" | "failed" =
        outcomeRaw === "partial" || outcomeRaw === "failed" ? outcomeRaw : "success";
      const durationMsRaw = getArgValue("--duration-ms") ?? "0";
      const durationMs = Number.parseInt(durationMsRaw, 10);
      await runSubagentStop(sessionId, agentType, outcome, Number.isNaN(durationMs) ? 0 : durationMs);
      return 0;
    }
    case "run": {
      const separatorIndex = process.argv.indexOf("--");
      const commandParts = separatorIndex === -1 ? process.argv.slice(3) : process.argv.slice(separatorIndex + 1);
      if (commandParts.length === 0) {
        console.error("No command provided for `run`");
        return 1;
      }
      const exitCode = await runWithHooks(sessionId, commandParts.join(" "), hasFlag("--approve-asks"));
      return exitCode;
    }
    default: {
      console.error(`Unknown command: ${command}`);
      return 1;
    }
  }
};

process.exit(await main());
