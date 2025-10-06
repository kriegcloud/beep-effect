import React from "react";
import type { LiveManagedRuntime } from "./live-layer";

export const RuntimeContext = React.createContext<LiveManagedRuntime | null>(null);
