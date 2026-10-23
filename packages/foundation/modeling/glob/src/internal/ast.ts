// Ported from minimatch@10.2.5 (https://github.com/isaacs/minimatch)
// Copyright: Isaac Z. Schlueter and Contributors
// License: BlueOak-1.0.0 (https://blueoakcouncil.org/license/1.0.0)
//
// Port notes, five changes from upstream:
// 1. #parseAST gains a STRUCTURAL depth backstop at MAX_NESTING_DEPTH,
//    independent of maxExtglobRecursion. Upstream increments its extDepth
//    counter only for non-coalescible nestings (depthAdd = 0 on adoption),
//    so a long @(@(@(... chain recurses unboundedly at DEFAULT options —
//    verified: real minimatch 10.2.5 dies with RangeError (stack overflow)
//    on "@(".repeat(20000) + "a" + ")".repeat(20000), which is under its own
//    64KB cap. The backstop throws GuardExceeded("NestingDepthExceeded").
//    The maxExtglobRecursion cap and its degrade-to-literal on-limit
//    behavior are otherwise kept exactly.
// 2. toRegExpSource / #partsToRegExp thread a depth counter through their
//    mutual recursion, guarded at MAX_NESTING_DEPTH (defensive: reachable
//    only if construction produced a deeper tree than the parse backstop
//    permits, i.e. programmer error, but the guard keeps it typed).
// 3. #flatten gains a tree-depth guard alongside the kept 10-pass width cap.
// 4. clone/copyIn thread a depth counter (they run during #fillNegs for `!`
//    extglobs), guarded at MAX_NESTING_DEPTH.
// 5. maxExtglobRecursion is validated by assertCap at fromGlob — a NaN or
//    non-integer cap is a wiring bug and dies as an InvalidCap defect.
// The shared option types come from the extracted types leaf (upstream let
// ast.ts and index.ts import each other circularly; noImportCycles forbids
// it here). The debug/inspect id plumbing is kept for diffability.

import { $GlobId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema/LiteralKit";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { parseClass } from "./braceExpressions.ts";
import { assertCap, GuardExceeded, MAX_EXTGLOB_RECURSION, MAX_NESTING_DEPTH } from "./limits.ts";
import { unescape as unescapePattern } from "./unescape.ts";
import type { EngineOptionsInput, MMRegExp } from "./types.ts";

const $I = $GlobId.create("internal/ast");

/**
 * An invariant violation in the internal extglob syntax tree.
 *
 * **Example** (Inspect an invariant violation)
 *
 * ```ts
 * import { ASTError } from "@beep/glob/internal/ast"
 *
 * const error = ASTError.make({ message: "Invalid extglob child" })
 * console.log(error.message) // Invalid extglob child
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ASTError extends S.TaggedError<ASTError, { readonly brand: unique symbol }>($I`ASTError`)(
  "ASTError",
  {
    message: S.String.pipe(
      $I.annoteKey("ASTError.message", { description: "The violated invariant in the extglob syntax tree." })
    ),
  },
  $I.annoteError<ASTError>("ASTError", {
    description: "An internal syntax-tree operation encountered an invalid extglob structure.",
  })
) {}

// classes [] are handled by the parseClass method
// for positive extglobs, we sub-parse the contents, and combine,
// with the appropriate regexp close.
// for negative extglobs, we sub-parse the contents, but then
// have to include the rest of the pattern, then the parent, etc.,
// as the thing that cannot be because RegExp negative lookaheads
// are different from globs.
//
// So for example:
// a@(i|w!(x|y)z|j)b => ^a(i|w((!?(x|y)zb).*)z|j)b$
//   1   2 3   4 5 6      1   2    3   46      5 6
//
// Assembling the extglob requires not just the negated patterns themselves,
// but also anything following the negative patterns up to the boundary
// of the current pattern, plus anything following in the parent pattern.
//
// So, first, we parse the string into an AST of extglobs, without turning
// anything into regexps yet.
//
// ['a', {@ [['i'], ['w', {!['x', 'y']}, 'z'], ['j']]}, 'b']
//
// Then, for all the negative extglobs, we append whatever comes after in
// each parent as their tail
//
// ['a', {@ [['i'], ['w', {!['x', 'y'], 'z', 'b'}, 'z'], ['j']]}, 'b']
//
// Lastly, we turn each of these pieces into a regexp, and join
//
//                                 v----- .* because there's more following,
//                                 v    v  otherwise, .+ because it must be
//                                 v    v  *something* there.
// ['^a', {@ ['i', 'w(?:(!?(?:x|y).*zb$).*)z', 'j' ]}, 'b$']
//   copy what follows into here--^^^^^
// ['^a', '(?:i|w(?:(?!(?:x|y).*zb$).*)z|j)', 'b$']
// ['^a(?:i|w(?:(?!(?:x|y).*zb$).*)z|j)b$']

/**
 * The five operators that introduce an extended glob expression.
 *
 * **Details**
 *
 * The operators represent negation, optional matching, one-or-more repetitions,
 * zero-or-more repetitions, and exactly one alternative, respectively.
 *
 * **Example** (Recognize an extglob operator)
 *
 * ```ts
 * import { ExtglobType } from "@beep/glob/internal/ast"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(ExtglobType)("@")) // true
 * console.log(S.is(ExtglobType)("x")) // false
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ExtglobType = LiteralKit(["!", "?", "+", "*", "@"]).pipe(
  $I.annoteSchema("ExtglobType", {
    description: "The negation, optional, one-or-more, zero-or-more and exactly-one extglob operators.",
  })
);
/**
 * An operator accepted by the extended-glob syntax tree.
 *
 * @see {@link ExtglobType} for the runtime operator schema.
 * @category type-level
 * @since 0.0.0
 */
export type ExtglobType = typeof ExtglobType.Type;
const isExtglobType = S.is(ExtglobType);
const isExtglobAST = (c: AST): c is AST & { type: ExtglobType } => isExtglobType(c.type);

// Map of which extglob types can adopt the children of a nested extglob
//
// anything but ! can adopt a matching type:
// +(a|+(b|c)|d) => +(a|b|c|d)
// *(a|*(b|c)|d) => *(a|b|c|d)
// @(a|@(b|c)|d) => @(a|b|c|d)
// ?(a|?(b|c)|d) => ?(a|b|c|d)
//
// * can adopt anything, because 0 or repetition is allowed
// + can adopt @, because 1 or repetition is allowed
// + and @ CANNOT adopt *, because 0 would be allowed
// + and @ CANNOT adopt ?, because 0 would be allowed
// ? can adopt @, because 0 or 1 is allowed
// ? and @ CANNOT adopt * or +, because >1 would be allowed
// ! CANNOT adopt ! (nothing else can either)
// ! can adopt @
// ! CANNOT adopt *, +, or ?
const adoptionMap = HashMap.fromIterable<ExtglobType, Array<ExtglobType>>([
  ["!", ["@"]],
  ["?", ["?", "@"]],
  ["@", ["@"]],
  ["*", ["*", "+", "?", "@"]],
  ["+", ["+", "@"]],
]);

// nested extglobs that can be adopted in, but with the addition of
// a blank '' element.
const adoptionWithSpaceMap = HashMap.fromIterable<ExtglobType, Array<ExtglobType>>([
  ["!", ["?"]],
  ["@", ["?"]],
  ["+", ["?", "*"]],
]);

// union of the previous two maps
const adoptionAnyMap = HashMap.fromIterable<ExtglobType, Array<ExtglobType>>([
  ["!", ["?", "@"]],
  ["?", ["?", "@"]],
  ["@", ["?", "@"]],
  ["*", ["*", "+", "?", "@"]],
  ["+", ["+", "@", "?", "*"]],
]);

// Extglobs that can take over their parent if they are the only child
// the key is parent, value maps child to resulting extglob parent type
// '@' is omitted because it's a special case. An `@` extglob with a single
// member can always be usurped by that subpattern.
const usurpMap = HashMap.fromIterable<ExtglobType, HashMap.HashMap<ExtglobType, ExtglobType>>([
  ["!", HashMap.fromIterable<ExtglobType, ExtglobType>([["!", "@"]])],
  [
    "?",
    HashMap.fromIterable<ExtglobType, ExtglobType>([
      ["*", "*"],
      ["+", "*"],
    ]),
  ],
  [
    "@",
    HashMap.fromIterable<ExtglobType, ExtglobType>([
      ["!", "!"],
      ["?", "?"],
      ["@", "@"],
      ["*", "*"],
      ["+", "+"],
    ]),
  ],
  [
    "+",
    HashMap.fromIterable<ExtglobType, ExtglobType>([
      ["?", "*"],
      ["*", "*"],
    ]),
  ],
]);

// Patterns that get prepended to bind to the start of either the
// entire string, or just a single path portion, to prevent dots
// and/or traversal patterns, when needed.
// Exts don't need the ^ or / bit, because the root binds that already.
const startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
const startNoDot = "(?!\\.)";

// characters that indicate a start of pattern needs the "no dots" bit,
// because a dot *might* be matched. ( is not in the list, because in
// the case of a child extglob, it will handle the prevention itself.
const addPatternStart = HashSet.make("[", ".");
// cases where traversal is A-OK, no dot prevention needed
const justDots = HashSet.make("..", ".");
const reSpecials = HashSet.fromIterable("().*{}+?[]^$\\!");
const regExpEscape = Str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// any single thing other than /
const qmark = "[^/]";

// * => any number of characters
const star = `${qmark}*?`;
// use + when we need to ensure that *something* matches, because the * is
// the only thing in the path portion.
const starNoEmpty = `${qmark}+?`;

const guardDepth = (depth: number): void => {
  if (depth > MAX_NESTING_DEPTH) {
    throw GuardExceeded.fromReason("NestingDepthExceeded", MAX_NESTING_DEPTH, depth);
  }
};

// Whether `c` opens an extglob at the scan position (its `(` follows).
const opensExtglob = (str: string, pos: number, opt: EngineOptionsInput, c: string): c is ExtglobType =>
  opt.noext !== true && isExtglobType(c) && str[pos] === "(";

// A non-empty object child of sequence type (null operator).
const isSequenceChild = (child?: AST | string): child is AST =>
  child !== undefined && child !== "" && P.isObjectKeyword(child) && !P.isFunction(child) && child.type === null;

// The per-call inputs every #parseAST helper shares.
interface ParseFrame {
  readonly extDepth: number;
  readonly maxDepth: number;
  readonly opt: EngineOptionsInput;
  readonly str: string;
  readonly structDepth: number;
}

// The extglob scan state: the alternative being built and those closed so far.
interface ExtglobParse {
  part: AST;
  readonly parts: Array<AST>;
  readonly scan: LiteralScanner;
}

// The cursor both #parseAST loops share: one per parse call. It accumulates
// literal text and tracks backslash escapes (still accumulated, but an
// escaped extglob start is ignored) and `[...]` classes, inside which extglob
// openers, `|` and `)` are plain text. Iterating appends every such literal
// character to `acc` and yields each character the parser must inspect; `pos`
// is then the index after it, and a recursive parse may advance it.
class LiteralScanner {
  readonly #str: string;
  #escaping = false;
  #inBrace = false;
  #braceStart = -1;
  #braceNeg = false;
  pos: number;
  acc = "";

  constructor(str: string, pos: number) {
    this.#str = str;
    this.pos = pos;
  }

  *[Symbol.iterator](): Generator<string, void, undefined> {
    while (this.pos < this.#str.length) {
      const c = String(this.#str[this.pos++]);
      if (this.#consumes(c)) {
        this.acc += c;
      } else {
        yield c;
      }
    }
  }

  // Returns the accumulated literal text and starts a fresh run.
  take(): string {
    const acc = this.acc;
    this.acc = "";
    return acc;
  }

  #consumes(c: string): boolean {
    const i = this.pos;
    if (this.#escaping || c === "\\") {
      this.#escaping = !this.#escaping;
      return true;
    }
    if (this.#inBrace) {
      this.#scanBrace(c, i);
      return true;
    }
    if (c === "[") {
      this.#inBrace = true;
      this.#braceStart = i;
      this.#braceNeg = false;
      return true;
    }
    return false;
  }

  // One character inside a `[...]` class: a leading `^`/`!` negates it, and a
  // `]` closes it unless it is the first member of a negated class.
  #scanBrace(c: string, i: number): void {
    if (i === this.#braceStart + 1) {
      if (c === "^" || c === "!") this.#braceNeg = true;
      return;
    }
    if (c === "]" && !(i === this.#braceStart + 2 && this.#braceNeg)) this.#inBrace = false;
  }
}

type RegExpSourceResult = [re: string, body: string, hasMagic: boolean, uflag: boolean];

// The case-insensitivity flag an engine option bag asks for.
const caseFlags = (options: EngineOptionsInput): string => (options.nocase === true ? "i" : "");

// Whether the start of a regexp source may match `.` or `..` and so needs the
// no-traversal guard.
const needsNoTraversal = (src: string, dot: boolean): boolean =>
  // dots are allowed, and the pattern starts with [ or .
  (dot && HashSet.has(addPatternStart, Str.slice(0, 1)(src))) ||
  // the pattern starts with \., and then [ or .
  (Str.startsWith("\\.")(src) && HashSet.has(addPatternStart, Str.slice(2, 3)(src))) ||
  // the pattern starts with \.\., and then [ or .
  (Str.startsWith("\\.\\.")(src) && HashSet.has(addPatternStart, Str.slice(4, 5)(src)));

// check if we have a possibility of matching . or .., and prevent that. no
// need to prevent dots if it can't match a dot, or if a sub-pattern will be
// preventing it anyway.
const startGuard = (src: string, dot: boolean, allowDot: boolean | undefined): string => {
  if (needsNoTraversal(src, dot)) return startNoTraversal;
  return !dot && allowDot !== true && HashSet.has(addPatternStart, Str.slice(0, 1)(src)) ? startNoDot : "";
};

// The closing group of a non-negated extglob; `dotted` marks a repeat whose
// dot-allowed body already carries the repetition.
const extglobCloseFor = (type: ExtglobType, dotted: boolean): string => {
  if (type === "@") return ")";
  if (type === "?") return ")?";
  if (type === "+" && dotted) return ")";
  if (type === "*" && dotted) return ")?";
  return `)${type}`;
};

// Literal-piece scan state for #parseGlob. Multiple stars that aren't
// globstars coalesce into one *.
interface GlobPieceScan {
  escaping: boolean;
  readonly glob: string;
  hasMagic: boolean | undefined;
  i: number;
  inStar: boolean;
  readonly noEmpty: boolean | undefined;
  re: string;
  uflag: boolean;
}

const parseGlobPiece = (glob: string, hasMagicInput: boolean | undefined, noEmpty?: boolean): RegExpSourceResult => {
  const scan: GlobPieceScan = {
    glob,
    noEmpty,
    i: 0,
    re: "",
    hasMagic: hasMagicInput,
    uflag: false,
    escaping: false,
    inStar: false,
  };
  for (; scan.i < glob.length; scan.i++) globPieceStep(scan, String(glob[scan.i]));
  return [scan.re, unescapePattern(glob), scan.hasMagic === true, scan.uflag];
};

const globPieceStep = (scan: GlobPieceScan, c: string): void => {
  if (scan.escaping) {
    scan.escaping = false;
    scan.re += escapedPieceChar(c);
    return;
  }
  if (c === "*") {
    globPieceStar(scan);
    return;
  }
  scan.inStar = false;
  if (c === "\\") {
    globPieceBackslash(scan);
    return;
  }
  if (c === "[" && globPieceClass(scan)) return;
  if (c === "?") {
    scan.re += qmark;
    scan.hasMagic = true;
    return;
  }
  scan.re += regExpEscape(c);
};

const escapedPieceChar = (c: string): string => (HashSet.has(reSpecials, c) ? "\\" : "") + c;

const globPieceStar = (scan: GlobPieceScan): void => {
  if (scan.inStar) return;
  scan.inStar = true;
  scan.re += scan.noEmpty === true && /^[*]+$/.test(scan.glob) ? starNoEmpty : star;
  scan.hasMagic = true;
};

const globPieceBackslash = (scan: GlobPieceScan): void => {
  if (scan.i === scan.glob.length - 1) {
    scan.re += "\\\\";
  } else {
    scan.escaping = true;
  }
};

// A `[...]` class at the cursor; false when it does not parse as one.
const globPieceClass = (scan: GlobPieceScan): boolean => {
  const [src, needUflag, consumed, magic] = parseClass(scan.glob, scan.i);
  if (consumed === 0 || Number.isNaN(consumed)) return false;
  scan.re += src;
  scan.uflag = scan.uflag || needUflag;
  scan.i += consumed - 1;
  scan.hasMagic = scan.hasMagic || magic;
  return true;
};

// Segment-matcher compilation (see #makeSegmentMatcher).
type SegmentMemo = MutableHashMap.MutableHashMap<string, ReadonlyArray<number>>;

interface SegmentStep {
  (candidate: string, start: number, allowDot: boolean, memo: SegmentMemo): ReadonlyArray<number>;
  (start: number, allowDot: boolean, memo: SegmentMemo): (candidate: string) => ReadonlyArray<number>;
}

interface SegmentIds {
  next: number;
}

// One compiled node: its regexp sources and regexps per dot mode, and the
// compiled steps of its parts.
interface CompiledSegment {
  readonly branches: ReadonlyArray<readonly [AST, SegmentStep]>;
  readonly children: ReadonlyArray<SegmentStep>;
  readonly leaf: boolean;
  readonly node: AST;
  readonly regexps: readonly [RegExp, RegExp];
  readonly sources: readonly [RegExpSourceResult, RegExpSourceResult];
}

const segmentRegExp = (options: EngineOptionsInput, [source, , , unicode]: RegExpSourceResult): RegExp =>
  new RegExp(
    `^(?:${Str.replace(startNoDot, "")(Str.replace(startNoTraversal, "")(source))})$`,
    caseFlags(options) + (unicode ? "u" : "")
  );

// Whether the contextual start assertions of `source` reject the candidate
// tail at `start`.
const startBlocked = (source: string, candidate: string, start: number): boolean => {
  const tail = Str.slice(start)(candidate);
  return (
    (Str.startsWith(startNoDot)(source) && Str.startsWith(".")(tail)) ||
    (Str.startsWith(startNoTraversal)(source) && start === 0 && (tail === "." || tail === ".."))
  );
};

// Every end offset from `start` at which `regexp` matches the slice.
const scanEnds = (regexp: RegExp, candidate: string, start: number): Array<number> => {
  const ends: Array<number> = [];
  for (let end = start; end <= candidate.length; end++) {
    if (regexp.test(Str.slice(start, end)(candidate))) ends.push(end);
  }
  return ends;
};

const scanEndSet = (regexp: RegExp, candidate: string, start: number): HashSet.HashSet<number> => {
  let ends = HashSet.empty<number>();
  for (let end = start; end <= candidate.length; end++) {
    if (regexp.test(Str.slice(start, end)(candidate))) ends = HashSet.add(ends, end);
  }
  return ends;
};

const fixedEndSet = (regexp: RegExp, candidate: string, start: number, length: number): HashSet.HashSet<number> => {
  const end = start + length;
  return end <= candidate.length && regexp.test(Str.slice(start, end)(candidate))
    ? HashSet.add(HashSet.empty<number>(), end)
    : HashSet.empty<number>();
};

const followChild = (
  child: SegmentStep,
  ends: HashSet.HashSet<number>,
  candidate: string,
  allowDot: boolean,
  memo: SegmentMemo
): HashSet.HashSet<number> => {
  let following = HashSet.empty<number>();
  for (const offset of ends) {
    for (const end of child(candidate, offset, allowDot, memo)) following = HashSet.add(following, end);
  }
  return following;
};

// Closes the reachable ends of a `*`/`+` extglob under repetition; `*` also
// matches the empty run.
const repeatedEnds = (
  type: "*" | "+",
  initial: HashSet.HashSet<number>,
  start: number,
  alternatives: (offset: number, dot: boolean) => HashSet.HashSet<number>
): HashSet.HashSet<number> => {
  let ends = initial;
  const queue = A.fromIterable(ends);
  for (const offset of queue) {
    for (const end of alternatives(offset, true)) {
      if (!HashSet.has(ends, end)) {
        ends = HashSet.add(ends, end);
        queue.push(end);
      }
    }
  }
  return type === "*" ? HashSet.add(ends, start) : ends;
};

let ID = 0;
/**
 * Represents a glob path portion as literal pieces and nested extended-glob alternatives.
 *
 * **Details**
 *
 * Parsing builds a syntax tree before regular-expression generation.
 * Negative extglobs incorporate the following pieces of their enclosing patterns
 * so that regular-expression lookaheads preserve glob negation semantics.
 *
 * **Example** (Compile an extended glob)
 *
 * ```ts
 * import { AST } from "@beep/glob/internal/ast"
 *
 * const tree = AST.fromGlob("@(cat|dog)")
 * const pattern = tree.toMMPattern()
 * console.log(pattern instanceof RegExp && pattern.test("cat")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AST {
  /**
   * Identifies the extglob operator, with `null` for a sequence of pattern pieces.
   *
   * **Example** (Inspect a sequence node)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("cat").type) // null
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  type: ExtglobType | null;
  /**
   * References the root that owns shared options and negation bookkeeping.
   *
   * **Example** (Read options inherited from the root)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const root = new AST(null, undefined, { dot: true })
   * const child = new AST("@", root)
   * console.log(child.options === root.options) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  readonly #root: AST;

  // #hasMagic and #toString are assigned undefined to reset them, so they are
  // declared `| undefined` rather than optional (exactOptionalPropertyTypes).
  /**
   * Caches whether this node requires glob-aware regular-expression matching.
   *
   * **Example** (Resolve the cached magic state)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("*")
   * tree.toRegExpSource()
   * console.log(tree.hasMagic) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #hasMagic: boolean | undefined;
  /**
   * Tracks whether generated character-class source requires the Unicode flag.
   *
   * **Example** (Inspect the Unicode requirement of a literal)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("cat").toRegExpSource()[3]) // false
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #uflag = false;
  /**
   * Stores literal sequence pieces or the alternative nodes of an extglob.
   *
   * **Example** (Append a sequence piece)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = new AST(null)
   * tree.push("cat")
   * console.log(tree.toString()) // cat
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #parts: Array<string | AST> = [];
  /**
   * References the enclosing node, or remains undefined for a root.
   *
   * **Example** (Measure distance to an enclosing root)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const root = new AST(null)
   * console.log(new AST("@", root).depth) // 1
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #parent: AST | undefined;
  /**
   * Records the insertion position within the enclosing node for boundary and negation handling.
   *
   * **Example** (Inspect a leading child boundary)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const root = new AST(null)
   * const child = new AST("@", root)
   * root.push(child)
   * console.log(child.isStart()) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #parentIndex: number;
  /**
   * Shares the root registry of negative extglobs awaiting tail completion.
   *
   * **Example** (Compile a registered negative extglob)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("!(cat)").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("dog")) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #negs: Array<AST>;
  /**
   * Records whether the root has completed its negative-extglob tails.
   *
   * **Example** (Generate negation source twice)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("!(cat)")
   * const first = tree.toRegExpSource()[0]
   * console.log(tree.toRegExpSource()[0] === first) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #filledNegs = false;
  /**
   * Stores the options object shared with the root and all sibling nodes.
   *
   * **Example** (Read root matching options)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("*", { dot: true }).options.dot) // true
   * ```
   *
   * @category configuration
   * @since 0.0.0
   */
  #options: EngineOptionsInput;
  /**
   * Caches the reconstructed pattern until a structural transformation clears it.
   *
   * **Example** (Read the reconstructed pattern twice)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("@(cat|dog)")
   * console.log(tree.toString() === tree.toString()) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #toString: string | undefined;
  // set to true if it's an extglob with no children
  // (which really means one child of '')
  /**
   * Marks an extglob with no children, representing one empty alternative.
   *
   * **Example** (Compile an empty negative extglob)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("!()").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("x")) // true
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  #emptyExt = false;
  /**
   * Identifies this node in the internal inspection output.
   *
   * **Details**
   *
   * Each constructed node receives the next identifier from the module counter.
   *
   * **Example** (Compare node identities)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const first = new AST(null)
   * const second = new AST(null)
   * console.log(second.id > first.id) // true
   * ```
   *
   * @category identifiers
   * @since 0.0.0
   */
  id = ++ID;

  /**
   * Reports how many parent edges separate this node from its root.
   *
   * **Details**
   *
   * A root node has depth zero.
   *
   * **Example** (Measure a child depth)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const root = new AST(null)
   * const child = new AST("@", root)
   * console.log(child.depth) // 1
   * ```
   *
   * @category getters
   * @since 0.0.0
   */
  get depth(): number {
    return (this.#parent?.depth ?? -1) + 1;
  }

  /**
   * Provides structural metadata for Node.js custom inspection of a syntax-tree node.
   *
   * **Example** (Inspect a root with Node utilities)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   * import { inspect } from "node:util"
   *
   * const rendered = inspect(AST.fromGlob("cat"))
   * console.log(rendered.includes("partsLength: 1")) // true
   * ```
   *
   * @category diagnostics
   * @since 0.0.0
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      "@@type": "AST",
      id: this.id,
      type: this.type,
      root: this.#root.id,
      parent: this.#parent?.id,
      depth: this.depth,
      partsLength: this.#parts.length,
      parts: this.#parts,
    };
  }

  /**
   * Creates an empty sequence or extglob node attached to an optional parent.
   *
   * **Details**
   *
   * Children share the root options and its registry of negative extglobs.
   * A non-null operator marks the node as magical immediately.
   *
   * **Example** (Construct a child operator)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const root = new AST(null, undefined, { dot: true })
   * const child = new AST("@", root)
   * console.log(child.options.dot) // true
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  constructor(type: ExtglobType | null, parent?: AST, options: EngineOptionsInput = {}) {
    this.type = type;
    // extglobs are inherently magical
    if (type !== null) this.#hasMagic = true;
    this.#parent = parent;
    this.#root = this.#parent !== undefined ? this.#parent.#root : this;
    this.#options = this.#root === this ? options : this.#root.#options;
    this.#negs = this.#root === this ? [] : this.#root.#negs;
    if (type === "!" && !this.#root.#filledNegs) this.#negs.push(this);
    this.#parentIndex = this.#parent !== undefined ? this.#parent.#parts.length : 0;
  }

  /**
   * Reports known glob magic in this node or its nested extglobs.
   *
   * **Gotchas**
   *
   * Literal-piece wildcard detection is deferred until regular-expression source
   * is generated, so the result can be undefined before that step.
   *
   * **Example** (Observe deferred wildcard detection)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("*")
   * console.log(tree.hasMagic) // undefined
   * tree.toRegExpSource()
   * console.log(tree.hasMagic) // true
   * ```
   *
   * @category getters
   * @since 0.0.0
   */
  get hasMagic(): boolean | undefined {
    if (this.#hasMagic !== undefined) return this.#hasMagic;
    for (const p of this.#parts) {
      if (P.isString(p)) continue;
      if (p.type !== null || p.hasMagic === true) {
        this.#hasMagic = true;
        return this.#hasMagic;
      }
    }
    // note: will be undefined until we generate the regexp src and find out
    return this.#hasMagic;
  }

  // reconstructs the pattern
  /**
   * Reconstructs the glob pattern represented by this node.
   *
   * **Details**
   *
   * Sequence pieces are concatenated; extglob alternatives are joined with a pipe
   * and enclosed by their operator and parentheses. The result is cached.
   *
   * **Example** (Reconstruct an alternative pattern)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("@(cat|dog)").toString()) // @(cat|dog)
   * ```
   *
   * @category formatting
   * @since 0.0.0
   */
  toString(): string {
    if (this.#toString !== undefined) return this.#toString;
    if (this.type === null) {
      this.#toString = pipe(
        this.#parts,
        A.map((p) => String(p)),
        A.join("")
      );
    } else {
      this.#toString = `${this.type}(${pipe(
        this.#parts,
        A.map((p) => String(p)),
        A.join("|")
      )})`;
    }
    return this.#toString;
  }

  /**
   * Completes negative-extglob alternatives with the following pieces of enclosing sequences.
   *
   * **Details**
   *
   * Only the root may perform this step; calling it on a child throws ASTError.
   * Completion is performed once, after caching the original pattern string.
   *
   * **Example** (Preserve a suffix after negation)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("!(cat)z").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("dogz")) // true
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  #fillNegs() {
    if (this.#filledNegs) return this;

    // call toString() once to fill this out
    this.toString();
    this.#filledNegs = true;
    let n: AST | undefined = this.#negs.pop();
    while (n !== undefined) {
      if (n.type === "!") n.#fillNegTail();
      n = this.#negs.pop();
    }
    return this;
  }

  // walk up the tree from this `!` extglob, appending everything that comes
  // AFTER parentIndex in each sequence ancestor
  #fillNegTail(): void {
    let p: AST = this;
    let pp = p.#parent;
    while (pp !== undefined) {
      if (pp.type === null) this.#copyTailIn(pp.#parts.slice(p.#parentIndex + 1));
      p = pp;
      pp = p.#parent;
    }
  }

  #copyTailIn(sources: ReadonlyArray<string | AST>): void {
    for (const source of sources) {
      for (const part of this.#parts) {
        if (P.isString(part)) {
          throw ASTError.make({ message: "string part in extglob AST??" });
        }
        part.copyIn(source);
      }
    }
  }

  /**
   * Appends non-empty literal pieces or children belonging to this node.
   *
   * **Gotchas**
   *
   * An AST child must have this node as its parent; otherwise an ASTError is thrown.
   * Appending does not clear an already cached string representation, so append
   * before calling toString.
   *
   * **Example** (Append a literal piece)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = new AST(null)
   * tree.push("cat", "")
   * console.log(tree.toString()) // cat
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  push(...parts: Array<string | AST>) {
    for (const p of parts) {
      if (p === "") continue;
      if (!P.isString(p) && !(p instanceof AST && p.#parent === this)) {
        throw ASTError.make({ message: `invalid part: ${p}` });
      }
      this.#parts.push(p);
    }
  }

  /**
   * Serializes node pieces and extglob operators into nested arrays with boundary markers.
   *
   * **Details**
   *
   * Sequence starts receive an empty-array marker. Pattern ends receive an
   * empty-object marker; negation tails also receive that marker after they are filled.
   * Extglob nodes begin their array with their operator.
   *
   * **Example** (Serialize a literal root)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(JSON.stringify(AST.fromGlob("cat").toJSON())) // [[],"cat",{}]
   * ```
   *
   * @category serialization
   * @since 0.0.0
   */
  toJSON() {
    const ret: Array<unknown> =
      this.type === null
        ? A.map(this.#parts, (p) => (P.isString(p) ? p : p.toJSON()))
        : [
            this.type,
            ...A.map(this.#parts, (p) => {
              if (P.isString(p)) throw ASTError.make({ message: "p.toJSON is not a function" });
              return p.toJSON();
            }),
          ];
    if (this.isStart() && this.type === null) ret.unshift([]);
    if (this.isEnd() && (this === this.#root || (this.#root.#filledNegs && this.#parent?.type === "!"))) {
      ret.push({});
    }
    return ret;
  }

  /**
   * Checks whether this node can occupy the beginning of its enclosing pattern.
   *
   * **Details**
   *
   * A root is always a start. A child can also be a start when all preceding
   * siblings are negative extglobs and its parent is a start.
   *
   * **Example** (Identify a root start)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("cat").isStart()) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  isStart(): boolean {
    if (this.#root === this) return true;
    if (this.#parent?.isStart() !== true) return false;
    if (this.#parentIndex === 0) return true;
    // if everything AHEAD of this is a negation, then it's still the "start"
    const p = this.#parent;
    for (let i = 0; i < this.#parentIndex; i++) {
      const pp = p.#parts[i];
      if (!(pp instanceof AST && pp.type === "!")) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks whether this node reaches the end of its enclosing pattern.
   *
   * **Details**
   *
   * A root and a direct child of a negative extglob count as ends. Other nodes
   * depend on their parent boundary and, for extglobs, their position among siblings.
   *
   * **Example** (Identify a root end)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("cat").isEnd()) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  isEnd(): boolean {
    if (this.#root === this) return true;
    if (this.#parent?.type === "!") return true;
    if (this.#parent?.isEnd() !== true) return false;
    if (this.type === null) return this.#parent?.isEnd();
    // if not root, it'll always have a parent
    const pl = this.#parent.#parts.length;
    return this.#parentIndex === pl - 1;
  }

  /**
   * Copies a literal piece or clones a subtree into this node.
   *
   * **Details**
   *
   * Subtrees are cloned with this node as their parent. Recursive copying is
   * guarded by the structural nesting-depth limit.
   *
   * **Example** (Copy a subtree into a sequence)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const target = new AST(null)
   * target.copyIn(AST.fromGlob("cat"))
   * console.log(target.toString()) // cat
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  copyIn(part: AST | string, depth = 0) {
    guardDepth(depth);
    if (P.isString(part)) this.push(part);
    else this.push(part.clone(this, depth + 1));
  }

  /**
   * Copies this node and its descendants under a supplied parent.
   *
   * **Details**
   *
   * The clone inherits its new root options. Recursive cloning and copying are
   * guarded by the structural nesting-depth limit.
   *
   * **Example** (Clone beneath a new root)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const parent = new AST(null)
   * const cloned = AST.fromGlob("cat").clone(parent)
   * parent.push(cloned)
   * console.log(parent.toString()) // cat
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  clone(parent: AST, depth = 0): AST {
    guardDepth(depth);
    const c = new AST(this.type, parent);
    for (const p of this.#parts) {
      c.copyIn(p, depth + 1);
    }
    return c;
  }

  /**
   * Accumulates literal pieces and nested extglobs while tracking structural and operator depth.
   *
   * **Example** (Parse nested alternatives)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("@(cat|@(dog|fox))").toString()) // @(cat|@(dog|fox))
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  static readonly #parseAST: {
    (str: string, ast: AST, pos: number, opt: EngineOptionsInput, extDepth: number, structDepth: number): number;
    (ast: AST, pos: number, opt: EngineOptionsInput, extDepth: number, structDepth: number): (str: string) => number;
  } = dual(
    6,
    (str: string, ast: AST, pos: number, opt: EngineOptionsInput, extDepth: number, structDepth: number): number => {
      // Structural backstop (port note 1): actual recursion depth, counted on
      // EVERY descent, unlike extDepth which adoption resets.
      guardDepth(structDepth);
      const frame: ParseFrame = {
        str,
        opt,
        extDepth,
        structDepth,
        maxDepth: opt.maxExtglobRecursion ?? MAX_EXTGLOB_RECURSION,
      };
      return ast.type === null ? AST.#parseSequence(ast, pos, frame) : AST.#parseExtglob(ast, pos, frame);
    }
  );

  // outside of a extglob, append until we find a start
  static #parseSequence(ast: AST, pos: number, frame: ParseFrame): number {
    const { str, opt, extDepth, structDepth, maxDepth } = frame;
    const sequence = new LiteralScanner(str, pos);
    for (const c of sequence) {
      // we don't have to check for adoption here, because that's
      // done at the other recursion point.
      if (opensExtglob(str, sequence.pos, opt, c) && extDepth <= maxDepth) {
        ast.push(sequence.take());
        const ext = new AST(c, ast);
        sequence.pos = AST.#parseAST(str, ext, sequence.pos, opt, extDepth + 1, structDepth + 1);
        ast.push(ext);
        continue;
      }
      sequence.acc += c;
    }
    ast.push(sequence.acc);
    return sequence.pos;
  }

  // some kind of extglob, pos is at the (
  // find the next | or )
  static #parseExtglob(ast: AST, pos: number, frame: ParseFrame): number {
    const state: ExtglobParse = { scan: new LiteralScanner(frame.str, pos + 1), part: new AST(null, ast), parts: [] };
    for (const c of state.scan) {
      if (ast.#extglobStep(state, c, frame)) return state.scan.pos;
    }

    // unfinished extglob
    // if we got here, it was a malformed extglob! not an extglob, but
    // maybe something else in there.
    ast.type = null;
    ast.#hasMagic = undefined;
    ast.#parts = [Str.slice(pos - 1)(frame.str)];
    return state.scan.pos;
  }

  // One character the extglob scan must inspect; true once `)` closes it.
  #extglobStep(state: ExtglobParse, c: string, frame: ParseFrame): boolean {
    if (
      opensExtglob(frame.str, state.scan.pos, frame.opt, c) &&
      (frame.extDepth <= frame.maxDepth || this.#canAdoptType(c))
    ) {
      this.#descendExtglob(state, c, frame);
      return false;
    }
    if (c === "|") {
      state.part.push(state.scan.take());
      state.parts.push(state.part);
      state.part = new AST(null, this);
      return false;
    }
    if (c === ")") {
      this.#closeExtglob(state);
      return true;
    }
    state.scan.acc += c;
    return false;
  }

  #descendExtglob(state: ExtglobParse, c: ExtglobType, frame: ParseFrame): void {
    const depthAdd = this.#canAdoptType(c) ? 0 : 1;
    state.part.push(state.scan.take());
    const ext = new AST(c, state.part);
    state.part.push(ext);
    state.scan.pos = AST.#parseAST(
      frame.str,
      ext,
      state.scan.pos,
      frame.opt,
      frame.extDepth + depthAdd,
      frame.structDepth + 1
    );
  }

  #closeExtglob(state: ExtglobParse): void {
    if (state.scan.acc === "" && this.#parts.length === 0) {
      this.#emptyExt = true;
    }
    state.part.push(state.scan.take());
    this.push(...state.parts, state.part);
  }

  /**
   * Checks whether a nested extglob can be flattened by adding an empty alternative.
   *
   * **Example** (Compile optional alternatives under repetition)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("+(?(cat))").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("cat")) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  #canAdoptWithSpace(child?: AST | string): O.Option<AST & { type: ExtglobType }> {
    return this.#canAdopt(child, adoptionWithSpaceMap);
  }

  /**
   * Checks whether a sole nested extglob has an operator that this node can absorb.
   *
   * **Example** (Compile compatible nested operators)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("+(+(cat|dog))").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("catdog")) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  #canAdopt(
    child?: AST | string,
    map: HashMap.HashMap<ExtglobType, Array<ExtglobType>> = adoptionMap
  ): O.Option<AST & { type: ExtglobType }> {
    if (this.type === null) return O.none();
    return O.filter(AST.#soleExtglobGrandchild(child), (gc) => this.#canAdoptType(gc.type, map));
  }

  // The extglob wrapped by a sequence child holding exactly one part.
  static #soleExtglobGrandchild(child?: AST | string): O.Option<AST & { type: ExtglobType }> {
    if (!isSequenceChild(child) || child.#parts.length !== 1) return O.none();
    const gc = child.#parts[0];
    return gc instanceof AST && isExtglobAST(gc) ? O.some(gc) : O.none();
  }

  /**
   * Checks whether an operator is compatible with this node under an adoption map.
   *
   * **Example** (Compile exactly-one alternatives under repetition)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("+(@(cat|dog))").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("catdog")) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  #canAdoptType(c: string, map: HashMap.HashMap<ExtglobType, Array<ExtglobType>> = adoptionAnyMap): c is ExtglobType {
    return (
      this.type !== null && isExtglobType(c) && O.exists(HashMap.get(map, this.type), (types) => types.includes(c))
    );
  }

  /**
   * Adds an empty alternative to a nested operator before adopting its alternatives.
   *
   * **Example** (Retain optional alternatives during flattening)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("@(?(cat)|dog)").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("dog")) // true
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  #adoptWithSpace(gc: AST & { type: ExtglobType }, index: number) {
    const blank = new AST(null, gc, this.options);
    blank.#parts.push("");
    gc.push(blank);
    this.#adopt(gc, index);
  }

  /**
   * Replaces a nested sequence wrapper with its extglob alternatives and reparents them.
   *
   * **Details**
   *
   * Adoption clears the cached string representation and updates child parents.
   *
   * **Example** (Flatten repeated nested alternatives)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("+(+(cat|dog)|fox)")
   * tree.toRegExpSource()
   * console.log(tree.toString()) // +(cat|dog|fox)
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  #adopt(gc: AST & { type: ExtglobType }, index: number) {
    this.#parts.splice(index, 1, ...gc.#parts);
    for (const p of gc.#parts) {
      if (P.isObjectKeyword(p) && !P.isFunction(p)) p.#parent = this;
    }
    this.#toString = undefined;
  }

  /**
   * Checks whether a sole nested operator can replace this node according to the usurp map.
   *
   * **Example** (Compile nested optional repetition)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("?(+(cat))").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("catcat")) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  #canUsurpType(c: ExtglobType, parentType: ExtglobType): O.Option<ExtglobType> {
    return O.flatMap(HashMap.get(usurpMap, parentType), (types) => HashMap.get(types, c));
  }

  /**
   * Checks whether a sole sequence child wraps an operator that can replace this node.
   *
   * **Example** (Compile a sole nested alternative)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("@(*(cat))").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("catcat")) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  #canUsurp(child?: AST | string): O.Option<readonly [AST, ExtglobType]> {
    const parentType = this.type;
    if (parentType === null || this.#parts.length !== 1) return O.none();
    return O.flatMap(AST.#soleExtglobGrandchild(child), (gc) =>
      O.map(this.#canUsurpType(gc.type, parentType), (type): readonly [AST, ExtglobType] => [gc, type])
    );
  }

  /**
   * Replaces this node operator and alternatives with those of a compatible sole descendant.
   *
   * **Details**
   *
   * Replacement clears the cached string representation and empty-extglob marker.
   *
   * **Example** (Collapse optional repetition)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("?(+(cat))")
   * tree.toRegExpSource()
   * console.log(tree.toString()) // *(cat)
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  #usurp(gc: AST, type: ExtglobType) {
    this.#parts = gc.#parts;
    for (const p of this.#parts) {
      if (P.isObjectKeyword(p) && !P.isFunction(p)) {
        p.#parent = this;
      }
    }
    this.type = type;
    this.#toString = undefined;
    this.#emptyExt = false;
  }

  /**
   * Parses a glob path portion into a root syntax tree.
   *
   * **Details**
   *
   * Compatible nested extglobs can be coalesced during parsing. An unfinished
   * extglob is retained as literal text.
   *
   * **Gotchas**
   *
   * A supplied maxExtglobRecursion must be a valid non-negative integer cap.
   * Exceeding that cap degrades further non-coalescible extglobs to literal text.
   * The independent structural nesting-depth guard throws GuardExceeded for
   * excessive nesting, including nesting that could otherwise be coalesced.
   *
   * **Example** (Parse an extended-glob alternative)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("@(cat|dog)").toString()) // @(cat|dog)
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  static readonly fromGlob: {
    (pattern: string, options?: EngineOptionsInput): AST;
    (options?: EngineOptionsInput): (pattern: string) => AST;
  } = dual(
    (args) => P.isString(args[0]),
    (pattern: string, options: EngineOptionsInput = {}): AST => {
      if (options.maxExtglobRecursion !== undefined) {
        assertCap("maxExtglobRecursion", options.maxExtglobRecursion);
      }
      const ast = new AST(null, undefined, options);
      AST.#parseAST(pattern, ast, 0, options, 0, 0);
      return ast;
    }
  );

  // returns the regular expression if there's magic, or the unescaped
  // string if not.
  /**
   * Produces a regular expression for magic patterns or an unescaped literal for plain patterns.
   *
   * **Details**
   *
   * Calling this method on a child delegates to its root. Regular expressions are
   * anchored and carry the original glob and generated source in metadata.
   * Case-insensitive matching can require a regular expression even without glob
   * magic, unless nocaseMagicOnly restricts that behavior.
   *
   * **Example** (Compile both literal and wildcard patterns)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * console.log(AST.fromGlob("cat").toMMPattern()) // cat
   * const pattern = AST.fromGlob("c*").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("cat")) // true
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  toMMPattern(): MMRegExp | string {
    // should only be called on root
    if (this !== this.#root) return this.#root.toMMPattern();
    const glob = this.toString();
    const [re, body, hasMagic, uflag] = this.toRegExpSource();
    if (!(hasMagic || this.#hasMagic || this.#needsCaseRegExp(glob))) {
      return body;
    }
    return this.#compileRoot(re, glob, uflag);
  }

  // if we're in nocase mode, and not nocaseMagicOnly, then we do
  // still need a regular expression if we have to case-insensitively
  // match capital/lowercase characters.
  #needsCaseRegExp(glob: string): boolean {
    return (
      this.#options.nocase === true &&
      this.#options.nocaseMagicOnly !== true &&
      !Str.Equivalence(Str.toUpperCase(glob), Str.toLowerCase(glob))
    );
  }

  #compileRoot(re: string, glob: string, uflag: boolean): MMRegExp {
    const flags = (this.#options.nocase === true ? "i" : "") + (uflag ? "u" : "");
    const pattern: MMRegExp = new RegExp(`^${re}$`, flags);
    pattern._src = re;
    pattern._glob = glob;
    if (this.#hasRepeat()) pattern._matchSegment = this.#makeSegmentMatcher();
    return pattern;
  }

  /**
   * Detects repeated extglobs that need a memoized segment matcher.
   *
   * **Details**
   *
   * Repetition nested inside an alternative also selects the matcher when
   * the root is compiled through toMMPattern.
   *
   * **Example** (Compile a nested repetition)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("a*(b|bb)c").toMMPattern()
   * console.log(pattern instanceof RegExp) // true
   * ```
   *
   * @category predicates
   * @since 0.0.0
   */
  #hasRepeat(): boolean {
    return (
      this.type === "*" || this.type === "+" || A.some(this.#parts, (part) => part instanceof AST && part.#hasRepeat())
    );
  }

  /**
   * Compiles repeated alternatives into a memoized segment predicate.
   *
   * **Details**
   *
   * Each match caches reachable offsets by node and dot mode. Repetition
   * visits each reachable offset once, preserving contextual assertions and
   * normalized negative extglobs without exponential regexp backtracking.
   *
   * **Example** (Match overlapping repeated alternatives)
   *
   * ```ts
   * import { Minimatch } from "@beep/glob/internal/minimatch"
   *
   * const pattern = new Minimatch("*(a|aa)b")
   * console.log(pattern.match("aaaab")) // true
   * console.log(pattern.match("aaaac")) // false
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  #makeSegmentMatcher(): (candidate: string) => boolean {
    // Compile once with the regexp owner. Each invocation memoizes node,
    // offset and dot mode; repeated alternatives visit each offset once.
    const ids: SegmentIds = { next: 0 };
    const step = AST.#compileSegment(this, ids);
    return (candidate) =>
      !Str.includes("/")(candidate) && step(candidate, 0, false, MutableHashMap.empty()).includes(candidate.length);
  }

  static #compileSegment(node: AST, ids: SegmentIds): SegmentStep {
    const id = ids.next++;
    const sources = [node.toRegExpSource(), node.toRegExpSource(true)] as const;
    const leaf = node.type === null && A.every(node.#parts, P.isString);
    const regexps = [segmentRegExp(node.#options, sources[0]), segmentRegExp(node.#options, sources[1])] as const;
    const branches: Array<readonly [AST, SegmentStep]> = [];
    const children = A.map(node.#parts, (part): SegmentStep => {
      if (!(part instanceof AST)) return AST.#literalSegmentStep(node, part);
      const step = AST.#compileSegment(part, ids);
      branches.push([part, step]);
      return step;
    });
    const compiled: CompiledSegment = { node, sources, regexps, leaf, branches, children };
    return dual(4, (candidate: string, start: number, allowDot: boolean, memo: SegmentMemo): ReadonlyArray<number> => {
      const key = `${id}:${start}:${allowDot}`;
      const cached = MutableHashMap.get(memo, key);
      if (O.isSome(cached)) return cached.value;
      const result = A.fromIterable(AST.#segmentEnds(compiled, candidate, start, allowDot, memo));
      MutableHashMap.set(memo, key, result);
      return result;
    });
  }

  static #literalSegmentStep(node: AST, part: string): SegmentStep {
    const [source, body, magic, unicode] = AST.#parseGlob(part, undefined);
    const regexp = new RegExp(`^(?:${source})$`, caseFlags(node.#options) + (unicode ? "u" : ""));
    return dual(
      4,
      (candidate: string, start: number, _allowDot: boolean, _memo: SegmentMemo): ReadonlyArray<number> => {
        if (!magic) return regexp.test(Str.slice(start, start + body.length)(candidate)) ? [start + body.length] : [];
        return scanEnds(regexp, candidate, start);
      }
    );
  }

  static #segmentEnds(
    compiled: CompiledSegment,
    candidate: string,
    start: number,
    allowDot: boolean,
    memo: SegmentMemo
  ): HashSet.HashSet<number> {
    const mode = allowDot ? 1 : 0;
    if (compiled.leaf) return AST.#leafEnds(compiled, mode, candidate, start);
    if (compiled.node.type === null) return AST.#sequenceEnds(compiled, mode, candidate, start, allowDot, memo);
    return AST.#extglobEnds(compiled, candidate, start, allowDot, memo);
  }

  static #leafEnds(compiled: CompiledSegment, mode: 0 | 1, candidate: string, start: number): HashSet.HashSet<number> {
    const metadata = compiled.sources[mode];
    const regexp = compiled.regexps[mode];
    if (startBlocked(metadata[0], candidate, start)) return HashSet.empty<number>();
    const [, body, magic] = metadata;
    const ends = magic ? scanEndSet(regexp, candidate, start) : fixedEndSet(regexp, candidate, start, body.length);
    return AST.#restrictNegTail(compiled.node, ends, candidate);
  }

  // Preserve the contextual start assertions generated by the AST.
  static #sequenceEnds(
    compiled: CompiledSegment,
    mode: 0 | 1,
    candidate: string,
    start: number,
    allowDot: boolean,
    memo: SegmentMemo
  ): HashSet.HashSet<number> {
    if (startBlocked(compiled.sources[mode][0], candidate, start)) return HashSet.empty<number>();
    let ends = HashSet.make(start);
    for (const child of compiled.children) ends = followChild(child, ends, candidate, allowDot, memo);
    return AST.#restrictNegTail(compiled.node, ends, candidate);
  }

  // A sequence that ends a `!` extglob must consume the rest of the candidate.
  static #restrictNegTail(node: AST, ends: HashSet.HashSet<number>, candidate: string): HashSet.HashSet<number> {
    return node.isEnd() && node.#parent?.type === "!" ? HashSet.filter(ends, (end) => end === candidate.length) : ends;
  }

  static #extglobEnds(
    compiled: CompiledSegment,
    candidate: string,
    start: number,
    allowDot: boolean,
    memo: SegmentMemo
  ): HashSet.HashSet<number> {
    const node = compiled.node;
    const alternatives = (offset: number, dot: boolean): HashSet.HashSet<number> =>
      AST.#alternativeEnds(compiled, candidate, offset, dot, memo);
    const ends = alternatives(start, allowDot);
    if (node.type === "!") return AST.#negatedEnds(node, ends, candidate, start, allowDot);
    if (node.type === "*" || node.type === "+") return repeatedEnds(node.type, ends, start, alternatives);
    return node.type === "?" ? HashSet.add(ends, start) : ends;
  }

  static #alternativeEnds(
    compiled: CompiledSegment,
    candidate: string,
    offset: number,
    dot: boolean,
    memo: SegmentMemo
  ): HashSet.HashSet<number> {
    const node = compiled.node;
    let result = HashSet.empty<number>();
    for (const [part, child] of compiled.branches) {
      if (node.isStart() && node.isEnd() && part.toRegExpSource(dot)[0] === "") continue;
      for (const end of child(candidate, offset, dot, memo)) result = HashSet.add(result, end);
    }
    return result;
  }

  static #negatedEnds(
    node: AST,
    ends: HashSet.HashSet<number>,
    candidate: string,
    start: number,
    allowDot: boolean
  ): HashSet.HashSet<number> {
    const forbidden = node.#emptyExt === false && HashSet.has(ends, candidate.length);
    const blocked = node.isStart() && node.#options.dot !== true && !allowDot && candidate[start] === ".";
    let result = HashSet.empty<number>();
    if (forbidden || blocked) return result;
    for (let end = start + (node.#emptyExt ? 1 : 0); end <= candidate.length; end++) result = HashSet.add(result, end);
    return result;
  }

  /**
   * Exposes the root options shared by every node in this tree.
   *
   * **Details**
   *
   * The returned options object is the same object supplied to the root; it is
   * not copied.
   *
   * **Example** (Read shared dot matching options)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("*", { dot: true })
   * console.log(tree.options.dot) // true
   * ```
   *
   * @category getters
   * @since 0.0.0
   */
  get options(): EngineOptionsInput {
    return this.#options;
  }

  // returns the string match, the regexp source, whether there's magic
  // in the regexp (so a regular expression is required) and whether or
  // not the uflag is needed for the regular expression (for posix classes)
  /**
   * Generates regular-expression source and matching metadata for this node.
   *
   * **Details**
   *
   * The tuple contains regular-expression source, the unescaped body, whether
   * glob magic requires a regular expression, and whether POSIX character classes
   * require the Unicode flag. allowDot overrides the root dot option.
   * Root generation flattens compatible extglobs and fills negative-extglob tails
   * before assembling source.
   *
   * **Gotchas**
   *
   * Source generation can mutate the tree through flattening and negation-tail
   * completion. Recursive generation is guarded by the structural nesting-depth limit.
   *
   * **Example** (Inspect literal source metadata)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const [source, body, hasMagic, unicode] = AST.fromGlob("cat").toRegExpSource()
   * console.log(JSON.stringify([source, body, hasMagic, unicode])) // ["cat","cat",false,false]
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  toRegExpSource(allowDot?: boolean, depth = 0): RegExpSourceResult {
    // Port note 2: depth guard on the toRegExpSource <-> #partsToRegExp
    // mutual recursion.
    guardDepth(depth);
    const dot = allowDot ?? this.#options.dot === true;
    if (this.#root === this) {
      this.#flatten();
      this.#fillNegs();
    }
    return this.type === null
      ? this.#sequenceRegExpSource(dot, allowDot, depth)
      : this.#extglobRegExpSource(this.type, dot, allowDot, depth);
  }

  #sequenceRegExpSource(dot: boolean, allowDot: boolean | undefined, depth: number): RegExpSourceResult {
    const noEmpty = this.isStart() && this.isEnd() && A.every(this.#parts, P.isString);
    const src = pipe(
      this.#parts,
      A.map((p) => this.#partSource(p, noEmpty, allowDot, depth)),
      A.join("")
    );
    const final = this.#sequenceStart(src, dot, allowDot) + src + this.#negTailEnd();
    this.#hasMagic = this.#hasMagic === true;
    return [final, unescapePattern(src), this.#hasMagic, this.#uflag];
  }

  #partSource(p: string | AST, noEmpty: boolean, allowDot: boolean | undefined, depth: number): string {
    const [re, _, hasMagic, uflag] = P.isString(p)
      ? AST.#parseGlob(p, this.#hasMagic, noEmpty)
      : p.toRegExpSource(allowDot, depth + 1);
    this.#hasMagic = this.#hasMagic || hasMagic;
    this.#uflag = this.#uflag || uflag;
    return re;
  }

  // The string that will match the start of the pattern, so we need to
  // protect against dots and such.
  #sequenceStart(src: string, dot: boolean, allowDot: boolean | undefined): string {
    if (!this.isStart()) return "";
    const firstPart = this.#parts[0];
    if (!P.isString(firstPart)) return "";
    // '.' and '..' cannot match unless the pattern is that exactly,
    // even if it starts with . or dot:true is set.
    if (this.#parts.length === 1 && HashSet.has(justDots, firstPart)) return "";
    return startGuard(src, dot, allowDot);
  }

  // append the "end of path portion" pattern to negation tails
  #negTailEnd(): string {
    return this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!" ? "(?:$|\\/)" : "";
  }

  // We need to calculate the body *twice* if it's a repeat pattern
  // at the start, once in nodot mode, then again in dot mode, so a
  // pattern like *(?) can match 'x.y'
  #extglobRegExpSource(
    type: ExtglobType,
    dot: boolean,
    allowDot: boolean | undefined,
    depth: number
  ): RegExpSourceResult {
    let body = this.#partsToRegExp(dot, depth);

    if (this.isStart() && this.isEnd() && body === "" && type !== "!") {
      // invalid extglob, has to at least be *something* present, if it's
      // the entire path portion.
      return this.#degradeToLiteral();
    }

    const bodyDotAllowed = this.#dotAllowedBody(type, body, dot, allowDot, depth);
    if (bodyDotAllowed !== "") {
      body = `(?:${body})(?:${bodyDotAllowed})*?`;
    }

    const start = type === "!" ? "(?:(?!(?:" : "(?:";
    const final = this.#extglobFinal(type, start + body, dot, allowDot, bodyDotAllowed !== "");
    this.#hasMagic = this.#hasMagic === true;
    return [final, unescapePattern(body), this.#hasMagic, this.#uflag];
  }

  #extglobFinal(
    type: ExtglobType,
    opened: string,
    dot: boolean,
    allowDot: boolean | undefined,
    dotted: boolean
  ): string {
    // an empty !() is exactly equivalent to a starNoEmpty
    if (type === "!" && this.#emptyExt) return (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
    return opened + this.#extglobClose(type, dot, allowDot, dotted);
  }

  #degradeToLiteral(): RegExpSourceResult {
    const s = this.toString();
    this.#parts = [s];
    this.type = null;
    this.#hasMagic = undefined;
    return [s, unescapePattern(this.toString()), false, false];
  }

  #dotAllowedBody(type: ExtglobType, body: string, dot: boolean, allowDot: boolean | undefined, depth: number): string {
    const repeated = type === "*" || type === "+";
    if (!repeated || allowDot === true || dot) return "";
    const bodyDotAllowed = this.#partsToRegExp(true, depth);
    return bodyDotAllowed === body ? "" : bodyDotAllowed;
  }

  #extglobClose(type: ExtglobType, dot: boolean, allowDot: boolean | undefined, dotted: boolean): string {
    // !() must match something,but !(x) can match ''
    if (type === "!") return `))${this.isStart() && !dot && allowDot !== true ? startNoDot : ""}${star})`;
    return extglobCloseFor(type, dotted);
  }

  /**
   * Flattens compatible nested operators through adoption and replacement passes.
   *
   * **Details**
   *
   * Each operator is flattened for at most ten passes. Recursive traversal
   * is guarded by the structural nesting-depth limit.
   *
   * **Example** (Flatten nested exactly-one alternatives)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const tree = AST.fromGlob("@(cat|@(dog|fox))")
   * tree.toRegExpSource()
   * console.log(tree.toString()) // @(cat|dog|fox)
   * ```
   *
   * @category utilities
   * @since 0.0.0
   */
  #flatten(depth = 0) {
    // Port note 3: tree-depth guard alongside the kept 10-pass width cap.
    guardDepth(depth);
    if (this.type === null) this.#flattenChildren(depth);
    else this.#flattenExtglob(depth);
    this.#toString = undefined;
  }

  #flattenChildren(depth: number): void {
    for (const p of this.#parts) {
      if (P.isObjectKeyword(p) && !P.isFunction(p)) {
        p.#flatten(depth + 1);
      }
    }
  }

  // do up to 10 passes to flatten as much as possible
  #flattenExtglob(depth: number): void {
    let iterations = 0;
    let done = false;
    do {
      done = this.#flattenPass(depth);
    } while (!done && ++iterations < 10);
  }

  // One flatten pass over the extglob children; true when nothing coalesced.
  #flattenPass(depth: number): boolean {
    let done = true;
    for (let i = 0; i < this.#parts.length; i++) {
      const c = this.#parts[i];
      if (P.isObjectKeyword(c) && !P.isFunction(c) && this.#coalesceChild(c, i, depth)) done = false;
    }
    return done;
  }

  #coalesceChild(c: AST, i: number, depth: number): boolean {
    c.#flatten(depth + 1);
    const adopt = this.#canAdopt(c);
    if (O.isSome(adopt)) {
      this.#adopt(adopt.value, i);
      return true;
    }
    const adoptWithSpace = this.#canAdoptWithSpace(c);
    if (O.isSome(adoptWithSpace)) {
      this.#adoptWithSpace(adoptWithSpace.value, i);
      return true;
    }
    const usurp = this.#canUsurp(c);
    if (O.isSome(usurp)) {
      this.#usurp(...usurp.value);
      return true;
    }
    return false;
  }

  /**
   * Joins extglob alternatives into regular-expression source while collecting Unicode requirements.
   *
   * **Details**
   *
   * Alternatives must be AST nodes; a string alternative throws ASTError.
   * Empty alternatives are filtered when this node spans the entire pattern.
   *
   * **Example** (Match an extglob alternative)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("@(cat|dog)").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("dog")) // true
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  #partsToRegExp(dot: boolean, depth: number) {
    return pipe(
      this.#parts,
      A.map((p) => {
        // extglob ASTs should only contain parent ASTs
        if (P.isString(p)) {
          throw ASTError.make({ message: "string type in extglob ast??" });
        }
        // can ignore hasMagic, because extglobs are already always magic
        const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot, depth + 1);
        this.#uflag = this.#uflag || uflag;
        return re;
      }),
      A.filter((p) => !(this.isStart() && this.isEnd()) || p !== ""),
      A.join("|")
    );
  }

  /**
   * Converts literal glob pieces, wildcards and character classes into regular-expression source.
   *
   * **Details**
   *
   * Consecutive stars coalesce into one wildcard. A wildcard covering an entire
   * path portion can be required to match at least one character. Escapes and
   * POSIX character classes are handled while the magic and Unicode flags are collected.
   *
   * **Example** (Compile a wildcard piece)
   *
   * ```ts
   * import { AST } from "@beep/glob/internal/ast"
   *
   * const pattern = AST.fromGlob("c?t").toMMPattern()
   * console.log(pattern instanceof RegExp && pattern.test("cat")) // true
   * ```
   *
   * @category parsing
   * @since 0.0.0
   */
  static readonly #parseGlob: {
    (
      glob: string,
      hasMagicInput: boolean | undefined,
      noEmpty?: boolean
    ): [re: string, body: string, hasMagic: boolean, uflag: boolean];
    (
      hasMagicInput: boolean | undefined,
      noEmpty?: boolean
    ): (glob: string) => [re: string, body: string, hasMagic: boolean, uflag: boolean];
  } = dual((args) => P.isString(args[0]), parseGlobPiece);
}
