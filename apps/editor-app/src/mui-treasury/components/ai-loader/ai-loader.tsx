/**
 * MUI Treasury loader primitive installed into the editor app.
 *
 * @module
 * @since 0.0.0
 */
"use client";

import type { CircularProgressProps } from "@mui/material/CircularProgress";
import CircularProgress from "@mui/material/CircularProgress";
import { memo } from "react";

/**
 * Props accepted by the compact AI loader.
 *
 * @example
 * ```tsx
 * import type { LoaderProps } from "@beep/editor-app/mui-treasury/components/ai-loader"
 *
 * const props: LoaderProps = {
 *   color: "inherit",
 * }
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LoaderProps = CircularProgressProps;

/**
 * Render the compact AI loading spinner.
 *
 * @example
 * ```tsx
 * import { Loader } from "@beep/editor-app/mui-treasury/components/ai-loader"
 *
 * const Status = () => <Loader color="inherit" />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const Loader = memo((props: LoaderProps) => <CircularProgress size={16} thickness={5} {...props} />);

Loader.displayName = "Loader";
