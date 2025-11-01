import type { Image } from "./image";

export type AvatarOptions = {
  /**
   * Upload an avatar image and return the URL string
   * @remarks `(file: File) => Promise<string>`
   */
  readonly upload?: undefined | ((file: File) => Promise<string | undefined | null>);
  /**
   * Delete a previously uploaded avatar image from your storage/CDN
   * @remarks `(url: string) => Promise<void>`
   */
  readonly delete?: undefined | ((url: string) => Promise<void>);
  /**
   * Avatar size for resizing
   * @default 128 (or 256 if upload is provided)
   */
  readonly size: number;
  /**
   * File extension for avatar uploads
   * @default "png"
   */
  readonly extension: string;
  /**
   * Custom Image component for rendering avatar images
   * @default AvatarImage from Radix UI
   */
  readonly Image?: undefined | Image;
};
