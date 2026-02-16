import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

const normalizeUrl = (url: URL): string => url.toString().replace(/\/$/, "");

export class EnvVars extends Effect.Service<EnvVars>()("EnvVars", {
  accessors: true,
  effect: Effect.gen(function* () {
    return {
      API_URL: yield* Config.url("API_URL").pipe(
        Config.map(normalizeUrl),
        Config.withDefault("http://localhost:3001"),
      ),
      DATABASE_URL: yield* Config.redacted("DATABASE_URL"),
      UPLOADTHING_SECRET: yield* Config.redacted("UPLOADTHING_SECRET"),
    } as const;
  }),
}) {}
