import { Agent, Client, Errors, Protocol, Rpc, Schema, Terminal } from "@beep/acp";
import { describe, expect, it } from "tstyche";
import type { Effect, Layer, Stream } from "effect";
import type * as Scope from "effect/Scope";
import type * as Stdio from "effect/Stdio";
import type { ChildProcessSpawner } from "effect/unstable/process";

declare const client: Client.AcpClientShape;
declare const agent: Agent.AcpAgentShape;
declare const terminal: Terminal.AcpTerminal;

describe("@beep/acp", () => {
  it("exports public subpath modules through the package root", () => {
    expect(Client.AcpClient).type.not.toBe<never>();
    expect(Agent.AcpAgent).type.not.toBe<never>();
    expect(Errors.AcpError).type.not.toBe<never>();
    expect(Protocol.makeAcpPatchedProtocol).type.toBeAssignableTo<
      (options: Protocol.AcpPatchedProtocolOptions) => Effect.Effect<Protocol.AcpPatchedProtocol, never, Scope.Scope>
    >();
    expect(Rpc.AgentRpcs).type.not.toBe<never>();
    expect(Rpc.ClientRpcs).type.not.toBe<never>();
    expect(Schema.PROTOCOL_VERSION).type.toBe<1>();
    expect(Terminal.makeTerminal).type.toBeAssignableTo<
      (options: Terminal.MakeTerminalOptions) => Terminal.AcpTerminal
    >();
  });

  it("preserves generated schema value and type exports", () => {
    const request = Schema.InitializeRequest.make({
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: "beep", version: "0.0.0" },
      protocolVersion: 1,
    });

    expect(request).type.toBe<Schema.InitializeRequest>();
    expect(Schema.PROTOCOL_VERSION).type.toBe<1>();
  });

  it("preserves client and agent service channels", () => {
    expect(client.agent.initialize).type.toBeAssignableTo<
      (payload: Schema.InitializeRequest) => Effect.Effect<Schema.InitializeResponse, Errors.AcpError>
    >();
    expect(client.raw.notifications).type.toBe<Stream.Stream<Protocol.AcpIncomingNotification>>();
    expect(agent.client.requestPermission).type.toBeAssignableTo<
      (payload: Schema.RequestPermissionRequest) => Effect.Effect<Schema.RequestPermissionResponse, Errors.AcpError>
    >();
    expect(agent.raw.request("x/test", {})).type.toBe<Effect.Effect<unknown, Errors.AcpError>>();
    expect(Agent.layer).type.toBeAssignableTo<
      (stdio: Stdio.Stdio, options?: Agent.AcpAgentOptions) => Layer.Layer<Agent.AcpAgent>
    >();
    expect(Client.layerChildProcess).type.toBeAssignableTo<
      (
        handle: ChildProcessSpawner.ChildProcessHandle,
        options?: Client.AcpClientOptions
      ) => Layer.Layer<Client.AcpClient>
    >();
  });

  it("preserves typed ACP errors and terminal handles", () => {
    const error = Errors.AcpRequestError.methodNotFound("x/missing");

    expect(error).type.toBe<Errors.AcpRequestError>();
    expect(error).type.toBeAssignableTo<Errors.AcpError>();
    expect(terminal.kill).type.toBe<Effect.Effect<Schema.KillTerminalResponse, Errors.AcpError>>();
  });
});
