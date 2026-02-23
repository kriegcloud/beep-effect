import { useDebounce } from "@beep/notes/registry/hooks/use-debounce";
import { useEditorVersion, useValueVersion } from "platejs/react";

export const useDebouncedEditorVersion = (delay = 500) => {
  const version = useEditorVersion();

  return useDebounce(version, delay);
};

export const useDebouncedValueVersion = (delay = 500) => {
  const version = useValueVersion();

  return useDebounce(version, delay);
};
