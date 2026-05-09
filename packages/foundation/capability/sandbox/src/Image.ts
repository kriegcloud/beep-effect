/**
 * Container image helpers for sandbox CLI setup.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Effect, Path } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { DockerError, PodmanError } from "./Sandbox.errors.ts";
import { redactSensitiveText } from "./Sandbox.observability.ts";
import { ProcessCommand, type ProcessResult, SandboxProcess } from "./Sandbox.process.ts";

const $I = $SandboxId.create("Image");

/**
 * Container runtime used for local sandbox images.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ContainerImageRuntime = LiteralKit(["docker", "podman"]).annotate(
  $I.annote("ContainerImageRuntime", {
    description: "Container runtime used for local sandbox images.",
  })
);

/**
 * Runtime type for {@link ContainerImageRuntime}.
 *
 * @category models
 * @since 0.0.0
 */
export type ContainerImageRuntime = typeof ContainerImageRuntime.Type;

/**
 * Options for building a local sandbox image.
 *
 * @example
 * ```ts
 * import { ContainerImageBuildOptions } from "@beep/sandbox"
 *
 * const options = new ContainerImageBuildOptions({
 *   contextDir: ".sandcastle",
 *   imageName: "beep-sandbox:demo",
 *   runtime: "docker"
 * })
 * console.log(options.imageName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ContainerImageBuildOptions extends S.Class<ContainerImageBuildOptions>($I`ContainerImageBuildOptions`)(
  {
    contextDir: S.String,
    file: S.optionalKey(S.String),
    imageName: S.String,
    runtime: ContainerImageRuntime,
  },
  $I.annote("ContainerImageBuildOptions", {
    description: "Options for building a local sandbox image.",
  })
) {}

/**
 * Docker-specific image build options.
 *
 * @example
 * ```ts
 * import { DockerImageBuildOptions } from "@beep/sandbox"
 *
 * const options = new DockerImageBuildOptions({ contextDir: ".sandcastle" })
 * console.log(options.contextDir)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DockerImageBuildOptions extends S.Class<DockerImageBuildOptions>($I`DockerImageBuildOptions`)(
  {
    contextDir: S.String,
    dockerfile: S.optionalKey(S.String),
  },
  $I.annote("DockerImageBuildOptions", {
    description: "Docker-specific image build options.",
  })
) {}

/**
 * Podman-specific image build options.
 *
 * @example
 * ```ts
 * import { PodmanImageBuildOptions } from "@beep/sandbox"
 *
 * const options = new PodmanImageBuildOptions({ contextDir: ".sandcastle" })
 * console.log(options.contextDir)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PodmanImageBuildOptions extends S.Class<PodmanImageBuildOptions>($I`PodmanImageBuildOptions`)(
  {
    containerfile: S.optionalKey(S.String),
    contextDir: S.String,
  },
  $I.annote("PodmanImageBuildOptions", {
    description: "Podman-specific image build options.",
  })
) {}

/**
 * Options for removing a local sandbox image.
 *
 * @example
 * ```ts
 * import { ContainerImageRemoveOptions } from "@beep/sandbox"
 *
 * const options = new ContainerImageRemoveOptions({
 *   imageName: "beep-sandbox:demo",
 *   runtime: "podman"
 * })
 * console.log(options.runtime)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ContainerImageRemoveOptions extends S.Class<ContainerImageRemoveOptions>($I`ContainerImageRemoveOptions`)(
  {
    imageName: S.String,
    runtime: ContainerImageRuntime,
  },
  $I.annote("ContainerImageRemoveOptions", {
    description: "Options for removing a local sandbox image.",
  })
) {}

const runtimeError = (runtime: ContainerImageRuntime, message: string, cause: unknown): DockerError | PodmanError =>
  runtime === "docker"
    ? new DockerError({
        cause,
        message,
      })
    : new PodmanError({
        cause,
        message,
      });

const processOutput = (result: ProcessResult): string => redactSensitiveText(result.stderr || result.stdout);

const processResultOrRuntimeError = (
  runtime: ContainerImageRuntime,
  action: string,
  result: ProcessResult
): Effect.Effect<void, DockerError | PodmanError> =>
  result.exitCode === 0
    ? Effect.void
    : Effect.fail(
        runtimeError(
          runtime,
          `${runtime} ${action} failed with exit code ${result.exitCode}: ${processOutput(result)}`,
          processOutput(result)
        )
      );

const runRuntimeCommand = Effect.fn("Image.runRuntimeCommand")(function* (
  runtime: ContainerImageRuntime,
  action: string,
  args: ReadonlyArray<string>
) {
  const process = yield* SandboxProcess;
  const result = yield* process
    .run(
      new ProcessCommand({
        args,
        command: runtime,
      })
    )
    .pipe(Effect.mapError((cause) => runtimeError(runtime, `${runtime} ${action} failed.`, cause)));

  yield* processResultOrRuntimeError(runtime, action, result);
});

const optionalImageFileArgs = (file: string | undefined): ReadonlyArray<string> =>
  P.isUndefined(file) ? [] : ["-f", file];

/**
 * Build a local Docker or Podman image for sandbox runs.
 *
 * @example
 * ```ts
 * import { buildContainerImage, ContainerImageBuildOptions } from "@beep/sandbox"
 *
 * const program = buildContainerImage(
 *   new ContainerImageBuildOptions({
 *     contextDir: ".sandcastle",
 *     imageName: "beep-sandbox:demo",
 *     runtime: "docker"
 *   })
 * )
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildContainerImage: (
  options: ContainerImageBuildOptions
) => Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess> = Effect.fn(
  "Image.buildContainerImage"
)(function* (options) {
  const path = yield* Path.Path;
  const contextDir = path.resolve(options.contextDir);
  const imageFile = P.isUndefined(options.file) ? undefined : path.resolve(options.file);

  yield* runRuntimeCommand(options.runtime, "build", [
    "build",
    "-t",
    options.imageName,
    ...optionalImageFileArgs(imageFile),
    contextDir,
  ]);
});

/**
 * Remove a local Docker or Podman sandbox image.
 *
 * @example
 * ```ts
 * import { removeContainerImage, ContainerImageRemoveOptions } from "@beep/sandbox"
 *
 * const program = removeContainerImage(
 *   new ContainerImageRemoveOptions({
 *     imageName: "beep-sandbox:demo",
 *     runtime: "docker"
 *   })
 * )
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const removeContainerImage: (
  options: ContainerImageRemoveOptions
) => Effect.Effect<void, DockerError | PodmanError, SandboxProcess> = Effect.fn("Image.removeContainerImage")(
  function* (options) {
    yield* runRuntimeCommand(options.runtime, "image removal", ["rmi", options.imageName]);
  }
);

/**
 * Build a Docker image for sandbox runs.
 *
 * @example
 * ```ts
 * import { buildDockerImage, DockerImageBuildOptions } from "@beep/sandbox"
 *
 * const program = buildDockerImage(
 *   "beep-sandbox:demo",
 *   new DockerImageBuildOptions({ contextDir: ".sandcastle" })
 * )
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildDockerImage: {
  (
    imageName: string,
    options: DockerImageBuildOptions
  ): Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>;
  (
    options: DockerImageBuildOptions
  ): (imageName: string) => Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>;
} = dual(2, (imageName: string, options: DockerImageBuildOptions) =>
  buildContainerImage(
    new ContainerImageBuildOptions({
      contextDir: options.contextDir,
      ...(P.isUndefined(options.dockerfile) ? {} : { file: options.dockerfile }),
      imageName,
      runtime: "docker",
    })
  )
);

/**
 * Remove a Docker image used for sandbox runs.
 *
 * @example
 * ```ts
 * import { removeDockerImage } from "@beep/sandbox"
 *
 * const program = removeDockerImage("beep-sandbox:demo")
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const removeDockerImage = (imageName: string): Effect.Effect<void, DockerError | PodmanError, SandboxProcess> =>
  removeContainerImage(
    new ContainerImageRemoveOptions({
      imageName,
      runtime: "docker",
    })
  );

/**
 * Build a Podman image for sandbox runs.
 *
 * @example
 * ```ts
 * import { buildPodmanImage, PodmanImageBuildOptions } from "@beep/sandbox"
 *
 * const program = buildPodmanImage(
 *   "beep-sandbox:demo",
 *   new PodmanImageBuildOptions({ contextDir: ".sandcastle" })
 * )
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildPodmanImage: {
  (
    imageName: string,
    options: PodmanImageBuildOptions
  ): Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>;
  (
    options: PodmanImageBuildOptions
  ): (imageName: string) => Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>;
} = dual(2, (imageName: string, options: PodmanImageBuildOptions) =>
  buildContainerImage(
    new ContainerImageBuildOptions({
      contextDir: options.contextDir,
      ...(P.isUndefined(options.containerfile) ? {} : { file: options.containerfile }),
      imageName,
      runtime: "podman",
    })
  )
);

/**
 * Remove a Podman image used for sandbox runs.
 *
 * @example
 * ```ts
 * import { removePodmanImage } from "@beep/sandbox"
 *
 * const program = removePodmanImage("beep-sandbox:demo")
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const removePodmanImage = (imageName: string): Effect.Effect<void, DockerError | PodmanError, SandboxProcess> =>
  removeContainerImage(
    new ContainerImageRemoveOptions({
      imageName,
      runtime: "podman",
    })
  );
