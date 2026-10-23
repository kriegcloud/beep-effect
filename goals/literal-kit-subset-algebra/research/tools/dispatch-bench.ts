// Dispatch micro-benchmark for LiteralKit.match (evidence for the 2026-10-22 lane).
// Compares the kit's own-property dispatch against a direct record index and a
// hand-written switch over the same six literals. Run from the repo root:
//   bun goals/literal-kit-subset-algebra/research/tools/dispatch-bench.ts
import { LiteralKit } from "@beep/schema/LiteralKit";

const Status = LiteralKit(["draft", "review", "approved", "published", "archived", "rejected"]);
const values = Status.literals;
const cases = {
  draft: () => 0,
  review: () => 1,
  approved: () => 2,
  published: () => 3,
  archived: () => 4,
  rejected: () => 5,
};
const curried = Status.match(cases);
const partial = Status.matchOrElse({ draft: () => 0, review: () => 1 }, () => -1);

const viaSwitch = (value: (typeof values)[number]): number => {
  switch (value) {
    case "draft":
      return 0;
    case "review":
      return 1;
    case "approved":
      return 2;
    case "published":
      return 3;
    case "archived":
      return 4;
    case "rejected":
      return 5;
  }
};

const N = 5_000_000;
const run = (label: string, f: (value: (typeof values)[number]) => number) => {
  let sink = 0;
  for (let i = 0; i < 200_000; i++) sink += f(values[i % values.length]!);
  const start = Bun.nanoseconds();
  for (let i = 0; i < N; i++) sink += f(values[i % values.length]!);
  const ns = (Bun.nanoseconds() - start) / N;
  console.log(`${label.padEnd(28)} ${ns.toFixed(2)} ns/op (sink ${sink})`);
};

run("switch", viaSwitch);
run("direct index", (value) => cases[value]());
run("kit.match (data-first)", (value) => Status.match(value, cases));
run("kit.match (curried)", curried);
run("kit.matchOrElse (curried)", partial);
