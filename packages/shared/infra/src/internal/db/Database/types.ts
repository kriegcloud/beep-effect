import type * as Redacted from "effect/Redacted";
export type ConnectionOptions = {
  readonly connectionString: Redacted.Redacted<string>;
  readonly ssl: boolean;
};