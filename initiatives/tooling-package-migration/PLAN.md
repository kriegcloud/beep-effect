# Tooling Package Migration Plan

1. Add this initiative packet and move manifest.
2. Make `beep create-package`, docgen config generation, and config sync aware
   of `packages/tooling/<kind>/<name>`.
3. Move packages in dependency order: repo-utils, repo-configs, test-utils,
   repo-docgen, repo-cli.
4. Absorb `@beep/repo-checks` root quality scripts into `@beep/repo-cli` and
   delete the package.
5. Rewire active package refs, root configs, tests, identity metadata,
   lockfile, and package documentation.
6. Verify with focused tests, config-sync, and the repo quality battery.

