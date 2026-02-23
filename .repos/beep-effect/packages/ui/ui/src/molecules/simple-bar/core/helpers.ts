import type { UnsafeTypes } from "@beep/types";
import type { SimpleBarOptions } from "./options";
export function getElementWindow(element: Element) {
  if (!element || !element.ownerDocument || !element.ownerDocument.defaultView) {
    return window;
  }
  return element.ownerDocument.defaultView;
}

export function getElementDocument(element: Element) {
  if (!element || !element.ownerDocument) {
    return document;
  }
  return element.ownerDocument;
}

// Helper function to retrieve options from element attributes
export const getOptions = (obj: UnsafeTypes.UnsafeAny) => {
  const initialObj: SimpleBarOptions = {};

  const options = Array.prototype.reduce.call(
    obj,
    (acc: UnsafeTypes.UnsafeAny, attribute) => {
      const option = attribute.name.match(/data-simplebar-(.+)/);
      if (option) {
        const key: keyof SimpleBarOptions = option[1].replace(/\W+(.)/g, (_: UnsafeTypes.UnsafeAny, chr: string) =>
          chr.toUpperCase()
        );

        switch (attribute.value) {
          case "true":
            acc[key] = true;
            break;
          case "false":
            acc[key] = false;
            break;
          case undefined:
            acc[key] = true;
            break;
          default:
            acc[key] = attribute.value;
        }
      }
      return acc;
    },
    initialObj
  );
  return options as SimpleBarOptions;
};

export function addClasses(el: HTMLElement | null, classes: string) {
  if (!el) return;
  el.classList.add(...classes.split(" "));
}

export function removeClasses(el: HTMLElement | null, classes: string) {
  if (!el) return;
  classes.split(" ").forEach((className) => {
    el.classList.remove(className);
  });
}

export function classNamesToQuery(classNames: string) {
  return `.${classNames.split(" ").join(".")}`;
}

export const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
