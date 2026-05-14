/**
 * Stack Installer React workbench shell.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

import { isOnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import { Badge } from "@beep/ui/components/badge";
import { Button } from "@beep/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@beep/ui/components/card";
import { Progress } from "@beep/ui/components/progress";
import { Separator } from "@beep/ui/components/separator";
import { useAtom } from "@effect/atom-react";
import {
  CheckCircle,
  ClipboardText,
  DiscordLogo,
  LockKey,
  Play,
  ShieldCheck,
  TerminalWindow,
} from "@phosphor-icons/react";
import { invoke } from "@tauri-apps/api/core";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { Atom } from "effect/unstable/reactivity";
import type { FormEvent } from "react";
import { p1aDryRunRegistry, p1aDryRunSnapshot } from "./dry-run-registry.js";

const workbenchSteps = [
  {
    icon: TerminalWindow,
    label: "Dependencies",
    status: "Dry-run ready",
  },
  {
    icon: LockKey,
    label: "Secret References",
    status: "1Password refs only",
  },
  {
    icon: ShieldCheck,
    label: "Providers",
    status: "Claude + Codex",
  },
  {
    icon: DiscordLogo,
    label: "Discord",
    status: "Only v1 channel",
  },
] as const;

type ProofState =
  | {
      readonly _tag: "idle";
    }
  | {
      readonly _tag: "running";
    }
  | {
      readonly _tag: "failed";
      readonly message: string;
    }
  | {
      readonly _tag: "completed";
      readonly output: string;
    };

type P1ManualProofFormRequest = {
  readonly discordBotTokenReference: string;
  readonly discordChannelDisplayName: string;
  readonly discordChannelId: string;
  readonly discordGuildId: string;
  readonly operatorLabel: string;
  readonly targetPlatform: string;
  readonly testMessageContent: string;
};

type RunP1ManualProof = (request: P1ManualProofFormRequest) => Promise<string>;

const proofStateAtom = Atom.make<ProofState>({ _tag: "idle" });

const runTauriP1ManualProof: RunP1ManualProof = (request) => invoke<string>("run_p1_manual_proof", { request });

const valueFor = (formData: FormData, name: string): string => {
  const value = formData.get(name);
  return P.isString(value) ? value : "";
};

const errorMessage = (error: unknown): string => {
  if (P.isString(error)) {
    return error;
  }
  if (P.isObject(error) && P.hasProperty(error, "message") && P.isString(error.message)) {
    return error.message;
  }
  return "P1 proof failed before sanitized output was returned.";
};

const submitProof = async (
  event: FormEvent<HTMLFormElement>,
  setProofState: (state: ProofState) => void,
  runP1ManualProof: RunP1ManualProof
) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const discordBotTokenReference = valueFor(formData, "discordBotTokenReference");

  if (!isOnePasswordReference(discordBotTokenReference)) {
    setProofState({
      _tag: "failed",
      message: "Discord bot token must be a 1Password reference.",
    });
    return;
  }

  setProofState({ _tag: "running" });

  try {
    const output = await runP1ManualProof({
      discordBotTokenReference,
      discordChannelDisplayName: valueFor(formData, "discordChannelDisplayName"),
      discordChannelId: valueFor(formData, "discordChannelId"),
      discordGuildId: valueFor(formData, "discordGuildId"),
      operatorLabel: valueFor(formData, "operatorLabel"),
      targetPlatform: valueFor(formData, "targetPlatform"),
      testMessageContent: valueFor(formData, "testMessageContent"),
    });

    setProofState({ _tag: "completed", output });
  } catch (error) {
    setProofState({ _tag: "failed", message: errorMessage(error) });
  }
};

function AppHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Stack Installer</p>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">Install Workbench</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">P1</Badge>
          <Badge variant="secondary">Live proof ready</Badge>
          <Button variant="outline" size="sm">
            <ClipboardText weight="bold" />
            Manifest
          </Button>
          <Button size="sm">
            <Play weight="fill" />
            Preview
          </Button>
        </div>
      </div>
    </header>
  );
}

function ChecklistPanel() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Checklist</h2>
          <p className="text-sm text-muted-foreground">Manual-mode proof gates</p>
        </div>
        <Badge variant="outline">4 / 4</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {A.map(workbenchSteps, (step) => {
          const Icon = step.icon;

          return (
            <Card key={step.label} size="sm" className="rounded-lg">
              <CardContent className="flex items-start gap-3">
                <div className="rounded-md border bg-background p-2">
                  <Icon className="size-4" weight="bold" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ApprovalPanel() {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Approval Queue</CardTitle>
        <CardDescription>
          Install actions remain previews; validation runs through the P1 proof harness.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={80} />
        <div className="space-y-3">
          {A.map(p1aDryRunRegistry, (verb) => (
            <div key={verb.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div className="min-w-0">
                <p className="font-medium">{verb.label}</p>
                <p className="text-sm text-muted-foreground">{verb.summary}</p>
              </div>
              <Badge variant={verb.requiresApproval ? "outline" : "secondary"}>
                {verb.requiresApproval ? "Approval" : "Auto"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ValidationFeed() {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Validation Feed</CardTitle>
        <CardDescription>Deterministic events emitted from the P1A snapshot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {A.map(p1aDryRunSnapshot.validationEvents, (event) => (
          <div key={event.id} className="grid grid-cols-[auto_1fr] gap-3">
            <CheckCircle className="mt-0.5 size-5 text-emerald-600" weight="fill" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{event.subject}</p>
                <Badge variant="outline">{event.tier}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{event.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ManifestPreview() {
  const manifest = p1aDryRunSnapshot.manifest;

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Manifest Preview</CardTitle>
        <CardDescription>{manifest.manifestId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Platform</p>
            <p className="font-medium">{manifest.targetPlatform}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Version</p>
            <p className="font-medium">{manifest.version}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Mode</p>
            <p className="font-medium">{manifest.dryRunOnly ? "Dry-run" : "Live"}</p>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <p className="text-sm font-medium">Providers</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {A.map(manifest.providers, (provider) => (
              <div key={provider.provider} className="rounded-md border p-3">
                <p className="font-medium capitalize">{provider.provider}</p>
                <p className="text-sm text-muted-foreground">{provider.authMode}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border p-3">
          <p className="text-sm font-medium">Discord</p>
          <p className="text-sm text-muted-foreground">{manifest.discordChannel.displayName}</p>
          <p className="text-xs text-muted-foreground">{manifest.discordChannel.channelId}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Capabilities</p>
          {A.map(manifest.capabilities, (capability) => (
            <div key={capability.id} className="rounded-md border p-3">
              <p className="font-medium">{capability.label}</p>
              <p className="text-sm text-muted-foreground">{capability.summary}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LiveProofPanel({ runP1ManualProof }: { readonly runP1ManualProof: RunP1ManualProof }) {
  const [proofState, setProofState] = useAtom(proofStateAtom);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>P1 Live Proof</CardTitle>
        <CardDescription>Manual Mode desktop validation for Discord, Claude, Codex, and 1Password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            void submitProof(event, setProofState, runP1ManualProof);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Platform
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                defaultValue="macos"
                name="targetPlatform"
              >
                <option value="macos">macOS</option>
                <option value="windows">Windows</option>
                <option value="linux">Linux</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Operator
              <input
                className="h-10 rounded-md border bg-background px-3 text-sm"
                defaultValue="manual"
                name="operatorLabel"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Guild ID
              <input className="h-10 rounded-md border bg-background px-3 text-sm" name="discordGuildId" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Channel ID
              <input className="h-10 rounded-md border bg-background px-3 text-sm" name="discordChannelId" />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Channel Name
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm"
              defaultValue="ai-stack-installer"
              name="discordChannelDisplayName"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Bot Token Reference
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm"
              defaultValue="op://Private/Discord Bot/token"
              name="discordBotTokenReference"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Test Message
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm"
              defaultValue="Stack Installer P1 Manual Mode proof"
              name="testMessageContent"
            />
          </label>
          <Button className="w-fit" disabled={proofState._tag === "running"} type="submit">
            <Play weight="fill" />
            {proofState._tag === "running" ? "Running" : "Run Proof"}
          </Button>
          {proofState._tag === "failed" ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {proofState.message}
            </div>
          ) : null}
          {proofState._tag === "completed" ? (
            <pre className="max-h-72 overflow-auto rounded-md border bg-muted p-3 text-xs">{proofState.output}</pre>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Render the Stack Installer P1 workbench.
 *
 * @category components
 * @since 0.0.0
 */
export function App({ runP1ManualProof = runTauriP1ManualProof }: { readonly runP1ManualProof?: RunP1ManualProof }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="space-y-5">
          <ChecklistPanel />
          <LiveProofPanel runP1ManualProof={runP1ManualProof} />
          <ApprovalPanel />
        </div>
        <div className="space-y-5">
          <ValidationFeed />
          <ManifestPreview />
        </div>
      </div>
    </main>
  );
}
