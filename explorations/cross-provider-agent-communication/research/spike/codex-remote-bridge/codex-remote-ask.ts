// One-shot ask against a Codex app-server WebSocket listener (Bun >= 1.2, no dependencies).
//
// Qualified 2026-10-21 against codex-cli 0.160.1 on Windows through an SSH loopback tunnel:
//   ssh -f -N -M -S ~/.ssh/cm-tom-pc-bridge -o ExitOnForwardFailure=yes -L 127.0.0.1:48123:127.0.0.1:48123 <pc-user>@tom-pc-1
//   (close later with: ssh -S ~/.ssh/cm-tom-pc-bridge -O exit <pc-user>@tom-pc-1)
//   CODEX_TOMPC_WS_TOKEN="$(cat ~/.config/beep/tom-pc-codex-ws.token)" \
//   bun run codex-remote-ask.ts --url ws://127.0.0.1:48123 --token-env CODEX_TOMPC_WS_TOKEN \
//     (--thread <uuid> | --new --cwd 'C:\PracticeKG\bridge-probe' [--name "<thread name>"]) \
//     --text "probe: reply with the single word PONG and take no action" \
//     [--sandbox read-only] [--approval never] [--timeout-ms 180000]
//
// Flow: initialize -> thread/start | thread/resume with explicit approvalPolicy + sandbox (fail closed
// when the effective policy differs) -> turn/start -> wait for the turn/completed notification on this
// same connection (the app-server only streams turn events to the connection that started or resumed
// the thread) -> print one JSON line with the last agentMessage text. thread/read is the fallback when
// the notification is missed. Notifications are echoed to stderr. The bearer token is read from the
// named environment variable only; it never appears in argv or output.
const argv = Bun.argv.slice(2);
const opt = (name: string, dflt?: string) => {
  const i = argv.indexOf(name);
  if (i < 0) return dflt;
  const v = argv[i + 1];
  argv.splice(i, 2);
  return v;
};
const flag = (name: string) => {
  const i = argv.indexOf(name);
  if (i < 0) return false;
  argv.splice(i, 1);
  return true;
};
const url = opt("--url", "ws://127.0.0.1:48123")!;
const tokenEnv = opt("--token-env", "CODEX_TOMPC_WS_TOKEN")!;
const threadId = opt("--thread");
const isNew = flag("--new");
const cwd = opt("--cwd");
const name = opt("--name");
const text = opt("--text");
const sandbox = opt("--sandbox", "read-only")!;
const approvalPolicy = opt("--approval", "never")!;
const timeoutMs = Number(opt("--timeout-ms", "180000"));
const token = process.env[tokenEnv];
if (!token) {
  console.error(`env ${tokenEnv} is empty`);
  process.exit(2);
}
if (!text) {
  console.error("--text is required");
  process.exit(2);
}
if (!threadId && !isNew) {
  console.error("pass --thread <uuid> or --new --cwd <path>");
  process.exit(2);
}
const err = (o: unknown) => console.error(`${new Date().toISOString()} ${JSON.stringify(o)}`);
const ws = new WebSocket(url, { headers: { Authorization: `Bearer ${token}` } } as any);
const waiters = new Map<number, (m: any) => void>();
let nextId = 1;
let watchTurnId: string | null = null;
let completedTurn: any = null;
const agentMessages: string[] = [];
const call = (method: string, params?: unknown) =>
  new Promise<any>((resolve, reject) => {
    const id = nextId++;
    waiters.set(id, (m) => (m.error ? reject(new Error(`${method}: ${JSON.stringify(m.error)}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
ws.addEventListener("message", (ev) => {
  let m: any;
  try {
    m = JSON.parse(String(ev.data));
  } catch {
    return;
  }
  if (m.id !== undefined && waiters.has(m.id)) {
    const w = waiters.get(m.id)!;
    waiters.delete(m.id);
    w(m);
    return;
  }
  if (!m.method) return;
  if (!/delta|tokenUsage|startupStatus/.test(m.method)) err({ notification: m.method, params: m.params });
  const p = m.params ?? {};
  if (m.method === "item/completed" && p.turnId === watchTurnId && p.item?.type === "agentMessage")
    agentMessages.push(p.item.text ?? JSON.stringify(p.item.content));
  if (m.method === "turn/completed" && p.turn?.id === watchTurnId) completedTurn = p.turn;
});
ws.addEventListener("error", (e: any) => {
  err({ wsError: String(e?.message ?? e) });
  process.exit(5);
});
await new Promise<void>((res, rej) => {
  ws.addEventListener("open", () => res());
  ws.addEventListener("close", (e: any) => rej(new Error(`closed before open: ${e.code}`)));
}).catch((e) => {
  err({ error: String(e) });
  process.exit(6);
});
const deadline = Date.now() + timeoutMs;
const statusWord = (s: any) => (typeof s === "string" ? s : (s?.type ?? JSON.stringify(s)));
const expectSandbox: Record<string, string> = {
  "read-only": "readOnly",
  "workspace-write": "workspaceWrite",
  "danger-full-access": "dangerFullAccess",
};
try {
  const init = await call("initialize", {
    clientInfo: { name: "beep_bridge_ask", title: "beep bridge ask", version: "0.0.2" },
  });
  ws.send(JSON.stringify({ method: "initialized" }));
  err({ initialized: { userAgent: init.userAgent, platformOs: init.platformOs } });
  const policy = { approvalPolicy, sandbox };
  const opened = threadId
    ? await call("thread/resume", { threadId, excludeTurns: true, ...policy })
    : await call("thread/start", { cwd, ...policy });
  const tid: string = opened.thread.id;
  const effSandbox = statusWord(opened.sandbox);
  const effApproval = statusWord(opened.approvalPolicy);
  if (effApproval !== approvalPolicy || effSandbox !== expectSandbox[sandbox]) {
    err({ policyMismatch: { requested: policy, effective: { approvalPolicy: effApproval, sandbox: effSandbox } } });
    process.exit(7); // fail closed: never run a turn under a wider policy than requested
  }
  if (name) await call("thread/name/set", { threadId: tid, name });
  const started = await call("turn/start", { threadId: tid, input: [{ type: "text", text }] });
  const turnId: string = started.turn.id;
  watchTurnId = turnId;
  err({
    turnStarted: { threadId: tid, turnId, model: opened.model, approvalPolicy: effApproval, sandbox: effSandbox },
  });
  let last: any = null;
  while (Date.now() < deadline) {
    if (completedTurn) {
      last = completedTurn;
      break;
    }
    await Bun.sleep(1000);
  }
  if (!last) {
    // notification missed: fall back to reading the thread
    const read = await call("thread/read", { threadId: tid, includeTurns: true });
    const turn = (read.thread.turns ?? []).find((t: any) => t.id === turnId);
    if (turn && statusWord(turn.status) !== "inProgress") {
      last = turn;
      for (const it of turn.items ?? [])
        if (it.type === "agentMessage") agentMessages.push(it.text ?? JSON.stringify(it.content));
    }
  }
  if (!last) {
    err({ timeout: timeoutMs, threadId: tid, turnId });
    process.exit(3);
  }
  const replies =
    agentMessages.length > 0
      ? agentMessages
      : (last.items ?? [])
          .filter((it: any) => it.type === "agentMessage")
          .map((it: any) => it.text ?? JSON.stringify(it.content));
  console.log(
    JSON.stringify({
      threadId: tid,
      turnId,
      status: statusWord(last.status),
      durationMs: last.durationMs ?? null,
      reply: replies.at(-1) ?? null,
      agentMessages: replies.length,
    })
  );
  ws.close();
  process.exit(statusWord(last.status) === "completed" ? 0 : 8);
} catch (e) {
  err({ error: String(e) });
  ws.close();
  process.exit(4);
}
