declare module "virtual:pwa-register/react" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
    onLogging?: (log: string) => void;
  }

  export interface UseRegisterSWOptions extends RegisterSWOptions {
    controls?: boolean;
  }

  export function useRegisterSW(options?: UseRegisterSWOptions): {
    offlineReady: import("react").MutableRefObject<boolean>;
    needRefresh: import("react").MutableRefObject<boolean>;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
