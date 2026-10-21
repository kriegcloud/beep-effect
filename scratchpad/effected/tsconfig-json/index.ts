/**
 * The filesystem half of the tsconfig.json port: extends-chain loading and
 * config discovery. The pure document model lives in `@beep/tsconfig`.
 *
 * @packageDocumentation
 */

export type { FindNearestOptions } from "./TsconfigDiscovery.ts";
export { TsconfigDiscovery } from "./TsconfigDiscovery.ts";
export { TsconfigExtendsError, TsconfigLoader } from "./TsconfigLoader.ts";
export type { SyncFileSystem, SyncPath, TsconfigLoaderSyncOptions } from "./TsconfigLoaderSync.ts";
export { TsconfigLoaderSync } from "./TsconfigLoaderSync.ts";
