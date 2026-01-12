export interface IDraggable {
  /** @internal */
  readonly isEnableDrag: () => boolean;
  /** @internal */
  readonly getName: () => string | undefined;
}
