/**
 * CanvasProject aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import {$CanvasDomainId} from "@beep/identity/packages";
import {Effect, pipe, Tuple} from "effect";
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
) {
}

/**
 * CanvasProject aggregate.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const CanvasProject = CanvasProjectStatus.mapMembers((members) => {
  const make = <T extends CanvasProjectStatus>(literal: S.Literal<T>) => S.Struct({
    id: CanvasProjectId,
    title: CanvasProjectTitle,
    status: S.tag(literal.literal),
    nodes: S.Array(CanvasNode),
  })

  return pipe(
    members,
    Tuple.evolve([
      make,
      make
    ])
  )
}).pipe(
  S.toTaggedUnion("status"),
  $I.annoteSchema("CanvasProject", {
    title: "CanvasProject",
    description: "Scene container aggregate for the bootstrap canvas slice.",
  })
)

export type CanvasProject = typeof CanvasProject.Type;

/**
 * CanvasProject creation input.
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
) {
}

/**
 * Create a new open CanvasProject aggregate.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const create = (input: CreateCanvasProjectInput): CanvasProject =>
  CanvasProject.make({
    id: input.id,
    title: input.title,
    status: "open",
    nodes: O.getOrElse(input.nodes, A.empty<CanvasNode>),
  });

const requireMutable = (canvasProject: CanvasProject): Effect.Effect<void, CanvasProjectAlreadyArchived> =>
  canvasProject.status === "archived"
    ? Effect.fail(CanvasProjectAlreadyArchived.make({canvasProjectId: canvasProject.id}))
    : Effect.void;

const findNode = (
  canvasProject: CanvasProject,
  canvasNodeId: CanvasNodeId
): O.Option<CanvasNode> =>
  pipe(
    canvasProject.nodes,
    A.findFirst((node) => node.id === canvasNodeId)
  );

/**
 * Add lightweight node metadata to an open CanvasProject.
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
  return CanvasProject.make({
    ...canvasProject,
    nodes: A.append(canvasProject.nodes, canvasNode),
  });
});

/**
 * Remove lightweight node metadata from an open CanvasProject.
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
  return CanvasProject.make({
    ...canvasProject,
    nodes: A.filter(canvasProject.nodes, (node) => node.id !== canvasNodeId),
  });
});

/**
 * Archive any non-archived CanvasProject.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const archive = Effect.fn("CanvasProject.archive")(function* (canvasProject: CanvasProject) {
  yield* requireMutable(canvasProject);
  return CanvasProject.make({
    ...canvasProject,
    status: "archived",
  });
});

/**
 * Reopen an archived CanvasProject.
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
  return CanvasProject.make({
    ...canvasProject,
    status: "open",
  });
});
