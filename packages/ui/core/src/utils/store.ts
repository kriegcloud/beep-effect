export const getItemFromStore = (
  key: string,
  defaultValue?: string | boolean | undefined,
  store?: Storage | undefined
) => {
  if (typeof window !== "undefined") {
    store = store || window.localStorage;
    try {
      return store.getItem(key) === null ? defaultValue : JSON.parse(store.getItem(key) as string);
    } catch {
      return store.getItem(key) || defaultValue;
    }
  }
  return defaultValue;
};

export const setItemToStore = (key: string, payload: string, store = window.localStorage) =>
  store.setItem(key, payload);

export const removeItemFromStore = (key: string, store = window.localStorage) => store.removeItem(key);
