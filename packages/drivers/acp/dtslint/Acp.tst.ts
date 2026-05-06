import { Agent, Client, Errors, Protocol, Rpc, Schema, Terminal } from "@beep/acp";
import type { AcpAgent } from "@beep/acp/agent";
import type { AcpClient } from "@beep/acp/client";
import { type AcpError, AcpRequestError } from "@beep/acp/errors";
import type { AcpIncomingNotification } from "@beep/acp/protocol";
import type { AgentRpcs, ClientRpcs } from "@beep/acp/rpc";
import { InitializeRequest, PROTOCOL_VERSION } from "@beep/acp/schema";
import type { AcpTerminal } from "@beep/acp/terminal";
import type { Effect, Layer, Stream } from "effect";
import type * as Scope from "effect/Scope";
import type * as Stdio from "effect/Stdio";
import type { ChildProcessSpawner } from "effect/unstable/process";
import { describe, expect, it } from "tstyche";

declare const client: Client.AcpClientShape;
declare const agent: Agent.AcpAgentShape;
declare const terminal: AcpTerminal;

describe("@beep/acp", () => {
  it("exports public subpath modules through the package root", () => {
    expect(Client.AcpClient).type.toBe<typeof AcpClient>();
    expect(Agent.AcpAgent).type.toBe<typeof AcpAgent>();
    expect(Errors.AcpError).type.toBe<typeof AcpError>();
    expect(Protocol.makeAcpPatchedProtocol).type.toBeAssignableTo<
      (options: Protocol.AcpPatchedProtocolOptions) => Effect.Effect<Protocol.AcpPatchedProtocol, never, Scope.Scope>
    >();
    expect(Rpc.AgentRpcs).type.toBe<typeof AgentRpcs>();
    expect(Rpc.ClientRpcs).type.toBe<typeof ClientRpcs>();
    expect(Schema.PROTOCOL_VERSION).type.toBe<typeof PROTOCOL_VERSION>();
    expect(Terminal.makeTerminal).type.toBeAssignableTo<
      (options: Terminal.MakeTerminalOptions) => Terminal.AcpTerminal
    >();
  });

  it("preserves generated schema value and type exports", () => {
    const request = InitializeRequest.make({
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: "beep", version: "0.0.0" },
      protocolVersion: 1,
    });

    expect(request).type.toBe<InitializeRequest>();
    expect(PROTOCOL_VERSION).type.toBe<1>();
  });

  it("preserves client and agent service channels", () => {
    expect(client.agent.initialize).type.toBeAssignableTo<
      (payload: Schema.InitializeRequest) => Effect.Effect<Schema.InitializeResponse, Errors.AcpError>
    >();
    expect(client.raw.notifications).type.toBe<Stream.Stream<AcpIncomingNotification>>();
    expect(agent.client.requestPermission).type.toBeAssignableTo<
      (payload: Schema.RequestPermissionRequest) => Effect.Effect<Schema.RequestPermissionResponse, Errors.AcpError>
    >();
    expect(agent.raw.request("x/test", {})).type.toBe<Effect.Effect<unknown, Errors.AcpError>>();
    expect(Agent.layer).type.toBeAssignableTo<
      (stdio: Stdio.Stdio, options?: Agent.AcpAgentOptions) => Layer.Layer<AcpAgent>
    >();
    expect(Client.layerChildProcess).type.toBeAssignableTo<
      (handle: ChildProcessSpawner.ChildProcessHandle, options?: Client.AcpClientOptions) => Layer.Layer<AcpClient>
    >();
  });

  it("preserves typed ACP errors and terminal handles", () => {
    const error = AcpRequestError.methodNotFound("x/missing");

    expect(error).type.toBe<AcpRequestError>();
    expect(error).type.toBeAssignableTo<AcpError>();
    expect(terminal.kill).type.toBe<Effect.Effect<Schema.KillTerminalResponse, Errors.AcpError>>();
  });
});
