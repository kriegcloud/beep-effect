"use client";
import { useAtomMount } from "@effect-atom/atom-react";
import type React from "react";
import { WorkerClient } from "../../worker/worker-client";
import { makeAtomRuntime } from "./make-atom-runtime";

const kaRuntime = makeAtomRuntime(WorkerClient.Default);

export const KaServices: React.FC = () => {
  useAtomMount(kaRuntime);
  return null;
};
