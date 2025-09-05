"use client";

import type { UnsafeTypes } from "@beep/types";
import NProgress from "nprogress";
import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "../../hooks";

type PushStateInput = [data: UnsafeTypes.UnsafeAny, unused: string, url?: string | URL | null | undefined];

/**
 * Handles anchor click events to start the progress bar if the target URL is different from the current URL.
 * @param event - The mouse event triggered by clicking an anchor element.
 */
const handleAnchorClick = (event: MouseEvent) => {
  const targetUrl = (event.currentTarget as HTMLAnchorElement).href;
  const currentUrl = window.location.href;

  if (targetUrl !== currentUrl) {
    NProgress.start();
  }
};

/**
 * Handles DOM mutations to add click event listeners to anchor elements.
 */
const handleMutation = () => {
  const anchorElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a[href]");

  const filteredAnchors = Array.from(anchorElements).filter((element) => {
    const rel = element.getAttribute("rel");
    const href = element.getAttribute("href");
    const target = element.getAttribute("target");

    return href?.startsWith("/") && target !== "_blank" && rel !== "noopener";
  });

  filteredAnchors.forEach((anchor) => anchor.addEventListener("click", handleAnchorClick));
};

export function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const mutationObserver = new MutationObserver(handleMutation);

    mutationObserver.observe(document, { childList: true, subtree: true });

    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray: PushStateInput) => {
        NProgress.done();
        return target.apply(thisArg, argArray);
      },
    });

    // Cleanup function to remove event listeners and observer
    return () => {
      mutationObserver.disconnect();
      const anchorElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a[href]");
      anchorElements.forEach((anchor) => anchor.removeEventListener("click", handleAnchorClick));
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <NProgressDone />
    </Suspense>
  );
}

function NProgressDone() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, router, searchParams]);

  return null;
}
