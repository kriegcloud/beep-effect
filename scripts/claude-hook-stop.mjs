#!/usr/bin/env node

// Keep stop-hook behavior no-op and non-blocking. Consume stdin and exit 0.
let stdin = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  stdin += chunk;
});
process.stdin.on("end", () => {
  if (stdin.length > 0) {
    process.stdout.write("");
  }
  process.exit(0);
});

if (process.stdin.isTTY) {
  process.exit(0);
}
