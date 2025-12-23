import type { HistoryState } from "@lexical/react/LexicalHistoryPlugin";
import { createEmptyHistoryState } from "@lexical/react/LexicalHistoryPlugin";
import type { Context, JSX } from "react";
import { createContext, type ReactNode, useContext, useMemo } from "react";

interface IContextShape {
  readonly historyState?: undefined | HistoryState;
}

const Context: Context<IContextShape> = createContext({});

export const SharedHistoryContext = ({ children }: { readonly children: ReactNode }): JSX.Element => {
  const historyContext = useMemo(() => ({ historyState: createEmptyHistoryState() }), []);
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = (): IContextShape => {
  return useContext(Context);
};
