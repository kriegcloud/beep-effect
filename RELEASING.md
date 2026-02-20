# Releasing

We use changesets for version management in this repository, however we manually decide when to ship new versions.

The release Github Actions workflow is run automatically on `main` and `release/.*`. This will publish any package that is:
a. public
b. has not been published to NPM at the version in its current `package.json` version field.

In `packages/monorepo/release` is code that is adapted from changesets/action that will let you create the PR branch for releasing. There is a utility script at `./scripts/createReleasePr.sh` that ensures you are compiled and does some sanity checks prior to creating the release PR.

## Prerelease Mode

We keep the `main` branch on Changesets "prerelease mode". This means that from main, we only publish releases with `-beta.x` in their version strings. To create a new set of prerelease versions:

1. On `main`, run `./scripts/createReleasePr.sh`
3. Merge the PR

Example: https://github.com/palantir/pack/pull/25

## Releasing 

We publish releases from `release/` branches. On these branches, after the first release, only the patch number can be incremented. When cutting a `release/` branch, we also increment all versions on `main` to keep them ahead of the versions being published from the 

0. On `main`, run `./scripts/simulateMinorBump.sh`
    1. Create a PR with these changes, and merge it
    2. This will move all packages on main to their next beta versions
1. Create a `release/YY-MM-DD` branch from the commit _prior_ to the above PR
2. (Optional) On the `release/` branch, create RC releases:
    1. Switch the `pre` tag to `rc` in `.changeset/pre.json`
    2. run `./scripts/createReleasePr.sh`
    3. Merge the PR
3. On the `release/` branch, create the minor and major releases:
    1. Disable the `pre` mode using `pnpm exec changeset pre exit`
    2. run `./scripts/createReleasePr.sh`
    3. Merge the PR
4. Create patch releases for versions on this branch:
    1. Create PRs against the `release/` branch, including changesets with _patch only_ changes
    2. On the `release/` branch, run `./scripts/createReleasePr.sh`
    3. Merge the PR

## Uni-versioning

Some sets of packages may want to share a fixed version. This can be configured in `.changesets/config`.