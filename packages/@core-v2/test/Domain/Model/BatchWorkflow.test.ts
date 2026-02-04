/**
 * Tests for Domain Model - BatchWorkflow State Transitions
 *
 * @module test/Domain/Model/BatchWorkflow
 */

import { describe, expect, it } from "vitest"
import type { BatchStage } from "../../../src/Domain/Model/BatchWorkflow.js"
import {
  canFail,
  getValidNextStates,
  isValidStateTransition,
  isValidTransition,
  VALID_TRANSITIONS,
  validateTransition
} from "../../../src/Domain/Model/BatchWorkflow.js"

describe("BatchWorkflow State Transitions", () => {
  describe("VALID_TRANSITIONS map", () => {
    it("should define all stages", () => {
      const stages: Array<BatchStage> = [
        "Pending",
        "Preprocessing",
        "Extracting",
        "Resolving",
        "Validating",
        "Ingesting",
        "Complete",
        "Failed"
      ]

      for (const stage of stages) {
        expect(VALID_TRANSITIONS[stage]).toBeDefined()
      }
    })

    it("should have terminal states with empty transitions", () => {
      expect(VALID_TRANSITIONS.Complete).toEqual([])
      expect(VALID_TRANSITIONS.Failed).toEqual([])
    })

    it("should allow all non-terminal states to fail", () => {
      const nonTerminalStages: Array<BatchStage> = [
        "Pending",
        "Preprocessing",
        "Extracting",
        "Resolving",
        "Validating",
        "Ingesting"
      ]

      for (const stage of nonTerminalStages) {
        expect(VALID_TRANSITIONS[stage]).toContain("Failed")
      }
    })
  })

  describe("isValidTransition", () => {
    it("should allow same-state transitions (progress updates)", () => {
      expect(isValidTransition("Extracting", "Extracting")).toBe(true)
      expect(isValidTransition("Ingesting", "Ingesting")).toBe(true)
    })

    it("should allow Pending → Preprocessing", () => {
      expect(isValidTransition("Pending", "Preprocessing")).toBe(true)
    })

    it("should allow Preprocessing → Extracting", () => {
      expect(isValidTransition("Preprocessing", "Extracting")).toBe(true)
    })

    it("should allow Extracting → Resolving", () => {
      expect(isValidTransition("Extracting", "Resolving")).toBe(true)
    })

    it("should allow Resolving → Validating", () => {
      expect(isValidTransition("Resolving", "Validating")).toBe(true)
    })

    it("should allow Validating → Ingesting", () => {
      expect(isValidTransition("Validating", "Ingesting")).toBe(true)
    })

    it("should allow Ingesting → Complete", () => {
      expect(isValidTransition("Ingesting", "Complete")).toBe(true)
    })

    it("should allow any non-terminal state → Failed", () => {
      expect(isValidTransition("Pending", "Failed")).toBe(true)
      expect(isValidTransition("Preprocessing", "Failed")).toBe(true)
      expect(isValidTransition("Extracting", "Failed")).toBe(true)
      expect(isValidTransition("Resolving", "Failed")).toBe(true)
      expect(isValidTransition("Validating", "Failed")).toBe(true)
      expect(isValidTransition("Ingesting", "Failed")).toBe(true)
    })

    it("should reject skipping stages", () => {
      expect(isValidTransition("Pending", "Extracting")).toBe(false) // Must go through Preprocessing
      expect(isValidTransition("Pending", "Validating")).toBe(false)
      expect(isValidTransition("Extracting", "Complete")).toBe(false)
      expect(isValidTransition("Pending", "Ingesting")).toBe(false)
      expect(isValidTransition("Preprocessing", "Resolving")).toBe(false) // Must go through Extracting
    })

    it("should reject transitions from terminal states", () => {
      expect(isValidTransition("Complete", "Failed")).toBe(false)
      expect(isValidTransition("Complete", "Extracting")).toBe(false)
      expect(isValidTransition("Failed", "Pending")).toBe(false)
      expect(isValidTransition("Failed", "Complete")).toBe(false)
    })

    it("should reject backward transitions", () => {
      expect(isValidTransition("Extracting", "Pending")).toBe(false)
      expect(isValidTransition("Validating", "Extracting")).toBe(false)
      expect(isValidTransition("Complete", "Ingesting")).toBe(false)
    })
  })

  describe("validateTransition", () => {
    it("should return undefined for valid transitions", () => {
      expect(validateTransition("Pending", "Preprocessing")).toBeUndefined()
      expect(validateTransition("Preprocessing", "Extracting")).toBeUndefined()
      expect(validateTransition("Extracting", "Failed")).toBeUndefined()
      expect(validateTransition("Extracting", "Extracting")).toBeUndefined()
    })

    it("should return error message for invalid transitions", () => {
      const error = validateTransition("Pending", "Validating")
      expect(error).toBeDefined()
      expect(error).toContain("Invalid transition")
      expect(error).toContain("Pending → Validating")
      expect(error).toContain("Valid targets:")
    })

    it("should return terminal state message for Complete", () => {
      const error = validateTransition("Complete", "Failed")
      expect(error).toBeDefined()
      expect(error).toContain("terminal state")
    })

    it("should return terminal state message for Failed", () => {
      const error = validateTransition("Failed", "Pending")
      expect(error).toBeDefined()
      expect(error).toContain("terminal state")
    })
  })

  describe("isValidStateTransition", () => {
    it("should validate using state objects", () => {
      const pendingState = { _tag: "Pending" } as const
      const preprocessingState = { _tag: "Preprocessing" } as const
      const extractingState = { _tag: "Extracting" } as const
      const failedState = { _tag: "Failed" } as const

      // Valid: Pending → Preprocessing
      expect(
        isValidStateTransition(pendingState as any, preprocessingState as any)
      ).toBe(true)

      // Valid: Preprocessing → Extracting
      expect(
        isValidStateTransition(preprocessingState as any, extractingState as any)
      ).toBe(true)

      // Invalid: Pending → Extracting (must go through Preprocessing)
      expect(
        isValidStateTransition(pendingState as any, extractingState as any)
      ).toBe(false)

      // Valid: Pending → Failed (failing is always valid from non-terminal)
      expect(
        isValidStateTransition(pendingState as any, failedState as any)
      ).toBe(true)

      // Invalid (from terminal)
      expect(
        isValidStateTransition(failedState as any, pendingState as any)
      ).toBe(false)
    })
  })

  describe("getValidNextStates", () => {
    it("should return correct next states for Pending", () => {
      expect(getValidNextStates("Pending")).toEqual(["Preprocessing", "Failed"])
    })

    it("should return correct next states for Preprocessing", () => {
      expect(getValidNextStates("Preprocessing")).toEqual(["Extracting", "Failed"])
    })

    it("should return correct next states for Extracting", () => {
      expect(getValidNextStates("Extracting")).toEqual(["Resolving", "Failed"])
    })

    it("should return empty array for terminal states", () => {
      expect(getValidNextStates("Complete")).toEqual([])
      expect(getValidNextStates("Failed")).toEqual([])
    })
  })

  describe("canFail", () => {
    it("should return true for non-terminal states", () => {
      expect(canFail("Pending")).toBe(true)
      expect(canFail("Preprocessing")).toBe(true)
      expect(canFail("Extracting")).toBe(true)
      expect(canFail("Resolving")).toBe(true)
      expect(canFail("Validating")).toBe(true)
      expect(canFail("Ingesting")).toBe(true)
    })

    it("should return false for terminal states", () => {
      expect(canFail("Complete")).toBe(false)
      expect(canFail("Failed")).toBe(false)
    })
  })
})
