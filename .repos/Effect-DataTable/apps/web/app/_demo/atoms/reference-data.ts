"use client"

import { Effect } from "effect"
import { ReferenceService } from "../services/ReferenceService"
import { demoRuntime } from "./runtime"

// Labels atom - fetches and caches labels
export const labelsAtom = demoRuntime.atom(
  Effect.flatMap(ReferenceService, (svc) => svc.getLabels)
)

// Statuses atom - fetches and caches statuses
export const statusesAtom = demoRuntime.atom(
  Effect.flatMap(ReferenceService, (svc) => svc.getStatuses)
)

// Users atom - fetches and caches users
export const usersAtom = demoRuntime.atom(
  Effect.flatMap(ReferenceService, (svc) => svc.getUsers)
)
