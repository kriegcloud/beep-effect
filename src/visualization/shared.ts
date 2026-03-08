export interface SerializedExtraction {
  readonly index: number
  readonly extractionClass: string
  readonly extractionText: string
  readonly status: string
  readonly start: number
  readonly end: number
  readonly color: string
  readonly attributes: Readonly<Record<string, string | ReadonlyArray<string>>>
}

export interface VisualizationPayload {
  readonly animationSpeed: number
  readonly showLegend: boolean
  readonly extractions: ReadonlyArray<SerializedExtraction>
}
