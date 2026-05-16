/**
 * Stack Installer React workbench shell.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

import { Badge } from "@beep/ui/components/badge";
import { Button } from "@beep/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/ui/components/card";
import { Progress } from "@beep/ui/components/progress";
import { Separator } from "@beep/ui/components/separator";
import { ArrowClockwise, CheckCircle, Hammer, Lightning, TerminalWindow, WarningCircle } from "@phosphor-icons/react";
import { invoke } from "@tauri-apps/api/core";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type BunRuntimeHealthView = {
  readonly dependency: {
    readonly detectedVersion?: string;
    readonly id: string;
    readonly installHint: string;
    readonly kind: string;
    readonly name: string;
    readonly requiredVersion?: string;
    readonly status: string;
  };
  readonly state: "healthy" | "repair-required" | "missing";
  readonly summary: string;
};

type BunRuntimeRepairView = {
  readonly after: BunRuntimeHealthView;
  readonly before: BunRuntimeHealthView;
  readonly changed: boolean;
  readonly command: string;
  readonly summary: string;
};

type LoadBunRuntimeHealth = () => Promise<BunRuntimeHealthView>;
type RunBunRuntimeRepair = () => Promise<BunRuntimeRepairView>;

type LoadState =
  | { readonly _tag: "loading" }
  | { readonly _tag: "failed"; readonly message: string }
  | { readonly _tag: "loaded"; readonly health: BunRuntimeHealthView };

type RepairState =
  | { readonly _tag: "idle" }
  | { readonly _tag: "running" }
  | { readonly _tag: "failed"; readonly message: string }
  | { readonly _tag: "completed"; readonly result: BunRuntimeRepairView };

const previewHealth: BunRuntimeHealthView = {
  dependency: {
    detectedVersion: "1.3.11",
    id: "bun",
    installHint: "Run the focused Bun repair flow from the desktop app.",
    kind: "runtime",
    name: "Bun",
    requiredVersion: "1.3.14",
    status: "present",
  },
  state: "repair-required",
  summary: "Bun 1.3.11 is older than the required version 1.3.14.",
};

const defaultLoadBunRuntimeHealth: LoadBunRuntimeHealth = async () => {
  try {
    const encoded = await invoke<string>("inspect_bun_runtime");
    return JSON.parse(encoded) as BunRuntimeHealthView;
  } catch {
    return previewHealth;
  }
};

const defaultRunBunRuntimeRepair: RunBunRuntimeRepair = async () => {
  try {
    const encoded = await invoke<string>("repair_bun_runtime", {
      request: { approved: true },
    });
    return JSON.parse(encoded) as BunRuntimeRepairView;
  } catch (error) {
    throw new Error(errorMessage(error, "Desktop Bun repair is only available in the Tauri app."));
  }
};

const stateBadge = (state: BunRuntimeHealthView["state"]) => {
  switch (state) {
    case "healthy":
      return { label: "Healthy", variant: "secondary" as const };
    case "repair-required":
      return { label: "Repair Needed", variant: "outline" as const };
    case "missing":
      return { label: "Missing", variant: "outline" as const };
  }
};

const repairButtonLabel = (state: BunRuntimeHealthView["state"], repairState: RepairState): string => {
  if (repairState._tag === "running") {
    return "Repairing Bun";
  }

  switch (state) {
    case "healthy":
      return "Already Healthy";
    case "missing":
      return "Repair Unavailable";
    case "repair-required":
      return "Approve Repair";
  }
};

const repairButtonHint = (state: BunRuntimeHealthView["state"], repairState: RepairState): string => {
  if (repairState._tag === "running") {
    return "Approval was received. The installer is running the Bun repair workflow now.";
  }

  switch (state) {
    case "healthy":
      return "No repair action is available because Bun already satisfies the required version.";
    case "missing":
      return "This milestone only supports repairing an existing Bun install, not first-time bootstrap.";
    case "repair-required":
      return "Clicking repair is the explicit approval boundary for this host mutation.";
  }
};

const errorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
};

export function App({
  loadBunRuntimeHealth = defaultLoadBunRuntimeHealth,
  runBunRuntimeRepair = defaultRunBunRuntimeRepair,
}: {
  readonly loadBunRuntimeHealth?: LoadBunRuntimeHealth;
  readonly runBunRuntimeRepair?: RunBunRuntimeRepair;
}) {
  const [loadState, setLoadState] = useState<LoadState>({ _tag: "loading" });
  const [repairState, setRepairState] = useState<RepairState>({ _tag: "idle" });

  useEffect(() => {
    let cancelled = false;

    void loadBunRuntimeHealth()
      .then((health) => {
        if (!cancelled) {
          setLoadState({ _tag: "loaded", health });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadState({
            _tag: "failed",
            message: errorMessage(error, "Bun runtime inspection failed."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadBunRuntimeHealth]);

  const currentHealth = loadState._tag === "loaded" ? loadState.health : undefined;
  const currentBadge = currentHealth !== undefined ? stateBadge(currentHealth.state) : undefined;
  const repairActionEnabled = currentHealth?.state === "repair-required" && repairState._tag !== "running";
  const repairProgress =
    repairState._tag === "running"
      ? 55
      : repairState._tag === "completed"
        ? 100
        : currentHealth?.state === "healthy"
          ? 100
          : 35;

  const handleRepair = async () => {
    setRepairState({ _tag: "running" });

    try {
      const result = await runBunRuntimeRepair();
      setRepairState({ _tag: "completed", result });
      setLoadState({ _tag: "loaded", health: result.after });
    } catch (error) {
      setRepairState({
        _tag: "failed",
        message: errorMessage(error, "Bun repair failed."),
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stack Installer</p>
            <h1 className="text-2xl font-semibold tracking-normal">Bun Repair</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">P1D</Badge>
            {currentBadge !== undefined ? <Badge variant={currentBadge.variant}>{currentBadge.label}</Badge> : null}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_20rem]">
        <section className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Focused Repair Flow</CardTitle>
              <CardDescription>
                This milestone proves one real app-driven dependency mutation: inspect Bun, request approval, run
                repair, and show the before/after state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress value={repairProgress} />

              {loadState._tag === "loading" ? (
                <div className="flex items-center gap-3 rounded-md border p-4 text-sm text-muted-foreground">
                  <ArrowClockwise className="size-5 animate-spin" weight="bold" />
                  Inspecting Bun runtime health...
                </div>
              ) : null}

              {loadState._tag === "failed" ? (
                <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <WarningCircle className="mt-0.5 size-5" weight="fill" />
                  <p>{loadState.message}</p>
                </div>
              ) : null}

              {currentHealth !== undefined ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatusCard
                      icon={<TerminalWindow className="size-4" weight="bold" />}
                      label="Detected"
                      value={renderVersion(currentHealth.dependency.detectedVersion)}
                    />
                    <StatusCard
                      icon={<Lightning className="size-4" weight="bold" />}
                      label="Required"
                      value={renderVersion(currentHealth.dependency.requiredVersion)}
                    />
                    <StatusCard
                      icon={<Hammer className="size-4" weight="bold" />}
                      label="Action"
                      value={currentHealth.state === "healthy" ? "None" : "Repair"}
                    />
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Current health</p>
                        <p className="text-sm text-muted-foreground">{currentHealth.summary}</p>
                      </div>
                      {currentBadge !== undefined ? (
                        <Badge variant={currentBadge.variant}>{currentBadge.label}</Badge>
                      ) : null}
                    </div>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">{currentHealth.dependency.installHint}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleRepair}
                      disabled={!repairActionEnabled}
                      aria-busy={repairState._tag === "running"}
                      aria-disabled={!repairActionEnabled}
                      variant={repairActionEnabled ? "default" : "outline"}
                    >
                      {repairState._tag === "running" ? (
                        <ArrowClockwise className="animate-spin" weight="bold" />
                      ) : (
                        <Hammer weight="fill" />
                      )}
                      {repairButtonLabel(currentHealth.state, repairState)}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {repairButtonHint(currentHealth.state, repairState)}
                    </p>
                  </div>
                </div>
              ) : null}

              {repairState._tag === "running" ? (
                <div className="space-y-3 rounded-md border border-sky-300/60 bg-sky-50 p-4 dark:bg-sky-950/20">
                  <div className="flex items-start gap-3">
                    <ArrowClockwise className="mt-0.5 size-5 animate-spin text-sky-600" weight="bold" />
                    <div className="min-w-0">
                      <p className="font-medium">Repair in progress</p>
                      <p className="text-sm text-muted-foreground">
                        Approval was received. The installer is running the Bun repair workflow now.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This can take a moment while the desktop shell waits for <code>bun upgrade</code> to finish.
                  </p>
                </div>
              ) : null}

              {repairState._tag === "failed" ? (
                <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <WarningCircle className="mt-0.5 size-5" weight="fill" />
                  <p>{repairState.message}</p>
                </div>
              ) : null}

              {repairState._tag === "completed" ? (
                <div className="space-y-3 rounded-md border border-emerald-300/60 bg-emerald-50 p-4 dark:bg-emerald-950/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 text-emerald-600" weight="fill" />
                    <div className="min-w-0">
                      <p className="font-medium">Repair complete</p>
                      <p className="text-sm text-muted-foreground">{repairState.result.summary}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatusCard
                      icon={<ArrowClockwise className="size-4" weight="bold" />}
                      label="Before"
                      value={renderVersion(repairState.result.before.dependency.detectedVersion)}
                    />
                    <StatusCard
                      icon={<CheckCircle className="size-4" weight="bold" />}
                      label="After"
                      value={renderVersion(repairState.result.after.dependency.detectedVersion)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Executed command: {repairState.result.command}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Why This Step</CardTitle>
              <CardDescription>Turn the installer from proof harness into one real repair surface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>The app is the primary operator surface for this milestone.</p>
              <p>The mutation stays owned by installer slice contracts and the Bun CLI driver.</p>
              <p>The broader P1 manual proof harness remains available, but it is not the lead experience here.</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Secondary Flow</CardTitle>
              <CardDescription>P1 manual proof stays in the repo as the audited validation spine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                CLI capture, Discord liveness checks, and returned proof bundle auditing remain part of the project.
              </p>
              <p>This screen narrows the next product-facing milestone to one crisp repair task.</p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-normal">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function renderVersion(version: string | undefined): string {
  return version ?? "Unknown";
}
