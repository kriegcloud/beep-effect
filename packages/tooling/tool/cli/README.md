# `@beep/repo-cli`

CLI tool for creating and managing packages in the beep-effect monorepo following Effect v4 standards.

## Requirements

- **TypeScript 5.9 or Newer**
- **Strict Type-Checking**
- **Bun 1.3.9 or Newer**

## Installation

This is a private workspace package. Use it via:

```bash
bunx @beep/repo-cli <command>
```

## Commands

### `create-package`

Create a new package following effect-smol patterns.

```bash
bunx @beep/repo-cli create-package <name> [--type=library|tool|app]
```

### `codegen`

Generate barrel file exports for a package.

```bash
bunx @beep/repo-cli codegen [package-dir]
```

### `docgen quality`

Produce a report-only JSDoc quality review for exported symbols. The command
does not block on advisory findings; use `--score codex` when you want bounded
remediation packets for follow-up documentation work. Package-local runs write
`JSDOC_QUALITY.md` or `JSDOC_QUALITY.json` by default; use `--output` for a
scratch destination.

```bash
bun run beep docgen quality -p packages/shared/config -o /tmp/jsdoc-quality.md
bun run beep docgen quality --changed-files --json
bun run beep docgen quality --all --score codex -o /tmp/jsdoc-quality.json
```

### `files`

Curate direct image and video files for dataset preparation. From the repo root,
prefer the workspace shortcut:

```bash
bun run files <subcommand> [options]
```

The package binary works the same way:

```bash
bunx @beep/repo-cli files <subcommand> [options]
```

All `files` subcommands work on direct children of `--dir`; they do not recurse
into nested directories.

#### `files sort-and-rename`

Sort direct files by size, largest first, then rename them with a generated
prefix and zero-padded index.

```bash
bun run files sort-and-rename --dir ./tmp --prefix image --dry-run
bun run files sort-and-rename --dir ./tmp --prefix image
```

Output names use `<prefix>_<index>.<ext>`. The index width grows with the number
of selected files, so 7 files use `00`, 50 files use `000`, and 100 files use
`0000`.

Use `--with-dimensions` to append probed media dimensions:

```bash
bun run files sort-and-rename --dir ./tmp --prefix image --with-dimensions
```

With dimensions enabled, names use
`<prefix>_<index>_<width>x<height>.<ext>`, for example
`image_00_1024x1536.png`. Non-media files are left untouched. Video dimensions
require `ffprobe`.

#### `files strip-metadata`

Strip metadata from direct image and video files in place.

```bash
bun run files strip-metadata --dir ./dataset/images --dry-run
bun run files strip-metadata --dir ./dataset/images
```

Images are normalized through `sharp`; videos are rewritten through `ffmpeg`.
This command rewrites selected files in place, so run with `--dry-run` first
when working on irreplaceable sources.

#### `files normalize`

Normalize direct image files into a separate output directory and write a
transform manifest.

```bash
bun run files normalize \
  --dir ./raw \
  --out-dir ./dataset/images \
  --format png \
  --max-long-edge 1024
```

`normalize` applies EXIF orientation, strips metadata, converts format, and can
downscale the long edge without upscaling smaller images. Supported output
formats are `png`, `jpg`/`jpeg`, and `webp`; `png` is the default. The command
preserves source stems (`foo.jpg -> foo.png`) and resolves same-run collisions
as `foo.png`, `foo_01.png`, `foo_02.png`.

Useful options:

- `--manifest <path>` writes the manifest somewhere other than
  `--out-dir/normalize-manifest.json`.
- `--overwrite` allows replacing existing outputs, duplicate move targets, and
  the manifest.
- `--dry-run` prints the plan without creating directories or writing files.
- `--dedupe` skips later files whose normalized output bytes exactly duplicate
  an earlier output.
- `--move-duplicates-to <dir>` enables exact-byte dedupe and moves duplicate
  source files into the provided directory.

The manifest has schema version `beep.files.normalize.v1` and records source
paths, output paths, byte sizes, dimensions, hashes, skipped sources, duplicate
relationships, and summary counts.

#### `files create-captions`

Create same-stem `.txt` caption sidecar files for direct image files.

```bash
bun run files create-captions --dir ./dataset/images --dry-run
bun run files create-captions --dir ./dataset/images
```

By default, existing caption files are preserved and skipped. Use `--caption` to
seed newly created sidecars with shared text, such as a trigger token or class
phrase:

```bash
bun run files create-captions \
  --dir ./dataset/images \
  --caption "my_character, person"
```

Use `--overwrite` only when you intentionally want to replace existing caption
files with the provided `--caption` text, or with empty files when `--caption` is
omitted.

#### `files archive-poor-candidates`

Move obvious poor image candidates out of a dataset directory and write an
archive manifest.

```bash
bun run files archive-poor-candidates \
  --dir ./dataset/images \
  --archive-dir ./dataset/rejected \
  --dry-run
```

By default, the `character-lora` profile archives images that fail any of these
thresholds:

- shorter edge below `--min-short-edge` (`512` by default)
- aspect ratio above `--max-aspect` (`3` by default)
- estimated upscale to `--target-resolution` square area above `--max-upscale`
  (`1024` target resolution and `1.5` max upscale by default)

Same-stem `.txt` sidecars move with archived images by default. Use
`--sidecars none` to leave sidecars in place, or pass a comma-separated list such
as `--sidecars txt,json`. The manifest defaults to
`--archive-dir/archive-poor-candidates-manifest.json`; use `--manifest` to
choose another path and `--overwrite` to replace existing archive targets or the
manifest.

#### `files detect-borders`

Detect solid or near-solid canvas borders in direct image files.

```bash
bun run files detect-borders --dir ./dataset/images
bun run files detect-borders --dir ./dataset/images --json
```

Tune detection with:

- `--tolerance` maximum RGB channel distance from the sampled edge color
  (`12` by default)
- `--min-solid-pct` minimum matching pixels in a border row or column
  (`98.5` by default)
- `--min-width-pct` minimum detected border width (`1` by default)
- `--max-scan-pct` maximum percent of each dimension to scan from an edge
  (`45` by default)

`--json` emits a `beep.files.detect-borders.v1` report.

#### `files crop-borders`

Crop detected solid or near-solid borders from direct image files in place.

```bash
bun run files crop-borders --dir ./dataset/images --dry-run
bun run files crop-borders --dir ./dataset/images
```

`crop-borders` uses the same tuning flags as `detect-borders`. It rewrites
selected images in place, so use `--dry-run` before applying crops to a dataset.

### `sync-data-to-ts`

Sync checked-in generated TypeScript data modules from official upstream sources.

```bash
bunx @beep/repo-cli sync-data-to-ts --target iso4217
bunx @beep/repo-cli sync-data-to-ts --all
bunx @beep/repo-cli sync-data-to-ts --all --check
```

### `docs`

Discover repository laws, skills, and policy gates through command-first output.

```bash
bunx @beep/repo-cli docs laws
bunx @beep/repo-cli docs skills
bunx @beep/repo-cli docs policies
bunx @beep/repo-cli docs find <topic>
```

### `quality`

Run repository operational quality lanes that are not package-local Turbo tasks.

```bash
bun run beep quality github-checks quality
bun run beep quality github-checks repo-sanity
bun run beep quality bun-audit
bun run beep quality dtslint-tsgo
bun run beep quality test-tsgo
bun run beep quality tsgo-smoke
bun run beep quality jsdoc-module-tags
bun run beep quality jsdoc-inventory
```

### `ci`

Render CI helper output from checked-in repo automation.

```bash
bun run beep ci append-turbo-summary
bun run beep ci append-turbo-summary .turbo/runs/latest.json
```

### `graphiti`

Run and manage the local Graphiti MCP queue proxy.

```bash
bun run beep graphiti proxy
bun run beep graphiti proxy ensure
bun run beep graphiti proxy service install
bun run beep graphiti recover --dry-run
```

### `codex`

Launch Codex helper workflows from repo-owned prompts.

```bash
bun run beep codex quality-review-fix-loop "close the current initiative"
```

## License

MIT
