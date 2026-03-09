import { getAllDocs } from "./mdx"

export function getAllOgSlugs(): string[] {
  return getAllDocs().map((doc) => doc.slug)
}

export function getOgSlugIndex(slug: string): number {
  const slugs = getAllOgSlugs()
  return slugs.indexOf(slug)
}

export function getNextOgSlug(currentSlug: string): string | null {
  const slugs = getAllOgSlugs()
  const currentIndex = slugs.indexOf(currentSlug)
  if (currentIndex === -1 || currentIndex === slugs.length - 1) {
    return null
  }
  return slugs[currentIndex + 1] ?? null
}

export function getPrevOgSlug(currentSlug: string): string | null {
  const slugs = getAllOgSlugs()
  const currentIndex = slugs.indexOf(currentSlug)
  if (currentIndex <= 0) {
    return null
  }
  return slugs[currentIndex - 1] ?? null
}
