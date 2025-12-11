import { httpApp } from "@beep/runtime-server/rpcs/rpc-server";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Layer } from "effect";

httpApp().pipe(Layer.launch, BunRuntime.runMain);
