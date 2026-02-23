/**
 * Schema and types for classified workspace dependencies.
 *
 * Dependencies are split into workspace-internal dependencies (packages
 * that live within the monorepo) and external NPM dependencies.
 *
 * @since 0.0.0
 * @module
 */

/**
 * A record mapping package names to version specifiers.
 *
 * @since 0.0.0
 * @category types
 */
export type DependencyRecord = Readonly<Record<string, string>>;

/**
 * Classified dependencies for a single workspace package.
 *
 * Dependencies are separated into workspace-internal and external (NPM)
 * categories, each further divided by dependency type (runtime, dev, peer,
 * optional).
 *
 * @since 0.0.0
 * @category types
 */
export interface WorkspaceDeps {
  /** The package name this dependency set belongs to. */
  readonly packageName: string;

  /** Dependencies that reference other packages within the monorepo. */
  readonly workspace: {
    readonly dependencies: DependencyRecord;
    readonly devDependencies: DependencyRecord;
    readonly peerDependencies: DependencyRecord;
    readonly optionalDependencies: DependencyRecord;
  };

  /** Dependencies that reference external NPM packages. */
  readonly npm: {
    readonly dependencies: DependencyRecord;
    readonly devDependencies: DependencyRecord;
    readonly peerDependencies: DependencyRecord;
    readonly optionalDependencies: DependencyRecord;
  };
}

/**
 * Create an empty WorkspaceDeps for a given package name.
 *
 * @param packageName Package name to initialize.
 * @returns Empty dependency structure for the package.
 * @since 0.0.0
 * @category constructors
 */
export const emptyWorkspaceDeps = (packageName: string): WorkspaceDeps => ({
  packageName,
  workspace: {
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
    optionalDependencies: {},
  },
  npm: {
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
    optionalDependencies: {},
  },
});
