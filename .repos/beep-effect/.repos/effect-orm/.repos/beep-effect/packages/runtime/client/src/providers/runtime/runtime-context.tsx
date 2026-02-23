"use client";
import React from "react";
import type { LiveManagedRuntime } from "../../runtime";

export const RuntimeContext = React.createContext<LiveManagedRuntime | null>(null);
