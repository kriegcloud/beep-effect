"use client";
import { useAtomMount } from "@effect-atom/atom-react";
import type React from "react";
import { makeAtomRuntime } from "../runtime";
import { WorkerClient } from "../workers/worker-client";

const kaRuntime = makeAtomRuntime(WorkerClient.Default);

export const KaServices: React.FC = () => {
  useAtomMount(kaRuntime);
  return null;
};
