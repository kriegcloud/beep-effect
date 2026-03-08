#!/usr/bin/env node

[
  [`
   SL_all:
   SL_1: -SL_5
   SL_2: SL_4, SL_5
   SL_3: -SL_all, SL_2
   SL_4: SL_3
   SL_5: SL_all`,
   { SL_all: 0, SL_1: 1, SL_2: 1, SL_3: 1, SL_4: 1, SL_5: 0 } ],
  [`
   SL_5: SL_all
   SL_4: SL_3
   SL_3: -SL_all, SL_2
   SL_2: SL_4, SL_5
   SL_1: -SL_5
   SL_all:`,
   { SL_all: 0, SL_1: 1, SL_2: 1, SL_3: 1, SL_4: 1, SL_5: 0 } ],
  [` a: a`, {a:0} ],
  [` a: -a`, null ],
  [` a: b, -b \n b:`, { a: 1, b: 0 } ],
  [` a: b, -b \n b: a`, null ],
  [` a: `, {a:0} ],
  [` a: -b \n b: -a`, null ],
  [` a: b \n b: c \n c: -a`, null ],
  [` a: -b \n b: c \n c: -a, d \n d: -e \n e: -f \n f:`,
   null ],
  [` a: b \n b: c \n c: a, d \n d: -e \n e: -f \n f:`,
   {a: 2, b: 2, c: 2, d: 2, e: 1, f: 0} ],
  [` f: \n e: -f \n d: -e \n c: a, d \n b: c \n a: b`,
   {a: 2, b: 2, c: 2, d: 2, e: 1, f: 0} ]
].forEach((pair, idx) => {
  const ret = stratify(parse(pair[0]));
  console.log("running test " + idx)
  if (!areEqualShallow(ret, pair[1]))
    console.log(idx, ret);
});
console.log("done")

const testDep = {
  "SL_all": [],
  "SL_1"  : [{label: "SL_5"  , negative:true}],

  "SL_2"  : [{label: "SL_4"  },
             {label: "SL_5"  }],

  "SL_3"  : [{label: "SL_all", negative:true},
             {label: "SL_2"  }],

  "SL_4"  : [{label: "SL_3"  }],

  "SL_5"  : [{label: "SL_all"}]
};

function parse (str) {
  return str.split("\n").filter(s => {
    return !s.match(/^\s*$/);
  }).reduce((ret, s) => {
    const lr = s.split(":");
    const rz = lr[1].split(",").reduce((ret, s) => {
      s = s.replace(/\s/g, "");
      if (s === "")
	return ret;
      const negative = s[0] === "-";
      const add = {
	label: negative ? s.substr(1) : s
      };
      if (negative)
	add.negative = true;
      return ret.concat(add);
    }, []);
    ret[lr[0].replace(/\s/g, "")] = rz;
    return ret;
  }, {});
}

function stratify (dep) {
  function strat1 (key, neg, seen) {
    seen = seen || [];
    if (seen.indexOf(key) !== -1) {
      if (neg)
	throw false;
      else
	return 0;
    }
    return dep[key].reduce((ret, rule) => {
      const add = rule.negative ? 1 : 0;
      return Math.max(ret, strat1(rule.label, neg || rule.negative, seen.concat(key))+add);
    }, 0);
  }

  try {
    return Object.keys(dep).reduce((ret, key) => {
      ret[key] = strat1(key, false);
      return ret;
    }, {});
  } catch (e) {
    return null;
  }
}

function areEqualShallow (a, b) {
  if (a === null || b === null)
    return a === b;
  for(const key in a) {
    if(!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  for(const key in b) {
    if(!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
