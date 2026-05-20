/**
 * Pulumi entrypoint for the oip.law web stack.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { loadOipWebRuntimeSecrets, loadOipWebStackArgs, OipWebStack } from "../OipWeb.ts";

const stack = new OipWebStack("opip-web", loadOipWebStackArgs(), loadOipWebRuntimeSecrets());

/**
 * Encrypted Pulumi DIY backend S3 bucket URL.
 *
 * @category outputs
 * @since 0.0.0
 */
export const stateBackendUrl = stack.stateBackendUrl;

/**
 * Encrypted assets bucket reserved for OIP-managed media.
 *
 * @category outputs
 * @since 0.0.0
 */
export const assetsBucketName = stack.assetsBucketName;

/**
 * Vercel project id for the OIP web app.
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
