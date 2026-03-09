import Link from "next/link"
import { getAllDocs } from "@/lib/mdx"
import { DraftNote } from "./DraftNote"

export function DocTopicsList() {
  const allDocs = getAllDocs()
  const publishedDocs = allDocs.filter((doc) => !doc.draft)
  const draftDocs = allDocs.filter((doc) => doc.draft)

  return (
    <>
      {publishedDocs.map((doc) => (
        <div key={doc.slug} className="mx-6">
          <h3 className="text-lg font-semibold leading-snug text-neutral-200 mb-2">
            <Link href={`/${doc.slug}`} className="hover:text-neutral-100 transition-colors">
              {doc.title}
            </Link>
          </h3>
          {doc.description && <p className="text-[1.05rem] leading-relaxed text-neutral-300 mb-6">{doc.description}</p>}
        </div>
      ))}
      {draftDocs.length > 0 && (
        <DraftNote>
          {draftDocs.map((doc) => (
            <div key={doc.slug} className="mx-6">
              <h3 className="text-lg font-semibold leading-snug text-neutral-200 mb-2">
                <Link href={`/${doc.slug}`} className="hover:text-neutral-100 transition-colors">
                  {doc.title}
                </Link>
              </h3>
              {doc.description && (
                <p className="text-[1.05rem] leading-relaxed text-neutral-300 mb-6">{doc.description}</p>
              )}
            </div>
          ))}
        </DraftNote>
      )}
    </>
  )
}
