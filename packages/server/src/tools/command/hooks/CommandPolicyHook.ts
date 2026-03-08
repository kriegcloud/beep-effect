import type { CommandInvocationSource } from "../CommandTypes.js"
import { Effect } from "effect"
import { CommandHookError } from "../CommandErrors.js"
import type { CommandHook } from "../CommandHooks.js"

export interface CommandPolicyViolation {
  readonly ruleId: string
  readonly reason: string
}

export interface CommandPatternRule {
  readonly id: string
  readonly pattern: RegExp
  readonly reason: string
}

export interface CommandPolicyConfig {
  readonly hookId?: string
  readonly enforcedSources?: ReadonlyArray<CommandInvocationSource>
  readonly deniedExecutables?: ReadonlyArray<string>
  readonly deniedPatterns?: ReadonlyArray<CommandPatternRule>
}

const defaultEnforcedSources: ReadonlyArray<CommandInvocationSource> = [
  "tool",
  "checkpoint_replay",
  "schedule",
  "integration"
]

const defaultDeniedExecutables: ReadonlyArray<string> = [
  "sudo",
  "su",
  "doas",
  "pkexec",
  "shutdown",
  "reboot",
  "halt",
  "poweroff",
  "launchctl",
  "systemctl",
  "service",
  "init",
  "telinit",
  "mkfs",
  "fdisk",
  "sfdisk",
  "diskutil",
  "parted"
]

const defaultDeniedPatterns: ReadonlyArray<CommandPatternRule> = [
  {
    id: "fork-bomb",
    pattern: /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
    reason: "fork bomb pattern is not allowed"
  },
  {
    id: "rm-root",
    pattern: /(^|[;&|]\s*)rm\s+[^;\n]*-rf?\s+(--no-preserve-root\s+)?\/(\s|$)/i,
    reason: "destructive root deletion pattern is not allowed"
  },
  {
    id: "raw-disk-dd",
    pattern: /\bdd\b[^;\n]*\bof=\/dev\/(r?disk|sd[a-z]|nvme[0-9]+n[0-9]+)/i,
    reason: "raw block-device writes are not allowed"
  },
  {
    id: "curl-pipe-shell",
    pattern: /\bcurl\b[^;\n]*\|\s*(sh|bash|zsh)\b/i,
    reason: "piping remote scripts into a shell is not allowed"
  },
  {
    id: "wget-pipe-shell",
    pattern: /\bwget\b[^;\n]*\|\s*(sh|bash|zsh)\b/i,
    reason: "piping remote scripts into a shell is not allowed"
  },
  {
    id: "base64-pipe-shell",
    pattern: /\bbase64\b[^;\n]*(-d|--decode)\b[^;\n]*\|\s*(sh|bash|zsh|dash|ksh|fish)\b/i,
    reason: "decoded payload piped to shell is not allowed"
  },
  {
    id: "xxd-pipe-shell",
    pattern: /\bxxd\b[^;\n]*\s-r\b[^;\n]*\|\s*(sh|bash|zsh|dash|ksh|fish)\b/i,
    reason: "decoded payload piped to shell is not allowed"
  },
  {
    id: "printf-hex-pipe-shell",
    pattern: /\bprintf\b[^;\n]*\\x[0-9a-fA-F]{2}[^;\n]*\|\s*(sh|bash|zsh|dash|ksh|fish)\b/i,
    reason: "hex-escaped payload piped to shell is not allowed"
  },
  {
    id: "eval-decode",
    pattern: /\beval\b[^;\n]*(base64|xxd|decode|printf)\b/i,
    reason: "eval with decoded payload is not allowed"
  },
  {
    id: "encoded-interpreter-exec",
    pattern: /(?:python[23]?|perl|ruby)\s+-[ec]\s+[^;\n]*(base64|b64decode|decode|exec|system|eval)/i,
    reason: "encoded interpreter execution is not allowed"
  },
  {
    id: "shell-process-substitution-remote",
    pattern: /(?:sh|bash|zsh|dash|ksh|fish)\s+<\(\s*(?:curl|wget)\b/i,
    reason: "shell process-substitution from remote content is not allowed"
  },
  {
    id: "source-process-substitution-remote",
    pattern: /(?:^|[;&\s])(?:source|\.)\s+<\(\s*(?:curl|wget)\b/i,
    reason: "sourcing remote process-substitution content is not allowed"
  }
]

interface TokenizeResult {
  readonly token: string
  readonly nextIndex: number
}

const isWhitespace = (char: string): boolean => /\s/.test(char)

const stripWrappingQuotes = (value: string): string => {
  if (value.length >= 2 && value[0] === "'" && value[value.length - 1] === "'") {
    return value.slice(1, -1)
  }
  if (value.length >= 2 && value[0] === "\"" && value[value.length - 1] === "\"") {
    return value.slice(1, -1)
  }
  return value
}

const tokenizeWord = (input: string, startIndex: number): TokenizeResult => {
  let index = startIndex
  let token = ""
  let quote: "'" | "\"" | null = null
  let escaping = false

  while (index < input.length) {
    const char = input[index]!

    if (escaping) {
      token += char
      escaping = false
      index += 1
      continue
    }

    if (char === "\\" && quote !== "'") {
      token += char
      escaping = true
      index += 1
      continue
    }

    if (quote !== null) {
      token += char
      if (char === quote) {
        quote = null
      }
      index += 1
      continue
    }

    if (char === "'" || char === "\"") {
      quote = char
      token += char
      index += 1
      continue
    }

    if (isWhitespace(char)) {
      break
    }

    token += char
    index += 1
  }

  return {
    token,
    nextIndex: index
  }
}

const tokenizeShellWords = (input: string, maxWords = 12): ReadonlyArray<string> => {
  const words: Array<string> = []
  let index = 0

  while (index < input.length && words.length < maxWords) {
    while (index < input.length && isWhitespace(input[index]!)) {
      index += 1
    }
    if (index >= input.length) {
      break
    }

    const result = tokenizeWord(input, index)
    if (result.token.length > 0) {
      words.push(stripWrappingQuotes(result.token))
    }

    index = result.nextIndex
  }

  return words
}

const splitCommandSegments = (command: string): ReadonlyArray<string> => {
  const segments: Array<string> = []
  let current = ""
  let quote: "'" | "\"" | null = null
  let escaping = false

  const pushCurrent = () => {
    const trimmed = current.trim()
    if (trimmed.length > 0) {
      segments.push(trimmed)
    }
    current = ""
  }

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index]!

    if (escaping) {
      current += char
      escaping = false
      continue
    }

    if (char === "\\" && quote !== "'") {
      current += char
      escaping = true
      continue
    }

    if (quote !== null) {
      current += char
      if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === "'" || char === "\"") {
      current += char
      quote = char
      continue
    }

    const next = index + 1 < command.length ? command[index + 1] : null
    const isBreak = char === ";"
      || char === "\n"
      || (char === "|" && next === "|")
      || (char === "&" && next === "&")
      || char === "|"

    if (!isBreak) {
      current += char
      continue
    }

    pushCurrent()
    if ((char === "|" || char === "&") && next === char) {
      index += 1
    }
  }

  pushCurrent()
  return segments
}

const isEnvAssignmentToken = (token: string): boolean =>
  /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token)

const basenameToken = (token: string): string => {
  const normalized = token.replace(/\\/g, "/")
  const index = normalized.lastIndexOf("/")
  return index === -1 ? normalized : normalized.slice(index + 1)
}

const extractExecutable = (segment: string): string | null => {
  const words = tokenizeShellWords(segment)
  if (words.length === 0) {
    return null
  }

  let index = 0
  while (index < words.length && isEnvAssignmentToken(words[index]!)) {
    index += 1
  }

  if (index >= words.length) {
    return null
  }

  if (words[index] === "env") {
    index += 1
    while (index < words.length) {
      const token = words[index]!
      if (!token.startsWith("-") && !isEnvAssignmentToken(token)) {
        break
      }
      index += 1
    }
  }

  if (index >= words.length) {
    return null
  }

  const token = words[index]!
  const normalized = basenameToken(stripWrappingQuotes(token)).toLowerCase()
  return normalized.length > 0 ? normalized : null
}

export const evaluateCommandPolicy = (
  input: string | {
    readonly mode: "Shell"
    readonly command: string
  } | {
    readonly mode: "Argv"
    readonly executable: string
    readonly args: ReadonlyArray<string>
  },
  config: CommandPolicyConfig = {}
): CommandPolicyViolation | null => {
  const modeInput = typeof input === "string"
    ? {
        mode: "Shell" as const,
        command: input
      }
    : input

  const deniedExecutables = new Set(
    (config.deniedExecutables ?? defaultDeniedExecutables).map((value) => value.toLowerCase())
  )
  const deniedPatterns = config.deniedPatterns ?? defaultDeniedPatterns

  if (modeInput.mode === "Shell") {
    const command = modeInput.command
    if (command.includes("\u0000")) {
      return {
        ruleId: "invalid-null-byte",
        reason: "command contains an invalid null byte"
      }
    }

    const segments = splitCommandSegments(command)

    for (const segment of segments) {
      const executable = extractExecutable(segment)
      if (executable !== null && deniedExecutables.has(executable)) {
        return {
          ruleId: `blocked-executable:${executable}`,
          reason: `command '${executable}' is blocked by command policy`
        }
      }
    }

    for (const rule of deniedPatterns) {
      if (rule.pattern.test(command)) {
        return {
          ruleId: rule.id,
          reason: rule.reason
        }
      }
    }

    return null
  }

  const executableToken = modeInput.executable.trim()
  if (executableToken.length === 0) {
    return {
      ruleId: "invalid-executable",
      reason: "executable must be a non-empty string"
    }
  }

  if (executableToken.includes("\u0000")) {
    return {
      ruleId: "invalid-null-byte",
      reason: "executable contains an invalid null byte"
    }
  }

  for (let index = 0; index < modeInput.args.length; index += 1) {
    const arg = modeInput.args[index]!
    if (arg.includes("\u0000")) {
      return {
        ruleId: "invalid-null-byte",
        reason: `argument at index ${index} contains an invalid null byte`
      }
    }
  }

  const executable = basenameToken(stripWrappingQuotes(executableToken)).toLowerCase()
  if (executable.length > 0 && deniedExecutables.has(executable)) {
    return {
      ruleId: `blocked-executable:${executable}`,
      reason: `command '${executable}' is blocked by command policy`
    }
  }

  const commandText = [modeInput.executable, ...modeInput.args].join(" ")
  for (const rule of deniedPatterns) {
    if (rule.pattern.test(commandText)) {
      return {
        ruleId: rule.id,
        reason: rule.reason
      }
    }
  }

  return null
}

export const makeCommandPolicyHook = (
  config: CommandPolicyConfig = {}
): CommandHook => {
  const enforcedSources = new Set(config.enforcedSources ?? defaultEnforcedSources)
  const hookId = config.hookId ?? "command-policy"

  return {
    id: hookId,
    beforeExecute: ({ context, plan }) =>
      !enforcedSources.has(context.source)
        ? Effect.void
        : Effect.gen(function*() {
            const violation = plan.mode === "Shell"
              ? evaluateCommandPolicy(
                  {
                    mode: "Shell",
                    command: plan.command
                  },
                  config
                )
              : evaluateCommandPolicy(
                  {
                    mode: "Argv",
                    executable: plan.executable,
                    args: plan.args
                  },
                  config
                )
            if (violation === null) {
              return
            }

            return yield* new CommandHookError({
              reason: `${violation.reason} (rule=${violation.ruleId})`
            })
          })
  }
}

export const CommandPolicyHook: CommandHook = makeCommandPolicyHook()
