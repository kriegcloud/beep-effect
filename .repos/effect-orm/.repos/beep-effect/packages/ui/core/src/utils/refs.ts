import type React from "react";

export function mergeRefs<T>(refs: (React.Ref<T> | undefined | null)[]): React.RefCallback<T> {
  return (value: T | null) => {
    // Early return if there are no refs
    if (refs.length === 0) return;

    for (const ref of refs) {
      // Skip invalid refs
      if (!ref) continue;

      // Handle function refs
      if (typeof ref === "function") {
        ref(value);
      }
      // Handle object refs with 'current' property
      else if ("current" in ref) {
        (ref as React.RefObject<T | null>).current = value;
      }
    }
  };
}
