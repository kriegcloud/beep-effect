// https://github.com/vercel/next.js/discussions/50700#discussioncomment-10134248

import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useWarnIfUnsavedChanges = (options: { enabled?: undefined | boolean; router?: undefined | boolean }) => {
  const router = useRouter();

  const handleAnchorClick = (e: MouseEvent) => {
    if (e.button !== 0) return; // only handle left-clicks

    const targetUrl = (e.currentTarget as HTMLAnchorElement).href;
    const currentUrl = window.location.href;

    if (targetUrl !== currentUrl && window.onbeforeunload) {
      const res = window.onbeforeunload(new Event("beforeunload"));

      if (!res) e.preventDefault();
    }
  };

  useEffect(() => {
    const addAnchorListeners = () => {
      const anchorElements = document.querySelectorAll("a[href]");
      anchorElements.forEach((anchor) => anchor.addEventListener("click", handleAnchorClick as EventListener));
    };

    const mutationObserver = new MutationObserver(addAnchorListeners);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    addAnchorListeners();

    return () => {
      mutationObserver.disconnect();
      const anchorElements = document.querySelectorAll("a[href]");
      anchorElements.forEach((anchor) => anchor.removeEventListener("click", handleAnchorClick as EventListener));
    };
  }, []);

  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // required for Chrome
    };

    const handlePopState = (e: PopStateEvent) => {
      if (options.enabled) {
        const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");

        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    if (options.enabled) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
      window.addEventListener("popstate", handlePopState);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [options.enabled]);

  useEffect(() => {
    if (!options?.router) return;

    const originalPush = router.push;

    router.push = (url: string, opt?: undefined | NavigateOptions) => {
      if (options.enabled) {
        const confirmLeave = window.confirm("Changes you made may not be saved.");

        if (confirmLeave) originalPush(url, opt);
      } else {
        originalPush(url, opt);
      }
    };

    return () => {
      router.push = originalPush;
    };
  }, [router, options.enabled, options?.router]);
};
