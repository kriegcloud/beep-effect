import { getAllDocs } from "./mdx"

export interface OgSpec {
  slug: string
  title: string
  subtitle?: string
  background?: string
}

function buildDocSpecs(): OgSpec[] {
  const docs = getAllDocs()
  const docSpecs = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    subtitle: doc.description ?? "Best practices for applying Effect in production.",
  }))

  // Add home page spec
  const homeSpec: OgSpec = {
    slug: "home",
    title: "Effect Solutions",
    subtitle: "Best practices for building Effect TypeScript applications",
  }

  return [homeSpec, ...docSpecs]
}

export function getAllOgSpecs(): OgSpec[] {
  return buildDocSpecs()
}

export function getOgSpecBySlug(slug: string): OgSpec | null {
  const specs = getAllOgSpecs()
  return specs.find((spec) => spec.slug === slug) ?? null
}
