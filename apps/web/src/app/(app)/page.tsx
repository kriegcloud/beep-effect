"use client";

import { RegistryProvider, useAtom, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/unstable/reactivity";
import { useCallback } from "react";

/**
 * Atom+React prototype spike (validates AD-009).
 *
 * Verifies: RegistryProvider renders, useAtomValue reads derived state,
 * useAtom reads+writes, Atom.make works for both primitive and computed atoms.
 *
 * This page is a temporary spike replaced in P4.
 */

const countAtom = Atom.make(0);
const doubleAtom = Atom.make((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubled = useAtomValue(doubleAtom);

  const increment = useCallback(() => {
    setCount((prev: number) => prev + 1);
  }, [setCount]);

  const decrement = useCallback(() => {
    setCount((prev: number) => prev - 1);
  }, [setCount]);

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        Atom spike — count: <strong>{count}</strong>, doubled: <strong>{doubled}</strong>
      </p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={decrement}
          className="rounded-md border border-input px-3 py-1 text-sm hover:bg-accent"
        >
          -
        </button>
        <button
          type="button"
          onClick={increment}
          className="rounded-md border border-input px-3 py-1 text-sm hover:bg-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <RegistryProvider>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Effect v4 Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground">You are authenticated. Workspace coming in P4.</p>
        </div>
        <Counter />
      </main>
    </RegistryProvider>
  );
}
