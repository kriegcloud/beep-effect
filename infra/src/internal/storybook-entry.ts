/**
 * Pulumi entrypoint for the public Storybook Vercel project.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { loadStorybookStackArgs, StorybookStack } from "../Storybook.ts";

const stack = new StorybookStack("storybook", loadStorybookStackArgs());

/**
 * Vercel project id for the Storybook app.
 *
 * @category outputs
 * @since 0.0.0
 */
export const vercelProjectId = stack.vercelProjectId;

/**
 * Vercel project name for the Storybook app.
 *
 * @category outputs
 * @since 0.0.0
 */
export const projectName = stack.projectName;

/**
 * Vercel root directory for the Storybook app.
 *
 * @category outputs
 * @since 0.0.0
 */
export const rootDirectory = stack.rootDirectory;

/**
 * Static output directory served by Vercel.
 *
 * @category outputs
 * @since 0.0.0
 */
export const outputDirectory = stack.outputDirectory;
