import { Layer } from "effect"
import { ReferenceServiceLive } from "../services/ReferenceService"
import { IssuesServiceLive } from "../services/IssuesService"
import { FacetedServiceLive } from "../services/FacetedService"

// Compose all demo services into a single layer
export const DemoLive = Layer.mergeAll(
  ReferenceServiceLive,
  IssuesServiceLive,
  FacetedServiceLive
)

// Export the service requirements type
export type DemoServices = Layer.Layer.Success<typeof DemoLive>
