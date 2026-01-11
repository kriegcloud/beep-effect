import { Server } from "@beep/runtime-server";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Layer from "effect/Layer";

// Launch the server
Layer.launch(Server.layer).pipe(BunRuntime.runMain);
