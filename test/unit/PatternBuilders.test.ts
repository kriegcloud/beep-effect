import { describe, it, expect } from "vitest";
import { pipe } from "effect";
import type {
  POSPatternElement} from "../../src/NLP/Core/index.js";
import {
  pos,
  entity,
  literal,
  optionalPos,
  optionalEntity,
  optionalLiteral,
  make,
  withMark,
  withoutMark,
  addElements,
  prependElements,
  withId,
  hasMark,
  getMark,
  length,
  elements,
  elementAt,
  isEmpty,
  head,
  last,
  mapElements,
  filterElements,
  take,
  drop,
  combine,
  applyPatch,
  composePatches,
  patchReplaceLiteralAt,
  patchReplaceAllLiterals,
  generalizeLiterals,
} from "../../src/NLP/Core/index.js";

// =========================================================================
// ELEMENT BUILDER TESTS
// =========================================================================

describe("Element Builders", () => {
  describe("pos", () => {
    it("should create POS element with spread syntax", () => {
      const element = pos("ADJ", "NOUN");
      expect(element._tag).toBe("POSPatternElement");
      expect(element.value).toEqual(["ADJ", "NOUN"]);
    });

    it("should create POS element with array syntax", () => {
      const element = pos(["ADJ", "NOUN"]);
      expect(element._tag).toBe("POSPatternElement");
      expect(element.value).toEqual(["ADJ", "NOUN"]);
    });

    it("should handle empty strings for optional elements", () => {
      const element = pos("", "ADJ");
      expect(element.value).toEqual(["", "ADJ"]);
    });
  });

  describe("entity", () => {
    it("should create entity element with spread syntax", () => {
      const element = entity("CARDINAL", "TIME");
      expect(element._tag).toBe("EntityPatternElement");
      expect(element.value).toEqual(["CARDINAL", "TIME"]);
    });

    it("should create entity element with array syntax", () => {
      const element = entity(["CARDINAL", "TIME"]);
      expect(element._tag).toBe("EntityPatternElement");
      expect(element.value).toEqual(["CARDINAL", "TIME"]);
    });
  });

  describe("literal", () => {
    it("should create literal element with spread syntax", () => {
      const element = literal("Apple", "Google");
      expect(element._tag).toBe("LiteralPatternElement");
      expect(element.value).toEqual(["Apple", "Google"]);
    });

    it("should create literal element with array syntax", () => {
      const element = literal(["Apple", "Google"]);
      expect(element._tag).toBe("LiteralPatternElement");
      expect(element.value).toEqual(["Apple", "Google"]);
    });

    it("should filter out empty strings", () => {
      const element = literal("Apple", "", "Google");
      expect(element.value).toEqual(["Apple", "Google"]);
    });

    it("should default to empty string if no valid values", () => {
      const element = literal("", "");
      expect(element.value).toEqual([""]);
    });
  });

  describe("optional element builders", () => {
    it("should create optional POS element", () => {
      const element = optionalPos("DET");
      expect(element.value).toEqual(["", "DET"]);
    });

    it("should create optional entity element", () => {
      const element = optionalEntity("CARDINAL");
      expect(element.value).toEqual(["", "CARDINAL"]);
    });

    it("should create optional literal element", () => {
      const element = optionalLiteral("the");
      expect(element.value).toEqual(["", "the"]);
    });
  });
});

// =========================================================================
// PATTERN CONSTRUCTION TESTS
// =========================================================================

describe("Pattern Construction", () => {
  describe("make", () => {
    it("should create pattern with data-first API", () => {
      const pattern = make("test-pattern", [pos("ADJ"), pos("NOUN")]);
      expect(pattern.id).toBe("test-pattern");
      expect(length(pattern)).toBe(2);
      expect(hasMark(pattern)).toBe(false);
    });

    it("should create pattern with data-last API", () => {
      const pattern = pipe([pos("ADJ"), pos("NOUN")], make("test-pattern"));
      expect(pattern.id).toBe("test-pattern");
      expect(length(pattern)).toBe(2);
    });
  });

  describe("withMark", () => {
    const basePattern = make("test", [pos("ADJ"), pos("NOUN")]);

    it("should add mark with data-first API", () => {
      const markedPattern = withMark(basePattern, [0, 1]);
      expect(hasMark(markedPattern)).toBe(true);
      expect(getMark(markedPattern)).toEqual([0, 1]);
    });

    it("should add mark with data-last API", () => {
      const markedPattern = pipe(basePattern, withMark([0, 1]));
      expect(hasMark(markedPattern)).toBe(true);
      expect(getMark(markedPattern)).toEqual([0, 1]);
    });
  });

  describe("withoutMark", () => {
    const markedPattern = withMark(make("test", [pos("ADJ")]), [0, 0]);

    it("should remove mark with data-first API", () => {
      const unmarkedPattern = withoutMark(markedPattern);
      expect(hasMark(unmarkedPattern)).toBe(false);
    });

    it("should remove mark with data-last API", () => {
      const unmarkedPattern = pipe(markedPattern, withoutMark());
      expect(hasMark(unmarkedPattern)).toBe(false);
    });
  });

  describe("addElements", () => {
    const basePattern = make("test", [pos("ADJ")]);

    it("should add elements with data-first API", () => {
      const extendedPattern = addElements(basePattern, [
        pos("NOUN"),
        literal("test"),
      ]);
      expect(length(extendedPattern)).toBe(3);
    });

    it("should add elements with data-last API", () => {
      const extendedPattern = pipe(
        basePattern,
        addElements([pos("NOUN"), literal("test")])
      );
      expect(length(extendedPattern)).toBe(3);
    });
  });

  describe("prependElements", () => {
    const basePattern = make("test", [pos("NOUN")]);

    it("should prepend elements with data-first API", () => {
      const extendedPattern = prependElements(basePattern, [pos("ADJ")]);
      const elems = elements(extendedPattern);
      expect(length(extendedPattern)).toBe(2);
      expect((elems[0] as POSPatternElement).value).toEqual(["ADJ"]);
      expect((elems[1] as POSPatternElement).value).toEqual(["NOUN"]);
    });

    it("should prepend elements with data-last API", () => {
      const extendedPattern = pipe(basePattern, prependElements([pos("ADJ")]));
      const elems = elements(extendedPattern);
      expect(length(extendedPattern)).toBe(2);
      expect((elems[0] as POSPatternElement).value).toEqual(["ADJ"]);
    });
  });

  describe("withId", () => {
    const basePattern = make("old-id", [pos("ADJ")]);

    it("should update ID with data-first API", () => {
      const renamedPattern = withId(basePattern, "new-id");
      expect(renamedPattern.id).toBe("new-id");
    });

    it("should update ID with data-last API", () => {
      const renamedPattern = pipe(basePattern, withId("new-id"));
      expect(renamedPattern.id).toBe("new-id");
    });
  });
});

// =========================================================================
// PATTERN INSPECTION TESTS
// =========================================================================

describe("Pattern Inspection", () => {
  const testPattern = make("test", [pos("ADJ"), pos("NOUN"), literal("test")]);
  const markedPattern = withMark(testPattern, [0, 1]);
  const emptyPattern = make("empty", []);

  describe("basic properties", () => {
    it("should get pattern length", () => {
      expect(length(testPattern)).toBe(3);
      expect(length(emptyPattern)).toBe(0);
    });

    it("should check if pattern is empty", () => {
      expect(isEmpty(testPattern)).toBe(false);
      expect(isEmpty(emptyPattern)).toBe(true);
    });

    it("should get pattern elements", () => {
      const elems = elements(testPattern);
      expect(elems).toHaveLength(3);
      expect(elems[0]._tag).toBe("POSPatternElement");
      expect(elems[2]._tag).toBe("LiteralPatternElement");
    });
  });

  describe("mark inspection", () => {
    it("should detect mark presence", () => {
      expect(hasMark(testPattern)).toBe(false);
      expect(hasMark(markedPattern)).toBe(true);
    });

    it("should get mark range", () => {
      expect(getMark(testPattern)).toBeUndefined();
      expect(getMark(markedPattern)).toEqual([0, 1]);
    });
  });

  describe("element access", () => {
    it("should get element at specific index", () => {
      const elem = elementAt(testPattern, 1);
      expect(elem?._tag).toBe("POSPatternElement");
      expect((elem as POSPatternElement)?.value).toEqual(["NOUN"]);
    });

    it("should return undefined for out-of-bounds index", () => {
      expect(elementAt(testPattern, 10)).toBeUndefined();
      expect(elementAt(emptyPattern, 0)).toBeUndefined();
    });

    it("should get first element", () => {
      const firstElem = head(testPattern);
      expect(firstElem?._tag).toBe("POSPatternElement");
      expect(head(emptyPattern)).toBeUndefined();
    });

    it("should get last element", () => {
      const lastElem = last(testPattern);
      expect(lastElem?._tag).toBe("LiteralPatternElement");
      expect(last(emptyPattern)).toBeUndefined();
    });
  });
});

// =========================================================================
// PATTERN TRANSFORMATION TESTS
// =========================================================================

describe("Pattern Transformation", () => {
  const testPattern = make("test", [pos("ADJ"), pos("NOUN"), literal("test")]);

  describe("mapElements", () => {
    it("should map elements with data-first API", () => {
      const mappedPattern = mapElements(testPattern, (elem, index) => {
        if (elem._tag === "POSPatternElement" && index === 0) {
          return pos("VERB");
        }
        return elem;
      });

      const firstElem = elementAt(mappedPattern, 0) as POSPatternElement;
      expect(firstElem.value).toEqual(["VERB"]);
    });

    it("should map elements with data-last API", () => {
      const mappedPattern = pipe(
        testPattern,
        mapElements((elem) =>
          elem._tag === "POSPatternElement" ? pos("VERB") : elem
        )
      );

      const firstElem = elementAt(mappedPattern, 0) as POSPatternElement;
      expect(firstElem.value).toEqual(["VERB"]);
    });
  });

  describe("Patching DSL", () => {
    it("applyPatch should replace literal at index", () => {
      const p = make("id", [literal("hello"), pos("NOUN")]);
      const patched = applyPatch(
        p,
        patchReplaceLiteralAt(0, () => entity("URL"))
      );
      const arr = elements(patched);
      expect(arr[0]._tag).toBe("EntityPatternElement");
    });

    it("composePatches should compose multiple literal replacements", () => {
      const p = make("id", [literal("a"), literal("b"), pos("NOUN")]);
      const patch = composePatches(
        patchReplaceLiteralAt(0, () => pos("ADJ")),
        patchReplaceLiteralAt(1, () => entity("DATE"))
      );
      const out = applyPatch(p, patch);
      const arr = elements(out);
      expect(arr[0]._tag).toBe("POSPatternElement");
      expect(arr[1]._tag).toBe("EntityPatternElement");
    });

    it("patchReplaceAllLiterals should transform every literal", () => {
      const p = make("id", [literal("x"), pos("VERB"), literal("y")]);
      const out = applyPatch(
        p,
        patchReplaceAllLiterals(() => pos("ADV"))
      );
      const arr = elements(out);
      expect(arr[0]._tag).toBe("POSPatternElement");
      expect(arr[2]._tag).toBe("POSPatternElement");
    });

    it("generalizeLiterals (data-last) constant element", () => {
      const p = make("id", [literal("apple"), literal("google")]);
      const out = generalizeLiterals(pos("NOUN"))(p);
      const arr = elements(out);
      expect(arr[0]._tag).toBe("POSPatternElement");
      expect(arr[1]._tag).toBe("POSPatternElement");
    });

    it("generalizeLiterals (data-first) with function", () => {
      const p = make("id", [literal("apple"), literal("2010")]);
      const out = generalizeLiterals(p, (values) =>
        values[0] && /\d/.test(values[0]) ? entity("DATE") : pos("NOUN")
      );
      const arr = elements(out);
      expect(arr[0]._tag).toBe("POSPatternElement");
      expect(arr[1]._tag).toBe("EntityPatternElement");
    });
  });

  describe("filterElements", () => {
    it("should filter elements with data-first API", () => {
      const filteredPattern = filterElements(
        testPattern,
        (elem) => elem._tag === "POSPatternElement"
      );
      expect(length(filteredPattern)).toBe(2);
    });

    it("should filter elements with data-last API", () => {
      const filteredPattern = pipe(
        testPattern,
        filterElements((elem) => elem._tag !== "LiteralPatternElement")
      );
      expect(length(filteredPattern)).toBe(2);
    });
  });

  describe("take", () => {
    it("should take first n elements with data-first API", () => {
      const takenPattern = take(testPattern, 2);
      expect(length(takenPattern)).toBe(2);
    });

    it("should take first n elements with data-last API", () => {
      const takenPattern = pipe(testPattern, take(1));
      expect(length(takenPattern)).toBe(1);
      expect(elementAt(takenPattern, 0)?._tag).toBe("POSPatternElement");
    });
  });

  describe("drop", () => {
    it("should drop first n elements with data-first API", () => {
      const droppedPattern = drop(testPattern, 1);
      expect(length(droppedPattern)).toBe(2);
      expect(elementAt(droppedPattern, 0)?._tag).toBe("POSPatternElement");
    });

    it("should drop first n elements with data-last API", () => {
      const droppedPattern = pipe(testPattern, drop(2));
      expect(length(droppedPattern)).toBe(1);
      expect(elementAt(droppedPattern, 0)?._tag).toBe("LiteralPatternElement");
    });
  });
});

// =========================================================================
// PATTERN COMBINATION TESTS
// =========================================================================

describe("Pattern Combination", () => {
  const pattern1 = make("pattern1", [pos("ADJ")]);
  const pattern2 = make("pattern2", [pos("NOUN")]);

  describe("combine", () => {
    it("should combine patterns with data-first API", () => {
      const combinedPattern = combine(pattern1, pattern2, "combined");
      expect(combinedPattern.id).toBe("combined");
      expect(length(combinedPattern)).toBe(2);
    });

    it("should combine patterns with data-last API", () => {
      const combinedPattern = pipe(pattern1, combine(pattern2, "combined"));
      expect(combinedPattern.id).toBe("combined");
      expect(length(combinedPattern)).toBe(2);
    });
  });
});
