import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import {
  ExternalServiceRecord,
  IntegrationRecord,
  ServiceCapability,
  ServicePromptCapability,
  ServiceResourceCapability,
  ServiceToolCapability
} from "../src/integration.js"

describe("ServiceToolCapability", () => {
  it("decodes and encodes a valid capability", () => {
    const input = { _tag: "ServiceToolCapability" as const, name: "read_file", description: "Reads a file" }
    const decoded = Schema.decodeUnknownSync(ServiceToolCapability)(input)
    expect(decoded._tag).toBe("ServiceToolCapability")
    expect(decoded.name).toBe("read_file")
    expect(decoded.description).toBe("Reads a file")

    const encoded = Schema.encodeSync(ServiceToolCapability)(decoded)
    expect(encoded).toEqual(input)
  })

  it("decodes without optional description", () => {
    const input = { _tag: "ServiceToolCapability" as const, name: "list_dir" }
    const decoded = Schema.decodeUnknownSync(ServiceToolCapability)(input)
    expect(decoded._tag).toBe("ServiceToolCapability")
    expect(decoded.name).toBe("list_dir")
    expect(decoded.description).toBeUndefined()
  })

  it("rejects missing name", () => {
    expect(() => Schema.decodeUnknownSync(ServiceToolCapability)({ _tag: "ServiceToolCapability" })).toThrow()
  })
})

describe("ServiceResourceCapability", () => {
  it("decodes and encodes with all fields", () => {
    const input = {
      _tag: "ServiceResourceCapability" as const,
      name: "config",
      description: "Config resource",
      uri: "resource://config/main"
    }
    const decoded = Schema.decodeUnknownSync(ServiceResourceCapability)(input)
    expect(decoded._tag).toBe("ServiceResourceCapability")
    expect(decoded.name).toBe("config")
    expect(decoded.description).toBe("Config resource")
    expect(decoded.uri).toBe("resource://config/main")

    const encoded = Schema.encodeSync(ServiceResourceCapability)(decoded)
    expect(encoded).toEqual(input)
  })

  it("decodes with optional uri omitted", () => {
    const input = { _tag: "ServiceResourceCapability" as const, name: "data" }
    const decoded = Schema.decodeUnknownSync(ServiceResourceCapability)(input)
    expect(decoded.uri).toBeUndefined()
    expect(decoded.description).toBeUndefined()
  })
})

describe("ServicePromptCapability", () => {
  it("decodes and encodes a valid prompt capability", () => {
    const input = {
      _tag: "ServicePromptCapability" as const,
      name: "summarize",
      description: "Summarize text"
    }
    const decoded = Schema.decodeUnknownSync(ServicePromptCapability)(input)
    expect(decoded._tag).toBe("ServicePromptCapability")
    expect(decoded.name).toBe("summarize")
    expect(decoded.description).toBe("Summarize text")

    const encoded = Schema.encodeSync(ServicePromptCapability)(decoded)
    expect(encoded).toEqual(input)
  })

  it("decodes without optional description", () => {
    const input = { _tag: "ServicePromptCapability" as const, name: "generate" }
    const decoded = Schema.decodeUnknownSync(ServicePromptCapability)(input)
    expect(decoded.description).toBeUndefined()
  })
})

describe("ServiceCapability (Union)", () => {
  it("decodes each variant via the union", () => {
    const tool = Schema.decodeUnknownSync(ServiceCapability)({
      _tag: "ServiceToolCapability",
      name: "tool1"
    })
    expect(tool._tag).toBe("ServiceToolCapability")

    const resource = Schema.decodeUnknownSync(ServiceCapability)({
      _tag: "ServiceResourceCapability",
      name: "res1",
      uri: "resource://res1"
    })
    expect(resource._tag).toBe("ServiceResourceCapability")

    const prompt = Schema.decodeUnknownSync(ServiceCapability)({
      _tag: "ServicePromptCapability",
      name: "prompt1"
    })
    expect(prompt._tag).toBe("ServicePromptCapability")
  })

  it("rejects an unknown _tag", () => {
    expect(() =>
      Schema.decodeUnknownSync(ServiceCapability)({
        _tag: "UnknownCapability",
        name: "nope"
      })
    ).toThrow()
  })
})

describe("ExternalServiceRecord", () => {
  const validService = {
    serviceId: "svc-1",
    name: "MCP Filesystem",
    endpoint: "/usr/local/bin/mcp-fs",
    transport: "stdio" as const,
    identifier: "mcp-filesystem",
    createdAt: "2026-02-25T10:00:00Z"
  }

  it("decodes and encodes a valid record", () => {
    const decoded = Schema.decodeUnknownSync(ExternalServiceRecord)(validService)
    expect(decoded.serviceId).toBe("svc-1")
    expect(decoded.name).toBe("MCP Filesystem")
    expect(decoded.endpoint).toBe("/usr/local/bin/mcp-fs")
    expect(decoded.transport).toBe("stdio")
    expect(decoded.identifier).toBe("mcp-filesystem")

    const encoded = Schema.encodeSync(ExternalServiceRecord)(decoded)
    expect(encoded.serviceId).toBe("svc-1")
    expect(encoded.name).toBe("MCP Filesystem")
    expect(encoded.transport).toBe("stdio")
    expect(encoded.createdAt).toBe("2026-02-25T10:00:00.000Z")
  })

  it("accepts all transport types", () => {
    for (const transport of ["stdio", "sse", "http"] as const) {
      const decoded = Schema.decodeUnknownSync(ExternalServiceRecord)({
        ...validService,
        transport
      })
      expect(decoded.transport).toBe(transport)
    }
  })

  it("rejects an unknown transport", () => {
    expect(() =>
      Schema.decodeUnknownSync(ExternalServiceRecord)({
        ...validService,
        transport: "grpc"
      })
    ).toThrow()
  })

  it("rejects missing required fields", () => {
    expect(() =>
      Schema.decodeUnknownSync(ExternalServiceRecord)({
        serviceId: "svc-1"
      })
    ).toThrow()
  })
})

describe("IntegrationRecord", () => {
  const validIntegration = {
    integrationId: "int-1",
    agentId: "agent-1",
    serviceId: "svc-1",
    status: "Connected" as const,
    capabilities: [
      { _tag: "ServiceToolCapability" as const, name: "read_file", description: "Read a file" },
      { _tag: "ServiceResourceCapability" as const, name: "config", uri: "resource://config" },
      { _tag: "ServicePromptCapability" as const, name: "summarize" }
    ],
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-02-25T12:00:00Z"
  }

  it("decodes and encodes with mixed capability types", () => {
    const decoded = Schema.decodeUnknownSync(IntegrationRecord)(validIntegration)
    expect(decoded.integrationId).toBe("int-1")
    expect(decoded.agentId).toBe("agent-1")
    expect(decoded.serviceId).toBe("svc-1")
    expect(decoded.status).toBe("Connected")
    expect(decoded.capabilities).toHaveLength(3)
    expect(decoded.capabilities[0]._tag).toBe("ServiceToolCapability")
    expect(decoded.capabilities[1]._tag).toBe("ServiceResourceCapability")
    expect(decoded.capabilities[2]._tag).toBe("ServicePromptCapability")

    const encoded = Schema.encodeSync(IntegrationRecord)(decoded)
    expect(encoded.integrationId).toBe("int-1")
    expect(encoded.capabilities).toHaveLength(3)
    expect(encoded.createdAt).toBe("2026-02-25T10:00:00.000Z")
    expect(encoded.updatedAt).toBe("2026-02-25T12:00:00.000Z")
  })

  it("decodes with empty capabilities array", () => {
    const decoded = Schema.decodeUnknownSync(IntegrationRecord)({
      ...validIntegration,
      capabilities: []
    })
    expect(decoded.capabilities).toHaveLength(0)
  })

  it("accepts all integration statuses", () => {
    for (const status of ["Connected", "Disconnected", "Error", "Initializing"] as const) {
      const decoded = Schema.decodeUnknownSync(IntegrationRecord)({
        ...validIntegration,
        status
      })
      expect(decoded.status).toBe(status)
    }
  })

  it("rejects an invalid status", () => {
    expect(() =>
      Schema.decodeUnknownSync(IntegrationRecord)({
        ...validIntegration,
        status: "Pending"
      })
    ).toThrow()
  })

  it("rejects missing required fields", () => {
    expect(() =>
      Schema.decodeUnknownSync(IntegrationRecord)({
        integrationId: "int-1"
      })
    ).toThrow()
  })

  it("rejects invalid capability in array", () => {
    expect(() =>
      Schema.decodeUnknownSync(IntegrationRecord)({
        ...validIntegration,
        capabilities: [{ _tag: "InvalidCapability", name: "bad" }]
      })
    ).toThrow()
  })
})
