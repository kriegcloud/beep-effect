"use client";

import { useMediaState } from "@platejs/media/react";
import { ResizableProvider } from "@platejs/resizable";
import { PlateElement, type PlateElementProps, withHOC } from "platejs/react";

import { Caption, CaptionTextarea } from "./caption";

export const MediaAudioElement = withHOC(ResizableProvider, function MediaAudioElement(props: PlateElementProps) {
  const { align = "center", readOnly, unsafeUrl } = useMediaState();

  return (
    <PlateElement className="mb-1" {...props}>
      <figure className="group relative" contentEditable={false}>
        <div className="h-16">
          <audio className="size-full" controls src={unsafeUrl}>
            <track kind="captions" />
          </audio>
        </div>

        <Caption style={{ width: "100%" }} align={align}>
          <CaptionTextarea className="h-20" readOnly={readOnly} placeholder="Write a caption..." />
        </Caption>
      </figure>
      {props.children}
    </PlateElement>
  );
});
