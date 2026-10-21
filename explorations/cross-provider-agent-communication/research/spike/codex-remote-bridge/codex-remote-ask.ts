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
// the notification is missed. Every RPC is bounded by the remaining `--timeout-ms` budget and fails
// when the socket closes. If the turn this client started is still running when the budget runs out,
// or when any later step fails, the client sends turn/interrupt before exiting, so a timed-out ask never
// leaves a turn running under `approvalPolicy: never` on the remote machine. Notifications are echoed to
// stderr. The bearer token is read from the named environment variable only; it never appears in argv or
// output.
//
// Exit codes: 0 completed; 3 timeout (turn interrupted); 4 RPC or protocol error; 5 socket error;
// 6 socket closed; 7 effective policy differs from the requested one; 8 turn ended without completing.
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
const interruptGraceMs = 5000;
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
const deadline = Date.now() + timeoutMs;
const remaining = () => Math.max(0, deadline - Date.now());
const ws = new WebSocket(url, { headers: { Authorization: `Bearer ${token}` } } as any);
type Waiter = {
  method: string;
  resolve: (m: any) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};
const waiters = new Map<number, Waiter>();
let nextId = 1;
let socketOpen = false;
let startedTurn: { threadId: string; turnId: string } | null = null;
let completedTurn: any = null;
const agentMessages: string[] = [];
// Bounded JSON-RPC call: rejects when the budget runs out or the socket closes.
const call = (method: string, params?: unknown, budgetMs = remaining()) =>
  new Promise<any>((resolve, reject) => {
    if (!socketOpen) {
      reject(new Error(`${method}: socket is closed`));
      return;
    }
    const id = nextId++;
    const timer = setTimeout(() => {
      waiters.delete(id);
      reject(new Error(`${method}: no response within ${budgetMs} ms`));
    }, budgetMs);
    waiters.set(id, { method, resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
const settle = (id: number, m: any) => {
  const w = waiters.get(id);
  if (!w) return;
  waiters.delete(id);
  clearTimeout(w.timer);
  if (m.error) w.reject(new Error(`${w.method}: ${JSON.stringify(m.error)}`));
  else w.resolve(m.result);
};
ws.addEventListener("message", (ev) => {
  let m: any;
  try {
    m = JSON.parse(String(ev.data));
  } catch {
    return;
  }
  if (m.id !== undefined && waiters.has(m.id)) {
    settle(m.id, m);
    return;
  }
  if (!m.method) return;
  if (!/delta|tokenUsage|startupStatus/.test(m.method)) err({ notification: m.method, params: m.params });
  const p = m.params ?? {};
  if (m.method === "item/completed" && p.turnId === startedTurn?.turnId && p.item?.type === "agentMessage")
    agentMessages.push(p.item.text ?? JSON.stringify(p.item.content));
  if (m.method === "turn/completed" && p.turn?.id === startedTurn?.turnId) completedTurn = p.turn;
});
ws.addEventListener("error", (e: any) => {
  err({ wsError: String(e?.message ?? e) });
  process.exit(5);
});
ws.addEventListener("close", (e: any) => {
  socketOpen = false;
  for (const [id, w] of waiters) {
    waiters.delete(id);
    clearTimeout(w.timer);
    w.reject(new Error(`${w.method}: socket closed (${e.code})`));
  }
});
await new Promise<void>((res, rej) => {
  const t = setTimeout(() => rej(new Error("open: no connection within budget")), remaining());
  ws.addEventListener("open", () => {
    clearTimeout(t);
    socketOpen = true;
    res();
  });
  ws.addEventListener("close", (e: any) => {
    clearTimeout(t);
    rej(new Error(`closed before open: ${e.code}`));
  });
}).catch((e) => {
  err({ error: String(e) });
  process.exit(6);
});
const statusWord = (s: any) => (typeof s === "string" ? s : (s?.type ?? JSON.stringify(s)));
const expectSandbox: Record<string, string> = {
  "read-only": "readOnly",
  "workspace-write": "workspaceWrite",
  "danger-full-access": "dangerFullAccess",
};
// Never leave the turn this client started running on the remote machine.
const interruptStartedTurn = async (reason: string) => {
  if (!startedTurn || completedTurn || !socketOpen) return;
  try {
    await call("turn/interrupt", { threadId: startedTurn.threadId, turnId: startedTurn.turnId }, interruptGraceMs);
    err({ interrupted: { ...startedTurn, reason } });
  } catch (e) {
    err({ interruptFailed: { ...startedTurn, reason, error: String(e) } });
  }
};
const exitWith = async (code: number, reason: string) => {
  await interruptStartedTurn(reason);
  try {
    ws.close();
  } catch {}
  process.exit(code);
};
try {
  const init = await call("initialize", {
    clientInfo: { name: "beep_bridge_ask", title: "beep bridge ask", version: "0.0.3" },
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
    await exitWith(7, "policy mismatch"); // fail closed: never run a turn under a wider policy than requested
  }
  if (name) await call("thread/name/set", { threadId: tid, name });
  const started = await call("turn/start", { threadId: tid, input: [{ type: "text", text }] });
  startedTurn = { threadId: tid, turnId: started.turn.id };
  err({ turnStarted: { ...startedTurn, model: opened.model, approvalPolicy: effApproval, sandbox: effSandbox } });
  let last: any = null;
  while (remaining() > 0 && socketOpen) {
    if (completedTurn) {
      last = completedTurn;
      break;
    }
    await Bun.sleep(Math.min(1000, remaining()));
  }
  if (!last && socketOpen && remaining() > 0) {
    // notification missed: fall back to reading the thread
    const read = await call("thread/read", { threadId: tid, includeTurns: true });
    const turn = (read.thread.turns ?? []).find((t: any) => t.id === startedTurn!.turnId);
    if (turn && statusWord(turn.status) !== "inProgress") {
      last = turn;
      for (const it of turn.items ?? [])
        if (it.type === "agentMessage") agentMessages.push(it.text ?? JSON.stringify(it.content));
    }
  }
  if (!last) {
    if (!socketOpen) throw new Error("socket closed while the turn was running");
    err({ timeout: timeoutMs, ...startedTurn });
    await exitWith(3, "client timeout");
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
      turnId: startedTurn!.turnId,
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
  await exitWith(socketOpen ? 4 : 6, "error");
}
