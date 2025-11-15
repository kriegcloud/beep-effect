import { createContext } from "react";

import type { ConfirmOptions, ConfirmResult } from "./types";

export interface ConfirmContextValue {
  readonly confirmBase: (parentId: string, options?: ConfirmOptions) => Promise<ConfirmResult>;
  readonly closeOnParentUnmount: (parentId: string) => void;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirmBase() {
    throw new Error("Missing ConfirmProvider");
  },
  closeOnParentUnmount() {
    // no-op default to allow optional chaining in absence of provider
  },
});

export default ConfirmContext;
