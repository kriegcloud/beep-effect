// import { Command, Flag } from "effect/unstable/cli";
//
// const videoFlag = Flag.file("video", { mustExist: true }).pipe(Flag.withDescription("Input video file to sample"));
// const dirFlag = Flag.directory("dir", { mustExist: true }).pipe(
//   Flag.withDescription("Directory containing direct video files to sample")
// );
// const outDirFlag = Flag.directory("out-dir").pipe(Flag.withDescription("Output directory for extracted PNG frames"));
// const fpsFlag = Flag.float("fps").pipe(Flag.withDescription("Positive frame extraction rate in frames per second"));
// const prefixFlag = Flag.string("prefix").pipe(
//   Flag.withDescription("Generated frame prefix; defaults to <video-stem>_frame"),
//   Flag.optional
// );
// const manifestFlag = Flag.path("manifest", { pathType: "file" }).pipe(
//   Flag.withDescription("Manifest output path; defaults to --out-dir/extract-frames-manifest.json"),
//   Flag.optional
// );
// const overwriteFlag = Flag.boolean("overwrite").pipe(
//   Flag.withDescription("Overwrite existing frame outputs and manifest")
// );
