import { useEffect, useId, useMemo, useRef, useState } from "react";
import warning from "warning";

import { registerInstance, removeClient, unregisterInstance } from "./manager";
import ReCaptchaContext from "./ReCaptchaContext";

import type { ReCaptchaInstance, ScriptProps } from "./types";

let didWarnAboutHiddenBadge = false;

type ReCaptchaProviderProps = {
  /**
   * Configuration for the reCAPTCHA container.
   */
  container?:
    | undefined
    | {
        /**
         * The ID of the container element. If provided, the reCAPTCHA will be rendered into this
         * element. If not, the reCAPTCHA badge will be rendered.
         */
        element?: undefined | string | HTMLElement;
        parameters: {
          /**
           * The position of the badge.
           */
          badge?: undefined | "inline" | "bottomleft" | "bottomright";
          /**
           * Hides the reCAPTCHA badge.
           *
           * @see https://cloud.google.com/recaptcha/docs/faq#id_like_to_hide_the_badge_what_is_allowed
           */
          hidden?: undefined | boolean;
          /**
           * The name of your callback function, executed when the user submits a successful response.
           * The g-recaptcha-response token is passed to your callback.
           */
          callback?: undefined | (() => void);
          /**
           * The name of your callback function, executed when reCAPTCHA encounters an error (usually
           * network connectivity) and cannot continue until connectivity is restored. If you specify a
           * function here, you are responsible for informing the user that they should retry.
           */
          errorCallback?: undefined | (() => void);
          /**
           * The name of your callback function, executed when the reCAPTCHA response expires and the
           * user needs to re-verify.
           */
          expiredCallback?: undefined | (() => void);
          /**
           * The tabindex of the widget and challenge. If other elements in your page use tabindex, it
           * should be set to make user navigation easier.
           */
          tabindex?: undefined | number;
          /**
           * The color theme of the widget.
           */
          theme?: undefined | "dark" | "light";
        };
      };
  /**
   * The child components that will have access to the reCAPTCHA context.
   */
  children?: undefined | React.ReactNode;
  /**
   * The language code for the reCAPTCHA widget.
   */
  language?: undefined | string;
  /**
   * The reCAPTCHA site key.
   */
  reCaptchaKey: string;
  /**
   * Additional props for the reCAPTCHA script.
   */
  scriptProps?:
    | undefined
    | (Omit<ScriptProps, "src"> & {
        onLoadCallbackName?: undefined | string;
      });
  /**
   * Whether to use the reCAPTCHA Enterprise.
   *
   * @default false
   */
  useEnterprise?: undefined | boolean;
  /**
   * Whether to use recaptcha.net instead of google.com for loading the script.
   *
   * @default false
   */
  useRecaptchaNet?: undefined | boolean;
};

/**
 * Provides the reCAPTCHA context to your application. It should wrap your entire application or the
 * part of your application where you want to use reCAPTCHA.
 *
 * You may have multiple `ReCaptchaProvider` components in your application, however, they must use
 * the same settings.
 */
export default function ReCaptchaProvider({
  container,
  children,
  language,
  reCaptchaKey,
  scriptProps,
  useEnterprise,
  useRecaptchaNet,
}: ReCaptchaProviderProps) {
  const id = useId();
  const [reCaptchaInstance, setReCaptchaInstance] = useState<ReCaptchaInstance | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const clientIdMounted = useRef(false);

  useEffect(() => {
    function onLoadCallback() {
      const nextReCaptchaInstance = useEnterprise ? window.grecaptcha?.enterprise : window.grecaptcha;

      if (!nextReCaptchaInstance) {
        throw new Error("reCAPTCHA not found");
      }

      if (!nextReCaptchaInstance.ready) {
        throw new Error("reCAPTCHA ready callback not found");
      }

      nextReCaptchaInstance.ready(() => {
        setReCaptchaInstance(nextReCaptchaInstance);
      });
    }

    registerInstance(id, {
      language,
      onLoadCallback,
      onLoadCallbackName: scriptProps?.onLoadCallbackName,
      render: container?.element ? "explicit" : reCaptchaKey,
      scriptProps: {
        appendTo: scriptProps?.appendTo,
        async: scriptProps?.async,
        defer: scriptProps?.defer,
        id: scriptProps?.id,
        nonce: scriptProps?.nonce,
      },
      useEnterprise,
      useRecaptchaNet,
    });

    return () => {
      unregisterInstance(id);

      setReCaptchaInstance(null);
    };
  }, [
    container?.element,
    id,
    language,
    reCaptchaKey,
    scriptProps?.appendTo,
    scriptProps?.async,
    scriptProps?.defer,
    scriptProps?.id,
    scriptProps?.nonce,
    scriptProps?.onLoadCallbackName,
    useEnterprise,
    useRecaptchaNet,
  ]);

  useEffect(() => {
    if (!container?.element || !reCaptchaInstance?.render) {
      return;
    }

    const params = {
      "error-callback": container.parameters.errorCallback,
      "expired-callback": container.parameters.expiredCallback,
      badge: container.parameters?.badge || "inline",
      callback: container.parameters.callback,
      sitekey: reCaptchaKey,
      size: "invisible",
      tabindex: container.parameters.tabindex,
      theme: container.parameters.theme,
    };

    const actualContainerElement =
      typeof container?.element === "string" ? document.getElementById(container.element) : container?.element;

    if (!actualContainerElement) {
      throw new Error("reCAPTCHA container element not found");
    }

    const nextClientId = reCaptchaInstance.render(actualContainerElement, params);

    if (container?.parameters?.hidden) {
      if (!didWarnAboutHiddenBadge) {
        warning(
          false,
          "reCAPTCHA badge hidden. See https://cloud.google.com/recaptcha/docs/faq#id_like_to_hide_the_badge_what_is_allowed for more information."
        );

        didWarnAboutHiddenBadge = true;
      }

      (actualContainerElement.querySelector(".grecaptcha-badge") as HTMLDivElement | null)?.style.setProperty(
        "display",
        "none"
      );
    }

    setClientId(nextClientId);
    clientIdMounted.current = true;

    return () => {
      setClientId(null);
      clientIdMounted.current = false;

      removeClient(nextClientId);

      actualContainerElement.innerHTML = "";
    };
  }, [
    container?.element,
    container?.parameters?.badge,
    container?.parameters?.hidden,
    container?.parameters?.callback,
    container?.parameters?.errorCallback,
    container?.parameters?.expiredCallback,
    container?.parameters?.tabindex,
    container?.parameters?.theme,
    reCaptchaInstance,
    reCaptchaKey,
  ]);

  const shouldUseClientId = Boolean(container?.element);
  const clientIdOrReCaptchaKey = shouldUseClientId ? clientId : reCaptchaKey;

  const executeRecaptcha = useMemo(
    () =>
      clientIdOrReCaptchaKey !== null && reCaptchaInstance?.execute
        ? (action?: string) => {
            if (clientIdOrReCaptchaKey === null || !reCaptchaInstance?.execute) {
              throw new Error("reCAPTCHA has not been loaded");
            }

            if (shouldUseClientId && !clientIdMounted.current) {
              console.warn("Client ID not mounted");
              return null;
            }

            return reCaptchaInstance.execute(clientIdOrReCaptchaKey, { action });
          }
        : undefined,
    [clientIdOrReCaptchaKey, reCaptchaInstance, shouldUseClientId]
  );

  return (
    <ReCaptchaContext.Provider
      value={{
        container: container?.element,
        executeRecaptcha,
        reCaptchaInstance,
      }}
    >
      {children}
    </ReCaptchaContext.Provider>
  );
}
