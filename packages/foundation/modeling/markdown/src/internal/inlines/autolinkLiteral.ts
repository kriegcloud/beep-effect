// Ported from cmark-gfm@0.29.0.gfm.13 (https://github.com/github/cmark-gfm)
// Copyright (c) 2014, John MacFarlane; Copyright (c) 2015, GitHub, Inc.
// License: BSD-2-Clause
//
// `extensions/autolink.c`: GFM autolink literals — a bare `www.` host, a bare
// `http`/`https`/`ftp` URL, and a bare email address all become links with no
// markup around them.
//
// WHERE THIS HOOKS, and why it is split in two. Upstream splits it too, and
// the split is not incidental:
//
//   * `www.` and scheme literals are INLINE constructs, registered on the
//     trigger characters `w` and `:` (upstream's `special_inline_chars`).
//     They see the RAW subject, which is what a package that records byte
//     offsets needs — an entity or a backslash escape inside the run has not
//     been decoded yet, so `scanner.pos` still indexes the source and the
//     segment table still maps it.
//   * Email literals are a POSTPROCESS over the finished node list
//     (upstream's `postprocess`/`postprocess_text`), because recognizing one
//     means scanning BACKWARDS over text the parser already consumed, past
//     characters — `_` above all — that may have gone onto the delimiter
//     stack. Doing that mid-parse would mean unlinking a node a live
//     delimiter still points at. After `processEmphasis` has run there is no
//     stack left to corrupt.
//
// Both halves refuse to fire inside a link: the inline constructs check the
// bracket stack (upstream's `cmark_inline_parser_in_bracket`), and the
// postprocess skips every `link`/`linkReference` subtree (upstream's
// `in_link` flag). Code spans and raw HTML are not text nodes, so neither
// half can see inside one.
//
// Divergence from the GFM spec text, recorded deliberately: the spec's
// "Autolinks (extension)" section describes `www.`, `http`, `https` and
// email only, but the vendored C at this pin also linkifies `ftp://`
// (`sd_autolink_issafe`) and `xmpp:` addresses including a `/resource` path
// (`postprocess_text`). `extensions.txt` — the other vendored corpus —
// asserts both, so the C wins and both are implemented.
//
// Registered under the `gfm` dialect only.

import { $MarkdownId } from "@beep/identity/packages";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { appendChild, childrenOf, insertAfter, makeInlineNode, unlink } from "../inlineNode.ts";
import { InlineConstruct } from "../inlineTypes.ts";
import { unitAt } from "../patterns.ts";
import type { InlineNode } from "../inlineNode.ts";
import type { InlineScanner } from "../inlineTypes.ts";

const $I = $MarkdownId.create("internal/inlines/autolinkLiteral");

const C_LOWER_W = "w";
const C_COLON = ":";

const reAlnum = /^[0-9A-Za-z]$/;
const reAlpha = /^[A-Za-z]$/;

/**
 * Where a literal's run ends: `cmark_isspace` (ASCII only, deliberately —
 * upstream's URL scan uses it) or a `<`.
 */
const reLinkBoundary = /^[ \t\n\v\f\r<]$/;

/** What may precede a `www.` literal: a space or one of `*`, `_`, `~`, `(`. */
const reWwwPrefix = /^[ \t\n\v\f\r*_~(]$/;

/** The marks `autolink_delim` drops from a link's end. */
const reTrailingPunctuation = /^[?!.,:*_~'"]$/;

/** The characters an email's local part may hold. */
const reLocalPartChar = /^[0-9A-Za-z.+\-_]$/;

/** Every `@`, searched forward from `lastIndex`. */
const reAt = /@/g;

// `cmark_utf8proc_is_space` and `cmark_utf8proc_is_punctuation`, which the
// HOST-character test uses (a different, wider test than `cmark_isspace`).
// Note what is NOT here: the Unicode S categories. Upstream's punctuation
// table is the P categories plus ASCII punctuation, so a symbol such as an
// emoji is a valid host character — `http://🍄.ga/` links, and the corpus
// says so. ASCII's own P-category characters are all ASCII punctuation, so
// one sticky test at the code point covers both arms. Sticky at the index
// rather than a `codePointAt`: the `u` flag reads the code point there.
const reHostStop = /[\t\n\f\r \u00a0\u1680\u2000-\u200a\u202f\u205f\u3000!-/:-@[-`{-~]|\p{P}/uy;

/** The schemes `sd_autolink_issafe` whitelists, in its order. */
const SAFE_SCHEMES: ReadonlyArray<string> = ["http://", "https://", "ftp://"];

/** Whether the code point at `index` may appear in a host name. */
const isValidHostChar: {
  (subject: string, index: number): boolean;
  (index: number): (subject: string) => boolean;
} = dual(2, (subject: string, index: number): boolean => {
  reHostStop.lastIndex = index;
  return !reHostStop.test(subject);
});

/**
 * How far an entity reference ending at a trailing `;` reaches back — the
 * new link end at its `&` — or the end with just the `;` dropped.
 */
const trimSemicolon: {
  (subject: string, base: number, linkEnd: number): number;
  (base: number, linkEnd: number): (subject: string) => number;
} = dual(3, (subject: string, base: number, linkEnd: number): number => {
  // Each candidate retains its www., ://, or @ prefix, so a trailing
  // semicolon always has a preceding character.
  let newEnd = linkEnd - 2;
  while (newEnd > 0 && reAlpha.test(unitAt(subject, base + newEnd))) {
    newEnd -= 1;
  }
  return newEnd < linkEnd - 2 && unitAt(subject, base + newEnd) === "&" ? newEnd : linkEnd - 1;
});

/** How many more `)` than `(` the run `[base, base + end)` holds. */
const parenSurplus: {
  (subject: string, base: number, end: number): number;
  (base: number, end: number): (subject: string) => number;
} = dual(3, (subject: string, base: number, end: number): number => {
  let surplus = 0;
  for (let index = 0; index < end; index += 1) {
    const char = unitAt(subject, base + index);
    if (char === "(") {
      surplus -= 1;
    } else if (char === ")") {
      surplus += 1;
    }
  }
  return surplus;
});

/**
 * `autolink_delim`: pull the link's end back off trailing punctuation.
 *
 * **Details**
 *
 * Two rules beyond "drop the trailing mark". Parens are BALANCED rather than
 * simply stripped, so `www.a.com/q_(bar)` keeps its group while `(www.a.com/q)`
 * gives its closer back to the surrounding text. And a trailing `;` is
 * examined for an entity reference: `…&hl;` cuts at the `&`, because the
 * writer will re-escape that run and the link must not swallow it.
 */
const autolinkDelim: {
  (subject: string, base: number, end: number): number;
  (base: number, end: number): (subject: string) => number;
} = dual(3, (subject: string, base: number, end: number): number => {
  let linkEnd = end;
  let surplus = parenSurplus(subject, base, end);

  // Trimming cannot consume the validated prefix (www., ://, or @). A `)`
  // with no surplus left is balanced and ends the trim like any other
  // character outside the trailing set.
  while (true) {
    const char = unitAt(subject, base + linkEnd - 1);
    if (char === ")" && surplus > 0) {
      surplus -= 1;
      linkEnd -= 1;
    } else if (reTrailingPunctuation.test(char)) {
      linkEnd -= 1;
    } else if (char === ";") {
      linkEnd = trimSemicolon(subject, base, linkEnd);
    } else {
      return linkEnd;
    }
  }
});

/**
 * The tallies `check_domain` keeps while it walks a domain: the dots, and
 * the underscores in the last two dot-separated segments.
 */
class DomainTally {
  dots = 0;
  underscoresLast = 0;
  underscoresPenultimate = 0;

  /**
   * Walk the domain of `size` units from `base`, stepping over a backslash
   * escape, and return the index (relative to `base`) where it stops.
   */
  scan(subject: string, base: number, size: number): number {
    let index = 1;
    for (; index < size - 1; index += 1) {
      if (unitAt(subject, base + index) === "\\" && index < size - 2) {
        index += 1;
      }
      if (!this.admit(subject, base + index)) {
        break;
      }
    }
    return index;
  }

  /** Count the character at `index`; `false` when it ends the domain. */
  private admit(subject: string, index: number): boolean {
    const char = unitAt(subject, index);
    if (char === "_") {
      this.underscoresLast += 1;
      return true;
    }
    if (char === ".") {
      this.underscoresPenultimate = this.underscoresLast;
      this.underscoresLast = 0;
      this.dots += 1;
      return true;
    }
    return char === "-" || isValidHostChar(subject, index);
  }
}

/**
 * `check_domain`: how much of `subject` from `base` is a plausible domain.
 *
 * **Details**
 *
 * The underscore rule is the interesting one and it is a HOST-name rule, not
 * a domain-name rule: an `_` in either of the last two dot-separated segments
 * disqualifies the whole match (`www.xxx._yyy.zzz` is literal text), while one
 * further left is fine (`www._xxx.yyy.zzz` links). The `np > 10` escape hatch
 * is upstream's fix for GHSA-29g3-96g3-jg6c — a very long segmented run stops
 * being re-examined rather than going quadratic.
 */
const checkDomain: {
  (subject: string, base: number, size: number, allowShort: boolean): number;
  (base: number, size: number, allowShort: boolean): (subject: string) => number;
} = dual(4, (subject: string, base: number, size: number, allowShort: boolean): number => {
  const tally = new DomainTally();
  const index = tally.scan(subject, base, size);

  if (tally.underscoresPenultimate + tally.underscoresLast > 0 && tally.dots <= 10) {
    return 0;
  }
  return allowShort || tally.dots > 0 ? index : 0;
});

/** `sd_autolink_issafe`: does the run at `start` open with a whitelisted scheme. */
const isSafeScheme: {
  (subject: string, start: number, length: number): boolean;
  (start: number, length: number): (subject: string) => boolean;
} = dual(3, (subject: string, start: number, length: number): boolean =>
  A.some(
    SAFE_SCHEMES,
    (scheme) =>
      length > scheme.length &&
      Str.toLowerCase(Str.slice(start, start + scheme.length)(subject)) === scheme &&
      isValidHostChar(subject, start + scheme.length)
  )
);

/** Extend a matched prefix to the next space or `<`, as both matchers do. */
const extendToBoundary: {
  (subject: string, base: number, from: number, size: number): number;
  (base: number, from: number, size: number): (subject: string) => number;
} = dual(4, (subject: string, base: number, from: number, size: number): number => {
  let linkEnd = from;
  while (linkEnd < size && !reLinkBoundary.test(unitAt(subject, base + linkEnd))) {
    linkEnd += 1;
  }
  return linkEnd;
});

/** Append a literal-autolink `link` node spanning `[start, end)`. */
const appendLiteralLink: {
  (scanner: InlineScanner, start: number, end: number, url: string): void;
  (start: number, end: number, url: string): (scanner: InlineScanner) => void;
} = dual(4, (scanner: InlineScanner, start: number, end: number, url: string): void => {
  const text = Str.slice(start, end)(scanner.subject);
  const node = makeInlineNode("link", start, end);
  node.data.url = url;
  appendChild(node, makeInlineNode("text", start, end, text));
  scanner.append(node);
  scanner.pos = end;
});

/**
 * `www_match`: a `www.` host with no scheme, which links to `http://` + itself.
 *
 * **Details**
 *
 * The preceding character is the gate — start of line, whitespace, or one of
 * `*`, `_`, `~`, `(` — which is what keeps `xwww.a.com` from linking.
 *
 * **Example** (Register bare www hosts)
 *
 * ```ts
 * import { wwwAutolinkConstruct } from "@beep/markdown/internal/inlines/autolinkLiteral"
 *
 * console.log(wwwAutolinkConstruct.triggers.join("")) // w
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const wwwAutolinkConstruct = new InlineConstruct("wwwAutolink", [C_LOWER_W], (scanner) => {
  const { subject } = scanner;
  const start = scanner.pos;
  const size = subject.length - start;
  if (
    scanner.brackets !== undefined ||
    (start > 0 && !reWwwPrefix.test(unitAt(subject, start - 1))) ||
    size < 4 ||
    !Str.startsWith("www.", start)(subject)
  ) {
    return false;
  }

  const domain = checkDomain(subject, start, size, false);
  if (domain === 0) {
    return false;
  }

  const linkEnd = autolinkDelim(subject, start, extendToBoundary(subject, start, domain, size));
  appendLiteralLink(scanner, start, start + linkEnd, `http://${Str.slice(start, start + linkEnd)(subject)}`);
  return true;
});

/** How many ASCII letters run back from just before `colon` — the scheme. */
const schemeLength: {
  (subject: string, colon: number): number;
  (colon: number): (subject: string) => number;
} = dual(2, (subject: string, colon: number): number => {
  let rewind = 0;
  while (rewind < colon && reAlpha.test(unitAt(subject, colon - rewind - 1))) {
    rewind += 1;
  }
  return rewind;
});

/**
 * Where a URL literal whose scheme starts `rewind` before `colon` ends,
 * relative to the colon, or `0` when the run is not a URL literal.
 */
const urlLinkEnd: {
  (subject: string, colon: number, rewind: number): number;
  (colon: number, rewind: number): (subject: string) => number;
} = dual(3, (subject: string, colon: number, rewind: number): number => {
  const size = subject.length - colon;
  if (!isSafeScheme(subject, colon - rewind, size + rewind)) {
    return 0;
  }
  const domain = checkDomain(subject, colon + 3, size - 3, true);
  // The `://` is never trimmed, so a link end is always past it.
  return domain === 0 ? 0 : autolinkDelim(subject, colon, extendToBoundary(subject, colon, 3 + domain, size));
});

/**
 * `url_match`: a bare `http://`, `https://` or `ftp://` URL.
 *
 * **Details**
 *
 * The trigger is the `:`, so the scheme itself is already behind the cursor
 * and already emitted as text. Upstream calls `cmark_node_unput` to take it
 * back; `scanner.unputText` is that, and its refusal is a real bail-out —
 * when the scheme's characters did not come from plain text nodes (a decoded
 * entity, say) the run is not the source text it appears to be and no link
 * forms.
 *
 * **Example** (Register the URL colon trigger)
 *
 * ```ts
 * import { urlAutolinkConstruct } from "@beep/markdown/internal/inlines/autolinkLiteral"
 *
 * console.log(urlAutolinkConstruct.triggers.join("")) // :
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const urlAutolinkConstruct = new InlineConstruct("urlAutolink", [C_COLON], (scanner) => {
  const colon = scanner.pos;
  const { subject } = scanner;
  if (scanner.brackets !== undefined || subject.length - colon < 4 || !Str.startsWith("//", colon + 1)(subject)) {
    return false;
  }

  const rewind = schemeLength(subject, colon);
  const linkEnd = urlLinkEnd(subject, colon, rewind);
  if (linkEnd === 0 || !scanner.unputText(rewind)) {
    return false;
  }

  const start = colon - rewind;
  const end = colon + linkEnd;
  appendLiteralLink(scanner, start, end, Str.slice(start, end)(subject));
  return true;
});

// --- email literals: the postprocess ----------------------------------------

/** One email run found in a merged text run, in that run's coordinates. */
const EmailMatch = S.Struct({
  from: S.Natural.pipe(
    $I.annoteKey("EmailMatch.from", { description: "Inclusive start offset in the merged text run." })
  ),
  to: S.Natural.pipe($I.annoteKey("EmailMatch.to", { description: "Exclusive end offset in the merged text run." })),
  url: S.String.pipe(
    $I.annoteKey("EmailMatch.url", { description: "Link destination for the matched email address." })
  ),
}).pipe($I.annoteSchema("EmailMatch", { description: "An email link and its offsets within a merged text run." }));

type EmailMatch = typeof EmailMatch.Type;

/**
 * `validate_protocol`: is `protocol` the run immediately left of the address,
 * and is it itself preceded by a non-alphanumeric?
 *
 * **Details**
 *
 * The second half is why `mmmmailto:foo@bar.baz` links only `foo@bar.baz`.
 */
const validateProtocol: {
  (protocol: string, data: string, at: number, rewind: number, maxRewind: number): boolean;
  (data: string, at: number, rewind: number, maxRewind: number): (protocol: string) => boolean;
} = dual(5, (protocol: string, data: string, at: number, rewind: number, maxRewind: number): boolean => {
  const length = protocol.length;
  if (length > maxRewind - rewind) {
    return false;
  }
  if (Str.slice(at - rewind - length, at - rewind)(data) !== protocol) {
    return false;
  }
  if (length === maxRewind - rewind) {
    return true;
  }
  return !reAlnum.test(unitAt(data, at - rewind - length - 1));
});

/**
 * One email candidate's state across `postprocess_text`'s `goto found_at`
 * re-entries: the flags the protocol prefix sets and the dot count, none of
 * which a re-anchor resets, because upstream's `goto` jumps past their
 * initializers.
 */
class EmailCandidate {
  autoMailto = true;
  dots = 0;
  isXmpp = false;

  /**
   * How far the local part runs back from the `@` at `at`, looking no further
   * than `maxRewind` — accepting a `mailto:` or `xmpp:` prefix on the way.
   */
  rewindFrom(data: string, at: number, maxRewind: number): number {
    let rewind = 0;
    for (; rewind < maxRewind; rewind += 1) {
      const char = unitAt(data, at - rewind - 1);
      if (!reLocalPartChar.test(char) && (char !== ":" || !this.acceptProtocol(data, at, rewind, maxRewind))) {
        break;
      }
    }
    return rewind;
  }

  /**
   * How far the domain runs on from the `@` at `at`; it stops AT a second
   * `@`, which the caller re-anchors on.
   */
  domainFrom(data: string, at: number): number {
    const bound = data.length - at;
    let linkEnd = 1;
    while (linkEnd < bound && this.admitDomainChar(data, at + linkEnd, linkEnd === bound - 1)) {
      linkEnd += 1;
    }
    return linkEnd;
  }

  /** Accept the protocol whose `:` sits `rewind` before the `@`, if any. */
  private acceptProtocol(data: string, at: number, rewind: number, maxRewind: number): boolean {
    if (validateProtocol("mailto:", data, at, rewind, maxRewind)) {
      this.autoMailto = false;
      return true;
    }
    if (validateProtocol("xmpp:", data, at, rewind, maxRewind)) {
      this.autoMailto = false;
      this.isXmpp = true;
      return true;
    }
    return false;
  }

  /**
   * Whether the domain continues through `index`. A `.` counts only when an
   * alphanumeric follows it; `last` marks the run's final character, which
   * has nothing after it.
   */
  private admitDomainChar(data: string, index: number, last: boolean): boolean {
    const char = unitAt(data, index);
    if (reAlnum.test(char)) {
      return true;
    }
    if (char === "." && !last && reAlnum.test(unitAt(data, index + 1))) {
      this.dots += 1;
      return true;
    }
    return char === "-" || char === "_" || (char === "/" && this.isXmpp);
  }
}

/**
 * The first `@` at or after `from`, or `-1`.
 */
const nextAt: {
  (data: string, from: number): number;
  (from: number): (data: string) => number;
} = dual(2, (data: string, from: number): number => {
  reAt.lastIndex = from;
  return reAt.exec(data)?.index ?? -1;
});

/**
 * Scan the email candidate whose first `@` is `at`, scanning no further back
 * than `from`; append the link it forms, if any, and return where the next
 * search starts.
 *
 * **Details**
 *
 * The loop is upstream's `goto found_at`: when the domain scan runs into a
 * SECOND `@` the candidate is re-anchored on it rather than abandoned, which
 * is what makes `a@b@c.d` link `b@c.d`.
 */
const scanCandidate: {
  (data: string, from: number, at: number, matches: Array<EmailMatch>): number;
  (from: number, at: number, matches: Array<EmailMatch>): (data: string) => number;
} = dual(4, (data: string, from: number, at: number, matches: Array<EmailMatch>): number => {
  const candidate = new EmailCandidate();
  let floor = from;
  let anchor = at;
  while (true) {
    const rewind = candidate.rewindFrom(data, anchor, anchor - floor);
    if (rewind === 0) {
      return anchor + 1;
    }
    const linkEnd = candidate.domainFrom(data, anchor);
    if (unitAt(data, anchor + linkEnd) !== "@") {
      return finishCandidate(data, anchor, rewind, linkEnd, candidate, matches);
    }
    floor = anchor + 1;
    anchor += linkEnd;
  }
});

/**
 * Accept or reject a candidate whose domain ended at `anchor + linkEnd`, and
 * return where the next search starts.
 */
const finishCandidate = (
  data: string,
  anchor: number,
  rewind: number,
  linkEnd: number,
  candidate: EmailCandidate,
  matches: Array<EmailMatch>
): number => {
  const last = unitAt(data, anchor + linkEnd - 1);
  if (linkEnd < 2 || candidate.dots === 0 || (!reAlpha.test(last) && last !== ".")) {
    return anchor + linkEnd;
  }

  const from = anchor - rewind;
  const to = anchor + autolinkDelim(data, anchor, linkEnd);
  const text = Str.slice(from, to)(data);
  matches.push({ from, to, url: candidate.autoMailto ? `mailto:${text}` : text });
  return to;
};

/**
 * `postprocess_text`: every email address in one merged run of text.
 *
 * **Details**
 *
 * One absolute cursor replaces upstream's `start`/`offset`/`remaining`
 * triple: every index upstream builds is `start + offset` plus a local
 * distance, and `start + remaining` is always the run's length, so the
 * cursor and the candidate's `@` carry the same information.
 */
const scanEmails = (data: string): ReadonlyArray<EmailMatch> => {
  const matches: EmailMatch[] = [];
  let cursor = 0;
  while (cursor < data.length) {
    const at = nextAt(data, cursor);
    if (at === -1) {
      break;
    }
    cursor = scanCandidate(data, cursor, at, matches);
  }
  return matches;
};

/** One text node's contribution to a merged run. */
interface RunPiece {
  readonly node: InlineNode;
  readonly valueStart: number;
}

/** Replace a run of adjacent text nodes with the same text plus its email links. */
const linkifyRun = (pieces: ReadonlyArray<RunPiece>): void => {
  const merged = pipe(
    pieces,
    A.map((piece) => piece.node.value),
    A.join("")
  );
  const matches = scanEmails(merged);
  if (matches.length === 0) {
    return;
  }

  /**
   * The local content index a merged-run index came from.
   *
   * **Details**
   *
   * Exact whenever the contributing node's value is its source characters,
   * which is every node the text fallback produced. A node whose value was
   * DECODED — an entity, a backslash escape — is shorter than the source it
   * spans, so an index inside it clamps to that node's own range rather than
   * running past its end. An email address holds neither, so this is a
   * bound, not a rounding.
   */
  // Boundary queries are nondecreasing, including repeated exact ends.
  let pieceIndex = 0;
  const localAt = (index: number): number => {
    // The run is dense and nonempty; callers query only [0, merged.length].
    let piece = A.getUnsafe(pieces, pieceIndex);
    while (index > piece.valueStart + piece.node.value.length) {
      pieceIndex += 1;
      piece = A.getUnsafe(pieces, pieceIndex);
    }
    const within = index - piece.valueStart;
    return within === piece.node.value.length
      ? piece.node.end
      : piece.node.start + Math.min(within, piece.node.end - piece.node.start);
  };

  const replacements: InlineNode[] = [];
  let cursor = 0;

  const pushText: {
    (from: number, to: number): void;
    (to: number): (from: number) => void;
  } = dual(2, (from: number, to: number): void => {
    if (to <= from) {
      return;
    }
    replacements.push(makeInlineNode("text", localAt(from), localAt(to), Str.slice(from, to)(merged)));
  });

  for (const match of matches) {
    pushText(cursor, match.from);
    const start = localAt(match.from);
    const end = localAt(match.to);
    const link = makeInlineNode("link", start, end);
    link.data.url = match.url;
    appendChild(link, makeInlineNode("text", start, end, Str.slice(match.from, match.to)(merged)));
    replacements.push(link);
    cursor = match.to;
  }
  pushText(cursor, merged.length);

  // Splice after the run's last node, then drop the originals — the list has
  // no insert-before, and appending keeps the order without needing one.
  const lastPiece = A.getUnsafe(pieces, pieces.length - 1);
  let tail = lastPiece.node;
  for (const replacement of replacements) {
    insertAfter(tail, replacement);
    tail = replacement;
  }
  for (const piece of pieces) {
    unlink(piece.node);
  }
};

/**
 * Turn every bare email address in the finished list into a link.
 *
 * **Details**
 *
 * Iterative on purpose: this walks the tree emphasis and strikethrough just
 * built, whose depth the input controls, and the parser's depth cap does not
 * apply until materialization. A tree walk has no reason to recurse.
 *
 * **Example** (Linkify an email text node)
 *
 * ```ts
 * import { linkifyEmails } from "@beep/markdown/internal/inlines/autolinkLiteral"
 * import { appendChild, makeInlineNode } from "@beep/markdown/internal/inlineNode"
 *
 * const root = makeInlineNode("text", 0, 15)
 * appendChild(root, makeInlineNode("text", 0, 15, "ada@example.org"))
 * linkifyEmails(root)
 * console.log(root.firstChild?.type, root.firstChild?.data.url) // link mailto:ada@example.org
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const linkifyEmails = (root: InlineNode): void => {
  const pending: InlineNode[] = [root];
  while (pending.length > 0) {
    const container = A.getUnsafe(pending, pending.length - 1);
    pending.pop();
    linkifyContainer(container, pending);
  }
};

/**
 * Linkify every run of adjacent text children of `container`, queueing the
 * other children that may hold text of their own on `pending`.
 */
const linkifyContainer: {
  (container: InlineNode, pending: Array<InlineNode>): void;
  (pending: Array<InlineNode>): (container: InlineNode) => void;
} = dual(2, (container: InlineNode, pending: Array<InlineNode>): void => {
  let pieces: RunPiece[] = [];
  let valueLength = 0;

  for (const child of childrenOf(container)) {
    if (child.type === "text") {
      pieces.push({ node: child, valueStart: valueLength });
      valueLength += child.value.length;
      continue;
    }

    linkifyRun(pieces);
    pieces = [];
    valueLength = 0;
    // A formed link is closed to autolinking — upstream's `in_link`
    // flag, which is why `[foo@bar.baz](/x)` stays one link.
    if (child.type !== "link" && child.type !== "linkReference") {
      pending.push(child);
    }
  }

  linkifyRun(pieces);
});
