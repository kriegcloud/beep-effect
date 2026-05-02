# Beep CLI Image Commands

Last verified: 2026-05-02

This document describes the current `beep-cli image` command group from
`packages/tooling/tool/cli/src/commands/Image/index.ts`.

Run it from the repository root with:

```sh
bun run beep image <subcommand> [flags]
```

The package binary shape is:

```sh
beep-cli image <subcommand> [flags]
```

The root `package.json` also exposes:

```sh
bun run image <subcommand> [flags]
```

## Command Group

`image` is the image and video curation command group. It currently exposes one
subcommand:

| Subcommand | Purpose |
| --- | --- |
| `extract-frames` | Extract PNG frames from a video with native `ffmpeg`. |

There are no positional arguments on the `image` group itself. Choose a
subcommand and pass that subcommand's flags.

## Global Flags

These flags are accepted by the `image` command group and its subcommands:

| Flag | Argument | What it does |
| --- | --- | --- |
| `--help`, `-h` | none | Shows help information for the current command. |
| `--version` | none | Prints the CLI version. |
| `--completions` | `bash`, `zsh`, `fish`, or `sh` | Prints a shell completion script for the selected shell. |
| `--log-level` | `all`, `trace`, `debug`, `info`, `warn`, `warning`, `error`, `fatal`, or `none` | Sets the minimum log level. |

## `image extract-frames`

Extracts PNG frames from a video at a fixed frame rate using native `ffmpeg`.

Usage:

```sh
bun run beep image extract-frames \
  --video ./input/clip.mp4 \
  --out-dir ./frames \
  --fps 1
```

Equivalent via the root alias:

```sh
bun run image extract-frames --video ./input/clip.mp4 --out-dir ./frames --fps 1
```

### Required Flags

| Flag | Argument | What it does |
| --- | --- | --- |
| `--video` | file | Input video file to sample. The file must already exist. |
| `--out-dir` | directory | Output directory for extracted PNG frames. Missing directories are created by the FFmpeg service. |
| `--fps` | number | Positive frame extraction rate in frames per second. |

### Optional Flags

| Flag | Argument | Default | What it does |
| --- | --- | --- | --- |
| `--prefix` | string | `<video-stem>_frame` | Prefix for generated frame names. For `clip.mp4`, the default prefix is `clip_frame`. |
| `--manifest` | path | `--out-dir/extract-frames-manifest.json` | Manifest output path. The manifest directory is created when needed. |
| `--overwrite` | none | `false` | Allows existing frame outputs and the manifest to be replaced. Without it, the command refuses to overwrite existing outputs. |

### Outputs

Frame outputs are PNG files named with the selected prefix and a zero-padded index:

```text
clip_frame_00000.png
clip_frame_00001.png
```

The command also writes an extract-frames manifest. By default:

```text
<out-dir>/extract-frames-manifest.json
```

On success, non-TTY output prints a summary like:

```text
image extract-frames: wrote 2 frame(s) to ./frames. manifest: ./frames/extract-frames-manifest.json
```

In a TTY, the command renders an inline progress bar while frames are being
extracted.

### Behavior Notes

- `ffmpeg` and `ffprobe` must be available to the native FFmpeg service.
- `--video` points at a single video file, not a directory.
- `--fps` must be positive.
- Existing output files are protected unless `--overwrite` is passed.
- The output directory is resolved to an absolute path before extraction.
- The manifest path is resolved to an absolute path when a custom `--manifest`
  is provided.

## Related Photo Normalization Command

Directory photo normalization is not an `image` subcommand in the current CLI.
It lives under the `files` command group:

```sh
bun run beep files normalize --dir ./raw --out-dir ./dataset/images --format png
```

Use `bun run beep files normalize --help` for that command's full flag surface.
