import * as Duration from "effect/Duration";
import type { Span } from "../../domain/devtools";

export function getTotalSpans(span: Span): number {
  let total = 1;
  const stack = [span];
  while (stack.length > 0) {
    const node = stack.pop()!;
    const children = node.children;
    if (children.length > 0) {
      total += children.length;
      for (const child of children) {
        stack.push(child);
      }
    }
  }
  return total;
}

export function formatDuration(duration: Duration.Duration) {
  const nanos = Number(Duration.unsafeToNanos(duration));
  if (nanos < 1_000) {
    return `${nanos}ns`;
  }
  if (nanos < 1_000_000) {
    return `${(nanos / 1_000).toFixed(2)}µs`;
  }
  if (nanos < 1_000_000_000) {
    return `${(nanos / 1_000_000).toFixed(2)}ms`;
  }
  return `${(nanos / 1_000_000_000).toFixed(2)}s`;
}
