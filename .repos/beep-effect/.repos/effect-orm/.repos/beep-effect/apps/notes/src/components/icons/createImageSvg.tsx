import type { LucideProps } from "lucide-react";

export const createImageSvg = (src: string) => {
  return (props: LucideProps) => {
    return (
      <svg aria-hidden="true" height="24" width="24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <image height="100%" href={src} width="100%" />
      </svg>
    );
  };
};
