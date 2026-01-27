/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as MutableHashSet from "effect/MutableHashSet";

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

function readTouch(e: TouchEvent): [number, number] | null {
  const touch = e.changedTouches[0];
  if (touch === undefined) {
    return null;
  }
  return [touch.clientX, touch.clientY];
}

function addListener(element: HTMLElement, cb: Listener): () => void {
  let elementValues = elements.get(element);
  if (elementValues === undefined) {
    const listeners = MutableHashSet.empty<Listener>();
    const handleTouchstart = (e: TouchEvent) => {
      if (elementValues !== undefined) {
        elementValues.start = readTouch(e);
      }
    };
    const handleTouchend = (e: TouchEvent) => {
      if (elementValues === undefined) {
        return;
      }
      const start = elementValues.start;
      if (start === null) {
        return;
      }
      const end = readTouch(e);
      // Use native iteration - MutableHashSet implements iterable protocol
      for (const listener of listeners) {
        if (end !== null) {
          listener([end[0] - start[0], end[1] - start[1]], e);
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
  if (elementValues === undefined) {
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
