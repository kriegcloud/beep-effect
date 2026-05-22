const BRACKET_NOTATION_REGEX = /\[(\d+)]/g;

interface StandardPathSegment {
  readonly key: PropertyKey;
}

const getPathSegmentKey = (segment: PropertyKey | StandardPathSegment): PropertyKey =>
  typeof segment === "object" && segment !== null ? segment.key : segment;

export const schemaPathToFieldPath = (path: ReadonlyArray<PropertyKey | StandardPathSegment> | undefined): string => {
  if (path === undefined) return "";
  if (path.length === 0) return "";

  const first = path[0];
  if (first === undefined) return "";

  let result = String(getPathSegmentKey(first));
  for (let i = 1; i < path.length; i++) {
    const segment = path[i];
    if (segment === undefined) continue;
    const segmentKey = getPathSegmentKey(segment);
    if (typeof segmentKey === "number") {
      result += `[${segmentKey}]`;
    } else {
      result += `.${String(segmentKey)}`;
    }
  }
  return result;
};

export const isPathUnderRoot = (path: string, rootPath: string): boolean =>
  path === rootPath || path.startsWith(`${rootPath}.`) || path.startsWith(`${rootPath}[`);

export const isPathOrParentDirty = (dirtyFields: ReadonlySet<string>, path: string): boolean => {
  if (dirtyFields.has(path)) return true;

  let parent = path;
  while (true) {
    const lastDot = parent.lastIndexOf(".");
    const lastBracket = parent.lastIndexOf("[");
    const splitIndex = Math.max(lastDot, lastBracket);

    if (splitIndex === -1) break;

    parent = parent.substring(0, splitIndex);
    if (dirtyFields.has(parent)) return true;
  }

  return false;
};

export const getNestedValue = (obj: unknown, path: string): unknown => {
  if (path === "") return obj;
  const parts = path.replace(BRACKET_NOTATION_REGEX, ".$1").split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

export const setNestedValue = <T>(obj: T, path: string, value: unknown): T => {
  if (path === "") return value as T;
  const parts = path.replace(BRACKET_NOTATION_REGEX, ".$1").split(".");
  const result = { ...obj } as Record<string, unknown>;

  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part === undefined) continue;
    if (Array.isArray(current[part])) {
      current[part] = [...(current[part] as Array<unknown>)];
    } else {
      current[part] = { ...(current[part] as Record<string, unknown>) };
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart !== undefined) {
    current[lastPart] = value;
  }
  return result as T;
};
