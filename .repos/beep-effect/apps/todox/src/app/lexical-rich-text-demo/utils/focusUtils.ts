import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export const findFirstFocusableDescendant = (startElement: HTMLElement): O.Option<HTMLElement> => {
  const focusableSelector = "button, a[href], input, select, textarea, details, summary [tabindex], [contenteditable]";

  const element = startElement.querySelector(focusableSelector);
  return F.pipe(element, O.liftPredicate(S.is(S.instanceOf(HTMLElement))));
};

export const focusNearestDescendant = (startElement: HTMLElement): O.Option<HTMLElement> => {
  const el = findFirstFocusableDescendant(startElement);

  return el.pipe(
    O.tap((el) => {
      el.focus();
      return O.some(el);
    })
  );
};

export const isKeyboardInput = (event: MouseEvent | PointerEvent | React.MouseEvent): boolean => {
  if ("pointerId" in event && "pointerType" in event) {
    return event.pointerId === -1 && event.pointerType === "";
  }

  return event?.detail === 0;
};
