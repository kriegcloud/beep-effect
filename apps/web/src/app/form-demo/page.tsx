"use client";
import Button from "@mui/material/Button";
import { createBrowserInspector } from "@statelyai/inspect";
import { useMachine } from "@xstate/react";
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import {
  buildMachine,
  evaluateJsonLogic,
  validateStepData,
  type WorkflowDefinition,
} from "@/features/form-system";
import WORKFLOW from "@/features/form-system/examples/inventory-adjustment.workflow.json";

const inspector = createBrowserInspector();
// JSONForms / MUI generates dynamic DOM ids that can differ between SSR and client in dev.
// Render the StepForm only on the client to avoid hydration mismatches.
const StepFormNoSSR = dynamic(
  () =>
    import("@/features/form-system/renderer/jsonformsAdapter").then(
      (m) => m.StepForm,
    ),
  { ssr: false },
);

export default function FormDemoPage() {
  // TS2352: Conversion of type
  // { id: string; version: string; schemaVersion: string; initial: string; steps: ({ id: string; title: string; schema: { $schema: string; type: string; properties: { sku: { type: string; title: string; }; location: { ...; }; delta?: undefined; reason?: undefined; confirm?: undefined; }; required: string[]; }; } | { ......
  // to type WorkflowDefinition may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to unknown first.
  // Types of property steps are incompatible.
  // Type '({ id: string; title: string; schema: { $schema: string; type: string; properties: { sku: { type: string; title: string; }; location: { type: string; title: string; }; delta?: undefined; reason?: undefined; confirm?: undefined; }; required: string[]; }; } | { ...; } | { ...; } | { ...; })[]' is not comparable to type 'readonly StepDefinition[]'.
  // Type '{ id: string; title: string; schema: { $schema: string; type: string; properties: { sku: { type: string; title: string; }; location: { type: string; title: string; }; delta?: undefined; reason?: undefined; confirm?: undefined; }; required: string[]; }; } | { ...; } | { ...; } | { ...; }' is not comparable to type 'StepDefinition'.
  // Type '{ id: string; title: string; schema: { $schema: string; type: string; properties: { sku?: undefined; location?: undefined; delta?: undefined; reason?: undefined; confirm?: undefined; }; required?: undefined; }; }' is not comparable to type 'StepDefinition'.
  // Types of property schema are incompatible.
  // Type '{ $schema: string; type: string; properties: { sku?: undefined; location?: undefined; delta?: undefined; reason?: undefined; confirm?: undefined; }; required?: undefined; }' is not comparable to type 'JSONSchema'.
  // Property "properties" is incompatible with index signature.
  // Type
  // {
  //   sku?: undefined;
  //   location?: undefined;
  //   delta?: undefined;
  //   reason?: undefined;
  //   confirm?: undefined;
  // }
  // is not comparable to type JsonValue
  // Type
  // {
  //   sku?: undefined;
  //   location?: undefined;

  const workflow = WORKFLOW as unknown as WorkflowDefinition;
  const machine = useMemo(
    () => buildMachine(workflow, evaluateJsonLogic),
    [workflow],
  );
  const [state, send] = useMachine(machine, {
    inspect: inspector.inspect,
  });
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const stepId = state.value as string;
  const step = workflow.steps.find((s) => s.id === stepId)!;
  const stepData = answers[stepId];

  // Validate current step to gate NEXT
  const isCurrentStepValid = useMemo(() => {
    const res = validateStepData(step.schema, stepData ?? {});
    return res.valid === true;
  }, [step, stepData]);

  const isTerminal = useMemo(
    () => workflow.transitions.every((t) => t.from !== stepId),
    [workflow, stepId],
  );

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
      <h1>Form System Demo</h1>
      <p>
        Workflow: {workflow.id ?? "(unnamed)"} | Initial: {workflow.initial}
      </p>
      <h2>Step: {stepId}</h2>

      {!isTerminal ? (
        <>
          <StepFormNoSSR
            step={step}
            data={stepData ?? {}}
            onChange={(data) =>
              setAnswers((prev) => ({ ...prev, [stepId]: data }))
            }
          />
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button
              variant="outlined"
              onClick={() => send({ type: "BACK" })}
              disabled={((state.context as any)?.history?.length ?? 0) === 0}
            >
              Back
            </Button>
            <Button
              onClick={() =>
                send({
                  type: "NEXT",
                  context: {
                    answers,
                    currentStepAnswers: (answers[stepId] as any) ?? {},
                    externalContext: {},
                  },
                })
              }
              disabled={!isCurrentStepValid}
            >
              Next
            </Button>
          </div>
          <details style={{ marginTop: 16 }}>
            <summary>Debug</summary>
            <pre>
              {JSON.stringify({ state: state.value, answers }, null, 2)}
            </pre>
          </details>
        </>
      ) : (
        <div>
          <p>Done. No outgoing transitions from: {stepId}</p>
          <h3>Final Answers</h3>
          <pre>{JSON.stringify(answers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
