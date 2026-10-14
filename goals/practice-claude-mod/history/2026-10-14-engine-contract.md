# Claude Code mods engine contract — 2026-10-14

Completed targeted declaration research. Only this report is written; sources remain read-only.

Primary source: `plugin-authoring/types/claude-code.d.ts` (line numbers below refer to this file). Supporting sources: `plugin-authoring/reference.md` and `plugin-authoring/examples/*`. Declaration excerpts omit long documentation comments; adjacent prose preserves relevant contract summaries. Missing declarations are reported as **NOT FOUND**.

Excerpts below preserve declaration tokens while normalizing whitespace and removing documentation. Partial type excerpts are explicitly identified.

## 1. Registration, middleware, matching

`d.ts:9301–9301`
```ts
export type Register = (on: On, options: PluginOptions) => unknown;
// d.ts:6771–6774
export type On = { <P extends Pattern>(pattern: P, hook: NoInfer<HookFor<P>>): Registration<HookFor<P>>; <P extends Pattern, const M extends MatcherFor<P>>(pattern: P, matcher: M, hook: NoInfer<MatchedHook<P, M>>): Registration<MatchedHook<P, M>>; };
// d.ts:5087–5087
export type Hook<E extends EventName = EventName> = Events[E];
// d.ts:4805–4807
export type Events = { [E in keyof EventOf]: E extends StreamingEventName ? StreamHook<E> : ($: E extends 'engine.create' ? NoEngineInterface : EngineInterface, e: Frozen<Args<E>>, next: Next<E>) => EventResult<E> | Promise<EventResult<E>>; };
// d.ts:6535–6608
export type Next<N extends EventName = EventName, E = Args<N>, O = NextResult<N>, S extends { [K in N]?: unknown; } = { [K in N]: Args<K>; }> = { <T extends string>(e: E & ToolNamed<T>): Promise<NextResultFor<N, O, T>>; (e: E): Promise<O>; readonly to: { <T extends string>(e: E & ToolNamed<T>, tier: TargetTier): Promise<NextResultFor<N, O, T>>; (e: E, tier: TargetTier): Promise<O>; }; readonly signal: AbortSignal; readonly is: <M extends PatternOver<N>>(pattern: M, e: unknown) => e is Frozen<S[Extract<N, Selected<M>>]>; readonly event: N; readonly origin: Origin; readonly trace: readonly TraceEntry<N, E, O>[]; readonly budget: NextBudget; };
// d.ts:9327–9340
export type Registration<F> = { readonly catch: (handler: CatchHandler<F>) => void; };
// d.ts:1172–1172
export type CatchHandler<F> = F extends ($: infer D, e: infer E, next: infer N) => infer R ? [R] extends [AsyncGenerator<unknown, unknown, unknown>] ? ($: D, e: E, next: N & Caught) => R : ($: D, e: E, next: N & Caught) => R | undefined | Promise<Awaited<R> | undefined> : never;
// d.ts:1182–1196
export type Caught = { readonly error: HookFailure; readonly called: boolean; };
// d.ts:5801–5803
export type Matcher<I, All = I> = I extends unknown ? { readonly [K in KnownKeys<I>]?: MatcherValue<I[K & keyof I], MatcherValueOf<All, K>>; } & (string extends keyof I ? OpenMatcher<I, All> : unknown) : never;
// d.ts:5840–5850
type MatcherOne<V> = unknown extends V ? MatcherData : V extends readonly (infer Item)[] ? MatcherOne<Item> : V extends string | number | boolean | null ? V | RegExp : V extends object ? Matcher<V> : V extends undefined ? never : unknown; type MatcherValue<V, Across = V> = MatcherOne<V> | readonly MatcherOne<Across>[];
```

`next` is called as `next(e)`, not a zero-argument call. It delegates to the remaining chain; a copied `e` rewrites input. `.catch` receives the same `$`, `e`, and `next` augmented by `error` and `called`; its `next(e)` replays an already-started delegation rather than executing it twice (1174–1195). Matcher fields follow each event input: literals/RegExp, arrays of alternatives, nested objects. Concrete supported matcher shapes include `{ tool: "Bash" }`, `{ component: "ToolUse", surface: "terminal" }`, `{ command: "name" }`, and `{ element: "name" }` for `tool.call`, `ui.render`, `command.run`, `ui.press`, respectively; these are derived examples, not new declarations. Inputs for each appear below; the render-site props excerpts are members of `RenderPropsOf` (9763).

`ui.press` matcher fields are the following; note `element` is the button key. `PluginOptions` and pattern-selected hook alias follow.

```ts
// d.ts:14202–14238
export type UiPressArgument = { plugin: string; element: string; component: RenderComponent; requestId: string; surface: RenderSurface; link?: PressedLink; };
// d.ts:7658–7658
export type PluginOptions = Readonly<Record<string, string | number | boolean | readonly string[]>>;
// d.ts:5173–5173
export type HookFor<P extends Pattern> = P extends '*' ? AnyEventHook : P extends EventName ? Events[P] : GlobHook<P>;
```

## 2. Render sites and expansion

`d.ts:9360–9360`
```ts
export type RenderComponent = 'AskUserQuestion' | 'UserMessage' | 'AssistantMessage' | 'ToolUse' | 'ToolResult' | 'ToolGroup' | 'ToolProgress' | 'CommandOutput' | 'Spinner' | 'TurnDuration' | 'InfoNotice' | 'SessionMode' | 'PromptHint' | 'AbovePrompt' | 'Pane';
// d.ts:9710–9748
export type RenderInput<C extends RenderComponent = RenderComponent, P extends RenderSurface = RenderSurface> = C extends RenderComponent ? P extends RenderSurface ? RenderInputOf<C, P> : never : never; export type RenderInputOf<C extends RenderComponent, P extends RenderSurface> = { surface: P; component: C; requestId: string; viewport?: RenderViewport; props: RenderPropsOf[C]; };
// d.ts:9854–9885
AssistantMessage: { text: string; isFirstOfReply: boolean; isSummary?: true; onScreen?: OnScreen | null; };
// d.ts:9892–9940
ToolUse: { tool_use_id: string; tool: string; input: unknown; isRunning: boolean; isErrored: boolean; isInterrupted: boolean; output?: unknown; onScreen?: OnScreen | null; };
// d.ts:10255–10301
AbovePrompt: { hasSurvey: boolean; isWorking: boolean; maxRows: number; bodyColumns: number; scroll: SiteScroll; view: SiteView; };
// d.ts:10312–10357
Pane: { title: string; isFocused: boolean; bodyColumns: number; placement: 'dock' | 'inline'; scroll: SiteScroll; view: SiteView; };
// d.ts:10379–10416
export type RenderSurface = 'terminal' | 'desktop' | 'mobile' | 'vscode'; export type RenderViewport = { columns: number; rows: number; isFullscreen?: boolean; };
```

Full props above (these four blocks are entries within `RenderPropsOf`, not standalone exported types): `AssistantMessage`, `ToolUse`, `AbovePrompt`, `Pane`. **ToolUse expanded flag: NOT FOUND. AssistantMessage expanded flag: NOT FOUND.** `output` is the raw stored result, absent while running; it need not equal the model-facing text (9923–9930). `bodyColumns` is available body width in cells. `viewport.isFullscreen` describes pane docking/layout, not ctrl+o expansion. The declared expansion props are these partial entries of `RenderPropsOf`:

`d.ts:9814–9824`
```ts
isExpanded: boolean;
// d.ts:10008–10014
isExpanded: boolean;
```

The first belongs to `UserMessage` (9795–9844), the second to `ToolGroup` (9995–10017). `AssistantMessage.isSummary` distinguishes a summary of the model’s text from the full text in ctrl+o (9846–9875); it is not a general expanded flag.

## 3. Terminal/desktop elements

Both surfaces expose the same requested constructors (`Elements`, 3802–3841):

`d.ts:3802–3869`
```ts
export type Elements = { terminal: { Box: ElementConstructor<BoxProps>; Text: ElementConstructor<TextProps>; Button: ElementConstructor<ButtonProps>; Input: ElementConstructor<InputProps>; Select: ElementConstructor<SelectProps>; Link: ElementConstructor<LinkProps>; Code: ElementConstructor<CodeProps>; Markdown: ElementConstructor<MarkdownProps>; Client: ElementConstructor<ClientProps>; Raster: ElementConstructor<RasterProps>; Image: ElementConstructor<ImageProps>; }; desktop: { Box: ElementConstructor<BoxProps>; Text: ElementConstructor<TextProps>; Button: ElementConstructor<ButtonProps>; Input: ElementConstructor<InputProps>; Select: ElementConstructor<SelectProps>; Svg: ElementConstructor<SvgProps>; Link: ElementConstructor<LinkProps>; Code: ElementConstructor<CodeProps>; Markdown: ElementConstructor<MarkdownProps>; Client: ElementConstructor<ClientProps>; }; mobile: { Box: ElementConstructor<BoxProps>; Text: ElementConstructor<TextProps>; Button: ElementConstructor<ButtonProps>; Svg: ElementConstructor<SvgProps>; Link: ElementConstructor<LinkProps>; Code: ElementConstructor<CodeProps>; Markdown: ElementConstructor<MarkdownProps>; }; vscode: { Box: ElementConstructor<BoxProps>; Text: ElementConstructor<TextProps>; Button: ElementConstructor<ButtonProps>; Input: ElementConstructor<InputProps>; Select: ElementConstructor<SelectProps>; Svg: ElementConstructor<SvgProps>; Link: ElementConstructor<LinkProps>; Code: ElementConstructor<CodeProps>; Markdown: ElementConstructor<MarkdownProps>; }; };
// d.ts:901–990
export type BoxProps = { key?: string; hover?: BoxHoverProps; position?: 'relative' | 'absolute'; top?: number; left?: number; right?: number; bottom?: number; flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'; flexGrow?: number; flexShrink?: number; flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'; alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'; alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'auto'; justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'; gap?: number; columnGap?: number; rowGap?: number; width?: number | string; height?: number | string; minWidth?: number | string; minHeight?: number | string; margin?: number; marginX?: number; marginY?: number; marginTop?: number; marginBottom?: number; marginLeft?: number; marginRight?: number; padding?: number; paddingX?: number; paddingY?: number; paddingTop?: number; paddingBottom?: number; paddingLeft?: number; paddingRight?: number; borderStyle?: string; borderColor?: Color; borderDimColor?: boolean; backgroundColor?: Color; overflow?: 'visible' | 'hidden'; display?: 'flex' | 'none'; };
// d.ts:1060–1162
export type ButtonProps = { key?: string; label?: string; hotkey?: string; action?: string; plain?: true; dimColor?: boolean; variant?: 'primary' | 'secondary'; role?: 'dismiss'; autoFocus?: true; hover?: TextHoverProps; onPress: (e: UiPressArgument) => void; };
// d.ts:5471–5513
export type InputProps = { key: string; label?: string; placeholder?: string; value?: string; submitLabel?: string; autoFocus?: true; onInput?: (value: string, e: UiInputArgument) => void; onSubmit: (value: string, e: UiInputArgument) => void; };
// d.ts:5698–5735
export type MarkdownProps = { key?: string; text: string; dimColor?: boolean; onLinkPress?: (link: PressedLink, e: UiPressArgument) => void; pressableLinks?: readonly string[]; };
// d.ts:12563–12581
export type TextProps = { hover?: TextHoverProps; color?: Color; backgroundColor?: Color; dimColor?: boolean; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; inverse?: boolean; wrap?: 'wrap' | 'end' | 'middle' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end'; };
```

Constructor children are added to every props type:

`d.ts:3772–3774`
```ts
export type ElementChildren = { children?: RenderChildren; };
// d.ts:3784–3784
export type ElementConstructor<P> = (props: P & ElementChildren) => RenderElement;
```

## 4. `$.ui` methods

One-line summaries: `resolve` selects surface constructors; `invalidate` schedules redraw/cache invalidation; `status` sets/clears this plugin’s footer text; `toast` shows transient text; `open` places a pane; `notice` sets/clears a tool-use notice; `log` adds a transcript info line. Partial members of `CoreEngineInterface.ui`:

`d.ts:2397–2397`
```ts
resolve: <E extends ResolveInput>(e: E) => Elements[E['surface']];
// d.ts:2360–2360
invalidate: (event: InvalidatableEventName) => void;
// d.ts:2477–2477
status: (text: string | undefined) => void;
// d.ts:2447–2447
toast: (text: string, options?: ToastOptions) => void;
// d.ts:2500–2500
open: (pane: PaneOpenArgs) => Promise<UiOpenResult>;
// d.ts:2346–2346
notice: (tool_use_id: string, text: string | undefined) => void;
// d.ts:2414–2414
log: (text: string, options?: UiLogOptions) => void;
// d.ts:5564–5564
export type InvalidatableEventName = RenderEventName | 'prompt.section' | 'prompt.context' | 'prompt.attachment' | 'tool.describe' | 'command.describe' | 'config.describe';
// d.ts:12631–12636
export type ToastOptions = { timeoutMs?: number; };
```

Supporting UI option/result declarations:

```ts
// d.ts:14000–14015
export type UiLogOptions = { to?: UiLogSink; }; export type UiLogSink = 'transcript' | 'debug';
// d.ts:7390–7461
export type PaneOpenArgs = { id: string; title?: string; focus?: true; closeOnEscape?: true; holdToasts?: true; rows?: number; columns?: number; };
// d.ts:14134–14158
export type UiOpenResult = { isPlaced: true; } | { isPlaced: false; reason: string; };
```

## 5. Commands

Register the name without `/`; registration exposes the command, and a `command.run` hook implements it. Re-registering replaces it; built-in names are refused (3078–3091).

`d.ts:3091–3091`
```ts
register: (command: CommandSpec) => Promise<OpValueOf['command.register']>;
// d.ts:3076–3076
run: EventCalls['command']['run'];
// d.ts:4713–4713
run: (input: CommandRunArgs) => Promise<CommandRunResult>;
// d.ts:1886–1909
export type CommandSpec = { name: string; description: string; argumentHint?: string; immediate?: true; };
// d.ts:1781–1819
export type CommandRunArgs = Omit<CommandRunInput, 'origin' | 'args' | 'presentation'> & { args?: string; }; export type CommandRunInput = { command: string; args: string; origin: PromptOrigin; presentation: CommandPresentation; };
// d.ts:1761–1775
export type CommandPresentation = { isFullscreen: boolean; columns: number; };
// d.ts:1837–1872
export type CommandRunResult = { text?: string; context?: readonly string[]; exitCode?: number; ref?: number; };
```

`text` is printed; `context` carries model-facing reminders; `exitCode` is populated for the engine’s local-command runner; `ref` identifies core-produced messages and is passed through whole, not minted by a hook (1821–1871).

Registration result (`OpValueOf` member, d.ts:7238–7240):
```ts
'command.register': { command: string; };
```

## 6. MCP

Positional direct call; server names use `/mcp` spelling (e.g. `claude.ai Gmail`), with tool-name spelling (`claude_ai_Gmail`) also accepted. Hook `tool.call` names use `mcp__<server>__<tool>` instead (2693–2719, 5960–5992).

`d.ts:2718–2718`
```ts
call: (server: string, tool: string, args?: Record<string, unknown>) => Promise<McpToolResult>;
// d.ts:6012–6032
export type McpToolName = `mcp__${string}__${string}`; export type McpToolResult = { content: McpContentBlock[]; isError: boolean; structuredContent?: unknown; };
// d.ts:5928–5946
export type McpContentBlock = { type: string; text?: string; uri?: string; mimeType?: string; [field: string]: unknown; };
// d.ts:6872–6876
'mcp.call': { server: string; tool: string; args: Record<string, unknown>; };
```

Errors: MCP result errors are represented by `isError: boolean` and content blocks. A dedicated typed rejection/error class for `$.mcp.call`: **NOT FOUND**. Its Promise signature does not establish that connection failures cannot reject; the never-rejects-on-refusal wording at 2723–2724 belongs to `mcp.connect`, not `mcp.call`.

## 7. Filesystem, storage, session state

Filesystem paths are absolute or relative to the session working directory; text is UTF-8 (3215–3249). Partial `CoreEngineInterface.fs` members and their result types:

`d.ts:3242–3249`
```ts
read: FsReadCall; write: (path: string, text: string) => Promise<void>;
// d.ts:3263–3268
list: (path?: string) => Promise<FsEntry[]>; exists: (path: string) => Promise<boolean>;
// d.ts:3321–3321
stat: (path: string, options?: FsStatOptions) => Promise<FsStat>;
// d.ts:4967–4982
export type FsReadCall = { (path: string): Promise<string>; (path: string, options: FsReadBytesOptions): Promise<FsBytes>; (path: string, options: FsReadOptions): Promise<string | FsBytes>; }; export type FsReadOptions = { as: FsReadAs; };
// d.ts:4916–4945
export type FsEntry = { name: string; kind: 'file' | 'dir' | 'other'; size: number; mtimeMs: number; isLink: boolean; };
// d.ts:4988–5033
export type FsStat = { kind: 'file' | 'dir' | 'other'; size: number; mtimeMs: number; isLink: boolean; realPath?: string; }; export type FsStatOptions = { resolve: boolean; };
```

`$.fs.append`, `$.fs.appendFile`, `$.fs.mkdir`: **NOT FOUND**. `stat` rejects a missing path with `ENOENT` (3270–3281). `resolve: true` adds canonical `realPath` when resolvable, with no `realPath` when the target leads nowhere (3270–3321, 5008–5032). No plugin data/state directory path getter: **NOT FOUND**. `$.plugin.root` is the installed plugin directory, not a declared writable data directory. `$.store` is JSON persisted in a plugin-owned file under the user’s Claude Code configuration directory; its exact filename/path is **NOT FOUND** (3344–3350).

`d.ts:2319–2328`
```ts
plugin: { name: string; root: string; };
// d.ts:3351–3375
store: { get: (key: string) => Promise<unknown>; set: (key: string, value: unknown) => Promise<void>; delete: (key: string) => Promise<void>; keys: () => Promise<string[]>; };
// d.ts:3400–3400
get: <P extends keyof PluginState & string, K extends keyof PluginState[P] & string>(ref: StateRef<P, K>) => Promise<StateRead<StateValue<P, K>>>;
// d.ts:3416–3416
set: <P extends keyof PluginState & string, K extends keyof PluginState[P] & string>(ref: StateRef<P, K>, value: StateValue<P, K>, options?: StateSetOptions) => Promise<StateSetResult>;
// d.ts:7786–7787
export interface PluginState { }
// d.ts:12025–12041
type StateName<P extends string = string, K extends string = string> = { readonly plugin: P; readonly key: K; }; export type StateRead<T = unknown> = { value: T | undefined; version: number; };
// d.ts:12054–12054
export type StateRef<P extends keyof PluginState & string, K extends keyof PluginState[P] & string> = StateName<P, K> & (PluginState[P][K] extends StateFamily<unknown> ? Readonly<Required<Pick<StateAddress, 'id'>>> : Readonly<Partial<Record<'id', undefined>>>);
// d.ts:12072–12089
export type StateSetOptions = { ifVersion?: number; }; export type StateSetResult = { isSet: true; version: number; } | { isSet: false; version: number; };
// d.ts:688–696
export type Atom<T> = { readonly ref: StateAddress; readonly initial: T; readonly shape?: string; };
// d.ts:708–711
export type AtomFunction = { <P extends keyof PluginState & string, K extends keyof PluginState[P] & string>(ref: StateName<P, K> & Readonly<Pick<StateAddress, 'id'>>, initial: StateValue<P, K>): Atom<StateValue<P, K>>; <P extends keyof PluginState & string, K extends keyof PluginState[P] & string>(ref: StateName<P, K> & Readonly<Pick<StateAddress, 'id'>>, initial: ShapedValue<StateValue<P, K>>, options: AtomOptions): Atom<ShapedValue<StateValue<P, K>>>; };
// d.ts:9284–9288
export type ReadFunction = { <T>($: StateDollar, source: Atom<T>): Promise<T>; <T>($: StateDollar, source: Derived<T>): Promise<T>; <P extends keyof PluginState & string, K extends keyof PluginState[P] & string>($: StateDollar, source: StateRef<P, K>): Promise<StateValue<P, K> | undefined>; };
// d.ts:14585–14588
export type UpdateFunction = { <T>($: StateDollar, target: Atom<T>, change: (value: T) => T): Promise<T>; <P extends keyof PluginState & string, K extends keyof PluginState[P] & string>($: StateDollar, target: StateRef<P, K>, change: (value: StateValue<P, K> | undefined) => StateValue<P, K>): Promise<StateValue<P, K>>; };
// d.ts:14701–14701
export const atom: AtomFunction
// d.ts:14726–14726
export const read: ReadFunction
// d.ts:14735–14735
export const update: UpdateFunction
```

`PluginState` is declaration-merged by plugin name then key. State survives hot reload within the session; only the owning plugin writes it, while any plugin reads it. Reading state during rendering subscribes that instance; a later set redraws automatically. Persist across sessions with `$.store` (3377–3416). `get` initially returns `undefined` at version 0; `ifVersion` provides compare-and-set. `atom` is a pure frozen description with a default value; `read` returns it/default or a derived value; `update` accepts a change function, writes with `ifVersion`, and retries on a version miss (14729–14735). Imports are from `claude-code`, as demonstrated in `examples/band.tsx:1–7` and `examples/pane.tsx:1–7`.

Binary file reads and state addressing:

```ts
// d.ts:4905–4911
export type FsBytes = { base64: string; };
// d.ts:4950–4961
export type FsReadAs = 'text' | 'bytes'; export type FsReadBytesOptions = { as: 'bytes'; };
// d.ts:11986–11990
export type StateAddress = { plugin: string; key: string; id?: string; };
```

## 8. Clock

`now` returns epoch milliseconds (3428–3433). `after` fires once, `every` repeats in milliseconds; cancel a timer through its handle. `every` requires at least 1 ms; a refused period ends the interval (3448–3464).

`d.ts:3433–3433`
```ts
now: () => Promise<number>;
// d.ts:3454–3464
after: TimerCall; every: TimerCall;
// d.ts:12615–12626
export type Timer = { cancel: () => void; }; export type TimerCall = (ms: number, fn: () => void) => Timer;
```

## 9. Session identity and transcript rows

In any ordinary hook, call `await $.session.id()`; classic hooks additionally carry `session_id` through `BaseHookInput`. A getter for the id of the latest assistant answer: **NOT FOUND**. `SessionMessage` has no id/uuid. Its optional `handle` is a compaction token, explicitly absent from `$.session.messages()` (11153–11159). `turn.complete` carries a turn id and answer text, not an assistant message id. `classic.MessageDisplay` supplies a message UUID while streaming (not the API `msg_...` id); tracking its final main-loop flush is a possible derived strategy, not a declared latest-answer getter.

`d.ts:2796–2796`
```ts
id: () => Promise<string>;
// d.ts:826–855
type BaseHookInput = { session_id: string; transcript_path: string; cwd: string; prompt_id?: string; permission_mode?: string; agent_id?: string; agent_type?: string; effort?: { level: string; }; };
// d.ts:6049–6072
type MessageDisplayHookInput = BaseHookInput & { hook_event_name: 'MessageDisplay'; turn_id: string; message_id: string; index: number; final: boolean; delta: string; };
// d.ts:13276–13324
type TurnCompleteFields = { answer: string; durationMs: number; isAborted: boolean; turnId: string; agentId?: string; usage?: TurnUsage; }; export type TurnCompleteInput = TurnCompleteFields & (TurnCompleteRefused | TurnCompleteUnrefused);
// d.ts:11134–11160
export type SessionMessage = { role: 'user' | 'assistant'; text: string; toolUses: ToolUseSummary[]; toolResults?: ToolResultSummary[]; handle?: string; };
// d.ts:11226–11232
type SessionMessagesCall = { (): Promise<SessionMessage[]>; (args: SessionMessagesMainApiArgs): Promise<ApiMessage[]>; (args: SessionMessagesApiArgs): Promise<SessionMessagesApiResult>; (args: SessionMessagesAgentArgs): Promise<SessionMessagesResult>; (args: SessionMessagesArgs): Promise<SessionMessagesValue>; };
// d.ts:13147–13209
export type ToolUseSummary = { tool_use_id: string; tool: string; input: Record<string, unknown>; result?: unknown; text?: string; isError?: true; agentId?: string; durationMs?: number; meta?: Record<string, unknown>; };
```

`$.session.messages()` returns the newest 4096 user/assistant entries and excludes progress, UI logs, and notices; `{ agentId }` can return `{ deny }` instead of another loop’s rows; `{ as: "api" }` returns API content blocks (2739–2771).

## 10. Tool call input/result

Tool arguments are flat fields beside `tool` and `tool_use_id`, e.g. Bash `command`, Read `file_path`; they are not a nested `input` object as on the render row. Tool-specific mappings are declaration-merged through `BuiltinToolInputs` / `McpToolInputs`. `agentId` identifies the loop, not the session.

`d.ts:12644–12665`
```ts
export type ToolCallArgs = ToolCallEnvelope extends infer I ? I extends ToolCallEnvelope ? Omit<I, 'tool_use_id'> & ToolCallReserved<I['tool']> : never : never; export type ToolCallEnvelope = BuiltinToolCallInput | McpToolCallInput; export type ToolCallInput = ToolCallEnvelope & AgentLoop & ToolRequestMeta;
// d.ts:12955–12966
type ToolEnvelope<Name, Arguments> = { tool: Name; tool_use_id: string; } & Arguments;
// d.ts:13030–13032
export type ToolInputOf<Name extends string, Arguments> = { [K in keyof ToolEnvelope<Name, Arguments>]: ToolEnvelope<Name, Arguments>[K]; };
// d.ts:194–204
export type AgentLoop = { agentId?: string; };
// d.ts:13048–13065
export type ToolRequestMeta = { requestMeta?: Record<string, string>; };
// d.ts:12684–12688
export type ToolCallReserved<T> = { tool: T; tool_use_id?: string; consent?: string; };
// d.ts:12701–12790
export type ToolCallResult<Name extends string = string> = { deny: string; result?: undefined; context?: undefined; ref?: undefined; text?: undefined; isError?: undefined; isReadOnly?: undefined; } | { result: ToolResultOf<Name>; context?: readonly string[]; ref?: number; text?: string; isReadOnly?: true; isError?: undefined; deny?: undefined; } | { isError: true; result: unknown; text?: string; ref?: number; context?: readonly string[]; isReadOnly?: true; deny?: undefined; };
// d.ts:13073–13073
export type ToolResultOf<Name extends string> = string extends Name ? unknown : Name extends keyof BuiltinToolResults & string ? BuiltinToolResults[Name] | (Name extends 'Agent' ? AgentCallRecord | AgentTeammateRecord : never) : unknown;
```

`ToolCallResult.toolUseId`: **NOT FOUND**; no camelCase or snake_case call-id field exists in this result union. The hook input, render props, and transcript `ToolUseSummary` carry `tool_use_id`; retain it from `e` to correlate. `ref` is an opaque numeric reference to core-produced messages, not the tool-use id. Result branches distinguish refusal (`deny`), success (`result`), and tool failure (`isError: true`).

## 11. `claude-code/testing`

Import `test`, `expect`, `mock` from this module. Tests register bottom hooks before the first `$` call loads plugins; missing bottoms throw (except the kit’s state/render-invalidation/session-append handling). This is the engine kit, not an assumed Jest mock API.

`d.ts:15921–15921`
```ts
export const test: (name: string, ...rest: TestRest) => void;
// d.ts:15931–15959
export type TestBody = ($: Engine, on: On) => unknown; export type TestOptions = { plugins?: readonly Plugin[]; timeoutMs?: number; options?: PluginOptions; }; export type TestRest = readonly [body: TestBody] | readonly [options: TestOptions, body: TestBody];
// d.ts:15153–15153
export type Expect = Expecting & Matching;
// d.ts:15162–15185
export const expect: Expect; export type Expectation = Negatable<Matchers> & { resolves: Negatable<AsyncMatchers>; rejects: Negatable<AsyncMatchers>; }; export type Expecting = (received: unknown, message?: string) => Expectation;
// d.ts:15258–15265
toBe: (expected: unknown) => void; toEqual: (expected: unknown) => void;
// d.ts:15440–15490
export type Mock = { clock: (on: On, options?: MockClockOptions) => MockClock; store: (on: On, entries?: Readonly<Record<string, unknown>>) => void; env: (on: On, variables: Readonly<Record<string, string>>) => void; session: (on: On) => MockSession; }; export const mock: Mock;
// d.ts:15011–15023
export type Engine = { [N in keyof EventCalls]: N extends 'ui' ? EngineNoun<N> & EnginePress & EngineInput & EngineSelect & EngineMount : EngineNoun<N>; } & { classic: EngineClassic; }; export type EngineCall<E extends EventName> = E extends StreamingEventName ? (e: Args<E>) => HookStream<Chunk<E>, ResultOf[E]> : (e: Args<E>) => Promise<ResultOf[E]>;
// d.ts:15072–15095
export type EngineMount = { mount: <P extends RenderSurface, C extends RenderComponent>(target: MountTarget<P, C>) => Promise<Mounted<P, C>>; }; export type EngineNoun<N extends keyof EventCalls> = { [V in EngineNounEvent<N>]: `${N}.${V}` extends 'tool.call' | 'ui.render' ? EventCalls[N][V] : EngineCall<`${N}.${V}` & EventName>; };
// d.ts:4713–4713
run: (input: CommandRunArgs) => Promise<CommandRunResult>;
// d.ts:15800–15836
export type MountTarget<P extends RenderSurface = RenderSurface, C extends RenderComponent = RenderComponent> = { plugin: string; surface: P; component: C; props: RenderPropsOf[C]; requestId?: string; viewport?: RenderViewport; };
// d.ts:15574–15649
export type Mounted<P extends RenderSurface = RenderSurface, C extends RenderComponent = RenderComponent> = { [K in keyof MountedMembers<P, C> as K extends keyof ElementOfAct ? ElementOfAct[K] extends keyof Elements[P] ? K : never : K]: MountedMembers<P, C>[K]; }; export type MountedMembers<P extends RenderSurface, C extends RenderComponent = RenderComponent> = { readonly surface: P; drawn: (scope?: ClientScope) => Promise<RenderElement>; find: (query: ElementQuery) => Promise<FoundElement | undefined>; findAll: (query: ElementQuery) => Promise<FoundElement[]>; press: (target: MountPressTarget) => Promise<UiPressResult | undefined>; input: (target: MountInputTarget) => Promise<UiInputResult | undefined>;
```

The `MountedMembers` excerpt above is partial (through `input`). The test’s `$.command.run` is an event call, so its input is **CommandRunInput**, including `origin` and `presentation`, rather than the production convenience `CommandRunArgs`. `mock.mcp`: **NOT FOUND**. Fake a tool result with a bottom `on("mcp.call", matcher, ...)` returning the operation wrapper. Declaration evidence:

`d.ts:6872–6876`
```ts
'mcp.call': { server: string; tool: string; args: Record<string, unknown>; };
// d.ts:7203–7203
'mcp.call': McpToolResult;
```

Operation result wrapping (used by test calls and bottom hooks):

```ts
// d.ts:7191–7191
export type OpEventResult<N extends OpEventName = OpEventName> = ValueOrDeny<OpValueOf[N]>;
// d.ts:14675–14681
type ValueOrDeny<Value> = { value: Value; deny?: undefined; } | { deny: string; value?: undefined; };
```

Derived illustrative test (not a declaration excerpt; server/tool names are test placeholders):

```ts
import { test, expect } from "claude-code/testing"
test("MCP stub", async ($, on) => {
  on("mcp.call", { server: "fixture", tool: "lookup" }, () => ({
    value: { content: [{ type: "text", text: "ok" }], isError: false },
  }))
  const result = await $.mcp.call({ server: "fixture", tool: "lookup", args: {} })
  if (result.deny !== undefined) throw new Error(result.deny)
  expect(result.value.content[0].text).toBe("ok")
})
```

`$.mcp.call` in this **test** is event-shaped and returns the operation wrapper; inside a production hook it is positional and returns `McpToolResult` directly. A concrete test call is `await $.command.run({ command: "tool-calls", args: "", origin: { kind: "composer" }, presentation: { isFullscreen: false, columns: 100 } })` (derived example; `PromptOrigin` composer declaration: 8865–8874). Mount through `$.ui.mount({ plugin, surface, component, props })`; use `mount.drawn()`, `find`, `press({ key })`, `input` on the retained mounted instance. `reference.md:81` explicitly recommends looping tests over terminal/desktop. No test files exist in the supplied examples directory.

## 12. Session version

Reports the running Claude Code build, not a session revision.

`d.ts:2863–2863`
```ts
version: () => Promise<SessionVersion>;
// d.ts:11764–11784
export type SessionVersion = { version: string; base?: string; builtAt?: string; };
```

## Gaps / unknowns

- **NOT FOUND:** ToolUse/AssistantMessage general expanded prop; `UserMessage.isExpanded` and `ToolGroup.isExpanded` are the explicit ctrl+o-related fields.
- **NOT FOUND:** latest-assistant-answer id getter or message id in `SessionMessage`; streaming `classic.MessageDisplay.message_id` is the available UUID signal.
- **NOT FOUND:** `ToolCallResult.toolUseId`; correlate via input `tool_use_id`.
- **NOT FOUND:** filesystem append/mkdir; writable plugin data/state-directory getter; exact persistent-store filename.
- **NOT FOUND:** dedicated MCP call error type, `mock.mcp`, or a generic Jest-style mock function.
- Research is declaration/reference/example inspection only; no plugin execution, typecheck, or runtime validation was performed.
