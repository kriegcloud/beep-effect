import React from "react";

interface Dimensions {
  readonly width: number;
  readonly height: number;
}

export const useImageDimensions = (defaultMaxWidth: number) => {
  const [dimensions, setDimensions] = React.useState<Dimensions | null>(null);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const maxWidth = dimensions ? Math.min(defaultMaxWidth, dimensions.width) : defaultMaxWidth;
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : 1;

  return { handleImageLoad, maxWidth, aspectRatio };
};
