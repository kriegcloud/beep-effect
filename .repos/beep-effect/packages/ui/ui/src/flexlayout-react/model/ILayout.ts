/**
 * Interface for layout references stored in model.
 * This allows the model layer to hold references to layout components
 * without importing the actual view implementation.
 */
export interface ILayout {
  /** Marker to identify layout implementations */
  readonly isLayout: true;

  /** Clear local drag state */
  clearDragLocal(): void;
}
