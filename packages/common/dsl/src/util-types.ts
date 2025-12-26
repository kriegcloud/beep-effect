export type GetValForKey<T, K> = K extends keyof T ? T[K] : never;

export type SingleOrReadonlyArray<T> = T | ReadonlyArray<T>;
