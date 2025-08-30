"use client";
import Button from "@mui/material/Button";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  type ActorRegistry,
  buildMachine,
  evaluateJsonLogic,
  type JsonObject,
  validateStepData,
  type WorkflowDefinition,
} from "@/features/form-system";
import { inventoryAdjustmentTyped } from "@/features/form-system/examples/inventory-adjustment.typed";

const inspector = createBrowserInspector();
// JSONForms / MUI generates dynamic DOM ids that can differ between SSR and client in dev.
// Render the StepForm only on the client to avoid hydration mismatches.
const StepFormNoSSR = dynamic(
  () => import("@/features/form-system/renderer/jsonformsAdapter").then((m) => m.StepForm),
  { ssr: false }
);

export function View() {
  const workflow: WorkflowDefinition = inventoryAdjustmentTyped;
  const actors = useMemo<ActorRegistry>(() => {
    return {
      // Mocked API: returns product details with random lot control flag after a short delay
      fetchProductDetails: async (input?: unknown) => {
        const sku = (input as any)?.sku;
        await new Promise((r) => setTimeout(r, 800));
        return {
          sku,
          lotControlled: Math.random() < 0.5,
        } as const;
      },
    };
  }, []);
  const SNAP_KEY = "form-demo:snapshot";
  const initialSnapshot = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(SNAP_KEY) : null;
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.value === "string" &&
        parsed.context &&
        workflow.steps.some((s) => s.id === parsed.value)
      ) {
        return parsed;
      }
    } catch {
      // ignore
    }
    return undefined;
  }, [workflow]);
  const machine = useMemo(() => buildMachine(workflow, evaluateJsonLogic, actors), [workflow, actors]);
  const [state, send] = useMachine(machine, {
    inspect: inspector.inspect,
  });
  const [answers, setAnswers] = useState<Record<string, JsonObject>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [pendingNext, setPendingNext] = useState(false);

  const rawValue = state.value;
  const normalized = typeof rawValue === "string" ? rawValue.replace(/^#/, "") : undefined;
  const stepId = normalized && workflow.steps.some((s) => s.id === normalized) ? normalized : workflow.initial;
  const step = workflow.steps.find((s) => s.id === stepId);
  const stepData = step ? answers[stepId] : undefined;
  const external = state.context?.external ?? {};
  const fetchError = external["productDetails__error" as const];

  // Validate current step to gate NEXT
  const isCurrentStepValid = useMemo(() => {
    if (!step) return true;
    const res = validateStepData(step.schema, stepData ?? {});
    return res.valid === true;
  }, [step, stepData]);

  const isTerminal = useMemo(() => workflow.transitions.every((t) => t.from !== stepId), [workflow, stepId]);

  // If Next was pressed on product step without prior API result, wait for the RUN result then proceed
  useEffect(() => {
    if (!pendingNext) return;
    if (external.productDetails || fetchError) {
      setIsFetching(false);
      if (external.productDetails) {
        send({
          type: "NEXT",
          context: {
            answers: answers,
            currentStepAnswers: answers[stepId] ?? {},
            externalContext: {} as JsonObject,
          },
        });
      }
      setPendingNext(false);
    }
  }, [external.productDetails, fetchError, pendingNext, answers, stepId, send]);

  // When machine context answers change (e.g., after LOAD_SNAPSHOT or RESET), sync local answers
  useEffect(() => {
    const ctxAnswers = state.context?.answers ?? {};
    // Only replace when they differ to avoid clobbering edits
    if (JSON.stringify(ctxAnswers) !== JSON.stringify(answers)) {
      setAnswers(ctxAnswers as Record<string, JsonObject>);
    }
  }, [state.context]);

  // After mount, if a snapshot exists, load it to avoid SSR hydration mismatch
  useEffect(() => {
    if (!initialSnapshot) return;
    try {
      send({ type: "LOAD_SNAPSHOT", snapshot: initialSnapshot });
    } catch {
      // ignore
    }
  }, [initialSnapshot]);

  // Auto-save snapshot to localStorage on every state change (value/context)
  useEffect(() => {
    try {
      const snapshot = {
        value: state.value,
        context: state.context,
      };
      localStorage.setItem(SNAP_KEY, JSON.stringify(snapshot));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1>Form System Demo</h1>
      <p>
        Workflow: {workflow.id ?? "(unnamed)"} | Initial: {workflow.initial}
      </p>
      <h2>Step: {stepId}</h2>

      <div style={{ margin: "8px 0", display: "flex", gap: 8 }}>
        <Button
          variant="outlined"
          onClick={() => {
            send({ type: "RESET" });
            setAnswers({});
            localStorage.removeItem(SNAP_KEY);
          }}
        >
          Reset
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const snapshot = {
              value: state.value,
              context: state.context,
            };
            localStorage.setItem(SNAP_KEY, JSON.stringify(snapshot));
          }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const raw = localStorage.getItem(SNAP_KEY);
            if (!raw) return;
            try {
              const snapshot = JSON.parse(raw);
              send({ type: "LOAD_SNAPSHOT", snapshot });
            } catch (e) {
              // noop for demo
              console.error("Failed to load snapshot", e);
            }
          }}
        >
          Load
        </Button>
      </div>

      {!isTerminal ? (
        <>
          {step && (
            <StepFormNoSSR
              step={step}
              data={stepData ?? {}}
              onChange={(data) =>
                setAnswers((prev) => ({
                  ...prev,
                  [stepId]: (data ?? {}) as JsonObject,
                }))
              }
            />
          )}
          {stepId === "product" && (
            <div style={{ marginTop: 8 }}>
              {isFetching && <span>Fetching product details...</span>}
              {!isFetching && external.productDetails && (
                <pre style={{ background: "#f7f7f7", padding: 8 }}>
                  {JSON.stringify(external.productDetails, null, 2)}
                </pre>
              )}
              {fetchError && <div style={{ color: "red" }}>Failed to fetch product details: {String(fetchError)}</div>}
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button
              variant="outlined"
              onClick={() => send({ type: "BACK" })}
              disabled={((state.context as any)?.history?.length ?? 0) === 0}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (stepId === "product" && !external.productDetails && !isFetching) {
                  setIsFetching(true);
                  setPendingNext(true);
                  send({
                    type: "RUN",
                    id: "fetchProductDetails",
                    assignKey: "productDetails",
                    input: answers[stepId] ?? {},
                  });
                  return;
                }
                send({
                  type: "NEXT",
                  context: {
                    answers: answers as Readonly<Record<string, JsonObject>>,
                    currentStepAnswers: (answers[stepId] ?? {}) as JsonObject,
                    externalContext: {} as JsonObject,
                  },
                });
              }}
              disabled={!isCurrentStepValid || isFetching}
            >
              Next
            </Button>
          </div>
          <details style={{ marginTop: 16 }}>
            <summary>Debug</summary>
            <pre>
              {JSON.stringify(
                {
                  state: state.value,
                  answers,
                  ctxAnswers: (state.context as any)?.answers ?? {},
                  external,
                },
                null,
                2
              )}
            </pre>
          </details>
        </>
      ) : (
        <div>
          <p>Done. No outgoing transitions from: {stepId}</p>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button
              variant="outlined"
              onClick={() => send({ type: "BACK" })}
              disabled={((state.context as any)?.history?.length ?? 0) === 0}
            >
              Back
            </Button>
          </div>
          <h3 style={{ marginTop: 16 }}>Final Answers</h3>
          <pre>{JSON.stringify(answers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
