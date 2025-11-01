export type GravatarOptions = {
  /**
   * Default image type or URL
   * Options: '404', 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank', or custom URL
   */
  readonly d?: undefined | string;
  /**
   * Image size in pixels (1-2048)
   */
  readonly size?: number | undefined;
  /**
   * Whether to append .jpg extension to the hash
   * @default false
   */
  readonly jpg?: undefined | boolean;
  /**
   * Force default image even if user has Gravatar
   * @default false
   */
  readonly forceDefault?: undefined | boolean;
};
