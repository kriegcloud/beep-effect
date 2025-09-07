import { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as Str from "effect/String";
import isEmpty from "lodash/isEmpty";
import range from "lodash/range";

export const composePaths = (path1: string, path2: string) => {
  let p1 = path1;
  if (!isEmpty(path1) && !isEmpty(path2) && !path2.startsWith("[")) {
    p1 = `${path1}.`;
  }

  if (isEmpty(p1)) {
    return path2;
  }
  if (isEmpty(path2)) {
    return p1;
  }
  return `${p1}${path2}`;
};

/**
 * Convert a schema path (i.e. JSON pointer) to an array by splitting
 * at the '/' character and removing all schema-specific keywords.
 *
 * The returned value can be used to de-reference a root object by folding over it
 * and de-referencing the single segments to obtain a new object.
 *
 *
 * @param {string} schemaPath the schema path to be converted
 * @returns {string[]} an array containing only non-schema-specific segments
 */
export const toDataPathSegments = (schemaPath: string): Array<string> => {
  const s = schemaPath
    .replace(BS.Regex.make(/(anyOf|allOf|oneOf)\/\d+\//g), "")
    .replace(BS.Regex.make(/(then|else)\//g), "");

  const segments = Str.split("/")(s);

  const decodedSegments = segments.map(decode);

  const startFromRoot = decodedSegments[0] === "#" || decodedSegments[0] === "";
  const startIndex = startFromRoot ? 2 : 1;
  return range(startIndex, decodedSegments.length, 2).map((idx) =>
    O.fromNullable(decodedSegments[idx]).pipe(O.getOrThrow)
  );
};

/**
 * Convert a schema path (i.e. JSON pointer) to a data path.
 *
 * Data paths can be used in field change event handlers like handleChange.
 *
 * @example
 * toDataPath('#/properties/foo/properties/bar') === 'foo.bar')
 *
 * @param {string} schemaPath the schema path to be converted
 * @returns {string} the data path
 */
export const toDataPath = (schemaPath: string): string => {
  return toDataPathSegments(schemaPath).join(".");
};

/**
 * Encodes the given segment to be used as part of a JSON Pointer
 *
 * JSON Pointer has special meaning for "/" and "~", therefore these must be encoded
 */
export const encode = (segment: string) => segment.replace(/~/g, "~0").replace(/\//g, "~1");

/**
 * Decodes a given JSON Pointer segment to its "normal" representation
 */
export const decode = (pointerSegment: string) => pointerSegment?.replace(/~1/g, "/").replace(/~0/, "~");

/**
 * Transform a dotted path to a uiSchema properties path
 * @param path a dotted prop path to a schema value (i.e. articles.comment.author)
 * @return the uiSchema properties path (i.e. /properties/articles/properties/comment/properties/author)
 */
export const getPropPath = (path: string): string => {
  return `/properties/${Str.split(".")(path).map(encode).join("/properties/")}`;
};
