import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { DocTocSidebar } from "@/components/DocTocSidebar"
import { FootnoteSidebar } from "@/components/FootnoteSidebar"
import { FootnoteArticleShell } from "@/components/mdx/FootnoteArticleShell"
import { dimensions } from "@/constants/dimensions"
import { SITE_DEPLOYMENT_URL } from "@/constants/urls"
import { FootnoteProvider } from "@/lib/footnote-context"
import { generateLLMInstructions } from "@/lib/llm-instructions"
import { getAllDocSlugs, getDocBySlug, normalizeDocSlug } from "@/lib/mdx"
import { remarkCodeHide } from "@/lib/remark-code-hide"
import { remarkHeadingIds } from "@/lib/remark-heading-ids"
import { useMDXComponents } from "@/mdx-components"

interface DocPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocBySlug(normalizeDocSlug(slug))

  if (!doc) {
    return {
      title: "Doc Not Found - Effect Solutions",
      description: "The requested doc could not be found",
    }
  }

  const title = `${doc.title} - Effect Solutions`
  const description = doc.description || doc.title
  const ogImage = `${SITE_DEPLOYMENT_URL}/og/${doc.slug}.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_DEPLOYMENT_URL}/${slug}`,
      siteName: "Effect Solutions",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: doc.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const doc = getDocBySlug(normalizeDocSlug(slug))

  if (!doc) {
    notFound()
  }

  const instructions = generateLLMInstructions()
  const components = useMDXComponents({ instructions })

  return (
    <FootnoteProvider>
      <div className="relative flex justify-center w-full">
        <DocTocSidebar className="fixed left-0 top-16 w-64 z-30" title={doc.title} />

        <main className="mx-auto max-w-screen-md border-x border-neutral-800 flex-1 w-full min-h-[calc(100vh-8rem)]">
          <div className="relative">
            <FootnoteArticleShell>
              <article className="prose prose-lg prose-invert max-w-none py-6">
                <MDXRemote
                  source={doc.content}
                  components={components}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm, remarkHeadingIds, remarkCodeHide],
                    },
                  }}
                />
              </article>
            </FootnoteArticleShell>

            <FootnoteSidebar
              className="absolute top-0 w-80 max-w-xs ml-6"
              style={{
                left: `calc(50% + ${dimensions.article.maxWidth} / 2 + ${dimensions.article.sidebarGap})`,
              }}
            />
          </div>
        </main>
      </div>
    </FootnoteProvider>
  )
}
