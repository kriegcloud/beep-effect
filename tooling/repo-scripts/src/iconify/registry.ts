import { FsUtils } from "@beep/tooling-utils/FsUtils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";

export const ICONIFY_REGISTRY_PATH = "packages/ui-core/src/constants/iconify/icon-sets.ts" as const;

export interface IconRegistryAddition {
  readonly name: string;
  readonly body: string;
  readonly setLabel?: string;
}

export interface MergeRegistryContentResult {
  readonly content: string;
  readonly added: ReadonlyArray<string>;
  readonly duplicates: ReadonlyArray<string>;
  readonly updated: boolean;
}

export interface MergeRegistryFileOptions {
  readonly additions: ReadonlyArray<IconRegistryAddition>;
  readonly path?: string;
}

type Segment = CommentSegment | EntrySegment | RawSegment;

interface CommentSegment {
  readonly kind: "comment";
  readonly lines: ReadonlyArray<string>;
  readonly label?: string;
}

interface EntrySegment {
  readonly kind: "entry";
  readonly key: string;
  readonly prefix: string;
  readonly lines: ReadonlyArray<string>;
}

interface RawSegment {
  readonly kind: "raw";
  readonly lines: ReadonlyArray<string>;
}

interface RegistryDocument {
  readonly header: ReadonlyArray<string>;
  readonly segments: ReadonlyArray<Segment>;
  readonly footer: ReadonlyArray<string>;
}

interface MergeState {
  readonly document: RegistryDocument;
  readonly keys: HashSet.HashSet<string>;
  readonly added: ReadonlyArray<string>;
  readonly duplicates: ReadonlyArray<string>;
}

const entryStartRegex = /^\s*"([^"]+)":/u;

const appendLine = (lines: ReadonlyArray<string>, line: string): ReadonlyArray<string> =>
  F.pipe(lines, A.append(line)) as ReadonlyArray<string>;

const appendSegment = (segments: ReadonlyArray<Segment>, segment: Segment): ReadonlyArray<Segment> =>
  F.pipe(segments, A.append(segment)) as ReadonlyArray<Segment>;

const appendSegments = (segments: ReadonlyArray<Segment>, extra: ReadonlyArray<Segment>): ReadonlyArray<Segment> =>
  F.pipe(segments, A.appendAll(extra)) as ReadonlyArray<Segment>;

const appendString = (values: ReadonlyArray<string>, value: string): ReadonlyArray<string> =>
  F.pipe(values, A.append(value)) as ReadonlyArray<string>;

const isCommentStart = (line: string): boolean => F.pipe(line, Str.startsWith("/**"));

const isFooterStart = (line: string): boolean => F.pipe(line, Str.startsWith("}"));

const entryKeyFromLine = (line: string): O.Option<string> =>
  F.pipe(
    Str.match(entryStartRegex)(line),
    O.flatMap((match) => A.get(1)(match))
  );

const prefixFromKey = (key: string): string =>
  F.pipe(Str.split(":")(key), (parts) =>
    F.pipe(
      A.get(0)(parts),
      O.getOrElse(() => key)
    )
  );

const countOccurrences = (search: string) => (line: string) =>
  F.pipe(Str.split(search)(line), A.length, (length) => length - 1);

const collectComment = (
  remaining: ReadonlyArray<string>,
  acc: ReadonlyArray<string>
): { readonly lines: ReadonlyArray<string>; readonly rest: ReadonlyArray<string> } =>
  F.pipe(
    remaining,
    A.match({
      onEmpty: () => ({ lines: acc, rest: [] as ReadonlyArray<string> }),
      onNonEmpty: (self) => {
        const [head, ...tailArray] = self;
        const tail = tailArray as ReadonlyArray<string>;
        const nextAcc = appendLine(acc, head);
        const trimmed = Str.trim(head);
        return F.pipe(Str.endsWith("*/")(trimmed), (isClosing) =>
          isClosing ? { lines: nextAcc, rest: tail } : collectComment(tail, nextAcc)
        );
      },
    })
  );

const collectEntry = (
  remaining: ReadonlyArray<string>,
  acc: ReadonlyArray<string>,
  depth: number
): { readonly lines: ReadonlyArray<string>; readonly rest: ReadonlyArray<string> } =>
  F.pipe(
    remaining,
    A.match({
      onEmpty: () => ({ lines: acc, rest: [] as ReadonlyArray<string> }),
      onNonEmpty: (self) => {
        const [head, ...tailArray] = self;
        const tail = tailArray as ReadonlyArray<string>;
        const nextAcc = appendLine(acc, head);
        const opens = countOccurrences("{")(head);
        const closes = countOccurrences("}")(head);
        const nextDepth = depth + opens - closes;
        const trimmed = Str.trim(head);
        const terminate = nextDepth <= 0 && (F.pipe(trimmed, Str.endsWith("}")) || F.pipe(trimmed, Str.endsWith("},")));
        return terminate ? { lines: nextAcc, rest: tail } : collectEntry(tail, nextAcc, nextDepth);
      },
    })
  );

const extractSetLabel = (lines: ReadonlyArray<string>): O.Option<string> =>
  F.pipe(
    lines,
    A.findFirst((line) => F.pipe(line, Str.includes("@set"))),
    O.flatMap((line) => {
      const trimmed = Str.trim(line);
      return F.pipe(
        Str.indexOf("@set ")(trimmed),
        O.map((index) => F.pipe(Str.substring(index + 5)(trimmed), Str.trim))
      );
    }),
    O.filter(Str.isNonEmpty)
  );

const takeHeader = (
  remaining: ReadonlyArray<string>,
  acc: ReadonlyArray<string>
): { readonly header: ReadonlyArray<string>; readonly rest: ReadonlyArray<string> } =>
  F.pipe(
    remaining,
    A.match({
      onEmpty: () => ({ header: acc, rest: [] as ReadonlyArray<string> }),
      onNonEmpty: (self) => {
        const [head, ...tailArray] = self;
        const tail = tailArray as ReadonlyArray<string>;
        const trimmed = Str.trim(head);
        if (isCommentStart(trimmed) || O.isSome(entryKeyFromLine(head)) || isFooterStart(trimmed)) {
          return { header: acc, rest: remaining };
        }
        return takeHeader(tail, appendLine(acc, head));
      },
    })
  );

const parseSegments = (
  remaining: ReadonlyArray<string>,
  acc: ReadonlyArray<Segment>
): { readonly segments: ReadonlyArray<Segment>; readonly footer: ReadonlyArray<string> } =>
  F.pipe(
    remaining,
    A.match({
      onEmpty: () => ({ segments: acc, footer: [] as ReadonlyArray<string> }),
      onNonEmpty: (self) => {
        const [head, ...tailArray] = self;
        const tail = tailArray as ReadonlyArray<string>;
        const trimmed = Str.trim(head);

        if (isFooterStart(trimmed)) {
          return { segments: acc, footer: remaining };
        }

        if (isCommentStart(trimmed)) {
          const { lines, rest } = collectComment(remaining, [] as ReadonlyArray<string>);
          const label = O.getOrUndefined(extractSetLabel(lines));
          const commentSegment: CommentSegment = {
            kind: "comment",
            lines,
            label,
          };
          return parseSegments(rest, appendSegment(acc, commentSegment));
        }

        const keyOption = entryKeyFromLine(head);
        if (O.isSome(keyOption)) {
          const { lines, rest } = collectEntry(remaining, [] as ReadonlyArray<string>, 0);
          const key = keyOption.value;
          const entrySegment: EntrySegment = {
            kind: "entry",
            key,
            prefix: prefixFromKey(key),
            lines,
          };
          return parseSegments(rest, appendSegment(acc, entrySegment));
        }

        const rawSegment: RawSegment = { kind: "raw", lines: [head] };
        return parseSegments(tail, appendSegment(acc, rawSegment));
      },
    })
  );

const parseDocument = (content: string): RegistryDocument => {
  const lines = Str.split("\n")(content);
  const { header, rest } = takeHeader(lines, [] as ReadonlyArray<string>);
  const { segments, footer } = parseSegments(rest, [] as ReadonlyArray<Segment>);
  return { header, segments, footer };
};

const flattenSegmentLines = (segments: ReadonlyArray<Segment>): ReadonlyArray<string> =>
  F.pipe(
    segments,
    A.flatMap((segment) => segment.lines)
  );

const serializeDocument = (document: RegistryDocument): string => {
  const bodyLines = flattenSegmentLines(document.segments);
  const combined = F.pipe(document.header, A.appendAll(bodyLines), A.appendAll(document.footer));
  return A.join("\n")(combined);
};

const adjustTrailingCommaLine = (line: string, shouldHaveComma: boolean): string => {
  const trimmedEnd = Str.trimEnd(line);
  const normalized = F.pipe(trimmedEnd, Str.replace(/,+$/u, ""));
  const withComma = shouldHaveComma ? F.pipe(normalized, Str.concat(",")) : normalized;
  const totalLength = Str.length(line);
  const trimmedLength = Str.length(trimmedEnd);
  const whitespaceLength = totalLength - trimmedLength;
  if (whitespaceLength <= 0) {
    return withComma;
  }
  const suffix = Str.slice(trimmedLength, totalLength)(line);
  return F.pipe(withComma, Str.concat(suffix));
};

const setTrailingComma = (lines: ReadonlyArray<string>, shouldHaveComma: boolean): ReadonlyArray<string> =>
  F.pipe(
    lines,
    A.matchRight({
      onEmpty: () => lines,
      onNonEmpty: (init, last) =>
        appendLine(init as ReadonlyArray<string>, adjustTrailingCommaLine(last, shouldHaveComma)),
    })
  );

const isBlankSegment = (segment: Segment): boolean =>
  segment.kind === "raw" &&
  F.pipe(
    segment.lines,
    A.every((line) => F.pipe(line, Str.trim, Str.isEmpty))
  );

const needsBlankSeparator = (segments: ReadonlyArray<Segment>): boolean =>
  F.pipe(
    segments,
    A.matchRight({
      onEmpty: () => false,
      onNonEmpty: (_, last) => !isBlankSegment(last),
    })
  );

const normalizeTrailingCommas = (segments: ReadonlyArray<Segment>): ReadonlyArray<Segment> => {
  const lastEntryIndexOption = A.findLastIndex(segments, (segment) => segment.kind === "entry");
  if (O.isNone(lastEntryIndexOption)) {
    return segments;
  }
  const lastEntryIndex = lastEntryIndexOption.value;
  const finalState = F.pipe(
    segments,
    A.reduce(
      {
        index: 0,
        acc: [] as ReadonlyArray<Segment>,
      },
      (state, segment) => {
        const updatedSegment: Segment =
          segment.kind === "entry"
            ? { ...segment, lines: setTrailingComma(segment.lines, state.index !== lastEntryIndex) }
            : segment;
        return {
          index: state.index + 1,
          acc: appendSegment(state.acc, updatedSegment),
        };
      }
    )
  );
  return finalState.acc;
};

const makeCommentSegment = (label: string): CommentSegment => ({
  kind: "comment",
  lines: ["  /**", F.pipe("   * @set ", Str.concat(label)), "   */"],
  label,
});

const makeBlankSegment = (): RawSegment => ({ kind: "raw", lines: [""] });

const makeEntrySegment = (addition: IconRegistryAddition): EntrySegment => {
  const prefix = prefixFromKey(addition.name);
  const bodyLiteral = JSON.stringify(addition.body);
  const bodyLine = F.pipe("    body: ", Str.concat(bodyLiteral), Str.concat(","));
  const lines: ReadonlyArray<string> = [`  "${addition.name}": {`, bodyLine, "  },"];
  return { kind: "entry", key: addition.name, prefix, lines };
};

const insertEntry = (document: RegistryDocument, addition: IconRegistryAddition): RegistryDocument => {
  const newEntry = makeEntrySegment(addition);
  const existingIndexOption = A.findLastIndex(
    document.segments,
    (segment) => segment.kind === "entry" && segment.prefix === newEntry.prefix
  );

  if (O.isSome(existingIndexOption)) {
    const insertionIndex = existingIndexOption.value + 1;
    const [before, after] = A.splitAt(document.segments, insertionIndex);
    const merged = appendSegments(appendSegment(before, newEntry), after);
    return {
      ...document,
      segments: normalizeTrailingCommas(merged),
    };
  }

  const label = F.pipe(
    addition.setLabel,
    O.fromNullable,
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.getOrElse(() => newEntry.prefix)
  );

  const commentSegment = makeCommentSegment(label);
  const segmentsWithBlank = needsBlankSeparator(document.segments)
    ? appendSegment(document.segments, makeBlankSegment())
    : document.segments;
  const withComment = appendSegment(segmentsWithBlank, commentSegment);
  const withEntry = appendSegment(withComment, newEntry);

  return {
    ...document,
    segments: normalizeTrailingCommas(withEntry),
  };
};

const processAddition = (state: MergeState, addition: IconRegistryAddition): MergeState => {
  if (HashSet.has(state.keys, addition.name)) {
    return {
      ...state,
      duplicates: appendString(state.duplicates, addition.name),
    };
  }

  const nextDocument = insertEntry(state.document, addition);
  return {
    document: nextDocument,
    keys: HashSet.add(state.keys, addition.name),
    added: appendString(state.added, addition.name),
    duplicates: state.duplicates,
  };
};

export const mergeRegistryContent = (
  originalContent: string,
  additionsInput: ReadonlyArray<IconRegistryAddition>
): MergeRegistryContentResult => {
  const additions = A.fromIterable(additionsInput);

  if (A.isEmptyReadonlyArray(additions)) {
    return {
      content: originalContent,
      added: [] as ReadonlyArray<string>,
      duplicates: [] as ReadonlyArray<string>,
      updated: false,
    };
  }

  const document = parseDocument(originalContent);

  const initialKeys = F.pipe(
    document.segments,
    A.reduce(HashSet.empty<string>(), (set, segment) =>
      segment.kind === "entry" ? HashSet.add(set, segment.key) : set
    )
  );

  const initialState: MergeState = {
    document,
    keys: initialKeys,
    added: [] as ReadonlyArray<string>,
    duplicates: [] as ReadonlyArray<string>,
  };

  const finalState = F.pipe(additions, A.reduce(initialState, processAddition));

  const normalizedDocument: RegistryDocument = {
    ...finalState.document,
    segments: normalizeTrailingCommas(finalState.document.segments),
  };

  const content = serializeDocument(normalizedDocument);

  return {
    content,
    added: finalState.added,
    duplicates: finalState.duplicates,
    updated: content !== originalContent,
  };
};

export const mergeRegistryFile = ({ additions, path = ICONIFY_REGISTRY_PATH }: MergeRegistryFileOptions) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;

    let outcome: MergeRegistryContentResult | undefined;

    yield* fsUtils.modifyFile(path, (content) => {
      const result = mergeRegistryContent(content, additions);
      outcome = result;
      return result.content;
    });

    return (
      outcome ?? {
        content: "",
        added: [] as ReadonlyArray<string>,
        duplicates: [] as ReadonlyArray<string>,
        updated: false,
      }
    );
  });
