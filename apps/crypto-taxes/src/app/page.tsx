import { Button } from "@beep/ui/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <header className="mb-16 flex items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.24em]">Crypto Taxes</p>
          <h1 className="mt-3 max-w-2xl text-4xl leading-none font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
            Shared UI components now render directly from <span className="text-primary">`@beep/ui`</span>.
          </h1>
        </div>

        <Button variant="outline">Import CSV</Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="bg-card/75 border-border rounded-3xl border p-6 shadow-[0_24px_90px_rgb(0_0_0_/_0.28)] backdrop-blur">
          <p className="text-muted-foreground text-sm leading-6">
            This app now pulls its styling tokens and shadcn primitives from the shared UI package, so we can build the
            crypto tax workflow on the same button, theme, and utility layer used elsewhere in the repo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Review Wallet Activity</Button>
            <Button variant="secondary">Generate Report Draft</Button>
            <Button variant="ghost">Connect Exchange</Button>
          </div>
        </article>

        <aside className="bg-card/65 border-border rounded-3xl border p-6">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.22em]">Ready Next</p>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li className="border-border/70 rounded-2xl border px-4 py-3">`@beep/ui` workspace dependency</li>
            <li className="border-border/70 rounded-2xl border px-4 py-3">Tailwind v4 + shared theme imports</li>
            <li className="border-border/70 rounded-2xl border px-4 py-3">
              Next transpilation for shared TSX components
            </li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
