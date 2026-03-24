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
import {Fn, LiteralKit } from "@beep/schema";
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
		resizeHandles?: undefined | ResizeHandleAxis[];

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
		constraints?: LayoutConstraint[];
	}
}

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
			description: 'Unique identifier for this item'
		}),

		/** X position in grid units (0-indexed from left) */
		x: S.Number.annotateKey({
			description: 'X position in grid units (0-indexed from left)'
		}),

		/** Y position in grid units (0-indexed from top) */
		y: S.Number.annotateKey({
			description: 'Y position in grid units (0-indexed from top)'
		}),

		/** Width in grid units */
		w: S.Number.annotateKey({
			description: 'Width in grid units'
		}),

		/** Height in grid units */
		h: S.Number.annotateKey({
			description: 'Height in grid units'
		}),

		/** Minimum width in grid units */
		minW: S.OptionFromOptionalKey(S.Number).annotateKey({
			description: 'Minimum width in grid units'
		}),

		/** Minimum height in grid units */
		minH: S.OptionFromOptionalKey(S.Number).annotateKey({
			description: 'Minimum height in grid units'
		}),

		/** Maximum width in grid units */
		maxW: S.OptionFromOptionalKey(S.Number).annotateKey({
			description: 'Maximum width in grid units'
		}),

		/** Maximum height in grid units */
		maxH: S.OptionFromOptionalKey(S.Number).annotateKey({
			description: 'Maximum height in grid units'
		}),

		/**
		 * If true, the item cannot be dragged or resized, and other items
		 * will move around it during compaction.
		 */
		static: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: 'If true, the item cannot be dragged or resized, and other items will move around it during compaction.'
		}),

		/**
		 * If false, the item cannot be dragged (but may still be resizable).
		 * Overrides grid-level isDraggable for this item.
		 */
		isDraggable: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: 'If false, the item cannot be dragged (but may still be resizable). Overrides grid-level isDraggable for this item.'
		}),

		/**
		 * If false, the item cannot be resized (but may still be draggable).
		 * Overrides grid-level isResizable for this item.
		 */
		isResizable: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: 'If false, the item cannot be resized (but may still be draggable). Overrides grid-level isResizable for this item.'
		}),

		/**
		 * Which resize handles to show for this item.
		 * Overrides grid-level resizeHandles for this item.
		 */
		resizeHandles: S.Array(ResizeHandleAxis).annotateKey({
			description: 'Which resize handles to show for this item. Overrides grid-level resizeHandles for this item.'
		}),

		/**
		 * If true, the item is constrained to the grid container bounds.
		 * Overrides grid-level isBounded for this item.
		 */
		isBounded: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: 'If true, the item is constrained to the grid container bounds. Overrides grid-level isBounded for this item.'
		}),

		/**
		 * Internal flag set during drag/resize operations to indicate
		 * the item has moved from its original position.
		 * @internal
		 */
		moved: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: 'Internal flag set during drag/resize operations to indicate the item has moved from its original position. @internal'
		}),

		/**
		 * Per-item layout constraints.
		 * Applied in addition to grid-level constraints.
		 */
		constraints: S.OptionFromOptionalKey(S.Array(LayoutConstraint)).annotateKey({
			description: 'Per-item layout constraints. Applied in addition to grid-level constraints.'
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
				item: LayoutItem,
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
				item: LayoutItem,
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