import type { TAudioElement } from "platejs";
import type { SlateElementProps } from "platejs/static";
import { SlateElement } from "platejs/static";

export function AudioElementStatic(props: SlateElementProps<TAudioElement>) {
  return (
    <SlateElement {...props} className="mb-1">
      <figure className="group relative cursor-default">
        <div className="h-16">
          {/* biome-ignore lint/a11y/useMediaCaption: captions are user-provided content */}
          {props.element.url && <audio className="size-full" src={props.element.url} controls />}
        </div>
      </figure>
      {props.children}
    </SlateElement>
  );
}
