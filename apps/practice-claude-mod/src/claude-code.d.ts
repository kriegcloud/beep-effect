/**
 * The subset of the Claude Code mods API (`claude-code`) this plugin uses.
 *
 * The engine ships the full declarations with every build; this file copies
 * only the members the plugin calls, with shapes taken from
 * `goals/practice-claude-mod/history/2026-10-14-engine-contract.md`
 * (Claude Code 2.1.295). The import is type-only: at run time the engine
 * provides `$`.
 */
declare module "claude-code" {
  export type RenderSurface = "terminal" | "desktop" | "mobile" | "vscode";

  export type RenderElement = { readonly __renderElement: unique symbol };
  export type RenderChildren = string | RenderElement | ReadonlyArray<string | RenderElement | undefined>;
  type Children = { children?: RenderChildren };

  export type UiPressArgument = {
    plugin: string;
    element: string;
    requestId: string;
    surface: RenderSurface;
  };

  export type BoxProps = {
    key?: string;
    flexDirection?: "row" | "column";
    gap?: number;
    paddingX?: number;
    width?: number | string;
  };
  export type TextProps = {
    color?: string;
    dimColor?: boolean;
    bold?: boolean;
    wrap?: "wrap" | "end" | "truncate-end";
  };
  export type ButtonProps = {
    key?: string;
    label?: string;
    hotkey?: string;
    plain?: true;
    dimColor?: boolean;
    variant?: "primary" | "secondary";
    onPress: (e: UiPressArgument) => void;
  };

  export type Elements = {
    Box: (props: BoxProps & Children) => RenderElement;
    Text: (props: TextProps & Children) => RenderElement;
    Button: (props: ButtonProps & Children) => RenderElement;
  };

  export type ToolUseProps = {
    tool_use_id: string;
    tool: string;
    input: unknown;
    isRunning: boolean;
    isErrored: boolean;
    isInterrupted: boolean;
  };
  export type AbovePromptProps = {
    isWorking: boolean;
    maxRows: number;
    bodyColumns: number;
  };
  export type RenderInput<C extends string, P> = {
    surface: RenderSurface;
    component: C;
    requestId: string;
    props: P;
  };

  export type CommandRunInput = { command: string; args: string };
  export type CommandRunResult = { text?: string };
  export type TurnCompleteInput = { answer: string; turnId: string; isAborted: boolean; agentId?: string };
  export type SessionMessage = { role: "user" | "assistant"; text: string };
  export type McpToolResult = {
    content: ReadonlyArray<{ type: string; text?: string }>;
    isError: boolean;
    structuredContent?: unknown;
  };

  export type Timer = { cancel: () => void };

  export type Engine = {
    readonly plugin: { readonly name: string; readonly root: string };
    readonly ui: {
      resolve: (e: { surface: RenderSurface }) => Elements;
      invalidate: (event: "ui.render") => void;
      toast: (text: string, options?: { timeoutMs?: number }) => void;
      status: (text: string | undefined) => void;
    };
    readonly command: {
      register: (command: { name: string; description: string; argumentHint?: string }) => Promise<unknown>;
    };
    readonly store: {
      get: (key: string) => Promise<unknown>;
      set: (key: string, value: unknown) => Promise<void>;
    };
    readonly fs: {
      write: (path: string, text: string) => Promise<void>;
    };
    readonly mcp: {
      call: (server: string, tool: string, args?: Record<string, unknown>) => Promise<McpToolResult>;
    };
    readonly session: {
      id: () => Promise<string>;
      messages: () => Promise<ReadonlyArray<SessionMessage>>;
    };
    readonly clock: {
      now: () => Promise<number>;
      every: (ms: number, fn: () => void) => Timer;
    };
  };

  export type Next<I, O> = (e: I) => Promise<O>;
  export type Hook<I, O> = ($: Engine, e: I, next: Next<I, O>) => O | Promise<O>;
  export type Registration = { readonly catch: (handler: (...args: ReadonlyArray<never>) => unknown) => void };

  export type On = {
    (event: "session.start", hook: Hook<unknown, unknown>): Registration;
    (event: "turn.complete", hook: Hook<TurnCompleteInput, unknown>): Registration;
    (event: "command.run", matcher: { command: string }, hook: Hook<CommandRunInput, CommandRunResult>): Registration;
    (
      event: "ui.render",
      matcher: { component: "ToolUse" },
      hook: Hook<RenderInput<"ToolUse", ToolUseProps>, RenderElement | unknown>
    ): Registration;
    (
      event: "ui.render",
      matcher: { component: "AbovePrompt" },
      hook: Hook<RenderInput<"AbovePrompt", AbovePromptProps>, RenderElement | unknown>
    ): Registration;
  };

  export type PluginOptions = Readonly<Record<string, string | number | boolean | ReadonlyArray<string>>>;
  export type Register = (on: On, options: PluginOptions) => unknown;
}
