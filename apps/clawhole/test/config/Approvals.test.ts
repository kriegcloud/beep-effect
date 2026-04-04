import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  ApprovalsConfig,
  ExecApprovalForwardingConfig,
  ExecApprovalForwardingMode,
  ExecApprovalForwardTarget,
  NativeExecApprovalEnableMode,
} from "../../src/config/Approvals.ts";

const strictParseOptions = { onExcessProperty: "error" } as const;

const decodeApprovalsConfig = S.decodeUnknownSync(ApprovalsConfig);
const decodeExecApprovalForwardTarget = S.decodeUnknownSync(ExecApprovalForwardTarget);
const decodeExecApprovalForwardingConfig = S.decodeUnknownSync(ExecApprovalForwardingConfig);
const decodeExecApprovalForwardingMode = S.decodeUnknownSync(ExecApprovalForwardingMode);
const decodeNativeExecApprovalEnableMode = S.decodeUnknownSync(NativeExecApprovalEnableMode);
const isNativeExecApprovalEnableMode = S.is(NativeExecApprovalEnableMode);

describe("Approval schemas", () => {
  it("decodes a minimal approvals config and leaves optional sections unset", () => {
    const approvals = decodeApprovalsConfig({});

    expect(approvals).toBeInstanceOf(ApprovalsConfig);
    expect(approvals.exec).toEqual(O.none());
    expect(approvals.plugin).toEqual(O.none());
  });

  it("decodes forwarding configs with omitted fields as Option.none", () => {
    const forwarding = decodeExecApprovalForwardingConfig({});

    expect(forwarding).toBeInstanceOf(ExecApprovalForwardingConfig);
    expect(forwarding.enabled).toEqual(O.none());
    expect(forwarding.mode).toEqual(O.none());
    expect(forwarding.agentFilter).toEqual(O.none());
    expect(forwarding.sessionFilter).toEqual(O.none());
    expect(forwarding.targets).toEqual(O.none());
  });

  it("decodes forwarding targets and nested top-level approvals config", () => {
    const approvals = decodeApprovalsConfig({
      exec: {
        enabled: true,
        mode: "both",
        agentFilter: ["agent-1"],
        sessionFilter: ["session-key"],
        targets: [
          {
            channel: "slack",
            to: "C123",
            accountId: "workspace-1",
            threadId: 42,
          },
          {
            channel: "discord",
            to: "U123",
            threadId: "thread-1",
          },
        ],
      },
    });

    expect(O.isSome(approvals.exec)).toBe(true);
    expect(O.isNone(approvals.plugin)).toBe(true);

    if (O.isSome(approvals.exec)) {
      const exec = approvals.exec.value;

      expect(exec.enabled).toEqual(O.some(true));
      expect(exec.mode).toEqual(O.some("both"));
      expect(exec.agentFilter).toEqual(O.some(["agent-1"]));
      expect(exec.sessionFilter).toEqual(O.some(["session-key"]));

      expect(O.isSome(exec.targets)).toBe(true);
      if (O.isSome(exec.targets)) {
        const [first, second] = exec.targets.value;

        expect(first).toBeInstanceOf(ExecApprovalForwardTarget);
        expect(first.channel).toBe("slack");
        expect(first.to).toBe("C123");
        expect(first.accountId).toEqual(O.some("workspace-1"));
        expect(first.threadId).toEqual(O.some(42));

        expect(second).toBeInstanceOf(ExecApprovalForwardTarget);
        expect(second.threadId).toEqual(O.some("thread-1"));
      }
    }
  });

  it("accepts all documented forwarding modes", () => {
    expect(decodeExecApprovalForwardingMode("session")).toBe("session");
    expect(decodeExecApprovalForwardingMode("targets")).toBe("targets");
    expect(decodeExecApprovalForwardingMode("both")).toBe("both");
  });

  it("accepts boolean and auto native enable modes via decoder and derived guard", () => {
    expect(decodeNativeExecApprovalEnableMode(true)).toBe(true);
    expect(decodeNativeExecApprovalEnableMode(false)).toBe(false);
    expect(decodeNativeExecApprovalEnableMode("auto")).toBe("auto");

    expect(isNativeExecApprovalEnableMode(true)).toBe(true);
    expect(isNativeExecApprovalEnableMode(false)).toBe(true);
    expect(isNativeExecApprovalEnableMode("auto")).toBe(true);
    expect(isNativeExecApprovalEnableMode("session")).toBe(false);
  });

  it("rejects invalid forwarding modes", () => {
    expect(() =>
      decodeExecApprovalForwardingConfig({
        mode: "channel",
      })
    ).toThrow();
  });

  it("rejects empty target channel and destination values", () => {
    expect(() =>
      decodeExecApprovalForwardTarget({
        channel: "",
        to: "C123",
      })
    ).toThrow();

    expect(() =>
      decodeExecApprovalForwardTarget({
        channel: "slack",
        to: "",
      })
    ).toThrow();
  });

  it("rejects invalid threadId types", () => {
    expect(() =>
      decodeExecApprovalForwardTarget({
        channel: "slack",
        to: "C123",
        threadId: {},
      })
    ).toThrow();
  });

  it("rejects excess properties in strict mode", () => {
    expect(() =>
      decodeExecApprovalForwardTarget(
        {
          channel: "slack",
          to: "C123",
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeExecApprovalForwardingConfig(
        {
          enabled: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeApprovalsConfig(
        {
          exec: {
            enabled: true,
          },
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
