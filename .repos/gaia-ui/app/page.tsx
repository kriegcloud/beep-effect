import { ComponentsGrid } from "@/components/core/components-grid";
import { InfoSection } from "@/components/core/info-section";
import { ArrowRight02Icon, HugeiconsIcon } from "@/components/icons";
import { GitHub } from "@/components/icons/github";
import { Footer } from "@/components/ui/footer";
import { getNavigation } from "@/lib/navigation";
import { generateSEO, generateSoftwareSchema } from "@/lib/seo";
import { RaisedButton } from "@/registry/new-york/ui/raised-button";
import Image from "next/image";
import Link from "next/link";

export const metadata = generateSEO({
  title: "GAIA UI - Open Source Components for AI Assistants",
  description:
    "Beautiful, accessible React components from the GAIA AI assistant project. Free and open source UI library for building chatbots and AI interfaces.",
  keywords: [
    "React Components",
    "UI Library",
    "AI Assistant",
    "Chatbot UI",
    "Open Source",
    "GAIA",
    "Free Components",
    "Radix UI",
    "Tailwind CSS",
  ],
  url: "/",
});

export default function Home() {
  const softwareSchema = generateSoftwareSchema();

  const navigation = getNavigation();
  const componentsSection = navigation.find(
    (section) => section.title === "Components",
  );
  const components = componentsSection?.items || [];

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: json schema
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <div className="relative px-4 space-y-10">
        <section className="mx-auto flex flex-col max-w-2xl gap-5 pt-8 md:pt-16 lg:pt-24 items-center">
          <Image
            src={"/media/gaiaui_logo.png"}
            alt="Logo"
            width={150}
            height={150}
            className="aspect-auton"
          />

          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-4xl text-center">
            We&apos;re building an AI assistant.
            <br />
            <span className="text-muted-foreground">
              Here&apos;s what we&apos;re using.
            </span>
          </h1>
          <div className="text-muted-foreground">
            Introducing GAIA UI, a library for building beautiful ai agents.
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 py-2">
            <Link href="/docs">
              <RaisedButton
                size="default"
                color="#0080ff"
                className="flex items-center"
              >
                Browse components
                <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
              </RaisedButton>
            </Link>
            <Link
              href="https://github.com/heygaia/ui"
              target="_blank"
              rel="noreferrer"
            >
              <RaisedButton size="default" color="#3b3b3b">
                Star on GitHub
                <GitHub className="h-5 w-5" />
              </RaisedButton>
            </Link>
          </div>
        </section>
        <div className="w-full max-w-6xl mx-auto">
          <Image
            src={"/media/screenshot.png"}
            alt="Screenshot of GAIA"
            width={1920}
            height={1080}
            className="rounded-2xl"
          />
        </div>
        <section className="mx-auto flex flex-col max-w-3xl gap-5 items-center">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base mt-5">
            We&apos;re working on an open source AI assistant called GAIA. Along
            the way, we&apos;ve built UI components that we actually use. If
            you&apos;re building chatbots or AI interfaces, these might be
            useful. They&apos;re free and open source.
          </p>
          <InfoSection
            title="What's this for?"
            description="We needed components that work well for conversational interfaces - animated buttons, smooth transitions, accessible controls. Instead of keeping them in our repo, we're sharing them for anyone building similar stuff."
          />
          <InfoSection
            title="Design philosophy"
            description="We design for how products are actually used. Not for screenshots. Not for hype. Every decision is about reducing friction, keeping things predictable, and making interfaces feel natural without needing explanation."
          />
          <InfoSection
            title="We obsess over experience"
            description="We care a lot about how things feel to use. Small details matter more than people think. Spacing, colors, motion, timing. Most of the time it's not about how something looks, it's about how it makes you feel. That's why some products just feel right and others don't."
          />
          <InfoSection
            title="What you'll find"
            description="Production-ready components we actively use. Built for conversational interfaces, not demos. Thoughtful motion, sensible defaults, accessibility baked in. Built with Radix UI and Tailwind CSS. Copy the code, tweak it, ship it."
          />
          <InfoSection
            title="Why share?"
            description="Open source has given us a lot. This is one of our way's of contributing back."
          />
          <Link href="/docs" className="mb-10 mt-5">
            <RaisedButton size="default" className="flex items-center">
              Browse components
              <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
            </RaisedButton>
          </Link>
        </section>

        <div className="max-w-5xl w-full mx-auto">
          <ComponentsGrid components={components} />
        </div>
        <Footer />
      </div>
    </>
  );
}
