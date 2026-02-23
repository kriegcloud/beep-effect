/**
 * Exports a boolean value reporting whether the given API is supported or not
 */
export const isApiSupported = (api: string): boolean => (typeof window !== "undefined" ? api in window : false);
