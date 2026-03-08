import { describe, test } from "bun:test"
import * as FC from "effect/FastCheck"
import * as Arbitrary from "effect/Arbitrary"
import { Schema } from "effect"
import {
  checkFrameSize,
  HostToWorker,
  WorkerToHost,
  decodeWorkerToHost
} from "../../src/SandboxProtocol"
import { assertProperty } from "./helpers/property"

const encodeByteLength = (value: unknown): number | null => {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength
  } catch {
    return null
  }
}

describe("SandboxProtocol properties", () => {
  test("prop: checkFrameSize matches UTF-8 JSON byte-length semantics", () => {
    assertProperty(
      FC.property(
        Arbitrary.make(HostToWorker),
        FC.integer({ min: 0, max: 32_768 }),
        (message, maxBytes) => {
          const bytes = encodeByteLength(message)
          return bytes === null
            ? checkFrameSize(message, maxBytes) === false
            : checkFrameSize(message, maxBytes) === (bytes <= maxBytes)
        }
      )
    )
  })

  test("prop: checkFrameSize is monotonic in maxBytes", () => {
    assertProperty(
      FC.property(
        Arbitrary.make(HostToWorker),
        FC.integer({ min: 0, max: 32_767 }),
        (message, maxBytes) => {
          if (!checkFrameSize(message, maxBytes)) return true
          return checkFrameSize(message, maxBytes + 1)
        }
      )
    )
  })

  test("prop: HostToWorker arbitrary values decode under schema", () => {
    const decode = Schema.decodeUnknownSync(HostToWorker)
    assertProperty(
      FC.property(
        Arbitrary.make(HostToWorker),
        (message) => {
          const decoded = decode(message)
          return decoded._tag === message._tag
        }
      )
    )
  })

  test("prop: WorkerToHost arbitrary values decode via decodeWorkerToHost", () => {
    assertProperty(
      FC.property(
        Arbitrary.make(WorkerToHost),
        (message) => {
          const decoded = decodeWorkerToHost(message)
          return decoded._tag === message._tag
        }
      )
    )
  })
})

