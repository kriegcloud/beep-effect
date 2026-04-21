import { $UiId } from "@beep/identity";
import { useAtom } from "@effect/atom-react";
import { Match, Number as N, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Atom } from "effect/unstable/reactivity";
import { HealthStats } from "../neo4j.ts";

const $I = $UiId.create("components/codegraph/components/StatsPanel");

class Props extends S.Class<Props>($I`Props`)({
  stats: S.OptionFromNullOr(HealthStats),
  loading: S.Boolean,
}) {}

const showDeadCodeAtom = Atom.make<boolean>(false);

const showGodObjectsAtom = Atom.make<boolean>(false);

const showGodFilesAtom = Atom.make<boolean>(false);

const showDuplicatesAtom = Atom.make<boolean>(false);

const basename = Str.replace(/^.*[\\/]/, "");

export function StatsPanel({ loading, stats }: Props) {
  const [showDeadCode, setShowDeadCode] = useAtom(showDeadCodeAtom);
  const [showGodObjects, setShowGodObjects] = useAtom(showGodObjectsAtom);
  const [showGodFiles, setShowGodFiles] = useAtom(showGodFilesAtom);
  const [showDuplicates, setShowDuplicates] = useAtom(showDuplicatesAtom);

  if (loading || O.isNone(stats)) {
    return (
      <aside className="w-64 border-r border-gray-800 p-4 flex flex-col gap-4 shrink-0">
        <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase">Health</h2>
        <div className="text-xs font-mono text-slate-600 animate-pulse">Loading...</div>
      </aside>
    );
  }

  const primaryMetrics = [
    {
      label: "Nodes",
      value: stats.value.nodeCount,
      color: "text-slate-300",
    },
    {
      label: "Edges",
      value: stats.value.edgeCount,
      color: "text-slate-300",
    },
  ];

  const nodeTypeMetrics = pipe(
    A.make(
      {
        label: "Files",
        value: stats.value.fileCount,
        color: "text-cyan-400",
      },
      {
        label: "Functions",
        value: stats.value.functionCount,
        color: "text-emerald-400",
      },
      {
        label: "Classes",
        value: stats.value.classCount,
        color: "text-purple-400",
      },
      {
        label: "Routes",
        value: stats.value.routeCount,
        color: "text-amber-400",
      },
      {
        label: "Variables",
        value: stats.value.variableCount,
        color: "text-blue-400",
      },
      {
        label: "Events",
        value: stats.value.eventCount,
        color: "text-purple-300",
      },
      {
        label: "Env Vars",
        value: stats.value.envVarCount,
        color: "text-slate-400",
      },
      {
        label: "Modules",
        value: stats.value.moduleCount,
        color: "text-cyan-300",
      },
      {
        label: "DB Tables",
        value: stats.value.dbTableCount,
        color: "text-orange-400",
      },
      {
        label: "External APIs",
        value: stats.value.externalApiCount,
        color: "text-indigo-400",
      },
      {
        label: "Security Issues",
        value: stats.value.securityIssueCount,
        color: "text-red-400",
      }
    ),
    A.filter((m) => m.value > 0)
  );

  return (
    <aside className="w-64 border-r border-gray-800 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
      {/* Primary counts */}
      <div>
        <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase mb-3">Graph</h2>
        <div className="space-y-1.5">
          {primaryMetrics.map((m) => (
            <div key={m.label} className="flex justify-between items-center">
              <span className="text-[11px] font-mono text-slate-500">{m.label}</span>
              <span className={`text-sm font-mono font-bold ${m.color}`}>{m.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Node type breakdown */}
      <div>
        <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase mb-3">Node Types</h2>
        <div className="space-y-1">
          {nodeTypeMetrics.map((m) => (
            <div key={m.label} className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500">{m.label}</span>
              <span className={`text-xs font-mono font-bold ${m.color}`}>{m.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Health */}
      <div>
        <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase mb-3">Health</h2>

        {/* Dead code — clickable to show details */}
        <HealthRow
          label="Dead code"
          count={stats.value.deadCodeCount}
          isOpen={showDeadCode}
          onToggle={() => setShowDeadCode(!showDeadCode)}
          badColor="text-red-400"
        />
        {showDeadCode && stats.value.deadCodeItems.length > 0 && (
          <div className="ml-3 mt-1 mb-2 space-y-1 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
            {stats.value.deadCodeItems.map((item, i) => (
              <div key={`dc-${i}`} className="group">
                <div className="text-[10px] font-mono text-red-300/80 truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="text-[9px] font-mono text-slate-600 truncate" title={item.filePath}>
                  {basename(item.filePath)}
                </div>
              </div>
            ))}
          </div>
        )}
        {showDeadCode && stats.value.deadCodeItems.length === 0 && (
          <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No dead code</div>
        )}

        {/* God objects */}
        <HealthRow
          label="God objects"
          count={stats.value.godObjectCount}
          isOpen={showGodObjects}
          onToggle={() => setShowGodObjects(!showGodObjects)}
          badColor="text-orange-400"
        />
        {showGodObjects && stats.value.godObjectItems.length > 0 && (
          <div className="ml-3 mt-1 mb-2 space-y-1 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
            {stats.value.godObjectItems.map((item, i) => (
              <div key={`go-${i}`} className="group">
                <div
                  className="text-[10px] font-mono text-orange-300/80 truncate flex justify-between"
                  title={item.name}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-orange-400/60 ml-1 shrink-0">{item.depCount} deps</span>
                </div>
                <div className="text-[9px] font-mono text-slate-600 truncate" title={item.filePath}>
                  {basename(item.filePath)}
                </div>
              </div>
            ))}
          </div>
        )}
        {showGodObjects && stats.value.godObjectItems.length === 0 && (
          <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No god objects</div>
        )}

        {/* God files */}
        <HealthRow
          label="God files"
          count={stats.value.godFileCount}
          isOpen={showGodFiles}
          onToggle={() => setShowGodFiles(!showGodFiles)}
          badColor="text-amber-400"
        />
        {showGodFiles && stats.value.godFileItems.length > 0 && (
          <div className="ml-3 mt-1 mb-2 space-y-1 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
            {stats.value.godFileItems.map((item, i) => (
              <div key={`gf-${i}`} className="group">
                <div
                  className="text-[10px] font-mono text-amber-300/80 truncate flex justify-between"
                  title={item.filePath}
                >
                  <span className="truncate">{basename(item.filePath)}</span>
                  <span className="text-amber-400/60 ml-1 shrink-0">{item.functionCount} fn</span>
                </div>
                {item.totalLines > 0 && (
                  <div className="text-[9px] font-mono text-slate-600">{item.totalLines} lines</div>
                )}
              </div>
            ))}
          </div>
        )}
        {showGodFiles && stats.value.godFileItems.length === 0 && (
          <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No god files</div>
        )}

        {/* Duplicates */}
        <HealthRow
          label="Duplicates"
          count={stats.value.duplicateCount}
          isOpen={showDuplicates}
          onToggle={() => setShowDuplicates(!showDuplicates)}
          badColor="text-yellow-400"
        />
        {showDuplicates && stats.value.duplicateGroups.length > 0 && (
          <div className="ml-3 mt-1 mb-2 space-y-2 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
            {stats.value.duplicateGroups.map((group, i) => (
              <div key={`dup-${i}`}>
                <div className="text-[10px] font-mono text-yellow-300/80">{group.count} copies:</div>
                {group.functions.map((fn, j) => (
                  <div
                    key={`dup-${i}-${j}`}
                    className="text-[9px] font-mono text-slate-500 truncate pl-1"
                    title={fn.filePath}
                  >
                    {fn.name} <span className="text-slate-600">({basename(fn.filePath)})</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {showDuplicates && stats.value.duplicateGroups.length === 0 && (
          <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No duplicates</div>
        )}

        {/* Security issues summary */}
        {stats.value.securityIssueCount > 0 && (
          <div className="flex justify-between items-center py-1 px-1 -mx-1">
            <span className="text-[11px] font-mono text-slate-500">Security issues</span>
            <span className="text-sm font-mono font-bold text-red-400">
              {stats.value.securityIssueCount}
              <span className="ml-1 text-[9px]">!</span>
            </span>
          </div>
        )}
      </div>

      {/* Health score */}
      <div className="border-t border-gray-800 pt-3">
        <HealthScore stats={stats.value} />
      </div>
    </aside>
  );
}

function HealthRow({
  label,
  count,
  isOpen,
  onToggle,
  badColor,
}: {
  readonly label: string;
  readonly count: number;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly badColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center py-1 hover:bg-slate-900/50 rounded px-1 -mx-1 transition-colors"
    >
      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
        <span className={`text-[9px] transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
        {label}
      </span>
      <span className={`text-sm font-mono font-bold ${count > 0 ? badColor : "text-emerald-400"}`}>
        {count}
        {count > 0 && <span className="ml-1 text-[9px]">!</span>}
      </span>
    </button>
  );
}

/** Visual health score indicator
 *
 */
function HealthScore({ stats }: { readonly stats: HealthStats }) {
  const total = stats.functionCount || 1;
  const deadPenalty = Math.min(25, Math.round((stats.deadCodeCount / total) * 100));
  const godObjPenalty = Math.min(20, stats.godObjectCount * 5);
  const godFilePenalty = Math.min(15, stats.godFileCount * 3);
  const dupPenalty = Math.min(10, stats.duplicateCount * 2);
  const secPenalty = Math.min(30, stats.securityIssueCount * 10);
  const score = Math.max(0, 100 - deadPenalty - godObjPenalty - godFilePenalty - dupPenalty - secPenalty);

  const getColor = Match.type<number>().pipe(
    Match.when(N.isGreaterThanOrEqualTo(80), () => "text-emerald-400"),
    Match.when(N.isGreaterThanOrEqualTo(50), () => "text-amber-400"),
    Match.orElse(() => "text-red-400")
  );
  const getLabel = Match.type<number>().pipe(
    Match.when(N.isGreaterThanOrEqualTo(80), () => "Healthy"),
    Match.when(N.isGreaterThanOrEqualTo(50), () => "Fair"),
    Match.orElse(() => "Needs attention")
  );

  return (
    <div className="text-center">
      <div className={`text-2xl font-mono font-bold ${getColor(score)}`}>{score}%</div>
      <div className={`text-[10px] font-mono ${getColor(score)}`}>{getLabel(score)}</div>
    </div>
  );
}
