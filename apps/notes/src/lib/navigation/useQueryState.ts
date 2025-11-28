"use client";

import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";

export const useSearchQueryState = () => {
  return useQueryState("q", { clearOnDefault: true, defaultValue: "" });
};

export const useIsIframe = () => {
  const searchParams = useSearchParams();

  return searchParams.get("iframe") === "true";
};
