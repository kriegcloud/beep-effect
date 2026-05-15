/**
 * Pulumi entrypoint for the opip.law web stack.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { loadOpipWebRuntimeSecrets, loadOpipWebStackArgs, OpipWebStack } from "../OpipWeb.ts";

const stack = new OpipWebStack("opip-web", loadOpipWebStackArgs(), loadOpipWebRuntimeSecrets());

/**
 * Encrypted Pulumi DIY backend S3 bucket URL.
 *
 * @category outputs
 * @since 0.0.0
 */
export const stateBackendUrl = stack.stateBackendUrl;

/**
 * Encrypted assets bucket reserved for OPIP-managed media.
 *
 * @category outputs
 * @since 0.0.0
 */
export const assetsBucketName = stack.assetsBucketName;

/**
 * Vercel project id for the OPIP web app.
 *
 * @category outputs
 * @since 0.0.0
 */
export const vercelProjectId = stack.vercelProjectId;

/**
 * Production domain attached to Vercel.
 *
 * @category outputs
 * @since 0.0.0
 */
export const productionDomain = stack.productionDomain;

/**
 * Staging domain attached to Vercel.
 *
 * @category outputs
 * @since 0.0.0
 */
export const stagingDomain = stack.stagingDomain;
