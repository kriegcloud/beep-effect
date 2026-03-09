import { NextResponse } from "next/server"
import { getDocBySlug } from "@/lib/mdx"

export const dynamic = "force-static"
export const revalidate = 300

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = getDocBySlug(slug)

  if (!doc) {
    return NextResponse.json({ error: `Doc '${slug}' not found` }, { status: 404 })
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      doc,
    },
    {
      headers: {
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    },
  )
}
