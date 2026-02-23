#!/usr/bin/env python3
"""
Ingest episodes into Graphiti MCP via Streamable HTTP (SSE) protocol.

Usage:
  python3 ingest-sse.py --batch <name> [--delay <seconds>] [--limit <n>] [--skip <n>] [--dry-run]

Batches: seed, modules, migrations, patterns, docs, enrichment, functions-top20, all-docs, all
"""
import json
import sys
import os
import time
import urllib.request
import argparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "outputs")
MCP_URL = "http://localhost:8000/mcp"
GROUP_ID = "effect-v4"

SEED_EPISODE = {
    "name": "Effect v4 Core Concepts Overview",
    "episode_body": "Title: Effect v4 Core Concepts Overview\nCategory: concept\n\nEffect v4 (beta) is a comprehensive TypeScript library for building type-safe, composable applications.\nIt provides a unified package \"effect\" that replaces the previous multi-package structure (@effect/platform, @effect/cli, etc.).\n\nCore Modules:\n- Effect: The central type representing effectful computations with typed errors and dependencies\n- Schema: Runtime validation, encoding/decoding with type inference\n- Stream: Lazy, composable streaming with backpressure\n- Layer: Dependency injection through composable service layers\n- ServiceMap: Service definition and management (replaces v3's Context.Tag)\n- Option: Type-safe optional values (replaces null/undefined)\n- Result: Type-safe error handling (replaces Either from v3)\n- Fiber: Lightweight concurrency primitives\n- Scope: Resource lifecycle management\n- Array: Immutable functional array operations\n- Chunk: Efficient immutable indexed sequences for streaming\n- Channel: Bidirectional communication for complex stream operations\n\nKey v4 Changes from v3:\n- Context.Tag replaced by ServiceMap.Service\n- Effect.catchAll replaced by Effect.catch\n- Either renamed to Result\n- Schema.decode replaced by Schema.decodeUnknownEffect\n- FileSystem/Path moved to main \"effect\" package from @effect/platform\n- Types that were Effect subtypes (Ref, Deferred, Fiber) now use Yieldable trait\n- Layer.scoped removed, Layer.effect handles scoping automatically\n\nUnstable Subsystems (effect/unstable/*):\n- cli: Command-line interface framework\n- http: HTTP client and server\n- httpapi: Declarative HTTP API framework\n- sql: Database access\n- ai: LLM integration\n- rpc: Remote procedure calls",
    "source": "text",
    "source_description": "Effect v4 core concepts seed",
    "group_id": GROUP_ID
}


def load_json(relpath):
    fullpath = os.path.join(OUT_DIR, relpath)
    if not os.path.exists(fullpath):
        print(f"  Warning: {relpath} not found, skipping")
        return []
    with open(fullpath) as f:
        return json.load(f)


class MCPClient:
    def __init__(self, url):
        self.url = url
        self.session_id = None
        self.msg_id = 0

    def initialize(self):
        """Initialize MCP session and get session ID."""
        self.msg_id += 1
        payload = json.dumps({
            "jsonrpc": "2.0",
            "id": self.msg_id,
            "method": "initialize",
            "params": {
                "protocolVersion": "2025-03-26",
                "capabilities": {},
                "clientInfo": {"name": "effect-kg-ingest", "version": "1.0"}
            }
        }).encode("utf-8")

        req = urllib.request.Request(
            self.url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream"
            }
        )
        resp = urllib.request.urlopen(req, timeout=30)

        # Extract session ID from headers
        self.session_id = resp.headers.get("Mcp-Session-Id")
        if not self.session_id:
            raise RuntimeError("No session ID in response")

        # Read and discard SSE response body
        resp.read()
        print(f"  Session: {self.session_id[:16]}...")
        return self.session_id

    def add_memory(self, episode):
        """Send add_memory tool call with session ID."""
        self.msg_id += 1
        payload = json.dumps({
            "jsonrpc": "2.0",
            "id": self.msg_id,
            "method": "tools/call",
            "params": {
                "name": "add_memory",
                "arguments": {
                    "name": episode["name"],
                    "episode_body": episode["episode_body"],
                    "source": episode.get("source", "text"),
                    "source_description": episode.get("source_description", ""),
                    "group_id": episode.get("group_id", GROUP_ID)
                }
            }
        }).encode("utf-8")

        req = urllib.request.Request(
            self.url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
                "Mcp-Session-Id": self.session_id
            }
        )

        resp = urllib.request.urlopen(req, timeout=120)
        body = resp.read().decode("utf-8")

        # Parse SSE response
        for line in body.split("\n"):
            if line.startswith("data: "):
                data = json.loads(line[6:])
                if "error" in data:
                    return False, data["error"].get("message", "Unknown error")
                if "result" in data:
                    return True, "OK"

        return True, "OK (no structured response)"


BATCHES = {
    "seed": lambda: [SEED_EPISODE],
    "modules": lambda: load_json("p2-doc-extraction/module-episodes.json"),
    "migrations": lambda: load_json("p2-doc-extraction/migration-episodes.json"),
    "patterns": lambda: load_json("p2-doc-extraction/pattern-episodes.json"),
    "docs": lambda: load_json("p2-doc-extraction/doc-episodes.json"),
    "enrichment": lambda: load_json("p4-enrichment/enrichment-episodes.json"),
    "functions-top20": lambda: load_json("p3-ast-extraction/function-episodes-top20.json"),
    "functions-all": lambda: load_json("p3-ast-extraction/function-episodes.json"),
    "unstable": lambda: load_json("p3-ast-extraction/unstable-episodes.json"),
}

ALL_DOCS_ORDER = ["seed", "modules", "migrations", "patterns", "docs", "enrichment"]
ALL_ORDER = ALL_DOCS_ORDER + ["functions-top20"]


def ingest_batch(client, name, episodes, delay, limit, skip, dry_run):
    to_process = episodes[skip:]
    if limit > 0:
        to_process = to_process[:limit]

    print(f"\n{'='*60}")
    print(f"Batch: {name} ({len(to_process)} episodes"
          f"{f', skipping {skip}' if skip > 0 else ''}"
          f"{f', limit {limit}' if limit > 0 else ''})")
    print(f"{'='*60}")

    succeeded = 0
    failed = 0
    errors = []
    start = time.time()

    for i, ep in enumerate(to_process):
        idx = skip + i
        progress = f"[{i+1}/{len(to_process)}]"

        if dry_run:
            print(f"  {progress} DRY: {ep['name'][:60]} ({len(ep['episode_body'])} chars)")
            succeeded += 1
            continue

        sys.stdout.write(f"  {progress} {ep['name'][:55]}...")
        sys.stdout.flush()

        try:
            ok, msg = client.add_memory(ep)
            if ok:
                print(f" OK")
                succeeded += 1
            else:
                print(f" FAIL: {msg[:60]}")
                failed += 1
                errors.append({"index": idx, "name": ep["name"], "error": msg})
        except Exception as e:
            print(f" ERR: {str(e)[:60]}")
            failed += 1
            errors.append({"index": idx, "name": ep["name"], "error": str(e)})
            # Re-initialize session on error
            try:
                client.initialize()
            except:
                pass

        if i < len(to_process) - 1 and not dry_run:
            time.sleep(delay)

    elapsed = time.time() - start
    print(f"\nBatch '{name}': {succeeded} OK, {failed} failed in {elapsed:.1f}s")
    return {
        "batch": name,
        "total": len(to_process),
        "succeeded": succeeded,
        "failed": failed,
        "duration_s": round(elapsed, 1),
        "errors": errors
    }


def main():
    parser = argparse.ArgumentParser(description="Ingest episodes into Graphiti")
    parser.add_argument("--batch", default="all-docs",
                       help="Batch name or 'all-docs' or 'all'")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between episodes")
    parser.add_argument("--limit", type=int, default=0, help="Max episodes per batch")
    parser.add_argument("--skip", type=int, default=0, help="Skip first N episodes")
    parser.add_argument("--dry-run", action="store_true", help="Don't actually send")
    args = parser.parse_args()

    print(f"Effect v4 KG Ingestion")
    print(f"MCP: {MCP_URL}")
    print(f"Group: {GROUP_ID}")
    print(f"Delay: {args.delay}s")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'LIVE'}")

    # Initialize MCP client
    client = MCPClient(MCP_URL)
    if not args.dry_run:
        print(f"\nInitializing MCP session...")
        client.initialize()

    all_logs = []

    if args.batch == "all-docs":
        order = ALL_DOCS_ORDER
    elif args.batch == "all":
        order = ALL_ORDER
    elif args.batch in BATCHES:
        order = [args.batch]
    else:
        print(f"Unknown batch: {args.batch}")
        sys.exit(1)

    for name in order:
        episodes = BATCHES[name]()
        if episodes:
            log = ingest_batch(client, name, episodes, args.delay,
                             args.limit, args.skip, args.dry_run)
            all_logs.append(log)
        args.skip = 0

    # Save logs
    log_path = os.path.join(OUT_DIR, "p5-graph-pipeline", "ingestion-log.json")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    existing = []
    if os.path.exists(log_path):
        with open(log_path) as f:
            try:
                existing = json.load(f)
            except:
                existing = []
    with open(log_path, "w") as f:
        json.dump(existing + all_logs, f, indent=2)

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    total_ok = sum(l["succeeded"] for l in all_logs)
    total_fail = sum(l["failed"] for l in all_logs)
    total_s = sum(l["duration_s"] for l in all_logs)
    for log in all_logs:
        print(f"  {log['batch']}: {log['succeeded']}/{log['total']} "
              f"({log['failed']} failed) in {log['duration_s']}s")
    print(f"  TOTAL: {total_ok} OK, {total_fail} failed in {total_s:.0f}s")

    stats_path = os.path.join(OUT_DIR, "p5-graph-pipeline", "graph-stats.json")
    with open(stats_path, "w") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "total_ingested": total_ok,
            "total_failed": total_fail,
            "total_duration_s": round(total_s, 1),
            "batch_results": [{
                "batch": l["batch"],
                "ingested": l["succeeded"],
                "failed": l["failed"],
                "duration_s": l["duration_s"]
            } for l in all_logs]
        }, f, indent=2)


if __name__ == "__main__":
    main()
