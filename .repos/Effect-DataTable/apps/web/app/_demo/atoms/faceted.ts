"use client"

import { Effect } from "effect"
import { FacetedService } from "../services/FacetedService"
import { demoRuntime } from "./runtime"

// Faceted label counts atom
export const facetedLabelsAtom = demoRuntime.atom(
  Effect.flatMap(FacetedService, (svc) => svc.getLabelCounts)
)

// Faceted status counts atom
export const facetedStatusesAtom = demoRuntime.atom(
  Effect.flatMap(FacetedService, (svc) => svc.getStatusCounts)
)

// Faceted user counts atom
export const facetedUsersAtom = demoRuntime.atom(
  Effect.flatMap(FacetedService, (svc) => svc.getUserCounts)
)

// Faceted hours range atom
export const facetedHoursAtom = demoRuntime.atom(
  Effect.flatMap(FacetedService, (svc) => svc.getHoursRange)
)
