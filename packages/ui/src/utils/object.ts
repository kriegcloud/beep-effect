export function hasKeys<T>(obj: T | null | undefined, keys: (keyof T | string)[]): boolean {
  if (!obj || !keys.length || typeof obj !== "object") {
    return false;
  }

  return keys.every((key) => key in obj);
}
