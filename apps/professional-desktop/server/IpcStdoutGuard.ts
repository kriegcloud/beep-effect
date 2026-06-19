const writeConsoleToStderr = (...values: Array<unknown>): void => {
  const line = values.map(String).join(" ");
  process.stderr.write(line.length === 0 ? "\n" : `${line}\n`);
};

// biome-ignore lint/suspicious/noUndeclaredEnvVars: CHAT_TRANSPORT is declared in turbo.json under global.passThroughEnv.
if (Bun.env.CHAT_TRANSPORT === "ipc") {
  console.log = writeConsoleToStderr;
  console.info = writeConsoleToStderr;
  console.debug = writeConsoleToStderr;
  console.warn = writeConsoleToStderr;
}
