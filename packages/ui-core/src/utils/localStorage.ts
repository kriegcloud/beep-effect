export function getStorage<T>(key: string, defaultValue?: T): T | null | undefined {
  if (!localStorageAvailable()) {
    return defaultValue ?? null;
  }

  const storedValue = localStorage.getItem(key);

  if (storedValue === "undefined") {
    return undefined as T;
  }

  if (storedValue) {
    try {
      // value as object
      return JSON.parse(storedValue) as T;
    } catch {
      // value as string
      return (storedValue as unknown as T) ?? defaultValue ?? null;
    }
  }

  return defaultValue ?? null;
}

export function setStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("Error while setting storage:", error);
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Error while removing from storage:", error);
  }
}

export function localStorageAvailable(): boolean {
  try {
    const key = "__some_random_key_you_are_not_going_to_use__";
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
