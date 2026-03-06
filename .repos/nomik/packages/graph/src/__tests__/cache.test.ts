import { describe, it, expect, beforeEach } from 'vitest';
import { QueryCache } from '../cache.js';

describe('QueryCache', () => {
    let cache: QueryCache;

    beforeEach(() => {
        cache = new QueryCache(1000, 5);
    });

    it('returns undefined for an unknown key', () => {
        expect(cache.get('missing')).toBeUndefined();
    });

    it('stores and retrieves a value', () => {
        cache.set('key1', { data: 42 });
        expect(cache.get('key1')).toEqual({ data: 42 });
    });

    it('respects TTL', async () => {
        const shortCache = new QueryCache(50, 10);
        shortCache.set('temp', 'value');
        expect(shortCache.get('temp')).toBe('value');
        await new Promise(r => setTimeout(r, 80));
        expect(shortCache.get('temp')).toBeUndefined();
    });

    it('invalidateAll clears the cache', () => {
        cache.set('a', 1);
        cache.set('b', 2);
        expect(cache.size).toBe(2);
        cache.invalidateAll();
        expect(cache.size).toBe(0);
        expect(cache.get('a')).toBeUndefined();
    });

    it('invalidateByPattern removes matching keys', () => {
        cache.set('stats:global', 100);
        cache.set('impact:foo', 200);
        cache.set('impact:bar', 300);
        cache.invalidateByPattern('impact');
        expect(cache.get('stats:global')).toBe(100);
        expect(cache.get('impact:foo')).toBeUndefined();
        expect(cache.get('impact:bar')).toBeUndefined();
    });

    it('evicts when maxSize is reached', () => {
        for (let i = 0; i < 6; i++) {
            cache.set(`key${i}`, i);
        }
        // maxSize = 5, the first entry should be evicted
        expect(cache.size).toBe(5);
        expect(cache.get('key0')).toBeUndefined();
        expect(cache.get('key5')).toBe(5);
    });
});
