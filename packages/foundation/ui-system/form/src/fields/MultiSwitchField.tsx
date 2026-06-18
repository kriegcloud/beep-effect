/**
 * Multi-select field rendering one `@beep/ui` `Switch` per option.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Switch } from "@beep/ui/components/switch";
import { MultiBooleanOptionField } from "../internal/FieldBinding.tsx";
import type React from "react";
import type { FieldOption } from "../core/Options.ts";

/**
 * Props for {@link MultiSwitchField}: label/description/options. The bound value
 * is the array of switched-on option values.
 *
 * @example
 * ```ts
 * import type { MultiSwitchFieldProps } from "@beep/form/fields/MultiSwitchField"
 *
 * const props = {
 *   label: "Notifications",
 *   options: [
 *     { value: "mentions", label: "Mentions" },
 *     { value: "releases", label: "Releases" },
 *   ],
 * } satisfies MultiSwitchFieldProps
 *
 * console.log(props.options.length) // 2
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface MultiSwitchFieldProps {
  readonly description?: React.ReactNode | undefined;
  readonly label?: React.ReactNode | undefined;
  readonly options: ReadonlyArray<FieldOption>;
}

/**
 * Schema-bound switch list: the value is the array of switched-on option values.
 *
 * @example
 * ```tsx
 * import { MultiSwitchField } from "@beep/form/fields/MultiSwitchField"
 *
 * console.log(MultiSwitchField)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const MultiSwitchField: React.FC<MultiSwitchFieldProps> = (props) => (
  <MultiBooleanOptionField {...props} Control={Switch} />
);
