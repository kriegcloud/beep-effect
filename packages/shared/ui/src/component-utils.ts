import { audio } from "@beep/schema/integrations/files/mime-types/audio";
import { image } from "@beep/schema/integrations/files/mime-types/image";
import { text } from "@beep/schema/integrations/files/mime-types/text";
import { video } from "@beep/schema/integrations/files/mime-types/video";
import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type { ExpandedRouteConfig } from "./types";

export type ProgressGranularity = "all" | "fine" | "coarse";
export const roundProgress = (progress: number, granularity: ProgressGranularity) => {
  if (granularity === "all") return progress;
  if (granularity === "fine") return Math.round(progress);
  return Math.floor(progress / 10) * 10;
};

export const generateMimeTypes = (typesOrRouteConfig: string[] | ExpandedRouteConfig) => {
  const fileTypes = Array.isArray(typesOrRouteConfig) ? typesOrRouteConfig : pipe(typesOrRouteConfig, Struct.keys);
  if (A.contains("blob")(fileTypes)) return A.empty();

  return pipe(
    fileTypes,
    A.map((type) => {
      if (type === "pdf") return "application/pdf";
      if (Str.includes("/")(type)) return type;
      const join = A.join(", ");
      // Add wildcard to support all subtypes, e.g. image => "image/*"
      // But some browsers/OSes don't support it, so we'll also dump all the mime types
      // we know that starts with the type, e.g. image => "image/png, image/jpeg, ..."
      if (type === "audio") return pipe(["audio/*", ...Struct.keys(audio)], join);
      if (type === "image") return pipe(["image/*", ...Struct.keys(image)], join);
      if (type === "text") return pipe(["text/*", ...Struct.keys(text)], join);
      if (type === "video") return pipe(["video/*", ...Struct.keys(video)], join);

      return `${type}/*`;
    })
  );
};

export const generateClientDropzoneAccept = (fileTypes: string[]) => {
  return pipe(
    fileTypes,
    generateMimeTypes,
    A.map((type) => [type, A.empty()] as const),
    R.fromEntries
  );
};

export function getFilesFromClipboardEvent(event: ClipboardEvent) {
  const dataTransferItems = event.clipboardData?.items;
  if (!dataTransferItems) return;

  return pipe(
    Array.from(dataTransferItems),
    A.reduce([] as File[], (acc, curr) => {
      const f = curr.getAsFile();
      return f ? [...acc, f] : acc;
    })
  );
}

/**
 * Shared helpers for our premade components that's reusable by multiple frameworks
 */

export const generatePermittedFileTypes = (config?: undefined | ExpandedRouteConfig) => {
  const fileTypes = config ? Struct.keys(config) : [];

  const maxFileCount = config ? A.map(Object.values(config), (v) => v.maxFileCount) : [];

  return { fileTypes, multiple: maxFileCount.some((v) => v && v > 1) };
};

export const capitalizeStart = (str: string) => {
  return pipe(str.charAt(0), Str.toUpperCase) + Str.slice(1)(str);
};

export const INTERNAL_doFormatting = (config?: ExpandedRouteConfig): string => {
  if (!config) return Str.empty;

  const allowedTypes = Struct.keys(config);

  const formattedTypes = A.map(allowedTypes, (f) => (f === "blob" ? "file" : f));

  // Format multi-type uploader label as "Supports videos, images and files";
  if (formattedTypes.length > 1) {
    const lastType = formattedTypes.pop();
    return `${A.join("s, ")(formattedTypes)} and ${lastType}s`;
  }

  // Single type uploader label
  const key = allowedTypes[0];
  const formattedKey = formattedTypes[0];
  if (!key || !formattedKey) return "";

  const { maxFileSize, maxFileCount, minFileCount } = pipe(config[key], O.fromNullable, O.getOrThrow);

  if (maxFileCount && maxFileCount > 1) {
    if (minFileCount > 1) {
      return `${minFileCount} - ${maxFileCount} ${formattedKey}s up to ${maxFileSize}`;
    }
    return `${formattedKey}s up to ${maxFileSize}, max ${maxFileCount}`;
  }
  return `${formattedKey} (${maxFileSize})`;
};

export const allowedContentTextLabelGenerator = (config?: ExpandedRouteConfig): string => {
  return capitalizeStart(INTERNAL_doFormatting(config));
};
