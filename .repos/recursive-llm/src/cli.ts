import { BunRuntime } from "@effect/platform-bun"
import { runCliMain } from "./cli/Main"

runCliMain(process.argv).pipe(BunRuntime.runMain)
