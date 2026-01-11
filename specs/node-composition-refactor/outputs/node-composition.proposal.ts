/**
 * COMPOSITION-BASED NODE HIERARCHY PROPOSAL
 *
 * This file demonstrates how to refactor the flexlayout Node inheritance hierarchy
 * into a composition-based approach using Effect patterns.
 *
 * Key patterns:
 * 1. Data.TaggedClass for immutable nodes with built-in equality
 * 2. S.suspend for recursive schemas
 * 3. Match.exhaustive for polymorphic dispatch
 * 4. Separate behavior modules instead of method overriding
 * 5. Pipeable for fluent composition
 */

import * as Data from "effect/Data";
import * as S from "effect/Schema";
import * as Match from "effect/Match";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as Pipeable from "effect/Pipeable";
import { Rect } from "../rect";
import { DockLocation } from "../dock-location";
import { Orientation } from "../orientation";
import type { UnsafeTypes } from "@beep/types";

// ============================================================================
// PART 1: CORE DATA TYPES
// ============================================================================

/**
 * Shared fields that all nodes have.
 * Instead of inheritance, we compose these into each node type.
 */
const BaseNodeFields = {
  id: S.String,
  rect: Rect.schema,
  path: S.String,
} as const;

/**
 * Fields for nodes that can have children (RowNode, TabSetNode, BorderNode)
 */
const ParentNodeFields = {
  ...BaseNodeFields,
  // Children use S.suspend for recursive definition
} as const;

/**
 * Attributes map - runtime type-safe but flexible for attribute system
 */
const AttributesMap = S.Record({
  key: S.String,
  value: S.Unknown,
});

// ============================================================================
// PART 2: TAGGED NODE CLASSES
// ============================================================================

/**
 * Instead of: class RowNode extends Node
 * We use: class RowNode extends Data.TaggedClass
 *
 * Benefits:
 * - Structural equality built-in
 * - Immutable by default
 * - Discriminator (_tag) for pattern matching
 * - No class hierarchy to maintain
 */

// Forward declaration for recursive type
interface NodeUnion {
  readonly _tag: "RowNode" | "TabSetNode" | "TabNode" | "BorderNode";
}

/**
 * RowNode - container for layout rows
 */
export class RowNode extends Data.TaggedClass("RowNode")<{
  readonly id: string;
  readonly windowId: string;
  readonly rect: Rect;
  readonly path: string;
  readonly weight: number;
  readonly minWidth: number;
  readonly minHeight: number;
  readonly maxWidth: number;
  readonly maxHeight: number;
  readonly children: ReadonlyArray<RowNode | TabSetNode>;
  readonly attributes: Record<string, unknown>;
}> {
  // Pipeable support for fluent composition
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  }
}

/**
 * TabSetNode - container for tabs
 */
export class TabSetNode extends Data.TaggedClass("TabSetNode")<{
  readonly id: string;
  readonly rect: Rect;
  readonly path: string;
  readonly weight: number;
  readonly selected: number;
  readonly tabStripRect: Rect;
  readonly contentRect: Rect;
  readonly children: ReadonlyArray<TabNode>;
  readonly attributes: Record<string, unknown>;
}> {
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  }
}

/**
 * TabNode - leaf node representing a tab
 */
export class TabNode extends Data.TaggedClass("TabNode")<{
  readonly id: string;
  readonly rect: Rect;
  readonly path: string;
  readonly name: string;
  readonly component: string;
  readonly tabRect: Rect;
  readonly visible: boolean;
  readonly rendered: boolean;
  readonly attributes: Record<string, unknown>;
}> {
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  }
}

/**
 * BorderNode - edge-docked container
 */
export class BorderNode extends Data.TaggedClass("BorderNode")<{
  readonly id: string;
  readonly rect: Rect;
  readonly path: string;
  readonly location: DockLocation;
  readonly selected: number;
  readonly size: number;
  readonly contentRect: Rect;
  readonly tabHeaderRect: Rect;
  readonly children: ReadonlyArray<TabNode>;
  readonly attributes: Record<string, unknown>;
}> {
  pipe() {
    return Pipeable.pipeArguments(this, arguments);
  }
}

/**
 * Union type for all nodes - replaces the abstract Node class
 */
export type Node = RowNode | TabSetNode | TabNode | BorderNode;

// ============================================================================
// PART 3: BEHAVIOR MODULES (Replaces Method Overriding)
// ============================================================================

/**
 * Instead of overriding methods in subclasses, we use pure functions
 * with exhaustive pattern matching. This is more explicit and composable.
 */

// ----- Core Node Operations -----

export const NodeOps = {
  /**
   * Get the type tag of a node
   */
  getType: (node: Node): string => node._tag.toLowerCase(),

  /**
   * Get node ID
   */
  getId: (node: Node): string => node.id,

  /**
   * Get node rect
   */
  getRect: (node: Node): Rect =>
    Match.value(node).pipe(
      Match.tag("BorderNode", (n) => n.tabHeaderRect), // BorderNode returns tabHeaderRect
      Match.orElse((n) => n.rect)
    ),

  /**
   * Get node path
   */
  getPath: (node: Node): string => node.path,

  /**
   * Get children of a node
   */
  getChildren: (node: Node): ReadonlyArray<Node> =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => n.children),
      Match.tag("TabSetNode", (n) => n.children),
      Match.tag("BorderNode", (n) => n.children),
      Match.tag("TabNode", () => [] as const),
      Match.exhaustive
    ),

  /**
   * Check if node is a leaf (has no children)
   */
  isLeaf: (node: Node): boolean =>
    node._tag === "TabNode" || NodeOps.getChildren(node).length === 0,

  /**
   * Get orientation based on parent/context
   */
  getOrientation: (node: Node, parentOrientation: O.Option<Orientation>): Orientation =>
    Match.value(node).pipe(
      Match.tag("BorderNode", (n) => n.location.getOrientation()),
      Match.orElse(() =>
        O.match(parentOrientation, {
          onNone: () => Orientation.HORZ,
          onSome: Orientation.flip,
        })
      )
    ),

  /**
   * Traverse all nodes in tree
   */
  forEachNode: (node: Node, fn: (node: Node, level: number) => void, level: number = 0): void => {
    fn(node, level);
    A.forEach(NodeOps.getChildren(node), (child) => {
      NodeOps.forEachNode(child as Node, fn, level + 1);
    });
  },
};

// ----- Draggable Behavior -----

export const DraggableOps = {
  /**
   * Check if node can be dragged
   */
  isDraggable: (node: Node): boolean =>
    Match.value(node).pipe(
      Match.tag("TabNode", () => true),
      Match.tag("TabSetNode", () => true),
      Match.tag("RowNode", () => false),
      Match.tag("BorderNode", () => false),
      Match.exhaustive
    ),

  /**
   * Check if drag is enabled for this node
   */
  isEnableDrag: (node: Node): boolean =>
    Match.value(node).pipe(
      Match.tag("TabNode", (n) => n.attributes.enableDrag !== false),
      Match.tag("TabSetNode", (n) => n.attributes.enableDrag !== false),
      Match.orElse(() => false)
    ),

  /**
   * Get drag name
   */
  getName: (node: Node): O.Option<string> =>
    Match.value(node).pipe(
      Match.tag("TabNode", (n) => O.fromNullable(n.name)),
      Match.tag("TabSetNode", (n) => O.fromNullable(n.attributes.name as string)),
      Match.orElse(() => O.none())
    ),
};

// ----- Drop Target Behavior -----

export interface DropInfo {
  readonly node: Node;
  readonly rect: Rect;
  readonly location: DockLocation;
  readonly index: number;
  readonly className: string;
}

export const DropTargetOps = {
  /**
   * Check if node can be a drop target
   */
  isDropTarget: (node: Node): boolean =>
    Match.value(node).pipe(
      Match.tag("RowNode", () => true),
      Match.tag("TabSetNode", () => true),
      Match.tag("BorderNode", () => true),
      Match.tag("TabNode", () => false),
      Match.exhaustive
    ),

  /**
   * Check if drop is enabled
   */
  isEnableDrop: (node: Node): boolean =>
    Match.value(node).pipe(
      Match.tag("RowNode", () => true),
      Match.tag("TabSetNode", (n) => n.attributes.enableDrop !== false),
      Match.tag("BorderNode", (n) => n.attributes.enableDrop !== false),
      Match.tag("TabNode", () => false),
      Match.exhaustive
    ),

  /**
   * Can drop at location - dispatches to node-specific logic
   */
  canDrop: (
    target: Node,
    dragNode: Node,
    x: number,
    y: number
  ): O.Option<DropInfo> =>
    Match.value(target).pipe(
      Match.tag("RowNode", (n) => RowNodeDropOps.canDrop(n, dragNode, x, y)),
      Match.tag("TabSetNode", (n) => TabSetNodeDropOps.canDrop(n, dragNode, x, y)),
      Match.tag("BorderNode", (n) => BorderNodeDropOps.canDrop(n, dragNode, x, y)),
      Match.tag("TabNode", () => O.none()),
      Match.exhaustive
    ),
};

// Specialized drop operations per node type
const RowNodeDropOps = {
  canDrop: (node: RowNode, dragNode: Node, x: number, y: number): O.Option<DropInfo> => {
    // Implementation of RowNode.canDrop() logic
    // Returns O.some(dropInfo) or O.none()
    const yy = y - node.rect.y;
    const xx = x - node.rect.x;
    const w = node.rect.width;
    const h = node.rect.height;
    const margin = 10;
    const half = 50;

    // Edge docking logic...
    if (x < node.rect.x + margin && yy > h / 2 - half && yy < h / 2 + half) {
      return O.some({
        node,
        rect: DockLocation.LEFT.getDockRect(node.rect),
        location: DockLocation.LEFT,
        index: -1,
        className: "flexlayout__outline_rect_edge",
      });
    }
    // ... more edge cases

    return O.none();
  },
};

const TabSetNodeDropOps = {
  canDrop: (node: TabSetNode, dragNode: Node, x: number, y: number): O.Option<DropInfo> => {
    // Implementation of TabSetNode.canDrop() logic
    return O.none();
  },
};

const BorderNodeDropOps = {
  canDrop: (node: BorderNode, dragNode: Node, x: number, y: number): O.Option<DropInfo> => {
    // Implementation of BorderNode.canDrop() logic
    return O.none();
  },
};

// ----- Sizing Behavior -----

export const SizingOps = {
  /**
   * Get weight of a node (for layout)
   */
  getWeight: (node: Node): number =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => n.weight),
      Match.tag("TabSetNode", (n) => n.weight),
      Match.orElse(() => 0)
    ),

  /**
   * Get min width
   */
  getMinWidth: (node: Node): number =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => n.minWidth),
      Match.tag("TabSetNode", (n) => (n.attributes.minWidth as number) ?? 0),
      Match.tag("TabNode", (n) => (n.attributes.minWidth as number) ?? 0),
      Match.tag("BorderNode", (n) => (n.attributes.minSize as number) ?? 0),
      Match.exhaustive
    ),

  /**
   * Get min height
   */
  getMinHeight: (node: Node): number =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => n.minHeight),
      Match.tag("TabSetNode", (n) => (n.attributes.minHeight as number) ?? 0),
      Match.tag("TabNode", (n) => (n.attributes.minHeight as number) ?? 0),
      Match.tag("BorderNode", (n) => (n.attributes.minSize as number) ?? 0),
      Match.exhaustive
    ),

  /**
   * Calculate min/max sizes recursively - replaces calcMinMaxSize()
   */
  calcMinMaxSize: (node: Node): {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  } =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => RowNodeSizingOps.calcMinMaxSize(n)),
      Match.tag("TabSetNode", (n) => TabSetNodeSizingOps.calcMinMaxSize(n)),
      Match.orElse(() => ({
        minWidth: 0,
        minHeight: 0,
        maxWidth: Infinity,
        maxHeight: Infinity,
      }))
    ),
};

const RowNodeSizingOps = {
  calcMinMaxSize: (node: RowNode) => {
    // Recursive calculation from children
    let minWidth = 0,
      minHeight = 0,
      maxWidth = Infinity,
      maxHeight = Infinity;

    // ... implementation
    return { minWidth, minHeight, maxWidth, maxHeight };
  },
};

const TabSetNodeSizingOps = {
  calcMinMaxSize: (node: TabSetNode) => {
    // Aggregate from child tabs
    let minWidth = 0,
      minHeight = 0,
      maxWidth = Infinity,
      maxHeight = Infinity;

    // ... implementation
    return { minWidth, minHeight, maxWidth, maxHeight };
  },
};

// ============================================================================
// PART 4: SERIALIZATION (Replaces toJson/fromJson)
// ============================================================================

/**
 * JSON schema for each node type using Effect Schema
 */
const RowNodeJson = S.Struct({
  type: S.Literal("row"),
  id: S.optional(S.String),
  weight: S.optional(S.Number),
  children: S.optional(S.Array(S.Unknown)), // Recursive
});

const TabSetNodeJson = S.Struct({
  type: S.Literal("tabset"),
  id: S.optional(S.String),
  weight: S.optional(S.Number),
  selected: S.optional(S.Number),
  children: S.optional(S.Array(S.Unknown)), // Recursive
});

const TabNodeJson = S.Struct({
  type: S.Literal("tab"),
  id: S.optional(S.String),
  name: S.optional(S.String),
  component: S.optional(S.String),
});

const BorderNodeJson = S.Struct({
  type: S.Literal("border"),
  location: S.Literal("top", "bottom", "left", "right"),
  size: S.optional(S.Number),
  selected: S.optional(S.Number),
  children: S.optional(S.Array(S.Unknown)),
});

/**
 * Serialize a node to JSON
 */
export const toJson = (node: Node): unknown =>
  Match.value(node).pipe(
    Match.tag("RowNode", (n) => ({
      type: "row",
      id: n.id,
      weight: n.weight,
      children: A.map(n.children, (c) => toJson(c as Node)),
    })),
    Match.tag("TabSetNode", (n) => ({
      type: "tabset",
      id: n.id,
      weight: n.weight,
      selected: n.selected,
      children: A.map(n.children, toJson),
    })),
    Match.tag("TabNode", (n) => ({
      type: "tab",
      id: n.id,
      name: n.name,
      component: n.component,
      ...n.attributes,
    })),
    Match.tag("BorderNode", (n) => ({
      type: "border",
      location: n.location.getName(),
      size: n.size,
      selected: n.selected,
      children: A.map(n.children, toJson),
    })),
    Match.exhaustive
  );

// ============================================================================
// PART 5: IMMUTABLE UPDATES (Replaces Mutating Methods)
// ============================================================================

/**
 * Since nodes are immutable Data classes, we return new instances.
 * This enables time-travel debugging and better React integration.
 */
export const NodeUpdates = {
  /**
   * Update rect - returns new node
   */
  setRect: (node: Node, rect: Rect): Node =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => new RowNode({ ...n, rect })),
      Match.tag("TabSetNode", (n) => new TabSetNode({ ...n, rect })),
      Match.tag("TabNode", (n) => new TabNode({ ...n, rect })),
      Match.tag("BorderNode", (n) => new BorderNode({ ...n, rect })),
      Match.exhaustive
    ),

  /**
   * Update path
   */
  setPath: (node: Node, path: string): Node =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => new RowNode({ ...n, path })),
      Match.tag("TabSetNode", (n) => new TabSetNode({ ...n, path })),
      Match.tag("TabNode", (n) => new TabNode({ ...n, path })),
      Match.tag("BorderNode", (n) => new BorderNode({ ...n, path })),
      Match.exhaustive
    ),

  /**
   * Add child to parent node
   */
  addChild: (parent: Node, child: Node, index?: number): Node =>
    Match.value(parent).pipe(
      Match.tag("RowNode", (n) => {
        if (child._tag !== "RowNode" && child._tag !== "TabSetNode") {
          throw new Error("RowNode can only contain RowNode or TabSetNode");
        }
        const children =
          index !== undefined
            ? [...A.take(n.children, index), child, ...A.drop(n.children, index)]
            : [...n.children, child];
        return new RowNode({ ...n, children: children as ReadonlyArray<RowNode | TabSetNode> });
      }),
      Match.tag("TabSetNode", (n) => {
        if (child._tag !== "TabNode") {
          throw new Error("TabSetNode can only contain TabNode");
        }
        const children =
          index !== undefined
            ? [...A.take(n.children, index), child, ...A.drop(n.children, index)]
            : [...n.children, child];
        return new TabSetNode({ ...n, children });
      }),
      Match.tag("BorderNode", (n) => {
        if (child._tag !== "TabNode") {
          throw new Error("BorderNode can only contain TabNode");
        }
        const children =
          index !== undefined
            ? [...A.take(n.children, index), child, ...A.drop(n.children, index)]
            : [...n.children, child];
        return new BorderNode({ ...n, children });
      }),
      Match.tag("TabNode", () => {
        throw new Error("TabNode cannot have children");
      }),
      Match.exhaustive
    ),

  /**
   * Remove child from parent node
   */
  removeChild: (parent: Node, childId: string): Node =>
    Match.value(parent).pipe(
      Match.tag("RowNode", (n) => {
        const children = A.filter(n.children, (c) => c.id !== childId);
        return new RowNode({ ...n, children });
      }),
      Match.tag("TabSetNode", (n) => {
        const children = A.filter(n.children, (c) => c.id !== childId);
        return new TabSetNode({ ...n, children });
      }),
      Match.tag("BorderNode", (n) => {
        const children = A.filter(n.children, (c) => c.id !== childId);
        return new BorderNode({ ...n, children });
      }),
      Match.tag("TabNode", () => parent),
      Match.exhaustive
    ),

  /**
   * Update weight
   */
  setWeight: (node: Node, weight: number): Node =>
    Match.value(node).pipe(
      Match.tag("RowNode", (n) => new RowNode({ ...n, weight })),
      Match.tag("TabSetNode", (n) => new TabSetNode({ ...n, weight })),
      Match.orElse(() => node)
    ),

  /**
   * Update selected index
   */
  setSelected: (node: Node, selected: number): Node =>
    Match.value(node).pipe(
      Match.tag("TabSetNode", (n) => new TabSetNode({ ...n, selected })),
      Match.tag("BorderNode", (n) => new BorderNode({ ...n, selected })),
      Match.orElse(() => node)
    ),
};

// ============================================================================
// PART 6: TYPE GUARDS AND PREDICATES
// ============================================================================

/**
 * Type guards for narrowing Node type
 */
export const NodePredicates = {
  isRowNode: (node: Node): node is RowNode => node._tag === "RowNode",
  isTabSetNode: (node: Node): node is TabSetNode => node._tag === "TabSetNode",
  isTabNode: (node: Node): node is TabNode => node._tag === "TabNode",
  isBorderNode: (node: Node): node is BorderNode => node._tag === "BorderNode",
  isDraggable: (node: Node): node is TabNode | TabSetNode =>
    node._tag === "TabNode" || node._tag === "TabSetNode",
  isDropTarget: (node: Node): node is RowNode | TabSetNode | BorderNode =>
    node._tag === "RowNode" || node._tag === "TabSetNode" || node._tag === "BorderNode",
  isParentNode: (node: Node): node is RowNode | TabSetNode | BorderNode =>
    node._tag !== "TabNode",
};

// ============================================================================
// PART 7: PIPEABLE OPERATIONS
// ============================================================================

/**
 * Pipeable operations for fluent composition.
 * Usage: node.pipe(withRect(newRect), withWeight(50))
 */
export const withRect =
  (rect: Rect) =>
  (node: Node): Node =>
    NodeUpdates.setRect(node, rect);

export const withPath =
  (path: string) =>
  (node: Node): Node =>
    NodeUpdates.setPath(node, path);

export const withWeight =
  (weight: number) =>
  (node: Node): Node =>
    NodeUpdates.setWeight(node, weight);

export const withChild =
  (child: Node, index?: number) =>
  (node: Node): Node =>
    NodeUpdates.addChild(node, child, index);

export const withoutChild =
  (childId: string) =>
  (node: Node): Node =>
    NodeUpdates.removeChild(node, childId);

// Example usage:
// const newNode = rowNode.pipe(
//   withRect(newRect),
//   withWeight(50),
//   withChild(tabSetNode)
// );

// ============================================================================
// PART 8: COMPARISON WITH OLD APPROACH
// ============================================================================

/**
 * OLD APPROACH (inheritance):
 *
 * abstract class Node {
 *   protected model: Model;
 *   abstract toJson(): IJsonNode;
 *   canDrop(dragNode, x, y): DropInfo | undefined { return undefined; }
 * }
 *
 * class RowNode extends Node {
 *   private minWidth: number;
 *   override canDrop(dragNode, x, y) { ... complex logic ... }
 *   toJson() { ... }
 * }
 *
 * Problems:
 * 1. Tight coupling via protected/private fields
 * 2. Hard to test individual behaviors
 * 3. No structural equality
 * 4. Mutable state makes debugging hard
 * 5. Adding new node types requires understanding entire hierarchy
 *
 *
 * NEW APPROACH (composition):
 *
 * type Node = RowNode | TabSetNode | TabNode | BorderNode;
 *
 * const canDrop = (node: Node, dragNode, x, y) =>
 *   Match.value(node).pipe(
 *     Match.tag("RowNode", n => RowNodeDropOps.canDrop(n, ...)),
 *     Match.tag("TabSetNode", n => TabSetNodeDropOps.canDrop(n, ...)),
 *     Match.exhaustive
 *   );
 *
 * Benefits:
 * 1. Each behavior is a pure function - easy to test
 * 2. Structural equality via Data.TaggedClass
 * 3. Immutable updates enable time-travel debugging
 * 4. Adding new node types = add to union + add to Match
 * 5. No class hierarchy to understand
 * 6. Tree-shakeable - only import what you use
 */
