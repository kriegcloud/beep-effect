import { loadOutboxConfig } from "@beep/m365-mcp";
import { it } from "@beep/test-runner";
import { assert, describe } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";

const credentials = {
  M365_OUTBOX_CERT_PRIVATE_KEY: "fixture-private-key",
  M365_OUTBOX_CERT_THUMBPRINT_SHA256: "AB12",
  M365_OUTBOX_CLIENT_ID: "client-id",
  M365_OUTBOX_MAILBOX: "mailbox@example.test",
  M365_OUTBOX_TENANT_ID: "tenant-id",
};

const load = (env: Readonly<Record<string, string>>) =>
  loadOutboxConfig().pipe(
    Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromEnv({ env: { ...credentials, ...env } }))
  );

const STAGING = "beep/m365-outbox/attachments";
const AUDIT = "beep/m365-outbox/audit";

type Resolved = readonly [name: string, env: Readonly<Record<string, string>>, staging: string, audit: string];
type Rejected = readonly [name: string, env: Readonly<Record<string, string>>, message: string];

/** The env matrix of the default staging root and audit directory. */
const resolved: ReadonlyArray<Resolved> = [
  ["both XDG variables", { HOME: "/h", XDG_DATA_HOME: "/d", XDG_STATE_HOME: "/s" }, `/d/${STAGING}`, `/s/${AUDIT}`],
  ["the HOME defaults", { HOME: "/h" }, `/h/.local/share/${STAGING}`, `/h/.local/state/${AUDIT}`],
  [
    "empty XDG variables",
    { HOME: "/h", XDG_DATA_HOME: "", XDG_STATE_HOME: "" },
    `/h/.local/share/${STAGING}`,
    `/h/.local/state/${AUDIT}`,
  ],
  [
    "whitespace XDG variables",
    { HOME: "/h", XDG_DATA_HOME: "  ", XDG_STATE_HOME: "  " },
    `/h/.local/share/${STAGING}`,
    `/h/.local/state/${AUDIT}`,
  ],
  ["XDG variables without HOME", { XDG_DATA_HOME: "/d", XDG_STATE_HOME: "/s" }, `/d/${STAGING}`, `/s/${AUDIT}`],
];

/** Rows where the resolution before @beep/xdg differs from the XDG spec. */
const divergent: ReadonlyArray<Resolved> = [
  [
    "a relative XDG_STATE_HOME",
    { HOME: "/h", XDG_STATE_HOME: "relative" },
    `/h/.local/share/${STAGING}`,
    `relative/${AUDIT}`,
  ],
  [
    "a space-padded XDG_STATE_HOME",
    { HOME: "/h", XDG_STATE_HOME: " /s " },
    `/h/.local/share/${STAGING}`,
    `/s/${AUDIT}`,
  ],
  ["a HOME with a trailing slash", { HOME: "/h/" }, `/h//.local/share/${STAGING}`, `/h//.local/state/${AUDIT}`],
];

const rejected: ReadonlyArray<Rejected> = [
  ["nothing set", {}, "Neither XDG_DATA_HOME nor HOME is set."],
  ["no state directory", { XDG_DATA_HOME: "/d" }, "Neither XDG_STATE_HOME nor HOME is set."],
];

/** Rejections before @beep/xdg: a relative data root reaches the absolute-roots check. */
const divergentRejected: ReadonlyArray<Rejected> = [
  [
    "a relative XDG_DATA_HOME",
    { HOME: "/h", XDG_DATA_HOME: "relative" },
    "M365_OUTBOX_ATTACHMENT_ROOTS must list absolute directories separated by ':'.",
  ],
  [
    "a relative HOME",
    { HOME: "relative" },
    "M365_OUTBOX_ATTACHMENT_ROOTS must list absolute directories separated by ':'.",
  ],
];

describe("@beep/m365-mcp outbox XDG roots env matrix", () => {
  for (const [name, env, staging, audit] of [...resolved, ...divergent]) {
    it.effect(
      name,
      Effect.fnUntraced(function* () {
        const config = yield* load(env);
        assert.deepStrictEqual(config.attachments.roots, [staging]);
        assert.strictEqual(config.auditDirectory, audit);
      })
    );
  }

  for (const [name, env, message] of [...rejected, ...divergentRejected]) {
    it.effect(
      `rejects ${name}`,
      Effect.fnUntraced(function* () {
        const error = yield* Effect.flip(load(env));
        assert.strictEqual(error.message, message);
      })
    );
  }
});
