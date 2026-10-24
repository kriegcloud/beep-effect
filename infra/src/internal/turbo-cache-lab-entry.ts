/**
 * Pulumi entrypoint for the disposable turbo-cache conformance lab.
 *
 * Reuses the production {@link CiTurboCache} component unchanged under a
 * lab-only component name, so every physical name (functions, log groups,
 * authorizer, API) carries the `beep-tcl-<epoch>` prefix and the stack owns
 * no production resource. The lab's bucket, KMS key and SecureStrings are
 * created by `infra/turbo-cache-lab/lab-aws.sh bootstrap` and named in this
 * stack's config, as production names its existing parameters.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as pulumi from "@pulumi/pulumi";
import { CiTurboCache, loadCiTurboCacheConfig } from "../CiTurboCache.ts";

const lab = new pulumi.Config("turboCacheLab");
const epoch = lab.require("epoch");
if (!/^[a-z0-9]{4,16}$/u.test(epoch)) {
  throw new pulumi.RunError("turboCacheLab:epoch must be 4-16 lowercase alphanumerics");
}
const config = loadCiTurboCacheConfig();
if (!config.bucketName.startsWith(`beep-tcl-${epoch}-`)) {
  throw new pulumi.RunError("ciTurboCache:bucketName must carry the lab prefix beep-tcl-<epoch>-");
}

const incumbent = new CiTurboCache(`beep-tcl-${epoch}`, { config });

/**
 * Lab incumbent API endpoint; conformance targets append `/v8`.
 *
 * @category resources
 * @since 0.0.0
 */
export const incumbentEndpoint = incumbent.apiEndpoint;

/**
 * Lab artifact bucket name.
 *
 * @category resources
 * @since 0.0.0
 */
export const incumbentBucket = incumbent.bucketName;
