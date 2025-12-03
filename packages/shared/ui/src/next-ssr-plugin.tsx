"use client";

import type { EndpointMetadata } from "@uploadthing/shared";
import { useServerInsertedHTML } from "next/navigation";
import { useId } from "react";

declare const globalThis: {
  __UPLOAD?: EndpointMetadata;
};

export function NextSSRPlugin(props: { routerConfig: EndpointMetadata }) {
  const id = useId();

  // Set routerConfig on server globalThis
  globalThis.__UPLOAD = props.routerConfig;

  useServerInsertedHTML(() => {
    const html = [
      // Hydrate routerConfig on client globalThis
      `globalThis.__UPLOAD = ${JSON.stringify(props.routerConfig)};`,
    ];

    return <script key={id} dangerouslySetInnerHTML={{ __html: html.join("") }} />;
  });

  return null;
}
