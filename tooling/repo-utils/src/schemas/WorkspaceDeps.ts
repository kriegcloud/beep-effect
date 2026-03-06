/**
 * Schema and types for classified workspace dependencies.
 *
 * Dependencies are split into workspace-internal dependencies (packages
 * that live within the monorepo) and external NPM dependencies.
 *
 * @since 0.0.0
 * @module
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("schemas/WorkspaceDeps");

/**
 * A record mapping package names to version specifiers.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DependencyRecord = S.Record(S.String, S.String).annotate(
  $I.annote("DependencyRecord", {
    description: "A mapping of dependency package names to version specifiers.",
  })
);

/**
 * A record mapping package names to version specifiers.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DependencyRecord = typeof DependencyRecord.Type;

class WorkspaceDependencyBuckets extends S.Class<WorkspaceDependencyBuckets>($I`WorkspaceDependencyBuckets`)(
  {
    dependencies: DependencyRecord,
    devDependencies: DependencyRecord,
    peerDependencies: DependencyRecord,
    optionalDependencies: DependencyRecord,
  },
  $I.annote("WorkspaceDependencyBuckets", {
    description: "Dependency buckets grouped by dependency kind for either workspace or npm references.",
  })
) {}

/**
 * Classified dependencies for a single workspace package.
 *
 * Dependencies are separated into workspace-internal and external (NPM)
 * categories, each further divided by dependency type (runtime, dev, peer,
 * optional).
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WorkspaceDeps extends S.Class<WorkspaceDeps>($I`WorkspaceDeps`)(
  {
    npm: WorkspaceDependencyBuckets,
    packageName: S.String,
    workspace: WorkspaceDependencyBuckets,
  },
  $I.annote("WorkspaceDeps", {
    description:
      "Classified dependencies for a workspace package, split into workspace-local and external npm buckets.",
  })
) {}

/**
 * Create an empty WorkspaceDeps for a given package name.
 *
 * @param packageName Package name to initialize.
 * @returns Empty dependency structure for the package.
 * @since 0.0.0
 * @category DomainModel
 */
export const emptyWorkspaceDeps = (packageName: string): WorkspaceDeps =>
  new WorkspaceDeps({
    packageName,
    workspace: new WorkspaceDependencyBuckets({
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }),
    npm: new WorkspaceDependencyBuckets({
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    }),
  });
