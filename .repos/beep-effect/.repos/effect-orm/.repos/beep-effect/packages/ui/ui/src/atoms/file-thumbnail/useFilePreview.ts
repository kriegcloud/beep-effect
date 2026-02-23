"use client";

import { useEffect, useRef, useState } from "react";

export type UseFilePreviewReturn = {
  readonly previewUrl: string;
  readonly setPreviewUrl: React.Dispatch<React.SetStateAction<string>>;
};

export function useFilePreview(file?: File | string | null | undefined): UseFilePreviewReturn {
  const objectUrlRef = useRef<string>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    // Cleanup old object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    } else if (typeof file === "string") {
      setPreviewUrl(file);
    } else {
      setPreviewUrl("");
    }

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file]);

  return {
    previewUrl,
    setPreviewUrl,
  };
}

export type FilePreviewItem = {
  previewUrl: string;
  file: File | string;
};

export type UseFilesPreviewReturn = {
  filesPreview: FilePreviewItem[];
  setFilesPreview: React.Dispatch<React.SetStateAction<FilePreviewItem[]>>;
};

export function revokeObjectUrls(urls: string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

export function useFilesPreview(files: (File | string)[]): UseFilesPreviewReturn {
  const objectUrlsRef = useRef<string[]>([]);
  const [filesPreview, setFilesPreview] = useState<FilePreviewItem[]>([]);

  useEffect(() => {
    // Cleanup old object URLs
    revokeObjectUrls(objectUrlsRef.current);
    objectUrlsRef.current = [];

    const previews: FilePreviewItem[] = files.map((file) => {
      const isFile = file instanceof File;
      const previewUrl = isFile ? URL.createObjectURL(file) : file;

      if (isFile) objectUrlsRef.current.push(previewUrl);

      return {
        file,
        previewUrl,
      };
    });

    setFilesPreview(previews);

    return () => {
      revokeObjectUrls(objectUrlsRef.current);
      objectUrlsRef.current = [];
    };
  }, [files]);

  return {
    filesPreview,
    setFilesPreview,
  };
}
