import type { TAudioElement } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";

export function MediaAudioElementStatic(props: SlateElementProps<TAudioElement>) {
  const { url } = props.element;

  return (
    <SlateElement className="mb-1" {...props}>
      <figure className="group relative cursor-default">
        <div className="h-16">
          <audio className="size-full" controls src={url}>
            <track kind="captions" />
          </audio>
        </div>
      </figure>
      {props.children}
    </SlateElement>
  );
}
