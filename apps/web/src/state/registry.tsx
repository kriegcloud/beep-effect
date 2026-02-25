"use client";

import { RegistryProvider } from "@effect/atom-react";
import { Duration } from "effect";
import type React from "react";

const defaultIdleTtl = Duration.toMillis(Duration.seconds(30));

export function AppRegistryProvider({ children }: { readonly children: React.ReactNode }) {
  return <RegistryProvider defaultIdleTTL={defaultIdleTtl}>{children}</RegistryProvider>;
}
