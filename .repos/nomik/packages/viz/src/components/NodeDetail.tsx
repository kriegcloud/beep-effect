import type cytoscape from 'cytoscape';

interface NodeDetailProps {
    node: cytoscape.NodeSingular | null;
    onClose: () => void;
}

/** Color map for node type badge */
const LABEL_COLORS: Record<string, string> = {
    File: 'border-cyan-700 text-cyan-400',
    Function: 'border-emerald-700 text-emerald-400',
    Class: 'border-purple-700 text-purple-400',
    Route: 'border-amber-700 text-amber-400',
    Variable: 'border-blue-700 text-blue-400',
    Event: 'border-purple-600 text-purple-300',
    EnvVar: 'border-slate-600 text-slate-400',
    Module: 'border-cyan-600 text-cyan-300',
    DBTable: 'border-orange-700 text-orange-400',
    DBColumn: 'border-orange-600 text-orange-300',
    ExternalAPI: 'border-indigo-700 text-indigo-400',
    CronJob: 'border-lime-700 text-lime-400',
    QueueJob: 'border-fuchsia-700 text-fuchsia-400',
    Metric: 'border-teal-700 text-teal-400',
    Span: 'border-sky-700 text-sky-400',
    Topic: 'border-violet-700 text-violet-400',
    SecurityIssue: 'border-red-700 text-red-400',
};

/** Detail panel for the selected node */
export function NodeDetail({ node, onClose }: NodeDetailProps) {
    if (!node) return null;

    const data = node.data();
    const label = data.label ?? 'Unknown';
    const name = data.name ?? data.path ?? 'unnamed';

    const calledBy = node.incomers('edge[label="CALLS"]').sources();
    const calls = node.outgoers('edge[label="CALLS"]').targets();
    const containedBy = node.incomers('edge[label="CONTAINS"]').sources();
    const contains = node.outgoers('edge[label="CONTAINS"]').targets();
    const extendsNodes = node.outgoers('edge[label="EXTENDS"]').targets();
    const extendedBy = node.incomers('edge[label="EXTENDS"]').sources();
    const listensTo = node.outgoers('edge[label="LISTENS_TO"]').targets();
    const dependsOn = node.outgoers('edge[label="DEPENDS_ON"]').targets();
    const dependedOnBy = node.incomers('edge[label="DEPENDS_ON"]').sources();
    const usesEnv = node.outgoers('edge[label="USES_ENV"]').targets();
    const callsExternal = node.outgoers('edge[label="CALLS_EXTERNAL"]').targets();
    const securityIssues = node.outgoers('edge[label="HAS_SECURITY_ISSUE"]').targets();

    const badgeClass = LABEL_COLORS[label] ?? 'border-slate-600 text-slate-400';

    return (
        <div className="absolute right-4 top-4 bottom-4 w-80 bg-slate-900/95 border border-slate-700 rounded-lg backdrop-blur-sm z-20 flex flex-col shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${badgeClass}`}>{label}</span>
                    <span className="text-sm font-mono text-slate-200 truncate max-w-[180px]">{name}</span>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">&times;</button>
            </div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs font-mono">
                {/* Source file */}
                {data.filePath && (
                    <Section title="File">
                        <span className="text-slate-400">{shortenPath(data.filePath)}</span>
                        {data.startLine && <span className="text-slate-500 ml-1">:{data.startLine}-{data.endLine}</span>}
                    </Section>
                )}

                {/* Properties */}
                <Section title="Properties">
                    <div className="space-y-1">
                        {data.isExported !== undefined && <Prop label="exported" value={String(data.isExported)} />}
                        {data.isAsync !== undefined && <Prop label="async" value={String(data.isAsync)} />}
                        {data.returnType && <Prop label="returns" value={data.returnType} />}
                        {data.superClass && <Prop label="extends" value={data.superClass} />}
                        {data.language && <Prop label="language" value={data.language} />}
                        {data.size && <Prop label="size" value={`${data.size} B`} />}
                        {data.method && <Prop label="method" value={data.method} />}
                        {data.path && label === 'Route' && <Prop label="route" value={data.path} />}
                        {data.url && <Prop label="url" value={data.url} />}
                        {data.schedule && <Prop label="schedule" value={data.schedule} />}
                    </div>
                </Section>

                {/* Outgoing calls */}
                {calls.length > 0 && (
                    <Section title={`Calls (${calls.length})`}>
                        <NodeList nodes={calls} color="text-amber-400" />
                    </Section>
                )}

                {/* Incoming calls */}
                {calledBy.length > 0 && (
                    <Section title={`Called by (${calledBy.length})`}>
                        <NodeList nodes={calledBy} color="text-blue-400" />
                    </Section>
                )}

                {/* Inheritance */}
                {extendsNodes.length > 0 && (
                    <Section title={`Extends (${extendsNodes.length})`}>
                        <NodeList nodes={extendsNodes} color="text-purple-400" />
                    </Section>
                )}
                {extendedBy.length > 0 && (
                    <Section title={`Extended by (${extendedBy.length})`}>
                        <NodeList nodes={extendedBy} color="text-purple-300" />
                    </Section>
                )}

                {/* Events */}
                {listensTo.length > 0 && (
                    <Section title={`Listens to (${listensTo.length})`}>
                        <NodeList nodes={listensTo} color="text-purple-300" />
                    </Section>
                )}

                {/* Dependencies */}
                {dependsOn.length > 0 && (
                    <Section title={`Depends on (${dependsOn.length})`}>
                        <NodeList nodes={dependsOn} color="text-sky-400" />
                    </Section>
                )}
                {dependedOnBy.length > 0 && (
                    <Section title={`Depended on by (${dependedOnBy.length})`}>
                        <NodeList nodes={dependedOnBy} color="text-sky-300" />
                    </Section>
                )}

                {/* Env vars */}
                {usesEnv.length > 0 && (
                    <Section title={`Uses env vars (${usesEnv.length})`}>
                        <NodeList nodes={usesEnv} color="text-slate-400" />
                    </Section>
                )}

                {/* External API calls */}
                {callsExternal.length > 0 && (
                    <Section title={`Calls external (${callsExternal.length})`}>
                        <NodeList nodes={callsExternal} color="text-indigo-400" />
                    </Section>
                )}

                {/* Security issues */}
                {securityIssues.length > 0 && (
                    <Section title={`Security issues (${securityIssues.length})`}>
                        <NodeList nodes={securityIssues} color="text-red-400" />
                    </Section>
                )}

                {/* Contents (for files) */}
                {contains.length > 0 && (
                    <Section title={`Contains (${contains.length})`}>
                        <NodeList nodes={contains} color="text-slate-300" />
                    </Section>
                )}

                {/* Parent */}
                {containedBy.length > 0 && (
                    <Section title="Contained in">
                        <NodeList nodes={containedBy} color="text-cyan-400" />
                    </Section>
                )}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-slate-500 uppercase tracking-wider text-[10px] mb-1.5">{title}</div>
            {children}
        </div>
    );
}

function Prop({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-300">{value}</span>
        </div>
    );
}

function NodeList({ nodes, color }: { nodes: cytoscape.NodeCollection; color: string }) {
    return (
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {nodes.map((n: cytoscape.NodeSingular) => (
                <div key={n.id()} className={`${color} truncate`}>
                    {n.data('name') ?? n.data('path') ?? n.id()}
                </div>
            ))}
        </div>
    );
}

function shortenPath(p: string): string {
    const parts = p.replace(/\\/g, '/').split('/');
    const idx = parts.findIndex((s) => s === 'packages');
    return idx >= 0 ? parts.slice(idx).join('/') : parts.slice(-3).join('/');
}
