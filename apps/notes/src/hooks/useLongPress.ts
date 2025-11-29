import type { UnsafeTypes } from "@beep/types";
import {
  type MouseEvent,
  type MouseEventHandler,
  type PointerEvent,
  type PointerEventHandler,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type SyntheticEvent,
  type TouchEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react";

// Disabled callback
export function useLongPress<Target extends Element = Element, Context = unknown>(
  callback: null,
  options?: undefined | LongPressOptions<Target, Context>
): LongPressResult<LongPressEmptyHandlers, Context>;

// https://github.com/minwork/react/blob/main/packages/use-long-press/README.md
export function useLongPress<
  Target extends Element = Element,
  Context = unknown,
  Callback extends LongPressCallback<Target, Context> = LongPressCallback<Target, Context>,
>(
  callback: Callback,
  options: LongPressOptions<Target, Context, (typeof LongPressEventType)["Touch"]>
): LongPressResult<LongPressTouchHandlers<Target>, Context>;

// Mouse events
export function useLongPress<
  Target extends Element = Element,
  Context = unknown,
  Callback extends LongPressCallback<Target, Context> = LongPressCallback<Target, Context>,
>(
  callback: Callback,
  options: LongPressOptions<Target, Context, typeof LongPressEventType.Mouse>
): LongPressResult<LongPressMouseHandlers<Target>, Context>;

// Pointer events
export function useLongPress<
  Target extends Element = Element,
  Context = unknown,
  Callback extends LongPressCallback<Target, Context> = LongPressCallback<Target, Context>,
>(
  callback: Callback,
  options: LongPressOptions<Target, Context, typeof LongPressEventType.Pointer>
): LongPressResult<LongPressPointerHandlers<Target>, Context>;

// Default options
export function useLongPress<
  Target extends Element = Element,
  Context = unknown,
  Callback extends LongPressCallback<Target, Context> = LongPressCallback<Target, Context>,
>(callback: Callback): LongPressResult<LongPressPointerHandlers<Target>, Context>;

// General
export function useLongPress<
  Target extends Element = Element,
  Context = unknown,
  Callback extends LongPressCallback<Target, Context> = LongPressCallback<Target, Context>,
>(
  callback: Callback | null,
  options?: undefined | LongPressOptions<Target, Context>
): LongPressResult<LongPressHandlers<Target>, Context>;

/**
 * Detect click / tap and hold event
 *
 * @param {useLongPress~callback|null} callback - Function to call when long
 *   press is detected (click or tap lasts for <i>threshold</i> amount of time
 *   or longer)
 * @param {number} threshold - Period of time that must elapse after detecting
 *   click or tap in order to trigger _callback_
 * @param {boolean} captureEvent - If `event.persist()` should be called on
 *   react event
 * @param {string} detect - Which type of events should be detected (`'mouse'` |
 *   `'touch'` | `'pointer'`). For TS use _LongPressEventType_ enum.
 * @param {boolean | number} cancelOnMovement - If long press should be canceled
 *   on mouse / touch / pointer move. Possible values:<ul><li>`false` -
 *   [default] Disable cancelling on movement</li><li>`true` - Enable cancelling
 *   on movement and use default 25px threshold</li><li>`number` - Set a
 *   specific tolerance value in pixels (square side size inside which movement
 *   won't cancel long press)</li></ul>
 * @param {boolean} cancelOutsideElement If long press should be canceled when
 *   moving mouse / touch / pointer outside the element to which it was bound.
 *   Works for mouse and pointer events, touch events will be supported in the
 *   future.
 * @param {(event: Object) => boolean} filterEvents - Function to filter
 *   incoming events. Function should return `false` for events that will be
 *   ignored (e.g. right mouse clicks)
 * @param {useLongPress~callback} onStart - Called after detecting initial click
 *   / tap / point event. Allows to change event position before registering it
 *   for the purpose of `cancelOnMovement`.
 * @param {useLongPress~callback} onMove - Called on every move event. Allows to
 *   change event position before calculating distance for the purpose of
 *   `cancelOnMovement`.
 * @param {useLongPress~callback} onFinish - Called when releasing click / tap /
 *   point if long press **was** triggered.
 * @param {useLongPress~callback} onCancel - Called when releasing click / tap /
 *   point if long press **was not** triggered
 * @see LongPressCallback
 * @see LongPressOptions
 * @see LongPressResult
 */
export function useLongPress<
  Target extends Element = Element,
  Context = unknown,
  Callback extends LongPressCallback<Target, Context> = LongPressCallback<Target, Context>,
>(
  callback: Callback | null,
  {
    cancelOnMovement = false,
    cancelOutsideElement = true,
    captureEvent = false,
    detect = LongPressEventType.Pointer,
    filterEvents,
    threshold = 400,
    onCancel,
    onFinish,
    onMove,
    onStart,
  }: LongPressOptions<Target, Context> = {}
): LongPressResult<LongPressHandlers<Target>, Context> {
  const isLongPressActive = useRef(false);
  const isPressed = useRef(false);
  const target = useRef<Target>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedCallback = useRef(callback);
  const startPosition = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const start = useCallback(
    (context?: undefined | Context) => (event: LongPressReactEvents<Target>) => {
      // Prevent multiple start triggers
      if (isPressed.current) {
        return;
      }
      // Ignore unrecognised events
      if (!isRecognisableEvent(event)) {
        return;
      }
      // If we don't want all events to trigger long press and provided event is filtered out
      if (filterEvents !== undefined && !filterEvents(event)) {
        return;
      }
      if (captureEvent) {
        event.persist();
      }

      // When touched trigger onStart and start timer
      onStart?.(event, { context });

      // Calculate position after calling 'onStart' so it can potentially change it
      startPosition.current = getCurrentPosition(event);
      isPressed.current = true;
      target.current = event.currentTarget;

      timer.current = setTimeout(() => {
        if (savedCallback.current) {
          savedCallback.current(event, { context });
          isLongPressActive.current = true;
        }
      }, threshold);
    },
    [captureEvent, filterEvents, onStart, threshold]
  );

  const cancel = useCallback(
    (context?: undefined | Context) =>
      (
        event: LongPressReactEvents<Target>,
        reason?: undefined | (typeof LongPressCallbackReason)[keyof typeof LongPressCallbackReason]
      ) => {
        // Ignore unrecognised events
        if (!isRecognisableEvent(event)) {
          return;
        }
        // Ignore when element is not pressed anymore
        if (!isPressed.current) {
          return;
        }

        startPosition.current = null;

        if (captureEvent) {
          event.persist();
        }
        // Trigger onFinish callback only if timer was active
        if (isLongPressActive.current) {
          onFinish?.(event, { context });
        } else if (isPressed.current) {
          // If not active but pressed, trigger onCancel
          onCancel?.(event, {
            context,
            reason: reason ?? LongPressCallbackReason.CancelledByRelease,
          });
        }

        isLongPressActive.current = false;
        isPressed.current = false;
        timer.current !== undefined && clearTimeout(timer.current);
      },
    [captureEvent, onFinish, onCancel]
  );

  const move = useCallback(
    (context?: undefined | Context) => (event: LongPressReactEvents<Target>) => {
      // First call callback to allow modifying event position
      onMove?.(event, { context });

      if (cancelOnMovement !== false && startPosition.current) {
        const currentPosition = getCurrentPosition(event);

        if (currentPosition) {
          const moveThreshold = cancelOnMovement === true ? 25 : cancelOnMovement;
          const movedDistance = {
            x: Math.abs(currentPosition.x - startPosition.current.x),
            y: Math.abs(currentPosition.y - startPosition.current.y),
          };

          // If moved outside move tolerance box then cancel long press
          if (movedDistance.x > moveThreshold || movedDistance.y > moveThreshold) {
            cancel(context)(event, LongPressCallbackReason.CancelledByMovement);
          }
        }
      }
    },
    [cancel, cancelOnMovement, onMove]
  );

  /* const unregisterWindowListeners = useCallback((context: Context | undefined) => {
    // Skip if SSR
    if (!window) return;

    const contextHash = hashContext(context);
    const listener = windowListeners.current.get(contextHash);

    if (listener) {
      window.removeEventListener('mouseup', listener);
      window.removeEventListener('touchend', listener);
      window.removeEventListener('pointerup', listener);

      windowListeners.current.delete(contextHash);
    }
  }, []); */

  const binder = useCallback<LongPressResult<LongPressHandlers<Target>, Context>>(
    (ctx?: undefined | Context) => {
      if (callback === null) {
        return {};
      }

      switch (detect) {
        case LongPressEventType.Mouse: {
          const result: LongPressMouseHandlers = {
            onMouseDown: start(ctx) as MouseEventHandler<Target>,
            onMouseMove: move(ctx) as MouseEventHandler<Target>,
            onMouseUp: cancel(ctx) as MouseEventHandler<Target>,
          };

          if (cancelOutsideElement) {
            result.onMouseLeave = (event: MouseEvent<Target>) => {
              cancel(ctx)(event, LongPressCallbackReason.CancelledOutsideElement);
            };
          }

          return result;
        }
        case LongPressEventType.Pointer: {
          const result: LongPressPointerHandlers = {
            onPointerDown: start(ctx) as PointerEventHandler<Target>,
            onPointerMove: move(ctx) as PointerEventHandler<Target>,
            onPointerUp: cancel(ctx) as PointerEventHandler<Target>,
          };

          if (cancelOutsideElement) {
            result.onPointerLeave = (event: PointerEvent<Target>) =>
              cancel(ctx)(event, LongPressCallbackReason.CancelledOutsideElement);
          }

          return result;
        }
        case LongPressEventType.Touch: {
          return {
            onTouchEnd: cancel(ctx) as TouchEventHandler<Target>,
            onTouchMove: move(ctx) as TouchEventHandler<Target>,
            onTouchStart: start(ctx) as TouchEventHandler<Target>,
          };
        }
      }
    },
    [callback, cancel, cancelOutsideElement, detect, move, start]
  );

  // Listen to long press stop events on window
  useEffect(() => {
    // Do nothing if SSR
    if (!window) return;

    function listener(event: LongPressDomEvents) {
      const reactEvent = createArtificialReactEvent<Target>(event);
      cancel()(reactEvent);
    }

    window.addEventListener("mouseup", listener as UnsafeTypes.UnsafeAny);
    window.addEventListener("touchend", listener);
    window.addEventListener("pointerup", listener as UnsafeTypes.UnsafeAny);

    // Unregister all listeners on unmount
    return () => {
      window.removeEventListener("mouseup", listener as UnsafeTypes.UnsafeAny);
      window.removeEventListener("touchend", listener);
      window.removeEventListener("pointerup", listener as UnsafeTypes.UnsafeAny);
    };
  }, [cancel]);

  // Clear timer on unmount
  useEffect(
    () => (): void => {
      timer.current !== undefined && clearTimeout(timer.current);
    },
    []
  );

  // Update callback handle when it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  return binder;
}

const getPointerEvent = () => (typeof window === "object" ? (window?.PointerEvent ?? null) : null);
const getTouchEvent = () => (typeof window === "object" ? (window?.TouchEvent ?? null) : null);

function isTouchEvent<Target extends Element>(event: SyntheticEvent<Target>): event is ReactTouchEvent<Target> {
  const { nativeEvent } = event;
  const TouchEvent = getTouchEvent();

  return (TouchEvent && nativeEvent instanceof TouchEvent) || "touches" in event;
}

function isMouseEvent<Target extends Element>(event: SyntheticEvent<Target>): event is ReactMouseEvent<Target> {
  const PointerEvent = getPointerEvent();

  return event.nativeEvent instanceof MouseEvent && !(PointerEvent && event.nativeEvent instanceof PointerEvent);
}

function isPointerEvent<Target extends Element>(event: SyntheticEvent<Target>): event is ReactPointerEvent<Target> {
  const { nativeEvent } = event;

  if (!nativeEvent) {
    return false;
  }

  const PointerEvent = getPointerEvent();

  return (PointerEvent && nativeEvent instanceof PointerEvent) || "pointerId" in nativeEvent;
}

function isRecognisableEvent<Target extends Element>(
  event: SyntheticEvent<Target>
): event is LongPressReactEvents<Target> {
  return isMouseEvent(event) || isTouchEvent(event) || isPointerEvent(event);
}

function getCurrentPosition<Target extends Element>(
  event: LongPressReactEvents<Target>
): {
  x: number;
  y: number;
} | null {
  if (isTouchEvent(event)) {
    const touch = event.touches[0];
    if (!touch) return null;
    return {
      x: touch.pageX,
      y: touch.pageY,
    };
  }
  if (isMouseEvent(event) || isPointerEvent(event)) {
    return {
      x: event.pageX,
      y: event.pageY,
    };
  }

  return null;
}

function createArtificialReactEvent<Target extends Element = Element>(
  event: LongPressDomEvents
): LongPressReactEvents<Target> {
  return {
    currentTarget: event.currentTarget,
    nativeEvent: event,

    target: event.target,
    persist: () => {},
  } as LongPressReactEvents<Target>;
}

/*
 ⌜‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 ⎹ Enums
 ⌞____________________________________________________________________________________________________
*/

/**
 * What was the reason behind calling specific callback For now it applies only
 * to 'onCancel' which receives cancellation reason
 *
 * @see LongPressCallbackMeta
 */
export const LongPressCallbackReason = {
  /**
   * Returned when mouse / touch / pointer was moved outside initial press area
   * when `cancelOnMovement` is active
   */
  CancelledByMovement: "cancelled-by-movement",
  /**
   * Returned when click / tap / point was released before long press detection
   * time threshold
   */
  CancelledByRelease: "cancelled-by-release",
  /**
   * Returned when mouse / touch / pointer was moved outside element and
   * _cancelOutsideElement_ option was set to `true`
   */
  CancelledOutsideElement: "cancelled-outside-element",
} as const;

/** Which event listeners should be returned from the hook */
export const LongPressEventType = {
  Mouse: "mouse",
  Pointer: "pointer",
  Touch: "touch",
} as const;

export type LongPressEventType = (typeof LongPressEventType)[keyof typeof LongPressEventType];

/*
 ⌜‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 ⎹ Long press callback
 ⌞____________________________________________________________________________________________________
*/

/**
 * Function to call when long press event is detected
 *
 * @callback useLongPress~callback
 * @param {Object} event React mouse, touch or pointer event (depends on
 *   _detect_ param)
 * @param {Object} meta Object containing _context_ and / or _reason_ (if
 *   applicable)
 */
export type LongPressCallback<Target extends Element = Element, Context = unknown> = (
  event: LongPressReactEvents<Target>,
  meta: LongPressCallbackMeta<Context>
) => void;

export type LongPressCallbackMeta<Context = unknown> = {
  context?: undefined | Context;
  reason?: (typeof LongPressCallbackReason)[keyof typeof LongPressCallbackReason];
};

export type LongPressDomEvents = MouseEvent | PointerEvent | TouchEvent;

export type LongPressEmptyHandlers = Record<never, never>;

/*
 ⌜‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
 ⎹ Hook function
 ⌞____________________________________________________________________________________________________
*/

export type LongPressHandlers<Target extends Element = Element> =
  | LongPressEmptyHandlers
  | LongPressMouseHandlers<Target>
  | LongPressPointerHandlers<Target>
  | LongPressTouchHandlers<Target>;

export interface LongPressMouseHandlers<Target extends Element = Element> {
  onMouseDown: MouseEventHandler<Target>;
  onMouseMove: MouseEventHandler<Target>;
  onMouseUp: MouseEventHandler<Target>;
  onMouseLeave?: MouseEventHandler<Target>;
}

export interface LongPressOptions<
  Target extends Element = Element,
  Context = unknown,
  EventType extends LongPressEventType = LongPressEventType,
> {
  /**
   * If long press should be canceled on mouse / touch / pointer move. Possible
   * values:
   *
   * - `false`: [default] Disable cancelling on movement
   * - `true`: Enable cancelling on movement and use default 25px threshold
   * - `number`: Set a specific tolerance value in pixels (square side size inside
   *   which movement won't cancel long press)
   */
  cancelOnMovement?: boolean | number;
  /**
   * If long press should be canceled when moving mouse / touch / pointer
   * outside the element to which it was bound.
   *
   * Works for mouse and pointer events, touch events will be supported in the
   * future.
   */
  cancelOutsideElement?: boolean;
  /** If `event.persist()` should be called on react event */
  captureEvent?: boolean;
  /**
   * Which type of events should be detected ('mouse' | 'touch' | 'pointer').
   * For TS use _LongPressEventType_ enum.
   *
   * @see LongPressEventType
   */
  detect?: EventType;
  /**
   * Called when releasing click / tap / point if long press **was not**
   * triggered
   */
  onCancel?: LongPressCallback<Target, Context>;
  /** Called when releasing click / tap / point if long press **was** triggered. */
  onFinish?: LongPressCallback<Target, Context>;
  /**
   * Called on every move event. Allows to change event position before
   * calculating distance for the purpose of `cancelOnMovement`.
   */
  onMove?: LongPressCallback<Target, Context>;
  /**
   * Called after detecting initial click / tap / point event. Allows to change
   * event position before registering it for the purpose of
   * `cancelOnMovement`.
   */
  onStart?: LongPressCallback<Target, Context>;
  /**
   * Period of time that must elapse after detecting click or tap in order to
   * trigger _callback_
   */
  threshold?: number;
  /**
   * Function to filter incoming events. Function should return `false` for
   * events that will be ignored (e.g. right mouse clicks)
   *
   * @param {Object} event React event coming from handlers
   * @see LongPressReactEvents
   */
  filterEvents?: (event: LongPressReactEvents<Target>) => boolean;
}

export interface LongPressPointerHandlers<Target extends Element = Element> {
  onPointerDown: PointerEventHandler<Target>;
  onPointerMove: PointerEventHandler<Target>;
  onPointerUp: PointerEventHandler<Target>;
  onPointerLeave?: PointerEventHandler<Target>;
}

export type LongPressReactEvents<Target extends Element = Element> =
  | ReactMouseEvent<Target>
  | ReactPointerEvent<Target>
  | ReactTouchEvent<Target>;

export type LongPressResult<
  T extends LongPressEmptyHandlers | LongPressHandlers<Target>,
  Context = unknown,
  Target extends Element = Element,
> = (context?: Context) => T;

export interface LongPressTouchHandlers<Target extends Element = Element> {
  onTouchEnd: TouchEventHandler<Target>;
  onTouchMove: TouchEventHandler<Target>;
  onTouchStart: TouchEventHandler<Target>;
}

export type LongPressWindowListener = (event: LongPressDomEvents) => void;
