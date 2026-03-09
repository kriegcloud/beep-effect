import { Console, Effect } from "effect"
import { getAllDocs } from "../../src/lib/mdx.js"
import { getOnlyFilter } from "./config.js"

// =============================================================================
// Types
// =============================================================================

export interface TemplateFields {
  slug: string
  title: string
  subtitle?: string
  background?: string
}

// =============================================================================
// Spec Building
// =============================================================================

const buildDocSpecs = (): TemplateFields[] => {
  const docs = getAllDocs()
  const docSpecs = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    subtitle: doc.description ?? "Best practices for applying Effect in production.",
  }))

  const homeSpec: TemplateFields = {
    slug: "home",
    title: "Effect Solutions",
    subtitle: "Best practices for building Effect TypeScript applications",
  }

  return [homeSpec, ...docSpecs]
}

const dedupeSpecs = (specs: TemplateFields[]): TemplateFields[] => {
  const seen = new Set<string>()
  const unique: TemplateFields[] = []

  for (const spec of specs) {
    if (seen.has(spec.slug)) {
      console.warn(`Skipping duplicate OG slug: ${spec.slug}`)
      continue
    }
    seen.add(spec.slug)
    unique.push(spec)
  }

  return unique
}

export const pickSpecs = Effect.gen(function* () {
  const only = getOnlyFilter()
  const specs = dedupeSpecs(buildDocSpecs())

  if (only.length === 0) {
    return specs
  }

  const filtered = specs.filter((spec) => only.includes(spec.slug))
  if (filtered.length === 0) {
    yield* Console.warn(`No OG specs matched OG_ONLY filter (${only.join(", ")}). Falling back to complete set.`)
    return specs
  }

  return filtered
})
