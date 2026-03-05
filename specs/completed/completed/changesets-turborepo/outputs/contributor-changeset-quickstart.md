# Contributor Quick-Start: Changesets

Follow these steps whenever your PR changes released behavior.

## 1) Make your code change

Implement your package change normally.

## 2) Add a changeset

Run:

```bash
bun run changeset
```

Then:

1. Select the package(s) changed.
2. Choose semver bump type (`patch`, `minor`, or `major`).
3. Write a short, user-facing summary.

Commit the generated `.changeset/*.md` file with your code.

## 3) If no release is needed, add an empty changeset

If your PR should not publish anything, run:

```bash
bun run changeset --empty
```

Commit that file so CI/release tooling has explicit intent.

## 4) Validate locally before push

```bash
bun run changeset:status
```

- If this command errors with `Some packages have been changed but no changesets were found`, add a real or empty changeset.

## 5) Open and merge PR

1. Open PR with code + changeset file.
2. After merge to `main`, GitHub Actions updates/creates the release PR automatically.
3. Do not manually edit versions/changelogs outside the Changesets flow unless maintainers explicitly request it.

## Current publish-surface reminder

Current publish target: `@beep/groking-effect-v4`  
Private workspace packages are intentionally excluded in `.changeset/config.json`.
