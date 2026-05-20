/**
 * Professional Desktop React workbench shell.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

import { Badge } from "@beep/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/ui/components/card";
import { Separator } from "@beep/ui/components/separator";
import { A } from "@beep/utils";
import { AppWindow, Brain, Buildings, CheckCircle, FolderOpen, Scales, ShieldCheck } from "@phosphor-icons/react";
import { invoke } from "@tauri-apps/api/core";
import { Match } from "effect";
import * as P from "effect/Predicate";
import { useEffect, useState } from "react";

type DesktopHealth = {
  readonly app: string;
  readonly desktopShell: "minimal";
  readonly runtimeConnection: "pending";
  readonly slices: readonly string[];
  readonly status: "preview" | "ready";
};

type LoadState =
  | { readonly _tag: "loading" }
  | { readonly _tag: "loaded"; readonly health: DesktopHealth }
  | { readonly _tag: "failed"; readonly message: string };

type LoadDesktopHealth = () => Promise<DesktopHealth>;

const previewHealth: DesktopHealth = {
  app: "@beep/professional-desktop",
  desktopShell: "minimal",
  runtimeConnection: "pending",
  slices: ["workspace", "agent-capability", "epistemic", "law-practice", "wealth-management"],
  status: "preview",
};

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const errorMessage = (error: unknown, fallback: string): string =>
  Match.value(error).pipe(
    Match.when(P.isString, (value) => value),
    Match.when(P.isError, (value) => value.message),
    Match.when(hasMessage, (value) => value.message),
    Match.orElse(() => fallback)
  );

const isDesktopShellRuntime = (): boolean =>
  P.hasProperty(globalThis, "__TAURI__") || P.hasProperty(globalThis, "__TAURI_INTERNALS__");

const defaultLoadDesktopHealth: LoadDesktopHealth = () => {
  if (!isDesktopShellRuntime()) {
    return Promise.resolve(previewHealth);
  }

  // In a real Tauri shell we surface bridge failures to the UI instead of
  // silently substituting preview data.
  return invoke<DesktopHealth>("professional_desktop_health");
};

const sliceMeta = [
  {
    description: "Workspaces, threads, tasks, approvals, and collaboration state.",
    icon: FolderOpen,
    name: "workspace",
  },
  {
    description: "Agents, skills, tools, commands, and capability promotion.",
    icon: Brain,
    name: "agent-capability",
  },
  {
    description: "Evidence, claims, provenance, audit trails, and knowledge graph outputs.",
    icon: ShieldCheck,
    name: "epistemic",
  },
  {
    description: "Legal clients, matters, filings, drafts, and legal overlays.",
    icon: Scales,
    name: "law-practice",
  },
  {
    description: "Households, accounts, goals, meetings, and advisor overlays.",
    icon: Buildings,
    name: "wealth-management",
  },
] as const;

export function App({
  loadDesktopHealth = defaultLoadDesktopHealth,
}: {
  readonly loadDesktopHealth?: LoadDesktopHealth;
}) {
  const [loadState, setLoadState] = useState<LoadState>({ _tag: "loading" });

  useEffect(() => {
    let cancelled = false;

    void loadDesktopHealth()
      .then((health) => {
        if (!cancelled) {
          setLoadState({ _tag: "loaded", health });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadState({
            _tag: "failed",
            message: errorMessage(error, "Professional Desktop health inspection failed."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadDesktopHealth]);

  const health = loadState._tag === "loaded" ? loadState.health : undefined;

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Agentic Professional Runtime</p>
            <h1 className="text-3xl font-semibold tracking-tight">Professional Desktop</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Tauri</Badge>
            <Badge variant="secondary">Minimal Bootstrap</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.5fr)_20rem]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desktop Shell Ready</CardTitle>
              <CardDescription>
                This bootstrap gives the repo a native desktop app shell, shared UI baseline, and Tauri health bridge
                without pre-committing to runtime orchestration details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadState._tag === "loading" ? (
                <p className="text-sm text-muted-foreground">Inspecting desktop shell…</p>
              ) : null}

              {loadState._tag === "failed" ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {loadState.message}
                </div>
              ) : null}

              {health !== undefined ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Package" value={health.app} />
                  <MetricCard label="Shell" value={health.desktopShell} />
                  <MetricCard label="Runtime" value={health.runtimeConnection} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planned Slice Surfaces</CardTitle>
              <CardDescription>
                The desktop app composes these runtime slices as clients and app-local runtime helpers. It does not own
                their domain semantics.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {A.map(sliceMeta, ({ description, icon: Icon, name }) => (
                <div key={name} className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md border p-2 text-muted-foreground">
                      <Icon className="size-4" weight="bold" />
                    </div>
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Moves</CardTitle>
              <CardDescription>Suggested follow-on work once the shell is in place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <Step line="Add app-local runtime composition in apps/professional-desktop/src/runtime/Layer.ts." />
              <Step line="Introduce workspace and capability client bindings once their public contracts settle." />
              <Step line="Wire native sidecar lifecycle for local runtime services after the bounded contracts exist." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Command</CardTitle>
              <CardDescription>Current Tauri bridge exposed by the bootstrap.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <AppWindow className="size-4 text-muted-foreground" weight="bold" />
                <div>
                  <p className="text-sm font-medium">professional_desktop_health</p>
                  <p className="text-xs text-muted-foreground">Returns minimal shell metadata for the workbench.</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="size-4" weight="fill" />
                {health?.status === "ready"
                  ? "Desktop shell is ready for runtime wiring."
                  : "Preview mode is active in the web shell."}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function Step({ line }: { readonly line: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 size-2 rounded-full bg-primary" />
      <p>{line}</p>
    </div>
  );
}
