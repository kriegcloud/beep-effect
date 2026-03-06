/** Simple in-memory TTL cache for Neo4j read queries */
interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

export class QueryCache {
    private store = new Map<string, CacheEntry<unknown>>();
    private readonly ttlMs: number;
    private readonly maxSize: number;

    constructor(ttlMs = 30_000, maxSize = 200) {
        this.ttlMs = ttlMs;
        this.maxSize = maxSize;
    }

    /** Recupere une entree si elle existe et n'a pas expire */
    get<T>(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.data as T;
    }

    /** Store an entry with TTL */
    set<T>(key: string, data: T): void {
        // Basic LRU eviction if we exceed max size
        if (this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            if (firstKey) this.store.delete(firstKey);
        }
        this.store.set(key, { data, expiresAt: Date.now() + this.ttlMs });
    }

    /** Invalidate all entries (after a write) */
    invalidateAll(): void {
        this.store.clear();
    }

    /** Invalidate entries whose key contains the pattern */
    invalidateByPattern(pattern: string): void {
        for (const key of this.store.keys()) {
            if (key.includes(pattern)) this.store.delete(key);
        }
    }

    get size(): number {
        return this.store.size;
    }
}
