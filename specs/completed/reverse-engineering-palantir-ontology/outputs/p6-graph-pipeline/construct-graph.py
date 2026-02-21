#!/usr/bin/env python3
"""
Phase 6: Knowledge Graph Construction
Ingests all extracted Palantir Ontology data into Graphiti via MCP.
"""

import json
import time
import sys
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

# --- Config ---
MCP_URL = "http://localhost:8000/mcp"
GROUP_ID = "palantir-ontology"
DELAY_SECONDS = 2  # seconds between episodes (Graphiti queues internally)
BASE_DIR = Path(__file__).parent.parent  # outputs/
LOG_PATH = Path(__file__).parent / "ingestion-log.json"
STATS_PATH = Path(__file__).parent / "graph-stats.json"

# --- MCP Client ---
class McpClient:
    def __init__(self, url):
        self.url = url
        self.session_id = None
        self.req_id = 0
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        }

    def _next_id(self):
        self.req_id += 1
        return self.req_id

    def _parse_sse(self, text):
        """Parse SSE response, return first data payload."""
        for line in text.split("\n"):
            if line.startswith("data:"):
                return json.loads(line[5:].strip())
        return None

    def initialize(self):
        resp = requests.post(self.url, json={
            "jsonrpc": "2.0", "method": "initialize", "id": self._next_id(),
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "p6-graph-builder", "version": "1.0"},
            }
        }, headers=self.headers, timeout=30)
        self.session_id = resp.headers.get("mcp-session-id")
        self.headers["Mcp-Session-Id"] = self.session_id

        # Send initialized notification
        requests.post(self.url, json={
            "jsonrpc": "2.0", "method": "notifications/initialized"
        }, headers=self.headers, timeout=10)

        print(f"[MCP] Session initialized: {self.session_id}")

    def call_tool(self, tool_name, arguments, timeout=120, retries=2):
        for attempt in range(retries + 1):
            try:
                resp = requests.post(self.url, json={
                    "jsonrpc": "2.0", "method": "tools/call", "id": self._next_id(),
                    "params": {"name": tool_name, "arguments": arguments}
                }, headers=self.headers, timeout=timeout)

                data = self._parse_sse(resp.text)
                if data and "result" in data:
                    result = data["result"]
                    if result.get("isError"):
                        err_text = result.get("content", [{}])[0].get("text", "unknown error")
                        raise RuntimeError(f"MCP tool error: {err_text}")
                    # Return structured content if available, else text content
                    if "structuredContent" in result:
                        return result["structuredContent"].get("result", result["structuredContent"])
                    elif "content" in result:
                        text = result["content"][0].get("text", "{}")
                        try:
                            return json.loads(text)
                        except json.JSONDecodeError:
                            return {"raw": text}
                elif data and "error" in data:
                    raise RuntimeError(f"MCP error: {data['error']}")
                return data
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                if attempt < retries:
                    print(f"  [RETRY] Connection issue ({e}), reinitializing session...")
                    time.sleep(5)
                    self.initialize()
                else:
                    raise


# --- Episode Formatters ---

def format_web_episode(entry):
    """Format an enriched web entry as structured narrative text."""
    parts = []
    parts.append(f"Title: {entry.get('title', 'Untitled')}")
    parts.append(f"Source: {entry.get('url', 'unknown')}")
    parts.append(f"Category: {entry.get('category', 'general')}")
    parts.append(f"Content Type: {entry.get('contentType', 'unknown')}")
    parts.append("")

    if entry.get("summary"):
        parts.append(f"Summary: {entry['summary']}")
        parts.append("")

    # Include extracted entities as narrative
    entities = entry.get("extractedEntities", [])
    if entities:
        parts.append("Key Concepts:")
        for ent in entities[:20]:  # Cap at 20 to avoid massive episodes
            desc = ent.get("description", "")
            parts.append(f"- {ent['name']} ({ent['type']}): {desc}")
        parts.append("")

    # Include extracted relationships as narrative
    rels = entry.get("extractedRelationships", [])
    if rels:
        parts.append("Relationships:")
        for rel in rels[:20]:  # Cap at 20
            parts.append(f"- {rel['source']} {rel['relationship']} {rel['target']}")
        parts.append("")

    # Include extracted insights
    insights = entry.get("extractedInsights", [])
    if insights:
        parts.append("Key Insights:")
        for ins in insights[:10]:
            parts.append(f"- {ins}")
        parts.append("")

    # Include relevant parts as additional context
    relevant = entry.get("relevantParts", [])
    if relevant:
        parts.append("Additional Details:")
        for rp in relevant[:8]:
            parts.append(f"- {rp}")
        parts.append("")

    return "\n".join(parts)


def format_repo_episode(repo_data):
    """Format a repo analysis JSON as structured narrative text."""
    parts = []
    repo = repo_data.get("repo", "unknown")
    parts.append(f"Repository: {repo}")
    parts.append(f"URL: {repo_data.get('repoUrl', 'unknown')}")
    parts.append("")

    if repo_data.get("summary"):
        parts.append(f"Summary: {repo_data['summary']}")
        parts.append("")

    # Ontology concepts with evidence
    concepts = repo_data.get("ontologyConcepts", [])
    if concepts:
        parts.append("Ontology Concept Evidence:")
        for c in concepts:
            concept_name = c.get("concept", "Unknown")
            evidence = c.get("evidence", "")
            # Truncate very long evidence
            if len(evidence) > 500:
                evidence = evidence[:500] + "..."
            parts.append(f"- {concept_name}: {evidence}")
        parts.append("")

    # API surface (may be list or dict)
    api_surface = repo_data.get("apiSurface", [])
    if api_surface:
        parts.append("API Surface:")
        if isinstance(api_surface, dict):
            for key, val in list(api_surface.items())[:15]:
                desc = str(val)[:200] if not isinstance(val, dict) else val.get("description", str(val))[:200]
                parts.append(f"- {key}: {desc}")
        elif isinstance(api_surface, list):
            for api in api_surface[:15]:
                if isinstance(api, dict):
                    name = api.get("name", "")
                    desc = api.get("description", "")
                    kind = api.get("kind", "")
                    parts.append(f"- {name} ({kind}): {desc[:200]}")
                else:
                    parts.append(f"- {str(api)[:200]}")
        parts.append("")

    # Architecture patterns (may be list of dicts or strings)
    patterns = repo_data.get("architecturePatterns", [])
    if patterns:
        parts.append("Architecture Patterns:")
        items = list(patterns.items())[:10] if isinstance(patterns, dict) else patterns[:10]
        for p in items:
            if isinstance(p, dict):
                name = p.get("name", "")
                desc = p.get("description", "")
                parts.append(f"- {name}: {desc[:200]}")
            elif isinstance(p, tuple):
                parts.append(f"- {p[0]}: {str(p[1])[:200]}")
            else:
                parts.append(f"- {str(p)[:200]}")
        parts.append("")

    # Key findings (may be list of strings or dicts)
    findings = repo_data.get("keyFindings", [])
    if findings:
        parts.append("Key Findings:")
        items = findings[:10] if isinstance(findings, list) else [str(findings)]
        for f in items:
            parts.append(f"- {str(f)[:300]}")
        parts.append("")

    return "\n".join(parts)


# --- Ingestion Logic ---

def ingest_episode(client, name, body, source, source_description, log_entries):
    """Ingest a single episode and log the result."""
    entry = {
        "name": name,
        "source": source,
        "source_description": source_description,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "pending",
        "body_length": len(body),
    }

    try:
        result = client.call_tool("add_memory", {
            "name": name,
            "episode_body": body,
            "group_id": GROUP_ID,
            "source": source,
            "source_description": source_description,
        }, timeout=180)  # LLM extraction can be slow
        entry["status"] = "success"
        entry["result"] = str(result)[:200] if result else "ok"
    except Exception as e:
        entry["status"] = "error"
        entry["error"] = str(e)[:500]
        print(f"  [ERROR] {str(e)[:100]}")

    log_entries.append(entry)
    return entry["status"] == "success"


def spot_check(client, label):
    """Run spot-check queries after a batch."""
    print(f"\n--- Spot Check: {label} ---")
    try:
        nodes = client.call_tool("search_nodes", {
            "query": "Palantir Ontology core concepts Object Type Property",
            "group_ids": [GROUP_ID],
            "max_nodes": 10,
        })
        node_list = nodes.get("nodes", [])
        print(f"  Nodes found: {len(node_list)}")
        for n in node_list[:5]:
            print(f"    - {n.get('name', '?')} ({n.get('label', '?')})")

        facts = client.call_tool("search_memory_facts", {
            "query": "Object Type relationships and properties",
            "group_ids": [GROUP_ID],
            "max_facts": 10,
        })
        fact_list = facts.get("facts", [])
        print(f"  Facts found: {len(fact_list)}")
        for f in fact_list[:5]:
            print(f"    - {f.get('fact', '?')[:100]}")
    except Exception as e:
        print(f"  Spot check error: {e}")
    print("---\n")


def main():
    start_time = time.time()

    # Parse args
    skip_clear = "--no-clear" in sys.argv
    batch_filter = None
    for arg in sys.argv[1:]:
        if arg.startswith("--batch="):
            batch_filter = arg.split("=")[1]

    # Load data
    print("[LOAD] Loading enriched web data...")
    enriched_path = BASE_DIR / "p5-rag-enrichment" / "enriched-web.json"
    with open(enriched_path) as f:
        enriched_web = json.load(f)
    print(f"  Loaded {len(enriched_web)} web entries")

    print("[LOAD] Loading repo analysis data...")
    repo_dir = BASE_DIR / "p4b-repo-analysis"
    repo_files = sorted(repo_dir.glob("*.json"))
    repo_data = []
    for rp in repo_files:
        if rp.name == "summary.json":
            continue
        with open(rp) as f:
            repo_data.append(json.load(f))
    print(f"  Loaded {len(repo_data)} repo analyses")

    # Split web entries by quality
    batch1 = [e for e in enriched_web if e.get("quality", 0) >= 4]
    batch2 = [e for e in enriched_web if e.get("quality", 0) < 4]
    print(f"  Batch 1 (quality>=4): {len(batch1)}")
    print(f"  Batch 2 (quality<4):  {len(batch2)}")
    print(f"  Batch 3 (repos):      {len(repo_data)}")

    # Initialize MCP
    print("\n[MCP] Initializing...")
    client = McpClient(MCP_URL)
    client.initialize()

    # Clear existing data
    if not skip_clear:
        print("[CLEAR] Clearing existing palantir-ontology data...")
        try:
            client.call_tool("clear_graph", {"group_ids": [GROUP_ID]})
            print("  Cleared.")
            time.sleep(2)
        except Exception as e:
            print(f"  Clear warning: {e}")

    log_entries = []
    success_count = 0
    error_count = 0

    def process_episode(name, body, source, source_desc):
        nonlocal success_count, error_count
        ok = ingest_episode(client, name, body, source, source_desc, log_entries)
        if ok:
            success_count += 1
        else:
            error_count += 1
        return ok

    # --- Batch 0: Seed Episode ---
    if batch_filter is None or batch_filter == "seed":
        print("\n=== BATCH 0: Seed Episode ===")
        seed_body = """The Palantir Ontology is a comprehensive data modeling system that forms the foundation of the Foundry platform. It consists of 9 core concepts:

1. Object Type: The primary schema definition of a real-world entity or event, analogous to a database table. Object Types have Properties, participate in Link Types, and implement Interfaces. They are the fundamental building block of the Ontology.

2. Property: A typed attribute on an Object Type, analogous to a column. Properties have data types (string, integer, double, boolean, datetime, timestamp, etc.), nullability, and presentation metadata. Properties can be marked as primary keys or title properties.

3. Shared Property Type: A reusable property definition that can be implemented across multiple Object Types and referenced by Interfaces. Shared Properties enable cross-domain consistency in data modeling.

4. Link Type: The schema definition of a typed, directed relationship between two Object Types. Link Types have cardinality of ONE or MANY on each side, are bidirectional with display names per side, and support three storage mechanisms (foreign keys for 1:1/1:N, join tables for N:N).

5. Action Type: The schema definition of a set of atomic mutations to objects, property values, and links, with validation, authorization, and side effects. Actions support submission criteria, logic rules, and generate Action Logs for audit trails.

6. Roles: The permissioning mechanism granting access to ontological resources at both the ontology level and individual resource level. Roles control what users can do with Object Types, Action Types, and Functions.

7. Functions (also called Queries): The computation layer over the Ontology, accepting typed parameters and returning typed outputs. Functions are implemented in TypeScript or Python, run as Compute Modules, and can operate on ObjectSets.

8. Interfaces: Abstract Ontology types that describe the shape and capabilities of Object Types, enabling polymorphism and type-safe querying. Interfaces can extend other Interfaces and define Shared Properties.

9. Object Views: Presentation-layer and security-scoped projections of Objects, defining how object data is displayed to users in different contexts.

The Ontology also includes supporting concepts:
- ObjectSet: A query mechanism for filtering, sorting, and aggregating collections of objects
- Value Types: Semantic type wrappers providing meaning to primitive types
- Structs: Composite types for complex property values
- Derived Properties: Computed fields calculated at runtime from other properties or links
- Branching: Git-like version control for parallel Ontology development
- Compute Modules: Containerized workloads (Docker) bridging any language to Foundry
- AIP Agents: AI agents that interact with the Ontology via natural language

Key products in the Palantir ecosystem:
- Foundry: The core data platform where Ontology is built and managed
- OSDK (Ontology SDK): TypeScript/Python client libraries for Ontology interaction
- AIP (Artificial Intelligence Platform): AI platform built on the Ontology
- Workshop: No-code/low-code application builder powered by the Ontology
- Apollo: Continuous delivery and deployment platform
- Gotham: Intelligence and defense-focused platform
- Conjure: API definition toolchain (IDL) underlying all Palantir APIs

Security mechanisms:
- PBAC (Purpose-Based Access Control): Requires stated purpose for data access
- Markings: Mandatory controls (conjunctive AND logic) for data sensitivity
- Organizations: Mandatory controls (disjunctive OR logic) for data isolation
- Classifications: Hierarchical sensitivity levels
- Roles: Discretionary controls for resource-level permissions
- Spaces: Containers mapping 1:1 with Ontologies, restricted by organizations
- Cipher: Application-layer encryption with separate key and permission management
- Checkpoints: Governance mechanism requiring justification for sensitive actions"""

        ok = process_episode(
            "Palantir Ontology Core Concepts and Ecosystem",
            seed_body, "text", "seed-episode"
        )
        print(f"  Seed: {'OK' if ok else 'FAILED'}")
        time.sleep(DELAY_SECONDS)

        spot_check(client, "After Seed")

    # --- Batch 1: High-quality web entries (quality >= 4) ---
    if batch_filter is None or batch_filter == "1":
        print(f"\n=== BATCH 1: High-Quality Web Entries ({len(batch1)} entries) ===")
        for i, entry in enumerate(batch1):
            title = entry.get("title", "Untitled")
            body = format_web_episode(entry)
            category = entry.get("category", "general")
            url = entry.get("url", "")
            source_desc = f"{category} | {entry.get('contentType', 'web')} | {url}"

            ep_name = f"Palantir: {title}"[:100]
            ok = process_episode(ep_name, body, "text", source_desc)

            status = "OK" if ok else "FAIL"
            print(f"  [{i+1}/{len(batch1)}] {status} - {title[:60]}")

            if (i + 1) % 50 == 0:
                spot_check(client, f"Batch 1 checkpoint ({i+1}/{len(batch1)})")

            time.sleep(DELAY_SECONDS)

        spot_check(client, "After Batch 1")

    # --- Batch 2: Medium-quality web entries (quality < 4) ---
    if batch_filter is None or batch_filter == "2":
        print(f"\n=== BATCH 2: Medium-Quality Web Entries ({len(batch2)} entries) ===")
        for i, entry in enumerate(batch2):
            title = entry.get("title", "Untitled")
            body = format_web_episode(entry)
            category = entry.get("category", "general")
            url = entry.get("url", "")
            source_desc = f"{category} | {entry.get('contentType', 'web')} | {url}"

            ep_name = f"Palantir: {title}"[:100]
            ok = process_episode(ep_name, body, "text", source_desc)

            status = "OK" if ok else "FAIL"
            print(f"  [{i+1}/{len(batch2)}] {status} - {title[:60]}")

            if (i + 1) % 50 == 0:
                spot_check(client, f"Batch 2 checkpoint ({i+1}/{len(batch2)})")

            time.sleep(DELAY_SECONDS)

        spot_check(client, "After Batch 2")

    # --- Batch 3: Repo analysis ---
    if batch_filter is None or batch_filter == "3":
        print(f"\n=== BATCH 3: Repository Analysis ({len(repo_data)} repos) ===")
        for i, repo in enumerate(repo_data):
            repo_name = repo.get("repo", "unknown")
            body = format_repo_episode(repo)
            url = repo.get("repoUrl", "")

            ep_name = f"Repository Analysis: {repo_name}"
            ok = process_episode(ep_name, body, "text", f"repo-analysis | {url}")

            status = "OK" if ok else "FAIL"
            print(f"  [{i+1}/{len(repo_data)}] {status} - {repo_name}")

            time.sleep(DELAY_SECONDS)

        spot_check(client, "After Batch 3")

    # --- Save logs ---
    elapsed = time.time() - start_time
    log_summary = {
        "run_timestamp": datetime.now(timezone.utc).isoformat(),
        "elapsed_seconds": round(elapsed, 1),
        "group_id": GROUP_ID,
        "total_episodes": len(log_entries),
        "successes": success_count,
        "errors": error_count,
        "batches": {
            "seed": 1,
            "batch1_high_quality": len(batch1) if (batch_filter is None or batch_filter == "1") else 0,
            "batch2_medium_quality": len(batch2) if (batch_filter is None or batch_filter == "2") else 0,
            "batch3_repos": len(repo_data) if (batch_filter is None or batch_filter == "3") else 0,
        },
        "entries": log_entries,
    }

    with open(LOG_PATH, "w") as f:
        json.dump(log_summary, f, indent=2)
    print(f"\n[LOG] Saved ingestion log to {LOG_PATH}")

    # --- Final stats ---
    print(f"\n=== INGESTION COMPLETE ===")
    print(f"  Total episodes: {len(log_entries)}")
    print(f"  Successes: {success_count}")
    print(f"  Errors: {error_count}")
    print(f"  Elapsed: {elapsed:.0f}s ({elapsed/60:.1f}m)")

    # Query final graph stats
    print("\n[STATS] Querying final graph stats...")
    try:
        episodes = client.call_tool("get_episodes", {
            "group_ids": [GROUP_ID], "max_episodes": 500
        })
        ep_list = episodes.get("episodes", [])

        nodes = client.call_tool("search_nodes", {
            "query": "Palantir Ontology concepts products patterns security",
            "group_ids": [GROUP_ID], "max_nodes": 100
        })
        node_list = nodes.get("nodes", [])

        facts = client.call_tool("search_memory_facts", {
            "query": "Ontology relationships connections",
            "group_ids": [GROUP_ID], "max_facts": 100
        })
        fact_list = facts.get("facts", [])

        stats = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "group_id": GROUP_ID,
            "episodes_count": len(ep_list),
            "nodes_found": len(node_list),
            "facts_found": len(fact_list),
            "node_names": [n.get("name", "?") for n in node_list[:50]],
        }

        with open(STATS_PATH, "w") as f:
            json.dump(stats, f, indent=2)
        print(f"  Episodes: {len(ep_list)}")
        print(f"  Nodes: {len(node_list)}")
        print(f"  Facts: {len(fact_list)}")
        print(f"  Saved stats to {STATS_PATH}")
    except Exception as e:
        print(f"  Stats error: {e}")


if __name__ == "__main__":
    main()
