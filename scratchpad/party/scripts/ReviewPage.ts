/**
 * Self-contained local review page for collision cases.
 *
 * No network requests: the cases are embedded as JSON, decisions persist in
 * the browser's localStorage keyed by basis digest, and "Export decisions"
 * downloads `review-decisions.jsonl` in the `CollisionDecision` encoded shape.
 * Drop that file into the run's output directory and re-run
 * `identity-evidence.ts` to apply it.
 *
 * The page carries client correspondents' names and addresses: open it from
 * a private directory only, never publish it.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Str from "effect/String";

/**
 * Render the page. `casesJson` is the schema-encoded `CollisionCase` array.
 *
 * @category review-page
 * @since 0.0.0
 */
export const renderReviewPage = (casesJson: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Collision Review</title>
<style>
  :root { --bg:#f7f5ef; --fg:#1c1f1a; --muted:#5d6358; --card:#fffdf7; --line:#d9d4c5; --accent:#2f6b4f; --warn:#8a5a14; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0f1512; --fg:#e7ece6; --muted:#9aa59b; --card:#151d18; --line:#2a3530; --accent:#5fbf8a; --warn:#d9a441; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.45 system-ui, sans-serif; }
  header { position:sticky; top:0; background:var(--bg); border-bottom:1px solid var(--line); padding:12px 16px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; z-index:1; }
  header h1 { font-size:17px; margin:0 12px 0 0; }
  input, select, button { font:inherit; color:inherit; }
  input, select { background:var(--card); border:1px solid var(--line); border-radius:6px; padding:5px 8px; }
  button { background:var(--card); border:1px solid var(--line); border-radius:6px; padding:5px 10px; cursor:pointer; }
  button.on { background:var(--accent); border-color:var(--accent); color:var(--bg); }
  button:disabled { opacity:.45; cursor:not-allowed; }
  main { max-width:980px; margin:0 auto; padding:16px; }
  .case { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:14px 16px; margin:0 0 14px; }
  .case h2 { font-size:16px; margin:0 0 4px; }
  .meta { color:var(--muted); font-size:13px; margin-bottom:10px; }
  .lead { color:var(--warn); font-weight:600; }
  table { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:10px; }
  th, td { text-align:left; padding:5px 6px; border-top:1px solid var(--line); vertical-align:top; overflow-wrap:anywhere; }
  .row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .row input { flex:1 1 220px; }
  .muted { color:var(--muted); }
</style>
</head>
<body>
<header>
  <h1>Collision review</h1>
  <label>Reviewer <input id="reviewer" placeholder="your id" size="12"></label>
  <label>Show <select id="filter">
    <option value="open">Undecided</option>
    <option value="all">All</option>
  </select></label>
  <span id="progress" class="muted"></span>
  <button id="export">Export decisions</button>
</header>
<main id="cases"></main>
<script type="application/json" id="data">${Str.replace(/</g, "\\u003c")(casesJson)}</script>
<script>
(() => {
  const cases = JSON.parse(document.getElementById("data").textContent);
  const leadOrder = ["different-orgs-concurrent", "same-org-alias", "different-orgs-sequential", "different-orgs-undated", "no-org-evidence"];
  const leadText = {
    "different-orgs-concurrent": "different organizations at the same time: probably different people",
    "same-org-alias": "shared organization domain: probably one person",
    "different-orgs-sequential": "different organizations at different times: possible career move",
    "different-orgs-undated": "different organizations, undated",
    "no-org-evidence": "no organization evidence",
  };
  cases.sort((a, b) => leadOrder.indexOf(a.orgLead) - leadOrder.indexOf(b.orgLead) || a.name.localeCompare(b.name));
  const store = (() => { try { return window.localStorage; } catch { return null; } })();
  const load = (k, d) => { try { const v = store && store.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const save = (k, v) => { try { store && store.setItem(k, JSON.stringify(v)); } catch {} };
  const decisions = load("collision-decisions", {});
  const reviewer = document.getElementById("reviewer");
  reviewer.value = load("collision-reviewer", "");
  reviewer.addEventListener("change", () => save("collision-reviewer", reviewer.value.trim()));
  const filter = document.getElementById("filter");
  const now = () => new Date().toISOString().replace(/\\.\\d+Z$/, "Z");
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => (k === "class" ? (n.className = v) : n.setAttribute(k, v)));
    kids.forEach((k) => n.append(k));
    return n;
  };
  const day = (t) => (t ? t.slice(0, 10) : "?");
  function render() {
    const root = document.getElementById("cases");
    root.replaceChildren();
    const shown = cases.filter((c) => filter.value === "all" || !decisions[c.basis]);
    document.getElementById("progress").textContent =
      Object.keys(decisions).length + " decided of " + cases.length + " (" + shown.length + " shown)";
    shown.slice(0, 200).forEach((c) => {
      const d = decisions[c.basis];
      const letters = c.mailboxes.map((_, i) => String.fromCharCode(65 + i));
      const assigned = c.mailboxes.map((m) => {
        if (!d || d.verdict._tag !== "Grouped") return "";
        const gi = d.verdict.groups.findIndex((g) => g.includes(m.party));
        return gi < 0 ? "" : letters[gi];
      });
      const selects = c.mailboxes.map((m, i) => {
        const sel = el("select", { "aria-label": "Person for mailbox " + (i + 1) }, el("option", { value: "" }, "—"), ...letters.map((l) => el("option", { value: l }, "Person " + l)));
        sel.value = assigned[i];
        sel.addEventListener("change", sync);
        return sel;
      });
      const table = el("table", {}, el("tr", {}, el("th", {}, "Person"), el("th", {}, "Addresses"), el("th", {}, "Domains"), el("th", {}, "Seen")));
      c.mailboxes.forEach((m, i) =>
        table.append(el("tr", {},
          el("td", {}, selects[i]),
          el("td", {}, m.identifiers.map((x) => x.replace(/^ident:(email|x500):/, "")).map(decodeURIComponent).join(", ")),
          el("td", {}, m.domains.join(", ") || "—"),
          el("td", {}, day(m.firstSeen) + " → " + day(m.lastSeen)))));
      const note = el("input", { placeholder: "note (optional)" });
      note.value = d ? d.note : "";
      const status = el("span", { class: "muted" }, d ? (d.verdict._tag === "Skip" ? "skipped" : "saved: " + d.verdict.groups.length + " person(s)") : "");
      const record = (verdict) => {
        const who = reviewer.value.trim();
        if (!who) { reviewer.focus(); return; }
        decisions[c.basis] = {
          name: c.name, verdict, basis: c.basis,
          reviewer: "user:" + who.replace(/\\s+/g, "-"),
          reviewedAt: now(), note: note.value,
        };
        save("collision-decisions", decisions);
        render();
      };
      const saveBtn = el("button", {}, "Save grouping");
      function sync() { saveBtn.disabled = selects.some((s) => s.value === ""); }
      saveBtn.addEventListener("click", () => {
        const groups = [];
        letters.forEach((l) => {
          const g = c.mailboxes.filter((_, i) => selects[i].value === l).map((m) => m.party);
          if (g.length) groups.push(g);
        });
        record({ _tag: "Grouped", groups });
      });
      const quick = (label, pick) => {
        const b = el("button", {}, label);
        b.addEventListener("click", () => { selects.forEach((s, i) => (s.value = pick(i))); sync(); });
        return b;
      };
      const skipBtn = el("button", {}, "Skip");
      skipBtn.addEventListener("click", () => record({ _tag: "Skip" }));
      sync();
      root.append(el("section", { class: "case" },
        el("h2", {}, c.name),
        el("div", { class: "meta" }, el("span", { class: "lead" }, leadText[c.orgLead] || c.orgLead), " · contact evidence: " + c.outcome),
        table,
        el("div", { class: "row" }, quick("All same", () => "A"), quick("All different", (i) => letters[i]), saveBtn, skipBtn, status),
        el("div", { class: "row" }, note)));
    });
    if (shown.length > 200) root.append(el("p", { class: "muted" }, "Showing the first 200; decide some to see more."));
  }
  filter.addEventListener("change", render);
  document.getElementById("export").addEventListener("click", () => {
    const lines = Object.values(decisions).map((d) => JSON.stringify(d)).join("\\n") + "\\n";
    const a = el("a", { href: URL.createObjectURL(new Blob([lines], { type: "application/jsonl" })), download: "review-decisions.jsonl" });
    a.click();
  });
  render();
})();
</script>
</body>
</html>
`;
