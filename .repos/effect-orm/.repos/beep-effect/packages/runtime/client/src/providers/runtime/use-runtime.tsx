"use client";
import React from "react";
import type { LiveManagedRuntime } from "../../runtime.ts";
import { RuntimeContext } from "./runtime-context";

export const useRuntime = (): LiveManagedRuntime => {
  const runtime = React.useContext(RuntimeContext);
  if (runtime === null) throw new Error("useRuntime must be used within a RuntimeProvider");
  return runtime;
};
