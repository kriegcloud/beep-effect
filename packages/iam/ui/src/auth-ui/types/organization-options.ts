import type { OrganizationViewPaths } from "../lib/view-paths";
export type OrganizationLogoOptions = {
  /**
   * Upload a logo image and return the URL string
   * @remarks `(file: File) => Promise<string>`
   */
  readonly upload?: undefined | ((file: File) => Promise<string | undefined | null>);
  /**
   * Delete a previously uploaded logo image from your storage/CDN
   * @remarks `(url: string) => Promise<void>`
   */
  readonly delete?: undefined | ((url: string) => Promise<void>);
  /**
   * Logo size for resizing
   * @default 256 if upload is provided, 128 otherwise
   */
  readonly size: number;
  /**
   * File extension for logo uploads
   * @default "png"
   */
  readonly extension: string;
};

export type OrganizationOptions = {
  /**
   * Logo configuration
   * @default undefined
   */
  readonly logo?: (boolean | Partial<OrganizationLogoOptions>) | undefined;
  /**
   * Custom roles to add to the built-in roles (owner, admin, member)
   * @default []
   */
  readonly customRoles?: undefined | ReadonlyArray<{ readonly role: string; readonly label: string }>;
  /**
   * Enable or disable API key support for organizations
   * @default false
   */
  readonly apiKey?: undefined | boolean;
  /**
   * Base path for organization-scoped views (supports slugged or static base)
   * When using slug paths, set this to the common prefix (e.g. "/organization")
   */
  readonly basePath?: undefined | string;
  /**
   * Organization path mode
   * - "default": use active-organization based routes
   * - "slug": use slug-based URLs where slug becomes the first path segment
   *   e.g. "/[slug]/members" (or `${basePath}/[slug]/members` if basePath provided)
   * @default "default"
   */
  readonly pathMode?: undefined | ("default" | "slug");
  /**
   * The current organization slug
   */
  readonly slug?: undefined | string;
  /**
   * The path to redirect to when Personal Account is selected
   */
  readonly personalPath?: undefined | string;
  /**
   * Customize organization view paths
   */
  readonly viewPaths?: undefined | Partial<OrganizationViewPaths>;
};

export type OrganizationOptionsContext = {
  /**
   * Logo configuration
   * @default undefined
   */
  readonly logo?: undefined | OrganizationLogoOptions;
  /**
   * Custom roles to add to the built-in roles (owner, admin, member)
   * @default []
   */
  readonly customRoles: ReadonlyArray<{ readonly role: string; readonly label: string }>;
  /**
   * Enable or disable API key support for organizations
   * @default false
   */
  readonly apiKey?: undefined | boolean;
  /**
   * Base path for organization-scoped views
   */
  readonly basePath: string;
  /**
   * Organization path mode
   * @default "default"
   */
  readonly pathMode?: undefined | ("default" | "slug");
  /**
   * The current organization slug
   */
  readonly slug?: undefined | string;
  /**
   * The path to redirect to when Personal Account is selected
   */
  readonly personalPath?: undefined | string;
  /**
   * Customize organization view paths
   */
  readonly viewPaths: OrganizationViewPaths;
};
