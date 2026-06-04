/**
 * Pulumi entrypoint for the `@beep/ui` Storybook deployment stack.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { loadStorybookStackArgs, StorybookStack } from "../Storybook.ts";

const stack = new StorybookStack("beep-storybook", loadStorybookStackArgs());

/**
 * Vercel project id for the Storybook deployment.
 *
 * @category outputs
 * @since 0.0.0
 */
export const vercelProjectId = stack.vercelProjectId;

/**
 * Custom domain attached to the Storybook Vercel project.
 *
 * @category outputs
 * @since 0.0.0
 */
export const domain = stack.domain;
