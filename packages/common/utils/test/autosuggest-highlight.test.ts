import { describe, expect, it } from "bun:test";
import { match, parse } from "@beep/utils/autosuggest-highlight";

describe("match without options", () => {
  it("should highlight at the beginning of a word", () => {
    expect(match("some text", "te")).toEqual([[5, 7]]);
  });

  it("should not highlight at the middle of a word if third parameter is not passed or is set to false value", () => {
    expect(match("some text", "e")).toEqual([]);
  });

  it("should highlight only the first match by default", () => {
    expect(match("some sweet text", "s")).toEqual([[0, 1]]);
  });

  it("should highlight all the matches when query has multiple words", () => {
    expect(match("some sweet text", "s s")).toEqual([
      [0, 1],
      [5, 6],
    ]);
  });

  it("should highlight when case doesn't match", () => {
    expect(match("Some Text", "t")).toEqual([[5, 6]]);
  });

  it("should remove diacritics when highlighting", () => {
    expect(match("Déjà vu", "deja")).toEqual([[0, 4]]);
  });

  it("should highlight diacritics", () => {
    expect(match("Déjà vu", "déjà")).toEqual([[0, 4]]);
  });

  it("should sort the matches", () => {
    expect(match("Albert Einstein", "e a")).toEqual([
      [0, 1],
      [7, 8],
    ]);
  });

  it("should highlight special characters", () => {
    expect(match("this & doesn't, (makesense) or is-it?", "(makesense) doesn't, is-it? &")).toEqual([
      [5, 6],
      [7, 15],
      [16, 27],
      [31, 37],
    ]);
  });

  it("should ignore whitespaces in query", () => {
    expect(match("Very nice day", "\td   \n\n ver \t\t   ni \n")).toEqual([
      [0, 3],
      [5, 7],
      [10, 11],
    ]);
  });

  it("should not highlight anything if the query is blank", () => {
    expect(match("Very nice day", " ")).toEqual([]);
  });

  it("should not merge the matches", () => {
    expect(match("Very nice day", "very nice day")).toEqual([
      [0, 4],
      [5, 9],
      [10, 13],
    ]);
  });

  it("should partially highlight", () => {
    expect(match("some text", "s sweet")).toEqual([[0, 1]]);
  });

  it("should adjust indexes per original text with diacritics", () => {
    expect(match("œuvre pompes test", "pompes")).toEqual([[6, 12]]);
  });

  it("should adjust indexes per original text if query typed with diacritics", () => {
    expect(match("œuvre pompes test", "œuvre")).toEqual([[0, 5]]);
  });

  it("should adjust indexes per original text if query typed without diacritics", () => {
    expect(match("œuvre pompes test", "oeuvre")).toEqual([[0, 5]]);
  });

  it("should match if diacritic is typed", () => {
    expect(match("œuvre", "œ")).toEqual([[0, 1]]);
  });

  it("should match if diacritic is not typed", () => {
    expect(match("œuvre", "oe")).toEqual([[0, 1]]);
  });

  it("should not match if part of diacritic is typed", () => {
    expect(match("œuvre", "o")).toEqual([]);
  });

  it("should match beginning of second word including diacritic character", () => {
    expect(match("ma sœur", "soe")).toEqual([[3, 5]]);
  });

  it("should not match entire diacritic character in middle of word if part of diacritic is typed", () => {
    expect(match("ma sœur", "so")).toEqual([[3, 4]]);
  });
});

describe("match with options", () => {
  it("should highlight at the middle of a word", () => {
    expect(match("some text", "e", { insideWords: true })).toEqual([[3, 4]]);
  });

  it("should highlight at the end of a word", () => {
    expect(match("some text", "me", { insideWords: true })).toEqual([[2, 4]]);
  });

  it("should match single unicode character inside word", () => {
    expect(match("ma sœur", "oe", { insideWords: true })).toEqual([[4, 5]]);
  });

  it("should highlight all the matches at the beginning of a word", () => {
    expect(match("some sweet text", "s", { findAllOccurrences: true })).toEqual([
      [0, 1],
      [5, 6],
    ]);
  });

  it("should highlight all the matches inside words", () => {
    expect(
      match("some sweet text", "e", {
        insideWords: true,
        findAllOccurrences: true,
      })
    ).toEqual([
      [3, 4],
      [7, 8],
      [8, 9],
      [12, 13],
    ]);
  });

  it("should not highlight anything", () => {
    expect(match("some text", "s sweet", { requireMatchAll: true })).toEqual([]);
  });

  it("should highlight all words in query", () => {
    expect(match("some sweet text", "s sweet", { requireMatchAll: true })).toEqual([
      [0, 1],
      [5, 10],
    ]);
  });

  it("should highlight case-insensitive with cyrillic letters", () => {
    expect(match("БАЗИЛИК", "базил", { requireMatchAll: true })).toEqual([[0, 5]]);
  });
});

describe("parse", () => {
  it("should highlight a single partial match", () => {
    expect(parse("Hello world", [[0, 4]])).toEqual([
      {
        text: "Hell",
        highlight: true,
      },
      {
        text: "o world",
        highlight: false,
      },
    ]);
  });

  it("should highlight a single complete match", () => {
    expect(parse("Hello world", [[0, 11]])).toEqual([
      {
        text: "Hello world",
        highlight: true,
      },
    ]);
  });

  it("should highlight multiple non-consecutive matches", () => {
    expect(
      parse("Hello world", [
        [2, 4],
        [6, 8],
      ])
    ).toEqual([
      {
        text: "He",
        highlight: false,
      },
      {
        text: "ll",
        highlight: true,
      },
      {
        text: "o ",
        highlight: false,
      },
      {
        text: "wo",
        highlight: true,
      },
      {
        text: "rld",
        highlight: false,
      },
    ]);
  });

  it("should highlight multiple consecutive matches", () => {
    expect(
      parse("Hello world", [
        [2, 4],
        [4, 8],
      ])
    ).toEqual([
      {
        text: "He",
        highlight: false,
      },
      {
        text: "ll",
        highlight: true,
      },
      {
        text: "o wo",
        highlight: true,
      },
      {
        text: "rld",
        highlight: false,
      },
    ]);
  });

  it("should not highlight the text if there are no matches", () => {
    expect(parse("Hello world", [])).toEqual([
      {
        text: "Hello world",
        highlight: false,
      },
    ]);
  });

  it("should highlight second word when first word contains œ", () => {
    expect(parse("œuvre pompes test", [[6, 12]])).toEqual([
      {
        text: "œuvre ",
        highlight: false,
      },
      {
        text: "pompes",
        highlight: true,
      },
      {
        text: " test",
        highlight: false,
      },
    ]);
  });

  it("should highlight only first word that contains œ", () => {
    expect(parse("œuvre pompes test", [[0, 5]])).toEqual([
      {
        text: "œuvre",
        highlight: true,
      },
      {
        text: " pompes test",
        highlight: false,
      },
    ]);
  });
});
