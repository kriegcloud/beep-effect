export interface SchemaPromptField {
  readonly name: string
  readonly type: string
  readonly optional: boolean
  readonly description?: string | undefined
}

export interface SchemaPromptSection {
  readonly identifier: string
  readonly description?: string | undefined
  readonly fields: ReadonlyArray<SchemaPromptField>
  readonly examples: ReadonlyArray<unknown>
}

export interface SchemaPromptDefinition {
  readonly description: string
  readonly sections: ReadonlyArray<SchemaPromptSection>
}

const renderField = (field: SchemaPromptField): string => {
  const requiredLabel = field.optional ? "optional" : "required"
  if (field.description !== undefined && field.description.length > 0) {
    return `  - ${field.name} (${field.type}, ${requiredLabel}): ${field.description}`
  }
  return `  - ${field.name} (${field.type}, ${requiredLabel})`
}

const renderSection = (section: SchemaPromptSection): string => {
  const header =
    section.description !== undefined && section.description.length > 0
      ? `**${section.identifier}**: ${section.description}`
      : `**${section.identifier}**`

  const fields = section.fields.map(renderField).join("\n")
  const examples =
    section.examples.length === 0
      ? ""
      : [
          "  - examples:",
          ...section.examples.map((example) => `    - ${JSON.stringify(example)}`)
        ].join("\n")

  return [header, fields, examples].filter((part) => part.length > 0).join("\n")
}

export const buildSchemaPromptDescription = (
  definition: SchemaPromptDefinition
): string => {
  const sections = definition.sections.map(renderSection).join("\n\n")
  return [
    definition.description,
    "",
    "Extract entities using the following schema classes.",
    "Return JSON with this shape:",
    '{"extractions":[{"extractionClass":"<class>","extractionText":"<verbatim span>","data":{...}}]}',
    "",
    sections
  ]
    .filter((part) => part.length > 0)
    .join("\n")
}
