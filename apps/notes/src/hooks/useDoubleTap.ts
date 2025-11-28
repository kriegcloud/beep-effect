import { type MouseEvent, type MouseEventHandler, useCallback, useRef } from "react";

export type CallbackFunction<Target = Element> = EmptyCallback | MouseEventHandler<Target>;

export type DoubleTapCallback<Target = Element> = CallbackFunction<Target> | null;

export interface DoubleTapOptions<Target = Element> {
  onSingleTap?: CallbackFunction<Target>;
}

export type DoubleTapResult<Target, Callback> =
  Callback extends CallbackFunction<Target>
    ? {
        onClick: CallbackFunction<Target>;
      }
    : Callback extends null
      ? Record<string, never>
      : never;

type EmptyCallback = () => void;

export function useDoubleTap<Target = Element, Callback extends DoubleTapCallback<Target> = DoubleTapCallback<Target>>(
  callback: Callback,
  threshold = 300,
  options: DoubleTapOptions<Target> = {}
): DoubleTapResult<Target, Callback> {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handler = useCallback<CallbackFunction<Target>>(
    (event: MouseEvent<Target>) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        callback?.(event);
      } else {
        timer.current = setTimeout(() => {
          if (options.onSingleTap) {
            options.onSingleTap(event);
          }

          timer.current = null;
        }, threshold);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, threshold, options.onSingleTap]
  );

  return (
    callback
      ? {
          onClick: handler,
        }
      : {}
  ) as DoubleTapResult<Target, Callback>;
}
