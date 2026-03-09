import { NextResponse } from "next/server"
import { getDocSearchDocuments, serializeSearchDocuments } from "@/lib/doc-search"

export const revalidate = 300

export async function GET() {
  const documents = serializeSearchDocuments(getDocSearchDocuments())
  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      count: documents.length,
      documents,
    },
    {
      headers: {
        "cache-control": "public, max-age=300, s-maxage=300",
      },
    },
  )
}
