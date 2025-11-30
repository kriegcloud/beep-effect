"use client";
import { useSearchParams } from "next/navigation";

export const useIsIframe = () => {
  const searchParams = useSearchParams();

  return searchParams.get("iframe") === "true";
};
