"use client";
import React from "react";
export const createCtx = <A extends NonNullable<unknown> | null>(name: string) => {
  const ctx = React.createContext<A | undefined>(undefined);
  function useCtx() {
    const c = React.use(ctx);
    if (c === undefined) throw new Error(`[${name}] useCtx must be inside a Provider with a value`);
    return c;
  }
  return [useCtx, ctx.Provider] as const; // 'as const' makes TypeScript infer a tuple
};
