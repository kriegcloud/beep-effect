import type { VideoProvider } from "../../utils/parseVideoUrl";

export interface IVideoNodeProps {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
  startAt?: undefined | number | null;
  originalUrl: string;
}

export const VideoComponent = (props: IVideoNodeProps) => {
  const { provider } = props;
  const title = provider === "youtube" ? "YouTube video" : provider === "vimeo" ? "Vimeo video" : "Video";

  return (
    <div className="lexical-video" contentEditable={false} draggable={false}>
      <div className="lexical-video__inner">
        <iframe
          className="lexical-video__iframe"
          src={props.embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
};
