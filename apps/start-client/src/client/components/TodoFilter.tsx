import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type TodoFilter = "all" | "completed" | "active";

export const filterAtom = Atom.make<TodoFilter>("all");

const filters: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Open" },
  { value: "completed", label: "Done" },
];

export function TodoFilter() {
  const filter = useAtomValue(filterAtom);
  const setFilter = useAtomSet(filterAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeIndex = filters.findIndex((f) => f.value === filter);

  useEffect(() => {
    const updateIndicatorPosition = () => {
      const activeButton = buttonRefs.current[activeIndex];
      if (activeButton && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        });
      }
    };

    updateIndicatorPosition();
    const handleResize = () => updateIndicatorPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="relative mb-6 flex gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1"
    >
      {/* Sliding background indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-md bg-blue-600"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      />
      {filters.map((f, index) => {
        const isActive = filter === f.value;
        return (
          <button
            key={f.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`relative flex-1 rounded-md px-4 py-2 font-bold font-mono text-xs uppercase tracking-widest transition-colors ${
              isActive ? "text-white" : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            <span className="relative z-10">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
