export type CacheConfig = {
  /**
   * expire time, in seconds (a positive integer)
   */
  ex?: undefined | number;
  /**
   * expire time, in milliseconds (a positive integer).
   */
  px?: undefined | number;
  /**
   * Unix time at which the key will expire, in seconds (a positive integer).
   */
  exat?: undefined | number;
  /**
   * Unix time at which the key will expire, in milliseconds (a positive integer)
   */
  pxat?: undefined | number;
  /**
   * Retain the time to live associated with the key.
   */
  keepTtl?: undefined | boolean;
  /**
   * Set an expiration (TTL or time to live) on one or more fields of a given hash key.
   * Used for HEXPIRE command
   */
  hexOptions?: undefined | "NX" | "nx" | "XX" | "xx" | "GT" | "gt" | "LT" | "lt";
};

export type WithCacheConfig = {
  enable: boolean;
  config?: undefined | CacheConfig;
  tag?: undefined | string;
  autoInvalidate?: undefined | boolean;
};
