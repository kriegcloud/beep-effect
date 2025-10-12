import { createClasses } from "@beep/ui-core/theme/create-classes";

export const carouselClasses = {
  root: createClasses("carousel__root"),
  container: createClasses("carousel__container"),
  dots: {
    root: createClasses("carousel__dots__root"),
    item: createClasses("carousel__dot__item"),
    itemSelected: createClasses("carousel__dot__selected"),
  },
  arrows: {
    root: createClasses("carousel__arrows__root"),
    label: createClasses("carousel__arrows__label"),
    prev: createClasses("carousel__arrow__prev"),
    next: createClasses("carousel__arrow__next"),
    svg: createClasses("carousel__arrows__svg"),
  },
  slide: {
    root: createClasses("carousel__slide__root"),
    content: createClasses("carousel__slide__content"),
    parallax: createClasses("carousel__slide__content__parallax"),
  },
  thumbs: {
    root: createClasses("carousel__thumbs__root"),
    container: createClasses("carousel__thumbs__container"),
    item: createClasses("carousel__thumb__item"),
    image: createClasses("carousel__thumb__item__image"),
  },
  progress: {
    root: createClasses("carousel__progress__root"),
    bar: createClasses("carousel__progress__bar"),
  },
};
