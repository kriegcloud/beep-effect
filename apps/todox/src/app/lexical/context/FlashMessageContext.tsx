import type React from "react";
import type { JSX } from "react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import FlashMessage from "../ui/FlashMessage";

export type ShowFlashMessage = (message?: undefined | React.ReactNode, duration?: undefined | number) => void;

interface FlashMessageProps {
  readonly message?: undefined | React.ReactNode;
  readonly duration?: undefined | number;
}

const Context = createContext<ShowFlashMessage | undefined>(undefined);
const INITIAL_STATE: FlashMessageProps = {};
const DEFAULT_DURATION = 1000;

export const FlashMessageContext = ({ children }: { readonly children: ReactNode }): JSX.Element => {
  const [props, setProps] = useState(INITIAL_STATE);
  const showFlashMessage = useCallback<ShowFlashMessage>(
    (message, duration) => setProps(message ? { duration, message } : INITIAL_STATE),
    []
  );
  useEffect(() => {
    if (props.message) {
      const timeoutId = setTimeout(() => setProps(INITIAL_STATE), props.duration ?? DEFAULT_DURATION);
      return () => clearTimeout(timeoutId);
    }
  }, [props]);
  return (
    <Context.Provider value={showFlashMessage}>
      {children}
      {props.message && <FlashMessage>{props.message}</FlashMessage>}
    </Context.Provider>
  );
};

export const useFlashMessageContext = (): ShowFlashMessage => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("Missing FlashMessageContext");
  }
  return ctx;
};
