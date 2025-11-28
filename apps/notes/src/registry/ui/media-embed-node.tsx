"use client";

import { parseTwitterUrl, parseVideoUrl } from "@platejs/media";
import { useMediaState } from "@platejs/media/react";
import { ResizableProvider, useResizableValue } from "@platejs/resizable";
import { PlateElement, type PlateElementProps, withHOC } from "platejs/react";
import { Tweet } from "react-tweet";

import { cn } from "@/lib/utils";

import { Caption, CaptionTextarea } from "./caption";
import { MediaToolbar } from "./media-toolbar";
import { mediaResizeHandleVariants, Resizable, ResizeHandle } from "./resize-handle";

export const MediaEmbedElement = withHOC(ResizableProvider, function MediaEmbedElement(props: PlateElementProps) {
  const {
    align = "center",
    embed,
    focused,
    isTweet,
    isVideo,
    isYoutube,
    readOnly,
    selected,
  } = useMediaState({
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });
  const width = useResizableValue("width");
  const provider = embed?.provider;

  return (
    <PlateElement className="py-2.5" {...props}>
      <figure className="relative m-0 w-full" contentEditable={false}>
        <Resizable
          align={align}
          options={{
            align,
            maxWidth: isTweet ? 550 : "100%",
            minWidth: isTweet ? 300 : 100,
          }}
        >
          <div className="group/media">
            <ResizeHandle
              className={mediaResizeHandleVariants({ direction: "left" })}
              options={{ direction: "left" }}
            />

            <ResizeHandle
              className={mediaResizeHandleVariants({ direction: "right" })}
              options={{ direction: "right" }}
            />

            {isVideo && !isYoutube && (
              <div
                className={cn(
                  provider === "vimeo" && "pb-[75%]",
                  provider === "youku" && "pb-[56.25%]",
                  provider === "dailymotion" && "pb-[56.0417%]",
                  provider === "coub" && "pb-[51.25%]"
                )}
              >
                <iframe
                  className={cn(
                    "absolute top-0 left-0 aspect-video size-full rounded-sm",
                    isVideo && "border-0",
                    focused && selected && "ring-2 ring-ring ring-offset-2"
                  )}
                  title="embed"
                  src={embed!.url}
                  allowFullScreen
                />
              </div>
            )}

            {isTweet && (
              <div
                className={cn(
                  "text-left [&_.react-tweet-theme]:my-0",
                  !readOnly &&
                    selected &&
                    "[&_.react-tweet-theme]:ring-2 [&_.react-tweet-theme]:ring-ring [&_.react-tweet-theme]:ring-offset-2"
                )}
              >
                <Tweet id={embed!.id!} />
              </div>
            )}

            <MediaToolbar />
          </div>
        </Resizable>

        <Caption style={{ width }} align={align}>
          <CaptionTextarea placeholder="Write a caption..." />
        </Caption>
      </figure>

      {props.children}
    </PlateElement>
  );
});
