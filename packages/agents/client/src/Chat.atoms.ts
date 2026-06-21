/**
 * Desktop chat surface atoms.
 *
 * Ports the chat client state graph onto the {@link ChatRpcs} wire contract:
 * a thread list, per-thread timeline reads, thread creation, persisted composer
 * drafts, and a streaming assistant turn driver. The atoms are browser-targeted
 * (they read `window.location` and `globalThis.localStorage`) and require a live
 * rpc server to resolve — type-check and lint are the gates here.
 *
 * @packageDocumentation
 * @category atoms
 * @since 0.0.0
 */
import { AssistantBlock } from "@beep/agents-domain/values/AssistantContent";
import { ChatActionError, ChatRpcs } from "@beep/agents-use-cases/public";
import { Document } from "@beep/md/Md.model";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { A, O, P, Str } from "@beep/utils";
import { Clock, Duration, Effect, Layer, Metric, Stream } from "effect";
import * as S from "effect/Schema";
import { FetchHttpClient } from "effect/unstable/http";
import { KeyValueStore } from "effect/unstable/persistence";
import { Atom, AtomRegistry, AtomRpc, Reactivity } from "effect/unstable/reactivity";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { ClientObservabilityLive } from "./ClientObservability.js";

type WorkspaceId = WorkspaceIdentity.WorkspaceId;
type ThreadId = WorkspaceIdentity.ThreadId;
type TurnId = WorkspaceIdentity.TurnId;

// Dev (browser or `tauri dev`): the page is served from a real http(s) origin
// (the dev server), so the rpc URL rides that origin relative to `/rpc` — which
// keeps the app reachable from any device that can reach the dev server.
// Packaged Tauri serves from a `tauri://`-style origin, so there is no http
// server to ride: talk to the sidecar directly. We avoid `import.meta.env`
// (vite-only, untyped under NodeNext) and key off the live origin instead.
const SERVER_URL = ((): string => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (Str.startsWith(origin, "http://") || Str.startsWith(origin, "https://")) {
      return new URL("/rpc", origin).toString();
    }
  }
  return "http://127.0.0.1:3939/rpc";
})();

// Ambient telemetry (logger/tracer/metrics are fiber-runtime concerns, not
// typed services) rides every atom runtime via the global layer; this is what
// threads the client span context onto outgoing rpc envelopes so webview spans
// join the sidecar's `RpcServer.*` spans into one trace. Env-gated: collapses to
// Layer.empty without an OTLP endpoint, so tests/dev without a collector are
// unaffected (see ClientObservability.ts).
Atom.runtime.addGlobalLayer(ClientObservabilityLive);

/**
 * The default HTTP protocol used by browser and non-IPC desktop sessions.
 *
 * The URL is resolved at module load from the active browser origin: dev-server
 * sessions use a relative `/rpc`, while packaged non-IPC desktop sessions fall
 * back to the local sidecar server.
 *
 * @example
 * ```ts
 * import { HttpChatProtocolLive } from "@beep/agents-client"
 *
 * console.log(HttpChatProtocolLive)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const HttpChatProtocolLive: Layer.Layer<RpcClient.Protocol> = RpcClient.layerProtocolHttp({
  url: SERVER_URL,
}).pipe(Layer.provide([RpcSerialization.layerNdjson, FetchHttpClient.layer]));

/**
 * Writable transport selector consumed by {@link ChatClient}.
 *
 * Apps that own a non-HTTP transport set this atom before mounting chat atoms;
 * otherwise the client keeps the default HTTP protocol. Professional Desktop
 * uses this to swap in its Tauri IPC protocol only after the shell confirms the
 * sidecar was spawned in IPC mode.
 *
 * @example
 * ```ts
 * import { chatProtocolLayerAtom, HttpChatProtocolLive } from "@beep/agents-client"
 *
 * console.log(chatProtocolLayerAtom, HttpChatProtocolLive)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const chatProtocolLayerAtom: Atom.Writable<Layer.Layer<RpcClient.Protocol>> = Atom.make(HttpChatProtocolLive);

/**
 * Flattened rpc client for {@link ChatRpcs}, integrated with atom reactivity.
 * Exposes `query`/`runtime`/the flat client used by the atoms below.
 *
 * @example
 * ```ts
 * import { ChatClient } from "@beep/agents-client"
 *
 * console.log(ChatClient)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class ChatClient extends AtomRpc.Service<ChatClient>()("ChatClient", {
  group: ChatRpcs,
  protocol: (get) => get(chatProtocolLayerAtom),
}) {}

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

// Thread lists key on both a per-workspace key (invalidated when that
// workspace's threads change) and a shared `threads` key (invalidated by a turn,
// which only knows its threadId — not its workspaceId — yet still bumps the
// thread's `lastActivityAt`/title and so must refresh every visible list).
const THREADS_KEY = "threads" as const;
const workspaceThreadsKey = (workspaceId: WorkspaceId) => `threads:${workspaceId}`;

/**
 * The thread list for a workspace, refetched whenever a thread or turn mutates.
 *
 * @example
 * ```ts
 * import { threadsAtoms } from "@beep/agents-client"
 *
 * console.log(threadsAtoms)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const threadsAtoms = Atom.family((workspaceId: WorkspaceId) =>
  ChatClient.query(
    "ListThreads",
    { workspaceId },
    {
      reactivityKeys: [THREADS_KEY, workspaceThreadsKey(workspaceId)],
    }
  )
);

/**
 * The user's explicit thread selection — none means "follow the list".
 *
 * @example
 * ```ts
 * import { selectedThreadAtom } from "@beep/agents-client"
 *
 * console.log(selectedThreadAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const selectedThreadAtom = Atom.make<O.Option<ThreadId>>(O.none());

const timelineKey = (threadId: ThreadId) => `timeline:${threadId}`;

/**
 * The persisted timeline read-model per thread, refetched whenever a turn
 * completes.
 *
 * @example
 * ```ts
 * import { threadTimelineAtoms } from "@beep/agents-client"
 *
 * console.log(threadTimelineAtoms)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const threadTimelineAtoms = Atom.family((threadId: ThreadId) =>
  ChatClient.query("GetTimeline", { threadId }, { reactivityKeys: [timelineKey(threadId)] })
);

/**
 * Creates a thread in a workspace and focuses it.
 *
 * @example
 * ```ts
 * import { createThreadAtom } from "@beep/agents-client"
 *
 * console.log(createThreadAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const createThreadAtom = ChatClient.runtime.fn<{ readonly workspaceId: WorkspaceId; readonly title: string }>()(
  Effect.fn("createThread")(function* (input, ctx) {
    const client = yield* ChatClient;
    const thread = yield* Reactivity.mutation(client("CreateThread", input), [
      THREADS_KEY,
      workspaceThreadsKey(input.workspaceId),
    ]);
    ctx.set(selectedThreadAtom, O.some(thread.id));
  })
);

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------

// drafts persist in localStorage so unsent composer content survives restarts
const draftsRuntime = Atom.runtime(KeyValueStore.layerStorage(() => globalThis.localStorage));

/**
 * Unsent composer content per thread, persisted in localStorage.
 *
 * @example
 * ```ts
 * import { draftAtoms } from "@beep/agents-client"
 *
 * console.log(draftAtoms)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const draftAtoms = Atom.family((threadId: ThreadId) =>
  Atom.kvs({
    runtime: draftsRuntime,
    key: `draft:${threadId}`,
    schema: S.OptionFromNullOr(Document),
    defaultValue: O.none,
  })
);

// ---------------------------------------------------------------------------
// Streaming turn
// ---------------------------------------------------------------------------

/**
 * A streaming assistant turn: optimistic user content plus the assistant blocks
 * appended as each finishes streaming.
 *
 * @example
 * ```ts
 * import { StreamingTurn } from "@beep/agents-client"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 *
 * console.log(StreamingTurn.fields)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StreamingTurn extends S.Class<StreamingTurn>("StreamingTurn")(
  {
    /** The thread this turn streams into. */
    threadId: WorkspaceIdentity.ThreadId,
    /** Optimistic rendering of the just-sent user message. */
    userContent: Document,
    /** For edits: hide this turn and everything after it while streaming. */
    truncateFrom: S.Option(WorkspaceIdentity.TurnId),
    /** Assistant blocks appended as they stream in. */
    blocks: S.Array(AssistantBlock),
  },
  {
    description: "A streaming assistant turn rendered optimistically while blocks arrive.",
  }
) {}

/**
 * Blocks of the in-flight assistant turn, appended as they stream in.
 *
 * @example
 * ```ts
 * import { streamingTurnAtom } from "@beep/agents-client"
 *
 * console.log(streamingTurnAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const streamingTurnAtom = Atom.make<O.Option<StreamingTurn>>(O.none());

/**
 * The latest failed assistant turn, surfaced for app/UI-layer toast handling.
 *
 * @example
 * ```ts
 * import { turnErrorAtom } from "@beep/agents-client"
 *
 * console.log(turnErrorAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const turnErrorAtom = Atom.make<O.Option<ChatActionError>>(O.none());

const fallbackTurnErrorMessage = "Assistant turn failed" as const;

const messageFromUnknownError = (error: unknown): string => {
  const message = P.hasProperty(error, "message") && P.isString(error.message) ? Str.trim(error.message) : "";
  return Str.isNonEmpty(message) ? message : fallbackTurnErrorMessage;
};

const toTurnError = (error: unknown): ChatActionError =>
  S.is(ChatActionError)(error) ? error : ChatActionError.new(messageFromUnknownError(error));

/**
 * When set, the composer is editing an existing turn's message.
 *
 * @example
 * ```ts
 * import { EditTarget } from "@beep/agents-client"
 *
 * console.log(EditTarget.fields)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EditTarget extends S.Class<EditTarget>("EditTarget")(
  {
    turnId: WorkspaceIdentity.TurnId,
    content: Document,
  },
  {
    description: "When set, the composer is editing an existing turn's message.",
  }
) {}

/**
 * The turn currently being edited, if any.
 *
 * @example
 * ```ts
 * import { editTargetAtom } from "@beep/agents-client"
 *
 * console.log(editTargetAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const editTargetAtom = Atom.make<O.Option<EditTarget>>(O.none());

// client-perceived quality metrics — exported through the same OTLP layer
const perceivedLatency = Metric.timer("ui_turn_perceived_latency", {
  description: "Send action to first streamed block, as the user experiences it",
  boundaries: [100, 250, 500, 1000, 2000, 4000, 8000, 16000, 30000, 60000],
});
const decodeFailures = Metric.counter("ui_editor_decode_failures_total", {
  description: "Composer editor states that failed schema decode",
  incremental: true,
});

/**
 * Composer content failing schema decode is a bug — count and log it.
 *
 * @example
 * ```ts
 * import { reportDecodeFailureAtom } from "@beep/agents-client"
 *
 * console.log(reportDecodeFailureAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const reportDecodeFailureAtom = ChatClient.runtime.fn<void>()(
  Effect.fn("reportDecodeFailure")(function* () {
    yield* Metric.update(decodeFailures, 1);
    yield* Effect.logError("composer editor state failed schema decode");
  })
);

/**
 * A request to send a brand-new user message to a thread.
 *
 * @example
 * ```ts
 * import { SendTurnRequest } from "@beep/agents-client"
 *
 * console.log(SendTurnRequest.fields)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SendTurnRequest extends S.TaggedClass<SendTurnRequest>("SendTurnRequest")("send", {
  threadId: WorkspaceIdentity.ThreadId,
  content: Document,
}) {}

/**
 * A request to edit an existing turn's message and regenerate from there.
 *
 * @example
 * ```ts
 * import { EditTurnRequest } from "@beep/agents-client"
 *
 * console.log(EditTurnRequest.fields)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EditTurnRequest extends S.TaggedClass<EditTurnRequest>("EditTurnRequest")("edit", {
  threadId: WorkspaceIdentity.ThreadId,
  turnId: WorkspaceIdentity.TurnId,
  content: Document,
}) {}

/**
 * A turn the user wants to run: a fresh send or an edit-regenerate.
 *
 * @example
 * ```ts
 * import { TurnRequest } from "@beep/agents-client"
 *
 * console.log(TurnRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurnRequest = S.Union([SendTurnRequest, EditTurnRequest]).pipe(S.toTaggedUnion("_tag"));

/**
 * Runtime type for {@link TurnRequest}.
 *
 * @category models
 * @since 0.0.0
 */
export type TurnRequest = typeof TurnRequest.Type;

/**
 * Drives one assistant turn: fires the streaming rpc, appends blocks into
 * {@link streamingTurnAtom} as they arrive, and on completion invalidates the
 * thread's timeline key (plus the workspace thread list) so the persisted turn
 * and any derived title refetch. Records a perceived-latency timer (send → first
 * block) and a decode-failure counter as client-side quality signals.
 *
 * @remarks
 * Interrupt-cleanup lesson (hard-won, ported verbatim): user-cancel arrives as
 * an `Atom.Interrupt` write, which refreshes this fn node's Lifetime BEFORE the
 * fiber unwinds. By the time `Effect.onInterrupt` runs, the `ctx` passed to the
 * fn is already disposed, so `ctx.set(...)` writes are silently dropped. Cleanup
 * on interrupt must therefore go through the `AtomRegistry` and `Reactivity`
 * services — which outlive the node — via `registry.set(streamingTurnAtom, ...)`
 * and `reactivity.invalidateUnsafe(turnKeys)`. The error path
 * (`Effect.tapError`) still runs on the live fiber, so it may use `ctx.set`.
 *
 * @example
 * ```ts
 * import { runTurnAtom } from "@beep/agents-client"
 *
 * console.log(runTurnAtom)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
export const runTurnAtom = ChatClient.runtime.fn<TurnRequest>()(
  Effect.fn("runTurn")(function* (turn, ctx) {
    const client = yield* ChatClient;
    const reactivity = yield* Reactivity.Reactivity;
    const registry = yield* AtomRegistry.AtomRegistry;
    yield* Effect.logInfo("assistant turn started").pipe(Effect.annotateLogs({ turn: turn._tag }));
    const stream = TurnRequest.match(turn, {
      send: (turn) => client("SendMessage", { threadId: turn.threadId, content: turn.content }),
      edit: (turn) =>
        client("EditMessage", {
          threadId: turn.threadId,
          turnId: turn.turnId,
          content: turn.content,
        }),
    });
    const turnState = {
      threadId: turn.threadId,
      userContent: turn.content,
      truncateFrom: TurnRequest.guards.edit(turn) ? O.some(turn.turnId) : O.none<TurnId>(),
    };
    // a completed turn changes this thread's timeline and bumps its activity in
    // every workspace list, so invalidate both the timeline and the shared list
    const turnKeys = [timelineKey(turn.threadId), THREADS_KEY];
    const startedAt = yield* Clock.currentTimeMillis;
    let blocks: ReadonlyArray<AssistantBlock> = [];
    ctx.set(turnErrorAtom, O.none());
    ctx.set(streamingTurnAtom, O.some({ ...turnState, blocks }));
    yield* Reactivity.mutation(
      Stream.runForEach(
        stream,
        Effect.fnUntraced(function* (block) {
          if (A.isReadonlyArrayEmpty(blocks)) {
            const now = yield* Clock.currentTimeMillis;
            yield* Metric.update(
              Metric.withAttributes(perceivedLatency, { kind: turn._tag }),
              Duration.millis(now - startedAt)
            );
          }
          blocks = A.append(blocks, block);
          ctx.set(streamingTurnAtom, O.some({ ...turnState, blocks }));
        })
      ),
      turnKeys
    ).pipe(
      // error policy lives here, in Effect: clear the partial turn and log. The
      // error fiber is still live, so `ctx.set` is safe here.
      Effect.tapError(
        Effect.fnUntraced(function* (error) {
          ctx.set(streamingTurnAtom, O.none());
          const turnError = toTurnError(error);
          ctx.set(turnErrorAtom, O.some(turnError));
          yield* Effect.logError("assistant turn failed", error);
        })
      ),
      // user-cancelled (Atom.Interrupt write): drop the partial turn and
      // refetch — the user message persisted before the stream started. The
      // Interrupt write refreshes the fn node BEFORE this fiber unwinds, so
      // `ctx` is already disposed and its writes are silently dropped — go
      // through the registry and reactivity services, which outlive the node.
      Effect.onInterrupt(() =>
        Effect.sync(() => {
          registry.set(streamingTurnAtom, O.none());
          reactivity.invalidateUnsafe(turnKeys);
        })
      )
    );
    // wait for the refetched timeline before dropping the streamed turn, so the
    // persisted rendering swaps in without a gap
    yield* ctx.result(threadTimelineAtoms(turn.threadId), { suspendOnWaiting: true });
    ctx.set(streamingTurnAtom, O.none());
    yield* Effect.logInfo("assistant turn complete");
  })
);
