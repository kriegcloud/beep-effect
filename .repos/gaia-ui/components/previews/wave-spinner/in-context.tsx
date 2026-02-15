"use client";

import { WaveSpinner } from "@/registry/new-york/ui/wave-spinner";
import { useState } from "react";

export default function WaveSpinnerInContext() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleClick1 = () => {
    setLoading1(true);
    setTimeout(() => setLoading1(false), 2000);
  };

  const handleClick2 = () => {
    setLoading2(true);
    setTimeout(() => setLoading2(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Loading state for a card */}
      <div className="w-64 rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800">
        <h3 className="mb-3 text-sm font-medium">Processing Data</h3>
        <div className="flex items-center justify-center py-8">
          <WaveSpinner color="primary" size="lg" />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Please wait while we process your request...
        </p>
      </div>

      {/* Button with spinner */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleClick1}
          disabled={loading1}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-70"
        >
          {loading1 && <WaveSpinner color="#ffffff" size="xs" pattern="line" />}
          {loading1 ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={handleClick2}
          disabled={loading2}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-70"
        >
          {loading2 && (
            <WaveSpinner color="#ffffff" size="xs" pattern="square2x2" />
          )}
          {loading2 ? "Processing..." : "Submit"}
        </button>
      </div>

      {/* Inline loading indicator */}
      <div className="flex items-center gap-3 rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
        <WaveSpinner color="primary" size="sm" />
        <span className="text-sm text-muted-foreground">
          Loading content...
        </span>
      </div>
    </div>
  );
}
