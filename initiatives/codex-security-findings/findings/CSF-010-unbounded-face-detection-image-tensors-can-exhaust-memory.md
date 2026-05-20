# CSF-010: Unbounded face-detection image tensors can exhaust memory

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 3ce0fe0 |
| Reported age | 6d ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/face-detection/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a denial-of-service bug in the new face-detection feature. The code adds face-detection request schemas and preprocessing logic but does not bound pixel count or tensor allocation size before raw decode and ONNX tensor creation.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Face detection preprocessing now rejects oversized input images before decoding large buffers or tensors. The branch bounds source byte size, source pixel count, fixed model dimensions, padded tensor dimensions, and decoded image dimensions before allocating pixel arrays.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx tsc --noEmit --pretty false -p packages/drivers/face-detection/tsconfig.json && bunx vitest run packages/drivers/face-detection/test/FaceDetection.service.test.ts`
- Changed files:
  - packages/drivers/face-detection/src/FaceDetection.service.ts
- Verification notes:
  - The package typecheck passes and the focused face-detection service test passes.

## Evidence Paths

- packages/drivers/face-detection/src/FaceDetection.models.ts
- packages/drivers/face-detection/src/FaceDetection.service.ts
- packages/tooling/tool/cli/src/commands/Files/Files.service.ts

## Validation Notes From Codex

- Confirm the public face-detection image request lacks maximum file-size, dimension, pixel-count, or tensor-size validation.
- Confirm preprocessing derives pad dimensions from unbounded image metadata or unbounded model metadata.
- Confirm the code decodes raw pixels and allocates both 3widthheight Uint8 data and a Float32 tensor copy without a guard.
- Reproduce the allocation path with a valid small-on-disk large-dimension image and observe memory growth or process failure.
- Check whether CLI concurrency can multiply per-image allocation, and attempt crash/valgrind/debugger validation before finalizing.

## Sanitized Finding Content

```text
Finding
Unbounded face-detection image tensors can exhaust memory
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
3ce0fe0
2:20 AM May 13, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a denial-of-service bug in the new face-detection feature. The code adds face-detection request schemas and preprocessing logic but does not bound pixel count or tensor allocation size before raw decode and ONNX tensor creation.
The new @beep/face-detection driver accepts arbitrary image paths and does not enforce maximum image dimensions, model input dimensions, file size, or tensor size. During preprocessing it reads image metadata, derives padded dimensions either from the model metadata or from the original image dimensions, decodes the image to raw pixels, allocates a 3 * width * height Uint8Array, and then converts it into a Float32Array for ONNX. A large but valid image, especially when used with a dynamic-input YuNet model, can therefore force hundreds of MB to multiple GB of allocations. The files detect-faces CLI runs up to four image analyses concurrently, multiplying the impact. An attacker who can get a crafted image into a dataset/repository that a victim or automation scans can cause the CLI/runtime process to terminate or become unavailable.
Validation
Confirm the public face-detection image request lacks maximum file-size, dimension, pixel-count, or tensor-size validation.
Confirm preprocessing derives pad dimensions from unbounded image metadata or unbounded model metadata.
Confirm the code decodes raw pixels and allocates both 3widthheight Uint8 data and a Float32 tensor copy without a guard.
Reproduce the allocation path with a valid small-on-disk large-dimension image and observe memory growth or process failure.
Check whether CLI concurrency can multiply per-image allocation, and attempt crash/valgrind/debugger validation before finalizing.
Validation artifact
Evidence
packages/drivers/face-detection/src/FaceDetection.models.ts
189
export class FaceDetectionImageRequest extends S.Class<FaceDetectionImageRequest>($I`FaceDetectionImageRequest`)(
190
{
191
imagePath: S.String,
192
minConfidence: FaceDetectionConfidence.pipe(
193
S.withConstructorDefault(Effect.succeed(0.75)),
194
S.withDecodingDefault(Effect.succeed(0.75))
195
),
196
nmsThreshold: FaceDetectionConfidence.pipe(
197
S.withConstructorDefault(Effect.succeed(0.3)),
198
S.withDecodingDefault(Effect.succeed(0.3))
199
),
200
topK: FaceDetectionTopK.pipe(
201
S.withConstructorDefault(Effect.succeed(5000)),
202
S.withDecodingDefault(Effect.succeed(5000))
203
),
packages/drivers/face-detection/src/FaceDetection.service.ts
175
const height = metadata.shape[2];
176
const width = metadata.shape[3];
177
178
if (!P.isNumber(height) || !P.isNumber(width) || height < 1 || width < 1) {
179
return Effect.succeed(O.none());
180
}
181
182
return Effect.succeed(O.some(new ModelInputDimensions({ height, width })));
189
const metadata = yield* Effect.tryPromise({
190
try: () => sharp(imagePath).metadata(),
191
catch: (cause) =>
192
FaceDetectionError.fromUnknown("preprocessImage", `Failed to read image metadata: "${imagePath}"`, {
193
cause,
194
imagePath,
195
}),
196
});
197
198
const width = metadata.width ?? 0;
199
const height = metadata.height ?? 0;
200
201
if (width < 1 || height < 1) {
202
return yield* new FaceDetectionError({
203
imagePath,
204
message: `Image metadata did not return usable dimensions for "${imagePath}"`,
205
operation: "preprocessImage",
206
});
207
}
208
209
const scale = pipe(
210
inputDimensions,
211
O.map((dimensions) => Math.min(dimensions.width / width, dimensions.height / height)),
212
O.getOrElse(() => 1)
213
);
214
const padWidth = pipe(
215
inputDimensions,
216
O.map((dimensions) => dimensions.width),
217
O.getOrElse(() => toPaddedDimension(width))
218
);
219
const padHeight = pipe(
220
inputDimensions,
221
O.map((dimensions) => dimensions.height),
222
O.getOrElse(() => toPaddedDimension(height))
223
);
224
const resizedWidth = Math.round(width * scale);
228
const decoded = yield* Effect.tryPromise({
229
try: () => {
230
let image = sharp(imagePath)
231
.rotate()
232
.flatten({ background: { b: 0, g: 0, r: 0 } })
233
.toColorspace("srgb");
234
235
if (O.isSome(inputDimensions)) {
236
image = image.resize({
237
background: { b: 0, g: 0, r: 0 },
238
fit: "contain",
239
height: inputDimensions.value.height,
240
width: inputDimensions.value.width,
241
});
242
}
243
244
return image.raw().toBuffer({ resolveWithObject: true });
245
},
246
catch: (cause) =>
247
FaceDetectionError.fromUnknown("preprocessImage", `Failed to decode image pixels: "${imagePath}"`, {
248
cause,
249
imagePath,
250
}),
251
});
252
253
const channels = decoded.info.channels;
254
255
if (decoded.info.width < 1 || decoded.info.height < 1 || channels < 3) {
256
return yield* new FaceDetectionError({
257
imagePath,
258
message: `Image decode did not return usable RGB pixels for "${imagePath}"`,
259
operation: "preprocessImage",
260
});
261
}
262
263
const tensorData = new Uint8Array(3 * padWidth * padHeight);
264
265
for (let y = 0; y < decoded.info.height; y += 1) {
266
for (let x = 0; x < decoded.info.width; x += 1) {
267
const sourceOffset = (y * decoded.info.width + x) * channels;
268
const targetOffset = y * padWidth + x;
269
tensorData[targetOffset] = decoded.data[sourceOffset + 2] ?? 0;
270
tensorData[padWidth * padHeight + targetOffset] = decoded.data[sourceOffset + 1] ?? 0;
271
tensorData[2 * padWidth * padHeight + targetOffset] = decoded.data[sourceOffset] ?? 0;
272
}
273
}
274
275
return new PreprocessedImage({
276
height,
277
offsetX,
278
offsetY,
279
padHeight,
280
padWidth,
281
scale,
282
tensorData,
283
width,
284
});
285
});
286
287
const makeInputTensor = (ort: Ort, image: PreprocessedImage): OrtTensor =>
288
new ort.Tensor("float32", Float32Array.from(image.tensorData), [1, 3, image.padHeight, image.padWidth]);
packages/tooling/tool/cli/src/commands/Files/Files.service.ts
3980
if (A.isReadonlyArrayNonEmpty(collection.files)) {
3981
yield* withDetector(new FaceDetectionModelConfig({ modelPath: validatedOptions.modelPath }), (detector) =>
3982
Effect.gen(function* () {
3983
const analysisResults = yield* runFilesProgressForEach(
3984
collection.files,
3985
(file) => analyzeDetectFacesFile(detector, file, validatedOptions).pipe(Effect.result),
3986
{
3987
concurrency: FilesConcurrency.image,
3988
enabled: progressEnabled,
Attack-path analysis
Keep as medium. The code evidence validates a real resource-exhaustion bug reachable through normal local CLI use: unbounded image/model dimensions flow into raw decode, `Uint8Array`, and Float32 tensor allocation, and the CLI processes up to four images concurrently. The provided validation evidence further supports availability impact with a small 8192x8192 PNG causing >1.2GB RSS and an allocation failure under a memory limit. However, severity should not be raised above medium because the surface is local/automation-only, requires victim interaction or workflow ingestion of attacker-controlled files, may depend on dynamic or oversized model dimensions, affects availability of a single process/job, and does not demonstrate data exposure, privilege escalation, authentication bypass, cross-tenant access, or code execution.
Path
Attacker-controlled image in scanned directory --Victim scans dataset/repository--> `files detect-faces --dir ... --model ...` local CLI invocation --CLI passes file path to detector--> `FaceDetectionImageRequest` accepts raw `imagePath` without file-size or pixel-count cap --No request-level size/dimension bounds--> `preprocessImage` derives unbounded pad dimensions and decodes raw pixels --Unbounded dimensions drive allocation size--> Uint8 tensor plus Float32 ONNX tensor allocation --Large allocations exhaust memory--> Memory exhaustion / process or job failure
The finding is supported by repository code and validation evidence. The public face-detection request only carries `imagePath` and threshold fields, with no file-size, dimension, pixel-count, or tensor-size bound. The detector trusts fixed model dimensions when present and otherwise derives padded dimensions from image metadata. It then decodes the image to raw pixels, allocates a `Uint8Array(3 * padWidth * padHeight)`, and converts it to a Float32 ONNX tensor. The CLI exposes this through normal `files detect-faces` use and processes images with fixed image concurrency of 4. This is a real availability vulnerability for local/automation workflows that process attacker-supplied images, but it is not remotely reachable, does not cross an identity boundary, and does not expose secrets or code execution. Medium severity is appropriate; high or critical would be overstated.
Likelihood
Medium - The exploit path is plausible but not internet-exposed. It requires a victim or automation to run the optional `detect-faces` command on a directory containing attacker-controlled image content and to use a dynamic-input or oversized-dimension model. Once those conditions hold, the crafted image is straightforward and low cost.
Impact
Medium - Successful exploitation can crash or make unavailable a local CLI process or automation job by exhausting memory. The validation evidence demonstrates large memory consumption and allocation failure from a small valid high-dimension PNG. There is no demonstrated confidentiality, integrity, identity, or code-execution impact, and the blast radius is the invoking process/host workflow.
Assumptions
The attacker can place or contribute a valid but high-dimension image into a dataset or repository directory that a victim or automation later scans with the files detect-faces command.
The victim uses a YuNet-compatible ONNX model with dynamic input dimensions, or a model whose metadata reports large input dimensions; fixed small model dimensions reduce the vulnerable allocation path substantially.
The primary security impact is availability loss of the local CLI/runtime process or CI/automation job, not data disclosure, privilege escalation, or remote code execution.
Victim or automation invokes the local `files detect-faces` CLI command
The scanned directory contains attacker-controlled image bytes
A supplied ONNX model has dynamic input dimensions or unreasonably large fixed dimensions
The host has enough memory pressure for raw decode, Uint8 tensor, and Float32 tensor allocations to fail or destabilize the process
Controls
Local CLI invocation is required; there is no HTTP ingress, load balancer, service account, or cloud identity involved in this attack path.
The command scans direct files from a selected directory and filters to supported image-like entries before detection.
Symlink and regular-file checks reduce traversal/symlink abuse, but they do not cap image dimensions or allocation size.
The concurrency helper bounds image analysis to 4 workers, but that still amplifies memory use and is not a memory-budget control.
Blindspots
Static review did not enumerate all packaged/distributed entrypoints that may call `@beep/face-detection` outside the shown CLI.
The exact prevalence of dynamic-input YuNet models among expected users is unknown; fixed small model dimensions reduce exploitability.
Runtime memory behavior can vary by Node/Bun, sharp/libvips, ONNX Runtime, host limits, and image format.
No cloud/IaC deployment artifacts expose this path as a network service in the reviewed evidence.
Finding content copied
Finding content copied
```
