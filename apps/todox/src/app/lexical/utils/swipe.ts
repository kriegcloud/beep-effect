import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type { Force } from "../schema/swipe.schema";

type Listener = (force: Force.Type, e: TouchEvent) => void;
type ElementValues = {
  start: null | Force.Type;
  listeners: MutableHashSet.MutableHashSet<Listener>;
  handleTouchstart: (e: TouchEvent) => void;
  handleTouchend: (e: TouchEvent) => void;
};

// WeakMap is kept as native - no Effect equivalent, serves GC purposes
const elements = new WeakMap<HTMLElement, ElementValues>();

function readTouch(e: TouchEvent): O.Option<[number, number]> {
  return O.fromNullable(e.changedTouches[0]).pipe(O.map((touch) => [touch.clientX, touch.clientY] as const));
}

function addListener(element: HTMLElement, cb: Listener): () => void {
  let elementValues = elements.get(element);
  if (P.isUndefined(elementValues)) {
    const listeners = MutableHashSet.empty<Listener>();
    const handleTouchstart = (e: TouchEvent) => {
      if (P.isNotUndefined(elementValues)) {
        elementValues.start = readTouch(e).pipe(O.getOrNull);
      }
    };
    const handleTouchend = (e: TouchEvent) => {
      if (P.isUndefined(elementValues)) {
        return;
      }
      const start = elementValues.start;
      if (P.isNull(start)) {
        return;
      }
      const endOpt = readTouch(e);
      // Use native iteration - MutableHashSet implements iterable protocol
      for (const listener of listeners) {
        if (O.isSome(endOpt)) {
          listener([endOpt.value[0] - start[0], endOpt.value[1] - start[1]], e);
        }
      }
    };
    element.addEventListener("touchstart", handleTouchstart);
    element.addEventListener("touchend", handleTouchend);

    elementValues = {
      handleTouchend,
      handleTouchstart,
      listeners,
      start: null,
    };
    elements.set(element, elementValues);
  }
  MutableHashSet.add(elementValues.listeners, cb);
  return () => deleteListener(element, cb);
}

function deleteListener(element: HTMLElement, cb: Listener): void {
  const elementValues = elements.get(element);
  if (P.isUndefined(elementValues)) {
    return;
  }
  const listeners = elementValues.listeners;
  MutableHashSet.remove(listeners, cb);
  if (MutableHashSet.size(listeners) === 0) {
    elements.delete(element);
    element.removeEventListener("touchstart", elementValues.handleTouchstart);
    element.removeEventListener("touchend", elementValues.handleTouchend);
  }
}

export function addSwipeLeftListener(element: HTMLElement, cb: (_force: number, e: TouchEvent) => void) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (x < 0 && -x > Math.abs(y)) {
      cb(x, e);
    }
  });
}

export function addSwipeRightListener(element: HTMLElement, cb: (_force: number, e: TouchEvent) => void) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (x > 0 && x > Math.abs(y)) {
      cb(x, e);
    }
  });
}

export function addSwipeUpListener(element: HTMLElement, cb: (_force: number, e: TouchEvent) => void) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (y < 0 && -y > Math.abs(x)) {
      cb(x, e);
    }
  });
}

export function addSwipeDownListener(element: HTMLElement, cb: (_force: number, e: TouchEvent) => void) {
  return addListener(element, (force, e) => {
    const [x, y] = force;
    if (y > 0 && y > Math.abs(x)) {
      cb(x, e);
    }
  });
}
