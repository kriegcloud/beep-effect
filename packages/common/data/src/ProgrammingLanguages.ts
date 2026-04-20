/**
 * A curated collection of popular programming languages with detailed metadata about their origins, paradigms, and type systems.
 *
 * @see {@link https://jsonlint.com/datasets/programming-languages | Programming Languages JSON Dataset}
 *
 * @category constants
 * @module \@beep/data/ProgrammingLanguages
 * @since 0.0.0
 */
/**
 * Array of popular programming languages with origin and type system metadata.
 *
 * Each entry contains the language name, release year, creator, paradigms, and
 * typing discipline.
 *
 * @example
 * ```typescript
 * import { ProgrammingLanguages } from "@beep/data"
 *
 * const ts = ProgrammingLanguages.find(l => l.name === "TypeScript")
 * console.log(ts?.year) // 2012
 * console.log(ts?.typing) // "static"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ProgrammingLanguages = [
  {
    name: "JavaScript",
    year: 1995,
    creator: "Brendan Eich",
    paradigm: ["event-driven", "functional", "imperative", "object-oriented"],
    typing: "dynamic",
  },
  {
    name: "Python",
    year: 1991,
    creator: "Guido van Rossum",
    paradigm: ["functional", "imperative", "object-oriented", "structured"],
    typing: "dynamic",
  },
  {
    name: "Java",
    year: 1995,
    creator: "James Gosling",
    paradigm: ["class-based", "object-oriented", "generic"],
    typing: "static",
  },
  {
    name: "C++",
    year: 1985,
    creator: "Bjarne Stroustrup",
    paradigm: ["procedural", "functional", "object-oriented", "generic"],
    typing: "static",
  },
  {
    name: "C#",
    year: 2000,
    creator: "Microsoft",
    paradigm: ["structured", "imperative", "object-oriented", "event-driven", "functional", "generic"],
    typing: "static",
  },
  {
    name: "Ruby",
    year: 1995,
    creator: "Yukihiro Matsumoto",
    paradigm: ["multi-paradigm", "object-oriented", "imperative", "functional"],
    typing: "dynamic",
  },
  {
    name: "Go",
    year: 2009,
    creator: "Robert Griesemer, Rob Pike, Ken Thompson",
    paradigm: ["concurrent", "functional", "imperative", "object-oriented"],
    typing: "static",
  },
  {
    name: "Rust",
    year: 2010,
    creator: "Graydon Hoare",
    paradigm: ["concurrent", "functional", "generic", "imperative", "structured"],
    typing: "static",
  },
  {
    name: "Swift",
    year: 2014,
    creator: "Apple Inc.",
    paradigm: ["multi-paradigm", "protocol-oriented", "object-oriented", "functional", "imperative"],
    typing: "static",
  },
  {
    name: "Kotlin",
    year: 2011,
    creator: "JetBrains",
    paradigm: ["multi-paradigm", "object-oriented", "functional", "imperative"],
    typing: "static",
  },
  {
    name: "TypeScript",
    year: 2012,
    creator: "Microsoft",
    paradigm: ["multi-paradigm", "object-oriented", "imperative", "functional"],
    typing: "static",
  },
  {
    name: "PHP",
    year: 1995,
    creator: "Rasmus Lerdorf",
    paradigm: ["imperative", "functional", "object-oriented", "procedural"],
    typing: "dynamic",
  },
  {
    name: "Scala",
    year: 2004,
    creator: "Martin Odersky",
    paradigm: ["multi-paradigm", "concurrent", "functional", "object-oriented"],
    typing: "static",
  },
  {
    name: "R",
    year: 1993,
    creator: "Ross Ihaka, Robert Gentleman",
    paradigm: ["multi-paradigm", "array", "object-oriented", "imperative", "functional"],
    typing: "dynamic",
  },
  {
    name: "Perl",
    year: 1987,
    creator: "Larry Wall",
    paradigm: ["multi-paradigm", "functional", "imperative", "object-oriented"],
    typing: "dynamic",
  },
] as const;
