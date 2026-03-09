import { BriefcaseIcon, GlobeIcon } from "@phosphor-icons/react/dist/ssr"
import type { CSSProperties, ReactNode } from "react"
import { Suspense } from "react"
import { KeyboardNavigator } from "@/components/og/KeyboardNavigator"
import { commitMono } from "@/lib/fonts"
import { getAllOgSpecs } from "@/lib/og-specs"

const DEFAULTS = {
  tag: "EFFECT.SOLUTIONS",
  title: "Effect Solutions",
  subtitle: "Effect best practices and patterns for humans and AI agents.",
  footLeft: "RESILIENT SYSTEMS",
  footRight: "EFFECT.SOLUTIONS",
  accent: "#ffffff",
  background: "#030405",
} as const

type FieldKey = keyof typeof DEFAULTS

type SearchParams = Record<string, string | string[] | undefined>

function getValue(params: SearchParams, key: FieldKey) {
  const value = params[key]
  if (Array.isArray(value)) {
    return value.at(-1) ?? DEFAULTS[key]
  }
  return (value ?? DEFAULTS[key]) as string
}

export const dynamic = "force-dynamic"

export default async function OgTemplate({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const title = getValue(params, "title")
  const subtitle = getValue(params, "subtitle")
  const background = getValue(params, "background")

  const specs = getAllOgSpecs()

  return (
    <>
      <Suspense fallback={null}>
        <KeyboardNavigator specs={specs} />
      </Suspense>
      <section
        className="flex items-center justify-center bg-[#010102] p-8"
        style={{ width: "1200px", height: "630px", boxSizing: "border-box" }}
      >
        <div
          className="relative flex h-full w-full flex-col overflow-hidden border border-white/20 bg-[#030405] text-[18px] uppercase tracking-[0.32em]"
          style={{ background }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="grid grid-cols-2 border-b border-white/20">
              <Cell className="">
                <div className="flex items-center gap-3">
                  <BriefcaseIcon className="h-5 w-5" weight="regular" />
                  <span>EFFECT.SOLUTIONS</span>
                </div>
              </Cell>
              <Cell className="justify-end text-white/60">
                <div className="flex items-center gap-3">
                  <span>AN EFFECT FIELD MANUAL</span>
                  <GlobeIcon className="h-5 w-5" weight="regular" />
                </div>
              </Cell>
            </div>

            <div className="flex flex-1 flex-col justify-center px-16 py-12">
              <h1
                className={`text-[84px] font-bold leading-[1.05] tracking-[-0.02em] text-white normal-case ${commitMono.variable}`}
                style={{ fontFamily: "var(--font-commit-mono), monospace" }}
              >
                {title}
              </h1>
              <p className="mt-6 max-w-[900px] text-[32px] leading-[1.4] tracking-[-0.01em] text-white/70 normal-case">
                {subtitle}
              </p>
            </div>

            <div
              className="relative border-t border-white/20"
              style={{
                height: "60px",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.2) 12px, rgba(255,255,255,0.2) 13px)",
                  marginTop: "1px",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Cell({
  children,
  className = "",
  style,
}: {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`flex items-center border-white/20 px-8 py-5 ${className}`} style={style}>
      {children}
    </div>
  )
}
