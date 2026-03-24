/**
 * Core types for GridLayout
 *
 * These types are framework-agnostic and define the data structures
 * used by the layout algorithms.
 *
 * @module @beep/ui/components/grid-layout/core/Model
 * @since 0.0.0
 */
import {$UiId} from "@beep/identity";
import {
	createDOMRefSchema,
	DOMCssProperties,
	DOMEvent,
	DOMHtmlElement,
	DOMReactNode,
	DOMDragEvent,
	DOMMouseEvent,
	Fn,
	LiteralKit,
	NonEmptyTrimmedStr,
} from "@beep/schema";
import {P, thunk, thunkFalse, thunkSome, thunkSomeFalse, thunkSomeTrue, thunkTrue} from "@beep/utils";
import * as O from "effect/Option";
import {pipe} from "effect";
import * as S from "effect/Schema";

const $I = $UiId.create("components/grid-layout/core/Model");

// =====================================================================================================================
// Resize Handle Types
// =====================================================================================================================

/**
 * Axis identifiers for resize handles.
 * - Cardinal: 'n', 's', 'e', 'w' (north, south, east, west)
 * - Diagonal: 'ne', 'nw', 'se', 'sw'
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ResizeHandleAxis = LiteralKit([
	"s",
	"w",
	"e",
	"n",
	"sw",
	"nw",
	"se",
	"ne",
])
	.pipe(
		$I.annoteSchema(
			"ResizeHandleAxis",
			{
				description: "Axis identifiers for resize handles. Cardinal directions ('n', 's', 'e', 'w') and diagonal ('ne', 'nw', 'se', 'sw').",
			}
		)
	);

/**
 * type of {@link ResizeHandleAxis} {@inheritDoc ResizeHandleAxis}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ResizeHandleAxis = typeof ResizeHandleAxis.Type;

// =====================================================================================================================
// Layout Item Types
// =====================================================================================================================

declare namespace LayoutItem {
	/**
	 * The encoded type of {@link LayoutItem} {@inheritDoc LayoutItem}
	 *
	 * @category DomainModel
	 * @since 0.0.0
	 * biome-ignore assist/source/useSortedInterfaceMembers: Want certain properties colocated
	 */
	export interface Encoded {
		/** Unique identifier for this item */
		i: string;

		/** X position in grid units (0-indexed from left) */
		x: number;

		/** Y position in grid units (0-indexed from top) */
		y: number;

		/** Width in grid units */
		w: number;

		/** Height in grid units */
		h: number;

		/** Minimum width in grid units */
		minW?: number;

		/** Minimum height in grid units */
		minH?: number;

		/** Maximum width in grid units */
		maxW?: number;

		/** Maximum height in grid units */
		maxH?: number;

		/**
		 * If true, the item cannot be dragged or resized, and other items
		 * will move around it during compaction.
		 */
		static?: undefined | boolean;

		/**
		 * If false, the item cannot be dragged (but may still be resizable).
		 * Overrides grid-level isDraggable for this item.
		 */
		isDraggable?: undefined | boolean;

		/**
		 * If false, the item cannot be resized (but may still be draggable).
		 * Overrides grid-level isResizable for this item.
		 */
		isResizable?: undefined | boolean;

		/**
		 * Which resize handles to show for this item.
		 * Overrides grid-level resizeHandles for this item.
		 */
		resizeHandles?: undefined | ReadonlyArray<ResizeHandleAxis>;

		/**
		 * If true, the item is constrained to the grid container bounds.
		 * Overrides grid-level isBounded for this item.
		 */
		isBounded?: undefined | boolean;

		/**
		 * Internal flag set during drag/resize operations to indicate
		 * the item has moved from its original position.
		 * @internal
		 */
		moved?: undefined | boolean;

		/**
		 * Per-item layout constraints.
		 * Applied in addition to grid-level constraints.
		 */
		constraints?: ReadonlyArray<LayoutConstraint.Encoded>;
	}
}

const LayoutItem$ref = S.suspend((): S.Codec<LayoutItem, LayoutItem.Encoded> => LayoutItem);
const LayoutConstraint$ref = S.suspend(
	(): S.Codec<LayoutConstraint, LayoutConstraint.Encoded> => LayoutConstraint
);

/**
 * A single item in the grid layout.
 *
 * Position (x, y) is in grid units, not pixels.
 * Size (w, h) is in grid units.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class LayoutItem extends S.Class<LayoutItem>($I`LayoutItem`)(
	{
		/** Unique identifier for this item */
		i: S.String.annotateKey({
			description: "Unique identifier for this item"
		}),

		/** X position in grid units (0-indexed from left) */
		x: S.Number.annotateKey({
			description: "X position in grid units (0-indexed from left)"
		}),

		/** Y position in grid units (0-indexed from top) */
		y: S.Number.annotateKey({
			description: "Y position in grid units (0-indexed from top)"
		}),

		/** Width in grid units */
		w: S.Number.annotateKey({
			description: "Width in grid units"
		}),

		/** Height in grid units */
		h: S.Number.annotateKey({
			description: "Height in grid units"
		}),

		/** Minimum width in grid units */
		minW: S.OptionFromOptionalKey(S.Number)
			.annotateKey({
				description: "Minimum width in grid units"
			}),

		/** Minimum height in grid units */
		minH: S.OptionFromOptionalKey(S.Number)
			.annotateKey({
				description: "Minimum height in grid units"
			}),

		/** Maximum width in grid units */
		maxW: S.OptionFromOptionalKey(S.Number)
			.annotateKey({
				description: "Maximum width in grid units"
			}),

		/** Maximum height in grid units */
		maxH: S.OptionFromOptionalKey(S.Number)
			.annotateKey({
				description: "Maximum height in grid units"
			}),

		/**
		 * If true, the item cannot be dragged or resized, and other items
		 * will move around it during compaction.
		 */
		static: S.OptionFromOptionalKey(S.Boolean)
			.annotateKey({
				description: "If true, the item cannot be dragged or resized, and other items will move around it during compaction."
			}),

		/**
		 * If false, the item cannot be dragged (but may still be resizable).
		 * Overrides grid-level isDraggable for this item.
		 */
		isDraggable: S.OptionFromOptionalKey(S.Boolean)
			.annotateKey({
				description: "If false, the item cannot be dragged (but may still be resizable). Overrides grid-level isDraggable for this item."
			}),

		/**
		 * If false, the item cannot be resized (but may still be draggable).
		 * Overrides grid-level isResizable for this item.
		 */
		isResizable: S.OptionFromOptionalKey(S.Boolean)
			.annotateKey({
				description: "If false, the item cannot be resized (but may still be draggable). Overrides grid-level isResizable for this item."
			}),

		/**
		 * Which resize handles to show for this item.
		 * Overrides grid-level resizeHandles for this item.
		 */
		resizeHandles: S.Array(ResizeHandleAxis)
			.annotateKey({
				description: "Which resize handles to show for this item. Overrides grid-level resizeHandles for this item."
			}),

		/**
		 * If true, the item is constrained to the grid container bounds.
		 * Overrides grid-level isBounded for this item.
		 */
		isBounded: S.OptionFromOptionalKey(S.Boolean)
			.annotateKey({
				description: "If true, the item is constrained to the grid container bounds. Overrides grid-level isBounded for this item."
			}),

		/**
		 * Internal flag set during drag/resize operations to indicate
		 * the item has moved from its original position.
		 * @internal
		 */
		moved: S.OptionFromOptionalKey(S.Boolean)
			.annotateKey({
				description: "Internal flag set during drag/resize operations to indicate the item has moved from its original position. @internal"
			}),

		/**
		 * Per-item layout constraints.
		 * Applied in addition to grid-level constraints.
		 */
		constraints: S.OptionFromOptionalKey(S.Array(LayoutConstraint$ref))
			.annotateKey({
				description: "Per-item layout constraints. Applied in addition to grid-level constraints."
			})
	},
	$I.annote(
		"LayoutItem",
		{
			description: "A single item in the grid layout.",
		}
	)
) {
}

/**
 * A layout is a readonly array of layout items.
 * Layouts should be treated as immutable.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const Layout = S.Array(LayoutItem);

/**
 * Type alias for {@link Layout}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type Layout = typeof Layout.Type;

// =====================================================================================================================
// Layout Constraint Types
// =====================================================================================================================

/**
 * @since 0.0.0
 */
export declare namespace ConstraintContext {
	/**
	 * Interface representing encoded configuration and layout data.
	 *
	 * @category DomainModel
	 * @since 0.0.0
	 */
	export interface Encoded {
		/** Number of columns in the grid */
		readonly cols: number,
		/** Container height in pixels (might be 0 if auto-height) */
		readonly containerHeight: number,
		/** Container width in pixels */
		readonly containerWidth: number,
		/** Current layout state */
		readonly layout: Layout
		/** Margin between items [x, y] in pixels */
		readonly margin: readonly [number, number],
		/** Maximum number of rows (Infinity if unbounded) */
		readonly maxRows: number,
		/** Row height in pixels */
		readonly rowHeight: number,
	}
}

/**
 * Context provided to constraint functions during drag/resize operations.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ConstraintContext extends S.Class<ConstraintContext>($I`ConstraintContext`)(
	{
		/** Number of columns in the grid */
		cols: S.Number,

		/** Maximum number of rows (Infinity if unbounded) */
		maxRows: S.Number,

		/** Container width in pixels */
		containerWidth: S.Number,

		/** Container height in pixels (might be 0 if auto-height) */
		containerHeight: S.Number,

		/** Row height in pixels */
		rowHeight: S.Number,

		/** Margin between items [x, y] in pixels */
		margin: S.Tuple([
			S.Number,
			S.Number
		]),

		/** Current layout state */
		layout: Layout
	},
	$I.annote(
		"ConstraintContext",
		{
			description: "Context provided to constraint functions during drag/resize operations."
		}
	)
) {
}

/**
 * @since 0.0.0
 */
export declare namespace LayoutConstraint {
	/**
	 * Interface representing encoded configuration and layout data.
	 *
	 * @category DomainModel
	 * @since 0.0.0
	 */
	export interface Encoded {
		/**
		 * Constrain position during drag operations.
		 * Called after grid unit conversion, before layout update.
		 *
		 * @param params - The drag parameters
		 * @param params.item - The item being dragged
		 * @param params.x - Proposed x position in grid units
		 * @param params.y - Proposed y position in grid units
		 * @param params.context - Grid context (cols, maxRows, etc.)
		 * @returns Constrained x, y position
		 * @since 0.0.0
		 */
		readonly constrainPosition?: undefined | ((
			params: {
				readonly item: LayoutItem,
				readonly x: number,
				readonly y: number,
				readonly context: ConstraintContext
			}
		) => { readonly x: number, readonly y: number });

		/**
		 * Constrain size during resize operations.
		 * Called after grid unit conversion, before layout update.
		 *
		 * @param params - The resize parameters
		 * @param params.item - The item being resized
		 * @param params.w - Proposed width in grid units
		 * @param params.h - Proposed height in grid units
		 * @param params.handle - Which resize handle is being used
		 * @param params.context - Grid context (cols, maxRows, etc.)
		 * @returns Constrained w, h size
		 * @since 0.0.0
		 */
		readonly containerSize?: undefined | ((params: {
			readonly item: LayoutItem,
			readonly w: number,
			readonly h: number,
			readonly handle: ResizeHandleAxis,
			readonly context: ConstraintContext

		}) => { readonly h: number; readonly w: number });
		/**
		 * Constraint identifier for debugging
		 *
		 * @since 0.0.0
		 */
		readonly name: string;
	}
}

/**
 * Context provided to constraint functions during drag/resize operations.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class LayoutConstraint extends S.Class<LayoutConstraint>($I`LayoutConstraint`)(
	{
		/** Constraint identifier for debugging */
		name: S.String.annotateKey({
			description: "Constraint identifier for debugging"
		}),
		/**
		 * Constrain position during drag operations.
		 * Called after grid unit conversion, before layout update.
		 */
		constrainPosition: S.OptionFromOptionalKey(Fn({
			input: S.Struct({
				item: LayoutItem$ref,
				x: S.Number,
				y: S.Number,
			}),
			output: S.Struct({
				x: S.Number,
				y: S.Number,
			})
		}))
			.annotateKey({
				description: "Constrain position during drag operations.\nCalled after grid unit conversion, before layout update.\nConstrain size during resize operations.\nCalled after grid unit conversion, before layout update."
			}),
		/**
		 * Constrain size during resize operations.
		 * Called after grid unit conversion, before layout update.
		 */
		constrainSize: S.OptionFromOptionalKey(Fn({
			input: S.Struct({
				item: LayoutItem$ref,
				w: S.Number,
				h: S.Number,
				handle: ResizeHandleAxis,
				context: ConstraintContext
			}),
			output: S.Struct({
				w: S.Number,
				h: S.Number,
			})
		}))
			.annotateKey({
				description: "Constrain size during resize operations.\nCalled after grid unit conversion, before layout update."
			})
	},
	$I.annote(
		"ConstraintContext",
		{
			description: "Context provided to constraint functions during drag/resize operations."
		}
	)
) {
}

// =====================================================================================================================
// Position & Size Types
// =====================================================================================================================

/**
 * Pixel position and size of an element.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Position extends S.Class<Position>($I`Position`)(
	{
		left: S.Number,
		top: S.Number,
		width: S.Number,
		height: S.Number
	},
	$I.annote(
		"Position",
		{
			description: "Pixel position and size of an element."
		}
	)
) {
}

/**
 * Partial position (just coordinates, no size).
 */
export class PartialPosition extends S.Class<PartialPosition>($I`PartialPosition`)(
	{
		left: S.Number,
		top: S.Number
	},
	$I.annote(
		"PartialPosition",
		{
			description: "Partial position (just coordinates, no size)."
		}
	)
) {
}

/**
 * Size in pixels.
 */
export class Size extends S.Class<Size>($I`Size`)(
	{
		width: S.Number,
		height: S.Number
	},
	$I.annote(
		"Size",
		{
			description: "Size in pixels"
		}
	)
) {
}

/**
 * Position when dropping an external element onto the grid.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DroppingPosition extends S.Class<DroppingPosition>($I`DroppingPosition`)(
	{
		left: S.Number,
		top: S.Number,
		e: DOMEvent
	},
	$I.annote(
		"DroppingPosition",
		{
			description: "Size in pixels"
		}
	)
) {
}

// =====================================================================================================================
// Event Types
// =====================================================================================================================

/**
 * Data provided by react-draggable during drag operations.
 */
export class ReactDraggableCallbackData extends S.Class<ReactDraggableCallbackData>($I`ReactDraggableCallbackData`)(
	{
		node: DOMHtmlElement,
		x: S.OptionFromOptionalKey(S.Number),
		y: S.OptionFromOptionalKey(S.Number),
		deltaX: S.Number,
		deltaY: S.Number,
		lastX: S.OptionFromOptionalKey(S.Number),
		lastY: S.OptionFromOptionalKey(S.Number)
	},
	$I.annote(
		"ReactDraggableCallbackData",
		{
			description: "Data provided by react-draggable during drag operations."
		}
	)
) {
}

/**
 * Grid-level drag event data.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class GridDragEvent extends S.Class<GridDragEvent>($I`GridDragEvent`)(
	{
		e: DOMEvent,
		node: DOMHtmlElement,
		newPosition: PartialPosition
	},
	$I.annote(
		"GridDragEvent",
		{
			description: "Grid-level drag event data."
		}
	)
) {
}

/**
 * Grid-level resize event data.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class GridResizeEvent extends S.Class<GridResizeEvent>($I`GridResizeEvent`)(
	{
		e: DOMEvent,
		node: DOMHtmlElement,
		size: Size,
		handle: ResizeHandleAxis
	},
	$I.annote(
		"GridResizeEvent",
		{
			description: "Grid-level resize event data."
		}
	)
) {
}

export interface DragOverEvent extends MouseEvent {
	readonly nativeElement: Event & {
		readonly layerX: number
		readonly layerY: number
	};
}

const isDragOverEvent = (u: unknown): u is DragOverEvent => S.is(DOMMouseEvent)(
	u) && P.hasProperty(
	u,
	"nativeElement"
) && pipe(
	u,
	P.Struct({
		nativeElement: (u: unknown): u is DragOverEvent["nativeElement"] => S.is(DOMEvent)(
			u) && P.hasProperties(
			"layerX",
			"layerY"
		)(
			u) && pipe(
			u,
			P.Struct({
				layerX: P.isNumber,
				layerY: P.isNumber
			})
		)
	})
);
/**
 * Drag-over event with layer coordinates.
 */
export const DragOverEvent = S.declare(isDragOverEvent)
	.pipe(
		$I.annoteSchema(
			"DragOverEvent",
			{
				description: "Drag-over event with layer coordinates."
			}
		)
	);

// ============================================================================
// Compaction Types
// ============================================================================


/**
 * Type of compaction to apply to the layout.
 * - 'vertical': Items compact upward (default)
 * - 'horizontal': Items compact leftward
 * - 'wrap': Items arranged in wrapped-paragraph style (like words in text)
 * - null: No compaction (free-form positioning)
 */
export const CompactType = S.OptionFromNullOr(LiteralKit([
	"horizontal",
	"vertical",
	"wrap",
]))
	.pipe(
		$I.annoteSchema(
			"CompactType",
			{
				description: "Type of compaction to apply to the layout.",
				documentation: "- 'vertical': Items compact upward (default)\n- 'horizontal': Items compact leftward\n- 'wrap': Items arranged in wrapped-paragraph style (like words in text)\n- null: No compaction (free-form positioning)"
			}
		)
	);

export type CompactType = typeof CompactType.Type;

// ============================================================================
// Callback Types
// ============================================================================


export class EventCallbackParams extends S.Class<EventCallbackParams>($I`EventCallbackParams`)(
	{
		layout: Layout,
		oldItem: S.OptionFromNullOr(LayoutItem),
		newItem: S.OptionFromNullOr(LayoutItem),
		placeholder: S.OptionFromNullOr(LayoutItem),
		event: DOMEvent,
		element: S.OptionFromNullOr(DOMHtmlElement),
	},
	$I.annote(
		"EventCallbackParams",
		{
			description: "parameters for event callbacks"
		}
	)
) {
}

/**
 * Standard callback signature for layout change events.
 */
export const EventCallback = Fn({
	input: EventCallbackParams,
	output: S.Void,
})
	.pipe(
		$I.annoteSchema(
			"EventCallback",
			{
				description: "Standard callback signature for layout change events."
			}
		)
	);
/**
 * type of {@link EventCallback} {@inheritDoc EventCallback}
 */
export type EventCallback = typeof EventCallback.Type;

// =====================================================================================================================
// Composable Interfaces
// =====================================================================================================================
// ============================================================================
// Composable Interfaces (v2 API)
// ============================================================================

/**
 * Interface for layout compaction strategies.
 *
 * Implement this interface to create custom compaction algorithms.
 * @category DomainModel
 * @example
 * ```ts
 * const myCompactor: Compactor = {
 *   type: 'vertical',
 *   allowOverlap: false,
 *   compact(layout, cols) {
 *     // Custom compaction logic
 *     return compactedLayout;
 *   }
 * };
 * ```
 * @since 0.0.0
 */
export class Compactor extends S.Class<Compactor>($I`Compactor`)(
	{
		/** Compaction type identifier */
		type: CompactType.annotateKey({
			description: "Compaction type identifier."
		}),

		/**
		 * Whether items can overlap (stack on top of each other).
		 *
		 * When true:
		 * - Items can be placed on top of other items
		 * - Dragging into another item does NOT push it away
		 * - Compaction is skipped after drag/resize
		 */
		allowOverlap: S.Boolean.annotateKey({
			description: "Whether items can overlap (stack on top of each other).",
			documentation: "When true, items can be placed on top of each other, and dragging into another item does not push it away. Compaction is skipped after drag/resize."
		}),
		/**
		 * Whether to block movement that would cause collision.
		 *
		 * When true (and allowOverlap is false):
		 * - Dragging into another item is blocked (item snaps back)
		 * - Other items are NOT pushed away
		 * - Only affects drag/resize, not compaction
		 *
		 * Has no effect when allowOverlap is true.
		 */
		preventCollision: S.OptionFromOptionalKey(S.Boolean)
			.annotateKey({
				description: "Whether to block movement that would cause collision.",
				documentation: "When true, dragging into another item is blocked (item snaps back). Other items are NOT pushed away. Only affects drag/resize, not compaction. Has no effect when allowOverlap is true."
			}),

		/**
		 * Compact the layout
		 *
		 */
		compact: Fn({
			input: S.Struct({
				layout: Layout,
				cols: S.Number,
			}),
			output: Layout,
		})
			.annotateKey({
				description: "Compact the layout by moving items to fill gaps and optimize space usage.",
			})
	},
	$I.annote(
		"Compactor",
		{
			description: "Interface for layout compaction strategies.",
			documentation: "Implement this interface to create custom compaction algorithms."
		}
	)
) {
}

class PositionStrategyBase extends S.Class<PositionStrategyBase>($I`PositionStrategyBase`)(
	{
		/** Scale factor for drag/resize calculations */
		scale: S.Number.annotateKey({
			description: "Scale factor for drag/resize calculations"
		}),
		/** Convert pixel position to a CSS style object. */
		calcStyle: Fn({
			input: Position,
			output: DOMCssProperties
		}),
		/**
		 * Calculate position during drag operations, accounting for transforms and scale.
		 *
		 * This method is optional. When not provided, react-draggable uses its built-in
		 * parent-relative coordinate calculation. Only override this when you need custom
		 * coordinate handling, such as for scaled containers.
		 */
		calcDragPosition: S.OptionFromOptionalKey(
			Fn({
				input: S.Struct({
					clientX: S.Number,
					clientY: S.Number,
					offsetX: S.Number,
					offsetY: S.Number
				}),
				output: PartialPosition
			})
		)
			.annotateKey({
				description: "Calculate position during drag operations, accounting for transforms and scale.",
				documentation: "This method is optional. When not provided, react-draggable uses its built-in\nparent-relative coordinate calculation. Only override this when you need custom\ncoordinate handling, such as for scaled containers."
			})
	},
	$I.annote(
		"PositionStrategyBase",
		{
			description: "Base class for position strategies, providing common functionality and interfaces for layout positioning."
		}
	)
) {
}

/**
 * Interface for CSS positioning transform strategy.
 */
export class PositionStrategyTransform extends PositionStrategyBase.extend<PositionStrategyTransform>($I`PositionStrategyTransform`)(
	{
		/** Strategy type identifier */
		type: S.tag("transform")
			.annotateKey({
				description: "Strategy type identifier for transform-based positioning."
			})
	},
	$I.annote(
		"PositionStrategyTransform",
		{
			description: "Interface for CSS positioning transform strategy."
		}
	)
) {
}

/**
 * Interface for CSS positioning absolute strategy.
 */
export class PositionStrategyAbsolute extends PositionStrategyBase.extend<PositionStrategyAbsolute>($I`PositionStrategyAbsolute`)(
	{
		/** Strategy type identifier */
		type: S.tag("absolute")
			.annotateKey({
				description: "Strategy type identifier for absolute positioning."
			})
	},
	$I.annote(
		"PositionStrategyAbsolute",
		{
			description: "Interface for CSS positioning absolute strategy."
		}
	)
) {
}

/**
 * Interface for CSS positioning strategies.
 *
 * Implement this interface to customize how items are positioned in the DOM.
 * Built-in strategies: transformStrategy, absoluteStrategy.
 *
 * @example
 * ```ts
 * // Use transform-based positioning (default, better performance)
 * <GridLayout positionStrategy={transformStrategy} />
 *
 * // Use top/left positioning (for environments where transforms cause issues)
 * <GridLayout positionStrategy={absoluteStrategy} />
 *
 * // Use scaled transforms (for scaled containers)
 * <GridLayout positionStrategy={createScaledStrategy(0.5)} />
 * ```
 */
export const PositionStrategy = S.Union(
	[
		PositionStrategyTransform,
		PositionStrategyAbsolute
	]
)
	.pipe(
		S.toTaggedUnion("type"),
		$I.annoteSchema(
			"PositionStrategy",
			{
				description: "CSS positioning strategies."
			}
		)
	);

/**
 * type of {@link PositionStrategy} {@inheritDoc PositionStrategy}
 */
export type PositionStrategy = typeof PositionStrategy.Type;


// =====================================================================================================================
// Grid Configuration Types
// =====================================================================================================================


/**
 * Grid measurement configuration.
 * Groups all grid metrics (columns, row height, margins).
 */
export class GridConfig extends S.Class<GridConfig>($I`GridConfig`)(
	{
		/** Number of columns in the grid (default: 12) */
		cols: S.Number.pipe(
			S.withDecodingDefaultKey(() => 12),
			S.withConstructorDefault(() => O.some(12))
		)
			.annotateKey({
				description: "Number of columns in the grid (default: 12)"
			}),
		/** Height of a single row in pixels (default: 150) */
		rowHeight: S.Number.pipe(
			S.withDecodingDefaultKey(() => 150),
			S.withConstructorDefault(() => O.some(150))
		)
			.annotateKey({
				description: "Height of a single row in pixels (default: 150)"
			}),

		/** [horizontal, vertical] margin between items in pixels (default: [10, 10]) */
		margin: S.Tuple([
			S.Number,
			S.Number
		])
			.pipe(
				S.withDecodingDefaultKey(() => [
					10,
					10
				]),
				S.withConstructorDefault(() => O.some([
					10,
					10
				] as readonly [number, number]))
			)
			.annotateKey({
				description: "[horizontal, vertical] margin between items in pixels (default: [10, 10])"
			}),

		/** [horizontal, vertical] padding inside the container (default: null, uses margin) */
		containerPadding: S.OptionFromNullOr(S.Tuple([
			S.Number,
			S.Number
		]))
			.pipe(
				S.withDecodingDefaultKey(() => [
					10,
					10
				]),
				S.withConstructorDefault(() => O.some(O.none()))
			)
			.annotateKey({
				description: "[horizontal, vertical] padding inside the container (default: null, uses margin)"
			}),
		/** Maximum number of rows (default: Infinity) */
		maxRows: S.Number.pipe(
			S.withConstructorDefault(() => O.some(Number.POSITIVE_INFINITY)),
			S.withDecodingDefaultKey(() => Number.POSITIVE_INFINITY)
		)
			.annotateKey({
				description: "Maximum number of rows (default: Infinity)"
			})
	},
	$I.annote(
		"GridConfig",
		{
			description: "Grid measurement configuration.\nGroups all grid metrics (columns, row height, margins)."
		}
	)
) {
}

/**
 * Drag behavior configuration.
 * Groups all drag-related settings.
 */
export class DragConfig extends S.Class<DragConfig>($I`DragConfig`)(
	{
		/**
		 * Whether items can be dragged (default: true)
		 *
		 * @default true
		 */
		enabled: S.Boolean.pipe(
			S.optionalKey,
			S.withConstructorDefault(thunkSomeTrue),
			S.withDecodingDefaultKey(thunkTrue)
		)
			.annotateKey({
				description: "Whether items can be dragged (default: true)"
			}),

		/**
		 * Whether items are bounded to the container (default: false)
		 *
		 * @default false
		 */
		bounded: S.Boolean.pipe(
			S.optionalKey,
			S.withConstructorDefault(thunkSomeFalse),
			S.withDecodingDefaultKey(thunkFalse)
		)
			.annotateKey({
				description: "Whether items are bounded to the container (default: false)"
			}),

		/** CSS selector for a drag handle (e.g., '.drag-handle') */
		handle: S.OptionFromOptionalKey(S.String)
			.annotateKey({
				description: "CSS selector for a drag handle (e.g., '.drag-handle')"
			}),

		/** CSS selector for elements that should not trigger drag */
		cancel: S.OptionFromOptionalKey(S.String)
			.annotateKey({
				description: "CSS selector for elements that should not trigger drag"
			}),

		/**
		 * Minimum pixels to move before drag starts.
		 * Helps distinguish click from drag (fixes #1341, #1401).
		 * @default 3
		 */
		threshold: S.Number.pipe(
			S.optionalKey,
			S.withConstructorDefault(thunkSome(3)),
			S.withDecodingDefaultKey(thunk(3))
		)
	},
	$I.annote(
		"DragConfig",
		{
			description: "Drag behavior configuration.\nGroups all drag-related settings."
		}
	)
) {
}

/**
 * Resize behavior configuration.
 * Groups all resize-related settings.
 */
export class ResizeConfig extends S.Class<ResizeConfig>($I`ResizeConfig`)(
	{
		/** Whether items can be resized (default: true) */
		resizable: S.Boolean.pipe(
			S.optionalKey,
			S.withConstructorDefault(thunkSomeTrue),
			S.withDecodingDefaultKey(thunkTrue)
		),
		/** Which resize handles to show (default: ['se']) */
		handles: S.Array(ResizeHandleAxis)
			.pipe(
				S.optionalKey,
				S.withDecodingDefaultKey(() => ["se"]),
				S.withConstructorDefault(() => O.some(["se"] as const))
			),
		/**
		 * Custom resize handle component.
		 * Can be a React node or a function that receives the axis.
		 */
		handleComponent: S.OptionFromOptionalKey(
			S.Union(
				[
					DOMReactNode,
					Fn({
						input: S.Struct({
							axis: ResizeHandleAxis,
							ref: createDOMRefSchema<HTMLElement>()
						}),
						output: DOMReactNode
					})
				]
			)
		)
	},
	$I.annote(
		"ResizeConfig",
		{
			description: "Resize behavior configuration.\nGroups all resize-related settings."
		}
	)
) {
}

/**
 * Drop configuration (for dropping external elements).
 * Groups all drop-related settings.
 */
export class DropConfig extends S.Class<DropConfig>($I`DropConfig`)(
	{
		/** Whether external elements can be dropped on the grid (default: false) */
		enabled: S.Boolean.pipe(
			S.optionalKey,
			S.withConstructorDefault(thunkSomeFalse),
			S.withDecodingDefaultKey(thunkFalse)
		)
			.annotateKey({
				description: "Whether external elements can be dropped on the grid (default: false)"
			}),
		/** Default size for dropped items (default: { w: 1, h: 1 }) */
		defaultItem: S.Struct({
			w: S.Number.pipe(
				S.withConstructorDefault(thunkSome(1)),
				S.withDecodingDefaultKey(thunk(1))
			),
			h: S.Number.pipe(
				S.withConstructorDefault(thunkSome(1)),
				S.withDecodingDefaultKey(thunk(1))
			)
		})
			.pipe(
				S.optionalKey,
				S.withConstructorDefault(thunkSome({
					w: 1,
					h: 1
				})),
				S.withDecodingDefaultKey(thunk({
					w: 1,
					h: 1
				}))
			)
			.annotateKey({
				description: "Default size for dropped items (default: { w: 1, h: 1 })"
			}),
		/**
		 * Called when dragging over the grid.
		 * Return dimensions to override defaultItem, or false to reject the drop.
		 * Can also return dragOffsetX/dragOffsetY to specify cursor offset for centering.
		 */
		onDragOver: S.OptionFromOptionalKey(
			Fn({
				input: DOMDragEvent,
				output: S.Union([
					S.Literal(false),
					S.Void,
					S.Struct({
						w: S.OptionFromOptionalKey(S.Number),
						h: S.OptionFromOptionalKey(S.Number),
						dragOffsetX: S.OptionFromOptionalKey(S.Number),
						dragOffsetY: S.OptionFromOptionalKey(S.Number),
					})
				])
			})
		)
	},
	$I.annote(
		"DropConfig",
		{
			description: "Drop configuration (for dropping external elements).\nGroups all drop-related settings."
		}
	)
) {
}

// =====================================================================================================================
// Responsive Types
// =====================================================================================================================

/**
 * Breakpoint name (e.g., 'lg', 'md', 'sm', 'xs', 'xxs').
 */
export const Breakpoint = NonEmptyTrimmedStr.pipe(
	S.brand("Breakpoint")
);

export type Breakpoint = typeof Breakpoint.Type;

/**
 * Map of breakpoint name to pixel width.
 * Generic type B allows custom breakpoint strings.
 */
export const Breakpoints = <B extends ReadonlyArray<Breakpoint>>(schema: S.Literals<B>) => S.ReadonlyMap(
	schema,
	S.Number
);

/**
 * Map of breakpoint name to number of columns.
 * Generic type B allows custom breakpoint strings.
 */
export const BreakpointCols = <B extends ReadonlyArray<Breakpoint>>(schema: S.Literals<B>) => S.ReadonlyMap(
	schema,
	S.Number
);
