import { Console, Effect, FileSystem, Option, Stream } from "effect"
import { Command, Flag } from "effect/unstable/cli"
import * as readline from "node:readline"
import { ChatClient } from "./RuntimeClient.js"

// ---------------------------------------------------------------------------
// Flags
// ---------------------------------------------------------------------------

const channelFlag = Flag.optional(
  Flag.string("channel").pipe(
    Flag.withDescription("Resume an existing channel by ID")
  )
)

// ---------------------------------------------------------------------------
// chat command
// ---------------------------------------------------------------------------

const chat = Command.make("chat", { channel: channelFlag }).pipe(
  Command.withDescription("Interactive chat with the agent"),
  Command.withHandler(({ channel }) =>
    ChatClient.use((client) =>
      Effect.gen(function*() {
        const channelId = Option.isSome(channel)
          ? channel.value
          : `channel:${crypto.randomUUID()}`

        yield* Effect.logInfo(`Channel: ${channelId}`)
        yield* client.initialize(channelId, "agent:bootstrap")
        yield* Effect.logInfo("Ready. Type your message (Ctrl+C to exit).\n")

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })

        const prompt = () =>
          Effect.callback<string>((resume) => {
            rl.question("> ", (answer) => {
              resume(Effect.succeed(answer))
            })
          })

        let running = true
        rl.on("close", () => {
          running = false
        })

        while (running) {
          const input = yield* prompt()
          if (!input.trim()) continue

          const eventStream = yield* client.sendMessage(channelId, input)
          yield* eventStream.pipe(
            Stream.tap((event) => {
              switch (event.type) {
                case "turn.started":
                  return Console.log("")
                case "assistant.delta":
                  return Effect.sync(() => process.stdout.write(event.delta))
                case "tool.call":
                  return Console.log(`\n[tool: ${event.toolName}]`)
                case "tool.result":
                  return Console.log(`[result: ${event.outputJson}]`)
                case "tool.error":
                  return Console.log(`[tool error: ${event.outputJson}]`)
                case "turn.checkpoint_required":
                  return Console.log(`\n[checkpoint required: ${event.checkpointId} — ${event.action}: ${event.reason}]\n`)
                case "turn.completed":
                  return Console.log("\n")
                case "turn.failed":
                  return Console.log(`\n[error: ${event.errorCode}: ${event.message}]\n`)
                default:
                  return Effect.void
              }
            }),
            Stream.runDrain
          )
        }

        rl.close()
      })
    )
  )
)

// ---------------------------------------------------------------------------
// status command
// ---------------------------------------------------------------------------

const status = Command.make("status").pipe(
  Command.withDescription("Check server health"),
  Command.withHandler(() => ChatClient.use((client) => client.health))
)

// ---------------------------------------------------------------------------
// init command
// ---------------------------------------------------------------------------

const init = Command.make("init").pipe(
  Command.withDescription("Generate a starter agent.yaml config file"),
  Command.withHandler(() =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const path = "agent.yaml"
      const alreadyExists = yield* fs.exists(path)
      if (alreadyExists) {
        yield* Console.log(`${path} already exists. Delete it first or edit it directly.`)
        return
      }
      const template = yield* fs.readFileString("agent.yaml.example")
      yield* fs.writeFileString(path, template)
      yield* Console.log(
        `Created ${path}. Edit prompts.entries and agents.default.promptBindings to customize prompting.`
      )
    })
  )
)

// ---------------------------------------------------------------------------
// root command
// ---------------------------------------------------------------------------

const command = Command.make("agent").pipe(
  Command.withSubcommands([chat, status, init])
)

export const cli = Command.run(command, {
  version: "0.0.0"
})
