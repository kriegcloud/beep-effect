import { HashStraightIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { memo, useMemo } from "react";

interface Example {
  id: string;
  name: string;
  variant?: string;
  section?: string;
}

interface NavigationSidebarProps {
  examples: ReadonlyArray<Example>;
  currentExample?: string | undefined;
  onExampleSelect: (id: string) => void;
  className?: string;
}

function NavigationSidebarComponent({ className, currentExample, examples, onExampleSelect }: NavigationSidebarProps) {
  const sections = useMemo(
    () =>
      F.pipe(
        examples,
        A.groupBy((example) => example.section ?? "Other")
      ),
    [examples]
  );

  const containerClassName = `flex flex-col ${className ?? ""}`.trim();

  return (
    <aside className={containerClassName}>
      <div className="group h-full overflow-hidden">
        <div className="nav-scroll h-full overflow-y-auto overflow-x-hidden pr-2">
          <div className="p-4">
            <div className="mb-6 border-b border-white/5 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500">Examples</p>
            </div>

            {F.pipe(
              sections,
              R.toEntries,
              A.map(([sectionName, sectionExamples]) => (
                <div key={sectionName} className="mb-6 last:mb-0">
                  <h3 className="mb-3 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-neutral-500">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-white/5 bg-white/5">
                      <HashStraightIcon size={16} />
                    </span>
                    {Str.toUpperCase(sectionName)}
                  </h3>
                  <nav className="space-y-1">
                    {F.pipe(
                      sectionExamples,
                      A.map((example) => {
                        const isActive = currentExample === example.id;

                        return (
                          <button
                            type="button"
                            key={example.id}
                            onClick={() => onExampleSelect(example.id)}
                            className={`group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl py-2 pl-3 pr-4 text-left text-sm font-mono tracking-tight transition-colors duration-200 ${
                              isActive
                                ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors duration-200 ${
                                  isActive
                                    ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]"
                                    : "bg-neutral-600"
                                }`}
                              />
                              <span className="truncate">{example.name}</span>
                            </span>
                            {example.variant ? (
                              <span className="text-[0.55rem] uppercase tracking-[0.35em] text-neutral-500">
                                {example.variant}
                              </span>
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </nav>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Memoize the component to prevent re-renders when props don't change
export const NavigationSidebar = memo(NavigationSidebarComponent);
