import { cn } from "@beep/notes/lib/utils";

import { NodeApi, type TCaptionElement, type TResizableProps, type TVideoElement } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";

export function MediaVideoElementStatic(props: SlateElementProps<TVideoElement & TCaptionElement & TResizableProps>) {
  const { align = "center", caption, url, width } = props.element;

  return (
    <SlateElement className="py-2.5" {...props}>
      <div style={{ textAlign: align }}>
        <figure className="group relative m-0 inline-block cursor-default" style={{ width }}>
          <video className={cn("w-full max-w-full object-cover px-0", "rounded-sm")} controls src={url}>
            <track kind="captions" />
          </video>
          {caption && <figcaption>{NodeApi.string(caption[0])}</figcaption>}
        </figure>
      </div>
      {props.children}
    </SlateElement>
  );
}
