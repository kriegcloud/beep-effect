---
title: AgentEffectiveness.command.ts
nav_order: 3
parent: "@beep/repo-cli"
---

## AgentEffectiveness.command.ts overview

Agent-effectiveness command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - [agentEffectivenessCommand](#agenteffectivenesscommand)
---

# commands

## agentEffectivenessCommand

Agent-effectiveness root command.

**Example**

```ts
import { agentEffectivenessCommand } from "@beep/repo-cli/commands/AgentEffectiveness/index"
console.log(agentEffectivenessCommand)
```

**Signature**

```ts
declare const agentEffectivenessCommand: Command.Command<"agent-effectiveness", {} | {}, {}, AgentEffectivenessError | CliReportedExit, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/AgentEffectiveness/AgentEffectiveness.command.ts#L657)

Since v0.0.0