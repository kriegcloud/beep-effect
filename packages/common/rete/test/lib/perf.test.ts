import { beep } from "@beep/rete";
import { afterAll, describe, expect, it } from "@effect/vitest";
import { faker } from "@faker-js/faker";
import _ from "lodash";

const median = (numbers: number[]) => {
  const sorted = Array.from(numbers).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle];
};

type PriceSchedule = "PERCENT" | "FIXED";

type CompanySchema = {
  name: string;
  basePrice: number;
  markupKind: PriceSchedule;
  markupAmount: number;
  parentCompany: string;
  overrideParent: boolean;
};

const HIGHEST_MAX_MS = 1000;
const HIGHEST_MIN_MS = 300;

describe("company price scheduling...", () => {
  const performanceMeasures: {
    name: string;
    max?: number;
    min?: number;
    med?: number;
  }[] = [];
  const NUM_COMPANIES = 1000;
  let id = 0;
  const session = beep<CompanySchema>();
  session
    .rule(
      "Child companies apply a markup to their price based on their parent companies price",
      ({ basePrice, markupKind, markupAmount }) => ({
        $parent: {
          basePrice,
        },
        $child: {
          parentCompany: { join: "$parent" },
          basePrice,
          overrideParent: { match: false },
          markupKind,
          markupAmount,
        },
      })
    )
    .enact({
      then: ({ $parent, $child }) => {
        session.insert({
          [$child.id]: {
            basePrice:
              $child.markupKind === "FIXED"
                ? $parent.basePrice + $child.markupAmount
                : $parent.basePrice * $child.markupAmount,
          },
        });
      },
    });

  session
    .rule("companies", ({ parentCompany, markupKind, markupAmount, basePrice, overrideParent }) => ({
      $company: {
        parentCompany,
        markupKind: markupKind,
        markupAmount: markupAmount,
        basePrice,
        overrideParent,
      },
    }))
    .enact();

  const companyFac = (): [number, CompanySchema] => [
    id++,
    {
      name: faker.person.fullName(),
      markupKind: "FIXED",
      markupAmount: 10,
      overrideParent: false,
      basePrice: 10,
      parentCompany: "parent",
    },
  ];

  it("inserts quickly despite their being a lot of rules", () => {
    const perf = [];
    const companies: [number, CompanySchema][] = [];
    for (let i = 0; i < NUM_COMPANIES; i++) {
      const [id, data] = companyFac();
      if (i % NUM_COMPANIES === 0) {
        session
          .rule(`match for company ${data.name} with id ${id}`, ({ name }) => ({
            $company: {
              name: { match: data.name },
            },
          }))
          .enact();
      }
      companies.push([id, data]);
    }
    for (let i = 0; i < companies.length; i++) {
      const [id, data] = companies[i]!;
      const b = performance.now();
      session.insert({
        [id]: data,
      });
      const a = performance.now();
      perf.push(a - b);
    }
    const max = _.max(perf);
    const min = _.min(perf);
    const med = median(perf);
    performanceMeasures.push({ name: "simple inserts", max, min, med });
    expect(1).toBe(1);

    const randomPerfs: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const id = Math.floor(Math.random() * NUM_COMPANIES);
      const b = performance.now();
      session.insert({
        [id]: {
          basePrice: 1234,
        },
      });
      const a = performance.now();
      randomPerfs.push(a - b);
    }
    const rMax = _.max(randomPerfs);
    const rMin = _.min(randomPerfs);
    const rMed = median(randomPerfs);
    performanceMeasures.push({
      name: "random basePrice updates",
      max: rMax,
      min: rMin,
      med: rMed,
    });
    for (const measure of performanceMeasures) {
      expect(measure.max).toBeLessThan(HIGHEST_MAX_MS);
      expect(measure.min).toBeLessThan(HIGHEST_MIN_MS);
      expect(measure.med).toBeLessThan(HIGHEST_MAX_MS);
    }
  });

  it("let's add a few complex companies", () => {
    const perf: number[] = [];
    const insert = (obj: any) => {
      const b = performance.now();
      session.insert(obj);
      const a = performance.now();
      perf.push(a - b);
    };
    const COMPLEXITY = 3;
    const parentIds = [];
    const overrideIds = [];
    const lineages = [];
    const allCompanies = [];
    for (let i = 0; i < COMPLEXITY; i++) {
      const [id, parent] = companyFac();
      parentIds.push(id);
      allCompanies.push({ [id]: parent });
      for (let j = 0; j < COMPLEXITY; j++) {
        const [cId, child] = companyFac();
        allCompanies.push({
          [cId]: {
            ...child,
            parentCompany: `${id}`,
            markupKind: "PERCENT",
            markupAmount: Math.random() + 0.5,
          },
        });
        for (let k = 0; k < COMPLEXITY; k++) {
          const [ccId, grandChild] = companyFac();
          allCompanies.push({
            [ccId]: {
              ...grandChild,
              parentCompany: `${cId}`,
            },
          });
          for (let l = 0; l < COMPLEXITY; l++) {
            const [cccId, greatGrandChild] = companyFac();
            allCompanies.push({
              [cccId]: {
                ...greatGrandChild,
                parentCompany: `${ccId}`,
                overrideParent: Math.random() >= 0.5,
                basePrice: 23,
              },
            });
            overrideIds.push(cccId);
            for (let m = 0; m < COMPLEXITY; m++) {
              const [ccccId, greatGreatGrandChild] = companyFac();
              allCompanies.push({
                [ccccId]: {
                  ...greatGreatGrandChild,
                  parentCompany: `${cccId}`,
                  markupKind: "PERCENT",
                  markupAmount: Math.random() + 0.5,
                },
              });
              for (let n = 0; n < COMPLEXITY; n++) {
                const [cccccId, greatGreatGreatGrandChild] = companyFac();
                allCompanies.push({
                  [cccccId]: {
                    ...greatGreatGreatGrandChild,
                    parentCompany: `${ccccId}`,
                  },
                });
                lineages.push([id, cId, ccId, cccId, ccccId, cccccId]);
              }
            }
          }
        }
      }

      // Totally disorder the companies so that we insert them all out of order (but when we execute the maths,
      // the prices should still be correct!)
      for (const comp of _.shuffle(allCompanies)) {
        insert(comp);
      }

      const max = _.max(perf);
      const min = _.min(perf);
      const med = median(perf);
      performanceMeasures.push({
        name: "complex companies inserted",
        max,
        min,
        med,
      });

      const cPerfs = [];
      for (let i = 0; i < 100; i++) {
        const b = performance.now();
        session.insert({
          [parentIds[0]!]: {
            markupAmount: i * 20,
          },
          [parentIds[1]!]: {
            markupKind: i % 2 === 0 ? "FIXED" : "PERCENT",
          },
          [parentIds[2]!]: {
            markupAmount: i + 10,
          },
        });
        const a = performance.now();
        cPerfs.push(a - b);
      }
      const cMax = _.max(cPerfs);
      const cMin = _.min(cPerfs);
      const cMed = median(cPerfs);
      performanceMeasures.push({
        name: "parent companies updated",
        max: cMax,
        min: cMin,
        med: cMed,
      });

      const oPerf = [];
      for (let i = 0; i < overrideIds.length; i++) {
        const b = performance.now();
        session.insert({
          [overrideIds[i]!]: {
            basePrice: 10,
          },
        });
        const a = performance.now();
        oPerf.push(a - b);
      }
      const oMax = _.max(oPerf);
      const oMin = _.min(oPerf);
      const oMed = median(oPerf);
      performanceMeasures.push({
        name: "override parent pricing",
        max: oMax,
        min: oMin,
        med: oMed,
      });
    }

    // Prove the math works, and that even though we have crazy insert orders we still properly calculate the
    // price propagation.

    // For Debugging Purposes
    const companies = [];
    for (const lineage of lineages) {
      const l = [];
      for (const id of lineage) {
        const curPrice = session.get(id.toString(), "basePrice")!;
        const priceSchedule = session.get(id.toString()!, "markupKind")!;
        const priceScheduleAmount = session.get(id.toString()!, "markupAmount")!;
        l.push({ id, curPrice, priceSchedule, priceScheduleAmount });
      }
      companies.push(l);
    }

    for (const lineage of lineages) {
      const [root, ...rest] = lineage;
      let curPrice = session.get(root!.toString(), "basePrice")!;
      let pId = root!;
      for (const id of rest) {
        const priceSchedule = session.get(id.toString()!, "markupKind")!;
        const priceScheduleAmount = session.get(id.toString()!, "markupAmount")!;
        const overrideParent = session.get(id.toString(), "overrideParent")!;
        const childPrice = session.get(id.toString(), "basePrice");
        // if (priceSchedule !== "FIXED") {
        //   console.log("Not fixed");
        // }
        const expectedPrice = overrideParent
          ? childPrice
          : priceSchedule === "FIXED"
            ? curPrice + priceScheduleAmount
            : curPrice * priceScheduleAmount;
        // if (childPrice !== expectedPrice) {
        //   console.log("oh dear.");
        // }
        // expect(childPrice).toBe(expectedPrice)
        const parentId = session.get(id.toString(), "parentCompany");
        expect(parentId).toBe(pId.toString());
        curPrice = expectedPrice!;
        pId = id;
      }
    }

    for (const measure of performanceMeasures) {
      expect(measure.max).toBeLessThan(HIGHEST_MAX_MS);
      expect(measure.min).toBeLessThan(HIGHEST_MIN_MS);
      expect(measure.med).toBeLessThan(HIGHEST_MAX_MS);
    }
  });
  afterAll(() => {
    console.table(performanceMeasures);
  });
});
