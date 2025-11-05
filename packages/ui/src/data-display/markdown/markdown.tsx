"use client";

import "./code-highlight-block.css";

import { Image } from "@beep/ui/atoms";
import { RouterLink } from "@beep/ui/routing";
import { isExternalLink, mergeClasses } from "@beep/ui-core/utils";
import Link from "@mui/material/Link";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type { ComponentPropsWithoutRef, ReactEventHandler } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import type { Options } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { markdownClasses } from "./classes";
import { htmlToMarkdown, isMarkdownContent } from "./html-to-markdown";
import { MarkdownRoot } from "./styles";

// ----------------------------------------------------------------------

export type MarkdownProps = React.ComponentProps<typeof MarkdownRoot> & Options;

export function Markdown({ sx, children, className, components, rehypePlugins, ...other }: MarkdownProps) {
  const content = useMemo(() => {
    const cleanedContent = String(children).trim();

    return isMarkdownContent(cleanedContent) ? cleanedContent : htmlToMarkdown(cleanedContent);
  }, [children]);

  const allRehypePlugins = useMemo(() => [...defaultRehypePlugins, ...(rehypePlugins ?? [])], [rehypePlugins]);

  return (
    <MarkdownRoot className={mergeClasses([markdownClasses.root, className])} sx={sx}>
      <ReactMarkdown
        components={{ ...defaultComponents, ...components }}
        rehypePlugins={allRehypePlugins}
        /* base64-encoded images
         * https://github.com/remarkjs/react-markdown/issues/774
         * urlTransform={(value: string) => value}
         */
        {...other}
      >
        {content}
      </ReactMarkdown>
    </MarkdownRoot>
  );
}

/** **************************************
 * @rehypePlugins
 *************************************** */
const defaultRehypePlugins: NonNullable<Options["rehypePlugins"]> = [
  rehypeRaw,
  rehypeHighlight,
  [remarkGfm, { singleTilde: false }],
];

/** **************************************
 * @components
 * Note: node is passed by react-markdown, but we intentionally omit or rename it
 * (e.g., node: _n) to prevent rendering it as [object Object] in the DOM.
 *************************************** */
const defaultComponents: NonNullable<Options["components"]> = {
  img: (props) => <MarkdownImage {...props} />,
  a: ({ href = "", children, node: _n, ...other }) => {
    const linkProps = isExternalLink(href)
      ? { target: "_blank", rel: "noopener noreferrer" }
      : { component: RouterLink };

    return (
      <Link {...linkProps} href={href} className={markdownClasses.content.link} {...other}>
        {children}
      </Link>
    );
  },
  pre: ({ children }) => (
    <div className={markdownClasses.content.codeBlock}>
      <pre>{children}</pre>
    </div>
  ),
  code: ({ className = "", children, node: _n, ...other }) => {
    const hasLanguage = /language-\w+/.test(className);
    const appliedClass = hasLanguage ? className : markdownClasses.content.codeInline;

    return (
      <code className={appliedClass} {...other}>
        {children}
      </code>
    );
  },
  input: ({ type, node: _n, ...other }) =>
    type === "checkbox" ? (
      <CustomCheckbox className={markdownClasses.content.checkbox} {...other} />
    ) : (
      <input type={type} {...other} />
    ),
};

function CustomCheckbox(props: React.ComponentProps<"input">) {
  const uniqueId = useId();
  return <input type="checkbox" id={uniqueId} {...props} />;
}

type MarkdownImgProps = Omit<ComponentPropsWithoutRef<"img">, "src" | "onLoad"> & {
  readonly node?: unknown;
  readonly src?: string | Blob;
  readonly onLoad?: ReactEventHandler<HTMLImageElement>;
};

function MarkdownImage({ node: _n, onLoad: _ignored, src, className, ...other }: MarkdownImgProps) {
  const resolvedSrc = useMarkdownImageSrc(src);

  return (
    <Image
      ratio="16/9"
      className={mergeClasses([markdownClasses.content.image, className])}
      sx={{ borderRadius: 2 }}
      src={resolvedSrc}
      {...other}
    />
  );
}

function useMarkdownImageSrc(input: string | Blob | undefined) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(typeof input === "string" ? input : undefined);

  useEffect(() => {
    let isActive = true;

    const effect = F.pipe(
      resolveMarkdownImageSrc(input),
      Effect.matchEffect({
        onFailure: () =>
          Effect.sync(() => {
            if (isActive) {
              setResolvedSrc(undefined);
            }
          }),
        onSuccess: (value) =>
          Effect.sync(() => {
            if (isActive) {
              setResolvedSrc(value);
            }
          }),
      })
    );

    Effect.runPromise(effect);

    return () => {
      isActive = false;
    };
  }, [input]);

  return resolvedSrc;
}

class BlobToDataUrlError extends Data.TaggedError("BlobToDataUrlError")<{
  readonly cause: unknown;
  readonly message: string;
}> {
  override readonly _tag = "BlobToDataUrlError";

  constructor(override readonly cause: unknown) {
    super({
      cause,
      message: "Failed to convert Blob to a data URL",
    });
    this.name = this._tag;
  }
}

const blobToDataUrl = (blob: Blob) =>
  Effect.tryPromise({
    try: () =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result;

          if (typeof result === "string") {
            resolve(result);
            return;
          }

          reject(new Error("FileReader result was not a string"));
        };

        reader.onerror = () => {
          reject(reader.error ?? new Error("Unknown FileReader error"));
        };

        reader.onabort = () => {
          reject(new Error("FileReader operation was aborted"));
        };

        reader.readAsDataURL(blob);
      }),
    catch: (error) => new BlobToDataUrlError(error),
  });

const resolveMarkdownImageSrc = (input: string | Blob | undefined) =>
  F.pipe(
    Effect.succeed(input),
    Effect.flatMap((value) => {
      if (typeof value === "string" || typeof value === "undefined") {
        return Effect.succeed(value);
      }

      return Effect.map(blobToDataUrl(value), (dataUrl): string | undefined => dataUrl);
    })
  );
