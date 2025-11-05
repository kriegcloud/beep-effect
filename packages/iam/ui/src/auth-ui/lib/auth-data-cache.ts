type CacheEntry<T> = {
  readonly data: T | null;
  readonly timestamp: number;
  isRefetching: boolean;
};

class AuthDataCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private listeners = new Map<string, Set<() => void>>();
  private inFlightRequests = new Map<string, Promise<unknown>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.cache.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, data: T | null) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      isRefetching: false,
    };
    this.cache.set(key, entry);
    this.notify(key);
  }

  setRefetching(key: string, isRefetching: boolean) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.isRefetching = isRefetching;
      this.notify(key);
    }
  }

  clear(key?: string | undefined) {
    if (key) {
      this.cache.delete(key);
      this.inFlightRequests.delete(key);
      this.notify(key);
    } else {
      this.cache.clear();
      this.inFlightRequests.clear();
      const keys = Array.from(this.listeners.keys());
      for (const key of keys) {
        this.notify(key);
      }
    }
  }

  getInFlightRequest<T>(key: string): Promise<T> | undefined {
    return this.inFlightRequests.get(key) as Promise<T> | undefined;
  }

  setInFlightRequest<T>(key: string, promise: Promise<T>) {
    this.inFlightRequests.set(key, promise);
  }

  removeInFlightRequest(key: string) {
    this.inFlightRequests.delete(key);
  }

  subscribe(key: string, callback: () => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notify(key: string) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      const callbackArray = Array.from(callbacks);
      for (const callback of callbackArray) {
        callback();
      }
    }
  }
}

// Global singleton instance
export const authDataCache = new AuthDataCache();
