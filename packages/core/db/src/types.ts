import type * as Redacted from "effect/Redacted";

export type ConnectionOptions = {
  url: Redacted.Redacted<string>;
  ssl: boolean;
};
