/**
 * OPIP public home page components.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { cn } from "@beep/ui/lib/utils";
import * as P from "effect/Predicate";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ContactSubmissionStatus } from "../contact";
import type { OpipSiteContent } from "../content";
import { ContactForm } from "./ContactForm";
import { HeroVideo } from "./HeroVideo";
import { ThemeModeToggle } from "./ThemeModeToggle";

const sectionShell = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";
const monoLabel = "font-[family-name:var(--font-opip-mono)] text-xs font-medium uppercase tracking-[0.16em]";
const displayClass = "font-[family-name:var(--font-opip-display)]";
const ctaClass =
  "inline-flex h-12 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--opip-gold)]";

function Lockup({ className = "", width = 176 }: { readonly className?: string; readonly width?: number }) {
  return (
    <Image
      src="/opip/opip-lockup-horizontal.svg"
      alt="opip.law"
      width={width}
      height={Math.round(width * (100 / 320))}
      priority
      className={className}
    />
  );
}

function ExternalAnchor({
  children,
  className,
  href,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly href: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Nav({ content }: { readonly content: OpipSiteContent }) {
  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--opip-paper)] focus:px-4 focus:py-2 focus:text-[var(--opip-heading)]"
        href="#main-content"
      >
        Skip to main content
      </a>
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[color-mix(in_oklab,var(--opip-on-soil)_20%,transparent)] bg-[color-mix(in_oklab,var(--opip-soil)_82%,transparent)] backdrop-blur-md">
        <div className={`${sectionShell} relative flex h-14 items-center justify-end sm:justify-center`}>
          <div className="absolute left-5 sm:left-8 lg:left-12">
            <ThemeModeToggle />
          </div>
          <ul
            className="flex max-w-[calc(100%-4.5rem)] items-center gap-1 overflow-x-auto sm:max-w-none sm:gap-3"
            aria-label="Primary navigation"
          >
            {content.nav.map((item) => (
              <li key={item.href}>
                <a
                  className="block px-2 py-2 font-[family-name:var(--font-opip-mono)] text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--opip-on-soil)] opacity-80 transition-opacity hover:opacity-100 sm:px-3"
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

function Hero({ content }: { readonly content: OpipSiteContent }) {
  const { hero } = content;

  return (
    <section
      className="relative isolate grid min-h-[720px] overflow-hidden bg-[var(--opip-soil)] pt-14 text-[var(--opip-on-soil)] lg:grid-cols-[1.08fr_0.92fr]"
      aria-labelledby="hero-title"
    >
      <div className="relative z-10 flex min-h-[650px] flex-col justify-between px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
        <header>
          <Lockup className="h-auto w-44 brightness-0 invert" />
        </header>

        <div className="max-w-[41rem] py-12 lg:py-16">
          <p className={`${monoLabel} mb-5 text-[var(--opip-gold)]`}>{hero.citation}</p>
          <h1 id="hero-title" className={`${displayClass} max-w-3xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl`}>
            {hero.headline}
          </h1>
          <p className={`${displayClass} mt-6 max-w-xl text-2xl italic leading-9 text-[var(--opip-cream-muted)]`}>
            {hero.lede}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              className={`${ctaClass} border-[var(--opip-gold)] bg-[var(--opip-gold)] text-[var(--opip-soil)] hover:border-[var(--opip-gold-bright)] hover:bg-[var(--opip-gold-bright)]`}
              href={hero.primaryCta.href}
            >
              {hero.primaryCta.label}
            </a>
            <a
              className="font-[family-name:var(--font-opip-mono)] text-sm font-medium uppercase tracking-[0.12em] text-[var(--opip-gold)]"
              href={hero.secondaryCta.href}
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <Image
          className="pointer-events-none absolute bottom-0 right-4 hidden h-[84%] w-auto max-w-[46%] object-contain opacity-95 2xl:block"
          src={hero.portrait.src}
          alt={hero.portrait.alt}
          width={hero.portrait.width ?? 700}
          height={hero.portrait.height ?? 1245}
          sizes="(min-width: 1536px) 32vw, 1px"
        />
      </div>

      <div className="relative min-h-[420px] overflow-hidden bg-[var(--opip-soil)] lg:min-h-full lg:[clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]">
        <HeroVideo src={hero.video.src} poster={hero.videoPoster.src} />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(31,29,26,0.58),rgba(91,26,26,0.12),rgba(31,29,26,0.38))]" />
      </div>
    </section>
  );
}

function About({ content }: { readonly content: OpipSiteContent }) {
  return (
    <section className="bg-[var(--opip-paper)] py-20 text-[var(--opip-body)]" id="about" aria-labelledby="about-title">
      <div className={sectionShell}>
        <h2 id="about-title" className="sr-only">
          About Thomas J. Oppold's practice
        </h2>
        <div className="grid gap-7 lg:grid-cols-3">
          {content.about.map((panel) => {
            const isPortraitPanel = panel.id === "law";

            return (
              <article key={panel.id} className="grid gap-5">
                <figure
                  className={cn(
                    "overflow-hidden rounded-lg border border-[var(--opip-rule)]",
                    isPortraitPanel ? "bg-[var(--opip-portrait-ground)]" : "bg-[var(--opip-figure-ground)]"
                  )}
                >
                  <Image
                    className={cn(
                      "aspect-[4/3] size-full",
                      isPortraitPanel ? "object-contain object-bottom px-7 pt-7" : "object-cover"
                    )}
                    src={panel.image.src}
                    alt={panel.image.alt}
                    width={panel.image.width ?? 1200}
                    height={panel.image.height ?? 800}
                    quality={60}
                    sizes="(min-width: 1024px) 31vw, 90vw"
                  />
                  <figcaption
                    className={cn(
                      "px-4 py-2 font-[family-name:var(--font-opip-mono)] text-[0.68rem] uppercase tracking-[0.12em]",
                      isPortraitPanel ? "text-[var(--opip-cream-muted)]" : "text-[var(--opip-figure-caption)]"
                    )}
                  >
                    {panel.image.credit}
                  </figcaption>
                </figure>
                <div>
                  <p className={`${monoLabel} text-[var(--opip-burgundy)]`}>{panel.kicker}</p>
                  <h3 className={`${displayClass} mt-3 text-4xl leading-tight text-[var(--opip-heading)]`}>
                    {panel.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[var(--opip-body)]">{panel.body}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-14 border-t border-[var(--opip-rule)] pt-6 text-center">
          <p className={`${displayClass} text-xl italic text-[var(--opip-walnut)]`}>
            Each became part of how he reads a claim.
          </p>
        </div>
      </div>
    </section>
  );
}

function Practice({ content }: { readonly content: OpipSiteContent }) {
  return (
    <section
      className="bg-[var(--opip-paper)] py-20 text-[var(--opip-body)]"
      id="practice"
      aria-labelledby="practice-title"
    >
      <div className={sectionShell}>
        <header className="max-w-3xl">
          <p className={`${monoLabel} text-[var(--opip-burgundy)]`}>Practice</p>
          <h2 id="practice-title" className={`${displayClass} mt-4 text-5xl leading-tight text-[var(--opip-heading)]`}>
            Five areas, one docket.
          </h2>
        </header>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {content.practices.map((practice) => (
            <article
              key={practice.id}
              className="rounded-lg border border-[var(--opip-rule)] bg-[var(--opip-card)] p-5"
            >
              <p className={`${monoLabel} text-[var(--opip-burgundy)]`}>{practice.id}</p>
              <h3 className={`${displayClass} mt-4 text-2xl leading-8 text-[var(--opip-heading)]`}>{practice.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--opip-body)]">{practice.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Matters({ content }: { readonly content: OpipSiteContent }) {
  return (
    <section
      className="bg-[var(--opip-soil)] py-20 text-[var(--opip-on-soil)]"
      id="matters"
      aria-labelledby="matters-title"
    >
      <div className={sectionShell}>
        <header className="max-w-3xl">
          <p className={`${monoLabel} text-[var(--opip-gold)]`}>Selected matters</p>
          <h2 id="matters-title" className={`${displayClass} mt-4 text-5xl leading-tight`}>
            Public records, practical machinery.
          </h2>
        </header>
        <div className="mt-10 grid auto-cols-[minmax(18rem,1fr)] grid-flow-col gap-5 overflow-x-auto pb-5 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible">
          {content.matters.map((matter) => (
            <ExternalAnchor
              key={matter.id}
              href={matter.source.href}
              className="group grid min-h-[36rem] w-[min(84vw,26rem)] content-start overflow-hidden rounded-lg border border-[color-mix(in_oklab,var(--opip-on-soil)_18%,transparent)] bg-[color-mix(in_oklab,var(--opip-soil)_80%,black)] text-[var(--opip-on-soil)] transition-transform hover:-translate-y-1 lg:w-auto"
            >
              <figure className="border-b border-[color-mix(in_oklab,var(--opip-on-soil)_18%,transparent)] bg-[var(--opip-figure-ground)]">
                <Image
                  className="aspect-[3/2] size-full object-contain p-5"
                  src={matter.figure.src}
                  alt={matter.figure.alt}
                  width={matter.figure.width ?? 900}
                  height={matter.figure.height ?? 600}
                  sizes="(min-width: 1024px) 31vw, 84vw"
                />
                <figcaption className="border-t border-[var(--opip-rule)] px-4 py-2 font-[family-name:var(--font-opip-mono)] text-[0.68rem] uppercase tracking-[0.12em] text-[var(--opip-figure-caption)]">
                  {matter.figure.credit}
                </figcaption>
              </figure>
              <div className="grid gap-3 p-5">
                <p className={`${monoLabel} text-[var(--opip-gold)]`}>{matter.eyebrow}</p>
                <p className={`${monoLabel} text-[var(--opip-cream-muted)]`}>{matter.caption}</p>
                <h3 className={`${displayClass} text-3xl leading-tight`}>{matter.title}</h3>
                <p className="text-sm leading-7 text-[var(--opip-cream-muted)]">{matter.body}</p>
                {P.isString(matter.citation) ? (
                  <p className="font-[family-name:var(--font-opip-mono)] text-xs leading-6 text-[var(--opip-gold)]">
                    {matter.citation}
                  </p>
                ) : null}
                <span className="mt-2 font-[family-name:var(--font-opip-mono)] text-xs uppercase tracking-[0.12em] text-[var(--opip-gold)]">
                  {matter.source.label}
                </span>
              </div>
            </ExternalAnchor>
          ))}
        </div>
      </div>
    </section>
  );
}

function Clients({ content }: { readonly content: OpipSiteContent }) {
  return (
    <section
      className="bg-[var(--opip-paper)] py-14 text-[var(--opip-body)]"
      id="clients"
      aria-label="Selected clients"
    >
      <div className={sectionShell}>
        <p className={`${monoLabel} text-center text-[var(--opip-burgundy)]`}>Counsel of record for selected matters</p>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {content.clients.map((client) => (
            <li key={client.id} className="flex min-h-16 items-center justify-center">
              <img
                src={client.logo.src}
                alt={client.logo.alt}
                loading="lazy"
                decoding="async"
                className="max-h-12 w-full max-w-40 object-contain opacity-[0.86] transition-opacity hover:opacity-100"
                style={
                  {
                    aspectRatio: client.aspectRatio,
                    filter: "var(--opip-client-logo-filter)",
                  } satisfies CSSProperties
                }
              />
            </li>
          ))}
        </ul>
        <p className={`${displayClass} mt-8 text-center text-lg italic text-[var(--opip-walnut)]`}>
          Selected matters - 1997 to present. Client marks are review-gated before launch.
        </p>
      </div>
    </section>
  );
}

function Press({ content }: { readonly content: OpipSiteContent }) {
  return (
    <section className="bg-[var(--opip-paper)] py-20 text-[var(--opip-body)]" id="press" aria-labelledby="press-title">
      <div className={sectionShell}>
        <header className="max-w-3xl">
          <p className={`${monoLabel} text-[var(--opip-burgundy)]`}>Selected press</p>
          <h2 id="press-title" className={`${displayClass} mt-4 text-5xl leading-tight text-[var(--opip-heading)]`}>
            In the trade and legal press.
          </h2>
        </header>
        <ul className="mt-10 grid gap-5">
          {content.press.map((item) => (
            <li key={item.source.href} className="border-t border-[var(--opip-rule)] pt-5">
              <article className="grid gap-4 md:grid-cols-[14rem_1fr_auto] md:items-start">
                <p className="font-[family-name:var(--font-opip-mono)] text-xs uppercase tracking-[0.12em] text-[var(--opip-muted)]">
                  <time dateTime={item.date}>{item.dateLabel}</time>
                  <br />
                  {item.publication}
                </p>
                <div>
                  <h3 className={`${displayClass} text-3xl leading-tight text-[var(--opip-heading)]`}>
                    <ExternalAnchor className="hover:text-[var(--opip-burgundy)]" href={item.source.href}>
                      {item.headline}
                    </ExternalAnchor>
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--opip-body)]">{item.body}</p>
                </div>
                <ExternalAnchor
                  className="font-[family-name:var(--font-opip-mono)] text-xs font-medium uppercase tracking-[0.12em] text-[var(--opip-burgundy)]"
                  href={item.source.href}
                >
                  {item.source.label}
                </ExternalAnchor>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact({
  content,
  status,
}: {
  readonly content: OpipSiteContent;
  readonly status: ContactSubmissionStatus | undefined;
}) {
  const { contact } = content;
  const mailto = `mailto:${contact.email}?subject=opip.law%20-%20new%20matter`;

  return (
    <section
      className="bg-[var(--opip-burgundy)] py-20 text-[var(--opip-on-soil)]"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className={`${sectionShell} grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start`}>
        <div>
          <p className={`${monoLabel} text-[var(--opip-gold)]`}>Contact</p>
          <h2 id="contact-title" className={`${displayClass} mt-4 text-5xl leading-tight`}>
            {contact.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color-mix(in_oklab,var(--opip-on-soil)_88%,transparent)]">
            {contact.lede}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              className={`${ctaClass} border-[var(--opip-on-soil)] bg-[var(--opip-on-soil)] text-[var(--opip-burgundy)] hover:border-white hover:bg-white`}
              href={mailto}
            >
              {contact.email}
            </a>
            <span className={`${monoLabel} text-[var(--opip-gold)]`}>Iowa and Minnesota Bars</span>
          </div>
        </div>
        <div className="grid gap-5">
          <ContactForm email={contact.email} status={status} />
          <aside className="rounded-lg border border-[color-mix(in_oklab,var(--opip-on-soil)_22%,transparent)] bg-[color-mix(in_oklab,var(--opip-soil)_22%,transparent)] p-6">
            <p className={`${monoLabel} text-[var(--opip-gold)]`}>Notice</p>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-[color-mix(in_oklab,var(--opip-on-soil)_88%,transparent)]">
              {contact.notice.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Footer({ content }: { readonly content: OpipSiteContent }) {
  const { metadata } = content;

  return (
    <footer className="bg-[var(--opip-soil)] py-10 text-[var(--opip-on-soil)]">
      <div className={`${sectionShell} grid gap-8 md:grid-cols-[1fr_auto] md:items-end`}>
        <div>
          <h2 id="footer-title" className="sr-only">
            Site footer
          </h2>
          <Lockup className="h-auto w-40 brightness-0 invert" />
          <p className={`${displayClass} mt-4 text-xl italic text-[var(--opip-cream-muted)]`}>
            Patent counsel for the people who build the machines.
          </p>
        </div>
        <div className="grid gap-3 text-left md:text-right">
          <ExternalAnchor
            className="font-[family-name:var(--font-opip-mono)] text-xs uppercase tracking-[0.12em] text-[var(--opip-gold)]"
            href={metadata.linkedInUrl}
          >
            LinkedIn
          </ExternalAnchor>
          <p className="text-sm text-[var(--opip-cream-muted)]">Copyright 2026 Thomas J. Oppold. opip.law.</p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Renders the OPIP public home page.
 *
 * @category components
 * @since 0.0.0
 */
export function OpipHomePage({
  contactStatus,
  content,
}: {
  readonly contactStatus: ContactSubmissionStatus | undefined;
  readonly content: OpipSiteContent;
}) {
  return (
    <div className="min-h-screen bg-[var(--opip-paper)] text-[var(--opip-body)]">
      <Nav content={content} />
      <main id="main-content">
        <Hero content={content} />
        <About content={content} />
        <Practice content={content} />
        <Matters content={content} />
        <Clients content={content} />
        <Press content={content} />
        <Contact content={content} status={contactStatus} />
      </main>
      <Footer content={content} />
    </div>
  );
}
