/**
 * JSONForms adapter components
 * Location: apps/web/src/features/form-system/renderer/jsonformsAdapter.tsx
 */

"use client";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import type React from "react";
import type { StepDefinition } from "../model/types";
import { getAjv } from "../validation/schema";

export interface StepFormProps {
  step: StepDefinition;
  data: unknown;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
  /** Additional JSONForms props passthrough */
  jsonforms?: Partial<React.ComponentProps<typeof JsonForms>>;
}

/**
 * Renders a single step using JSONForms Material renderers.
 * If `step.uiSchema` is missing, JSONForms will auto-generate a UI.
 */
export function StepForm(props: StepFormProps) {
  const { step, data, onChange, readOnly, jsonforms } = props;
  const mergedConfig = { ...jsonforms?.config, readonly: readOnly };
  const ajv = getAjv();
  return (
    <JsonForms
      schema={step.schema}
      uischema={(step.uiSchema as any) ?? undefined}
      data={data}
      onChange={({ data }) => onChange(data)}
      cells={materialCells}
      renderers={materialRenderers}
      config={mergedConfig}
      ajv={jsonforms?.ajv ?? (ajv as any)}
      {...jsonforms}
    />
  );
}
