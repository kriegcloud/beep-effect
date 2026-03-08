import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import {
  BridgeCall,
  ExecError,
  ExecRequest,
  ExecResult,
  GetVarResult,
  HostToWorker,
  Init,
  ListVarsRequest,
  ListVarsResult,
  SetVar,
  checkFrameSize,
  decodeWorkerToHost
} from "../src/SandboxProtocol"

describe("SandboxProtocol", () => {
  describe("HostToWorker", () => {
    const decode = Schema.decodeUnknownSync(HostToWorker)

    test("decodes ExecRequest", () => {
      const msg = decode({ _tag: "ExecRequest", requestId: "r1", code: "1+1" })
      expect(msg._tag).toBe("ExecRequest")
      expect((msg as typeof ExecRequest.Type).code).toBe("1+1")
    })

    test("decodes SetVar", () => {
      const msg = decode({ _tag: "SetVar", requestId: "r2", name: "x", value: 42 })
      expect(msg._tag).toBe("SetVar")
      expect((msg as typeof SetVar.Type).value).toBe(42)
    })

    test("decodes GetVarRequest", () => {
      const msg = decode({ _tag: "GetVarRequest", requestId: "r3", name: "x" })
      expect(msg._tag).toBe("GetVarRequest")
    })

    test("decodes ListVarsRequest", () => {
      const msg = decode({ _tag: "ListVarsRequest", requestId: "r3b" })
      expect(msg._tag).toBe("ListVarsRequest")
      expect((msg as typeof ListVarsRequest.Type).requestId).toBe("r3b")
    })

    test("decodes BridgeResult", () => {
      const msg = decode({ _tag: "BridgeResult", requestId: "r4", result: "hello" })
      expect(msg._tag).toBe("BridgeResult")
    })

    test("decodes BridgeFailed", () => {
      const msg = decode({ _tag: "BridgeFailed", requestId: "r5", message: "boom" })
      expect(msg._tag).toBe("BridgeFailed")
    })

    test("decodes Init", () => {
      const msg = decode({ _tag: "Init", callId: "c1", depth: 0 })
      expect(msg._tag).toBe("Init")
      expect((msg as typeof Init.Type).depth).toBe(0)
    })

    test("decodes Shutdown", () => {
      const msg = decode({ _tag: "Shutdown" })
      expect(msg._tag).toBe("Shutdown")
    })

    test("rejects unknown tag", () => {
      expect(() => decode({ _tag: "Unknown", requestId: "r1" })).toThrow()
    })

    test("rejects missing required fields", () => {
      expect(() => decode({ _tag: "ExecRequest" })).toThrow()
    })
  })

  describe("WorkerToHost", () => {
    test("decodes ExecResult", () => {
      const msg = decodeWorkerToHost({ _tag: "ExecResult", requestId: "r1", output: "42" })
      expect(msg._tag).toBe("ExecResult")
      expect((msg as typeof ExecResult.Type).output).toBe("42")
    })

    test("decodes ExecError", () => {
      const msg = decodeWorkerToHost({ _tag: "ExecError", requestId: "r1", message: "fail" })
      expect(msg._tag).toBe("ExecError")
    })

    test("decodes ExecError with optional stack", () => {
      const msg = decodeWorkerToHost({ _tag: "ExecError", requestId: "r1", message: "fail", stack: "at line 1" })
      expect((msg as typeof ExecError.Type).stack).toBe("at line 1")
    })

    test("decodes SetVarAck", () => {
      const msg = decodeWorkerToHost({ _tag: "SetVarAck", requestId: "r1" })
      expect(msg._tag).toBe("SetVarAck")
    })

    test("decodes SetVarError", () => {
      const msg = decodeWorkerToHost({ _tag: "SetVarError", requestId: "r1", message: "nope" })
      expect(msg._tag).toBe("SetVarError")
    })

    test("decodes GetVarResult", () => {
      const msg = decodeWorkerToHost({ _tag: "GetVarResult", requestId: "r1", value: [1, 2, 3] })
      expect(msg._tag).toBe("GetVarResult")
      expect((msg as typeof GetVarResult.Type).value).toEqual([1, 2, 3])
    })

    test("decodes ListVarsResult", () => {
      const msg = decodeWorkerToHost({
        _tag: "ListVarsResult",
        requestId: "r1",
        variables: [
          { name: "foo", type: "string", size: 3, preview: "bar" },
          { name: "count", type: "number", preview: "42" }
        ]
      })
      expect(msg._tag).toBe("ListVarsResult")
      expect((msg as typeof ListVarsResult.Type).variables).toEqual([
        { name: "foo", type: "string", size: 3, preview: "bar" },
        { name: "count", type: "number", preview: "42" }
      ])
    })

    test("decodes BridgeCall", () => {
      const msg = decodeWorkerToHost({ _tag: "BridgeCall", requestId: "r1", method: "llm_query", args: ["hello"] })
      expect(msg._tag).toBe("BridgeCall")
      expect((msg as typeof BridgeCall.Type).args).toEqual(["hello"])
    })

    test("decodes WorkerLog", () => {
      const msg = decodeWorkerToHost({ _tag: "WorkerLog", level: "info", message: "hi" })
      expect(msg._tag).toBe("WorkerLog")
    })

    test("rejects invalid log level", () => {
      expect(() => decodeWorkerToHost({ _tag: "WorkerLog", level: "trace", message: "hi" })).toThrow()
    })

    test("rejects unknown tag", () => {
      expect(() => decodeWorkerToHost({ _tag: "Bogus" })).toThrow()
    })
  })

  describe("checkFrameSize", () => {
    test("accepts message within limit", () => {
      expect(checkFrameSize({ hello: "world" }, 1024)).toBe(true)
    })

    test("rejects message exceeding limit", () => {
      const big = { data: "x".repeat(100) }
      // JSON is roughly 110+ bytes for this
      expect(checkFrameSize(big, 50)).toBe(false)
    })

    test("counts bytes not characters for multibyte", () => {
      // Each emoji is 4 bytes in UTF-8
      const msg = { data: "\u{1F600}".repeat(10) }
      const json = JSON.stringify(msg)
      const byteLength = new TextEncoder().encode(json).byteLength
      // Should reject if limit is less than byte count
      expect(checkFrameSize(msg, byteLength - 1)).toBe(false)
      expect(checkFrameSize(msg, byteLength)).toBe(true)
    })

    test("returns false for BigInt (non-serializable)", () => {
      expect(checkFrameSize({ value: BigInt(42) }, 1024)).toBe(false)
    })

    test("returns false for circular reference", () => {
      const obj: Record<string, unknown> = { a: 1 }
      obj.self = obj
      expect(checkFrameSize(obj, 1024)).toBe(false)
    })
  })

  describe("Init with maxFrameBytes", () => {
    const decode = Schema.decodeUnknownSync(HostToWorker)

    test("decodes Init with maxFrameBytes", () => {
      const msg = decode({ _tag: "Init", callId: "c1", depth: 0, maxFrameBytes: 8192 })
      expect(msg._tag).toBe("Init")
      expect((msg as typeof Init.Type).maxFrameBytes).toBe(8192)
    })

    test("decodes Init without maxFrameBytes (optional)", () => {
      const msg = decode({ _tag: "Init", callId: "c1", depth: 0 })
      expect(msg._tag).toBe("Init")
      expect((msg as typeof Init.Type).maxFrameBytes).toBeUndefined()
    })

    test("rejects Init with non-integer maxFrameBytes", () => {
      expect(() => decode({ _tag: "Init", callId: "c1", depth: 0, maxFrameBytes: 1.5 })).toThrow()
    })

    test("rejects Init with negative maxFrameBytes", () => {
      expect(() => decode({ _tag: "Init", callId: "c1", depth: 0, maxFrameBytes: -1 })).toThrow()
    })

    test("rejects Init with maxFrameBytes exceeding 64MB", () => {
      expect(() => decode({ _tag: "Init", callId: "c1", depth: 0, maxFrameBytes: 65 * 1024 * 1024 })).toThrow()
    })
  })

  describe("Init with sandboxMode", () => {
    const decode = Schema.decodeUnknownSync(HostToWorker)

    test("decodes Init with strict sandboxMode", () => {
      const msg = decode({ _tag: "Init", callId: "c1", depth: 0, sandboxMode: "strict" })
      expect(msg._tag).toBe("Init")
      expect((msg as typeof Init.Type).sandboxMode).toBe("strict")
    })

    test("decodes Init with permissive sandboxMode", () => {
      const msg = decode({ _tag: "Init", callId: "c1", depth: 0, sandboxMode: "permissive" })
      expect(msg._tag).toBe("Init")
      expect((msg as typeof Init.Type).sandboxMode).toBe("permissive")
    })

    test("rejects Init with invalid sandboxMode", () => {
      expect(() => decode({ _tag: "Init", callId: "c1", depth: 0, sandboxMode: "locked" })).toThrow()
    })
  })
})
