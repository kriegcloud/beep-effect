/**
 * CanvasProject aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $CanvasDomainId } from "@beep/identity/packages";
import { Effect, pipe, Tuple } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  CanvasNodeAlreadyExists,
  CanvasNodeNotFound,
  CanvasProjectAlreadyArchived,
  CanvasProjectInvalidTransition,
} from "./CanvasProject.errors.js";
import {
  CanvasNodeId,
  CanvasNodeKind,
  CanvasNodeLabel,
  CanvasProjectId,
  CanvasProjectStatus,
  CanvasProjectTitle,
} from "./CanvasProject.values.js";

const $I = $CanvasDomainId.create("aggregates/CanvasProject/CanvasProject.model");

/**
 * Lightweight node metadata stored inside a bootstrap canvas scene.
 *
 * @example
 * ```ts
 * import { CanvasNode } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(CanvasNode)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export class CanvasNode extends S.Class<CanvasNode>($I`CanvasNode`)(
  {
    id: CanvasNodeId,
    kind: CanvasNodeKind,
    label: CanvasNodeLabel,
  },
  $I.annote("CanvasNode", {
    title: "CanvasNode",
    description: "Non-rendering metadata entry for a bootstrap canvas scene.",
  })
) {}

export class OpenCanvasProject extends S.Class<OpenCanvasProject>($I`OpenCanvasProject`)(
  {
    id: CanvasProjectId,
    title: CanvasProjectTitle,
    status: S.tag("open"),
    nodes: S.Array(CanvasNode),
  },
  $I.annote("OpenCanvasProject", {
    title: "Open CanvasProject",
    description: "Mutable scene container aggregate for the bootstrap canvas slice.",
  })
) {}

export class ArchivedCanvasProject extends S.Class<ArchivedCanvasProject>($I`ArchivedCanvasProject`)(
  {
    id: CanvasProjectId,
    title: CanvasProjectTitle,
    status: S.tag("archived"),
    nodes: S.Array(CanvasNode),
  },
  $I.annote("ArchivedCanvasProject", {
    title: "Archived CanvasProject",
    description: "Archived scene container aggregate for the bootstrap canvas slice.",
  })
) {}

/**
 * CanvasProject aggregate.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(CanvasProject)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const CanvasProject = CanvasProjectStatus.mapMembers(
  Tuple.evolve([() => OpenCanvasProject, () => ArchivedCanvasProject])
).pipe(
  S.toTaggedUnion("status"),
  $I.annoteSchema("CanvasProject", {
    title: "CanvasProject",
    description: "Scene container aggregate for the bootstrap canvas slice.",
  })
);

/**
 * CanvasProject aggregate type.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type CanvasProject = typeof CanvasProject.Type;

const makeCanvasProject = (canvasProject: CanvasProject): CanvasProject =>
  canvasProject.status === "open" ? OpenCanvasProject.make(canvasProject) : ArchivedCanvasProject.make(canvasProject);

/**
 * CanvasProject creation input.
 *
 * @example
 * ```ts
 * import { CreateCanvasProjectInput } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(CreateCanvasProjectInput)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export class CreateCanvasProjectInput extends S.Class<CreateCanvasProjectInput>($I`CreateCanvasProjectInput`)(
  {
    id: CanvasProjectId,
    title: CanvasProjectTitle,
    nodes: CanvasNode.pipe(
      S.Array,
      S.OptionFromOptionalKey,
      S.withConstructorDefault(Effect.succeed(O.none<ReadonlyArray<CanvasNode>>()))
    ),
  },
  $I.annote("CreateCanvasProjectInput", {
    title: "Create CanvasProject input",
    description: "Input required to create an open canvas scene container.",
  })
) {}

/**
 * Create a new open CanvasProject aggregate.
 *
 * @example
 * ```ts
 * import { create } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(create)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const create = (input: CreateCanvasProjectInput): CanvasProject =>
  OpenCanvasProject.make({
    id: input.id,
    title: input.title,
    status: "open",
    nodes: O.getOrElse(input.nodes, A.empty<CanvasNode>),
  });

const requireMutable = (canvasProject: CanvasProject): Effect.Effect<void, CanvasProjectAlreadyArchived> =>
  canvasProject.status === "archived"
    ? Effect.fail(CanvasProjectAlreadyArchived.make({ canvasProjectId: canvasProject.id }))
    : Effect.void;

const findNode = (canvasProject: CanvasProject, canvasNodeId: CanvasNodeId): O.Option<CanvasNode> =>
  pipe(
    canvasProject.nodes,
    A.findFirst((node) => node.id === canvasNodeId)
  );

/**
 * Add lightweight node metadata to an open CanvasProject.
 *
 * @example
 * ```ts
 * import { addNode } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(addNode)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const addNode = Effect.fn("CanvasProject.addNode")(function* (
  canvasProject: CanvasProject,
  canvasNode: CanvasNode
) {
  yield* requireMutable(canvasProject);
  if (O.isSome(findNode(canvasProject, canvasNode.id))) {
    return yield* CanvasNodeAlreadyExists.make({
      canvasProjectId: canvasProject.id,
      canvasNodeId: canvasNode.id,
    });
  }
  return OpenCanvasProject.make({
    ...canvasProject,
    status: "open",
    nodes: A.append(canvasProject.nodes, canvasNode),
  });
});

/**
 * Remove lightweight node metadata from an open CanvasProject.
 *
 * @example
 * ```ts
 * import { removeNode } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(removeNode)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const removeNode = Effect.fn("CanvasProject.removeNode")(function* (
  canvasProject: CanvasProject,
  canvasNodeId: CanvasNodeId
) {
  yield* requireMutable(canvasProject);
  if (O.isNone(findNode(canvasProject, canvasNodeId))) {
    return yield* CanvasNodeNotFound.make({
      canvasProjectId: canvasProject.id,
      canvasNodeId,
    });
  }
  return OpenCanvasProject.make({
    ...canvasProject,
    status: "open",
    nodes: A.filter(canvasProject.nodes, (node) => node.id !== canvasNodeId),
  });
});

/**
 * Archive any non-archived CanvasProject.
 *
 * @example
 * ```ts
 * import { archive } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(archive)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const archive = Effect.fn("CanvasProject.archive")(function* (canvasProject: CanvasProject) {
  yield* requireMutable(canvasProject);
  return ArchivedCanvasProject.make({
    ...canvasProject,
    status: "archived",
  });
});

/**
 * Reopen an archived CanvasProject.
 *
 * @example
 * ```ts
 * import { reopen } from "@beep/canvas-domain/aggregates/CanvasProject"
 *
 * console.log(reopen)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const reopen = Effect.fn("CanvasProject.reopen")(function* (canvasProject: CanvasProject) {
  if (canvasProject.status !== "archived") {
    return yield* CanvasProjectInvalidTransition.fromStatus({
      canvasProjectId: canvasProject.id,
      from: canvasProject.status,
      to: "open",
    });
  }
  return makeCanvasProject({
    ...canvasProject,
    status: "open",
  });
});
