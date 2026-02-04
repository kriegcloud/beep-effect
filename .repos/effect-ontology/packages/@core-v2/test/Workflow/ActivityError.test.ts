// packages/@core-v2/test/Workflow/ActivityError.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { ActivityError, notFoundError, serviceError, toActivityError } from "../../src/Domain/Error/Activity.js"

describe("ActivityError", () => {
  it("should serialize and deserialize correctly", () => {
    const error: typeof ActivityError.Type = {
      _tag: "ActivityServiceFailure",
      service: "StorageService",
      operation: "get",
      message: "Object not found",
      retryable: true
    }

    const json = JSON.stringify(error)
    const parsed = JSON.parse(json)
    const decoded = Schema.decodeUnknownSync(ActivityError)(parsed)

    expect(decoded._tag).toBe("ActivityServiceFailure")
    if (decoded._tag === "ActivityServiceFailure") {
      expect(decoded.retryable).toBe(true)
    }
  })

  it("toActivityError should wrap unknown errors", () => {
    const error = toActivityError(new Error("Something failed"))

    expect(error._tag).toBe("ActivityGeneric")
    expect(error.message).toBe("Something failed")
  })

  it("serviceError should create proper structure", () => {
    const error = serviceError("OntologyService", "searchClasses", new Error("Connection failed"), true)

    expect(error._tag).toBe("ActivityServiceFailure")
    if (error._tag === "ActivityServiceFailure") {
      expect(error.service).toBe("OntologyService")
      expect(error.retryable).toBe(true)
    }
  })

  it("notFoundError should create proper structure", () => {
    const error = notFoundError("Document", "doc-123")

    expect(error._tag).toBe("ActivityNotFound")
    if (error._tag === "ActivityNotFound") {
      expect(error.resourceId).toBe("doc-123")
    }
  })
})
