import type { StringTypes } from "@beep/types";
import type {
  EarSize,
  EyeBrowStyle,
  EyeStyle,
  GlassesStyle,
  HairStyle,
  HatStyle,
  MouthStyle,
  NoseStyle,
  Sex,
  Shape,
  ShirtStyle,
} from "./enums";

type Style = {
  readonly [key: StringTypes.NonEmptyString]: string | number | boolean;
};

export interface GravitarConfig {
  readonly sex?: Sex.Type;
  readonly faceColor?: string;
  readonly earSize?: EarSize.Type;
  readonly hairColor?: string;
  readonly hairStyle?: HairStyle.Type;
  readonly hairColorRandom?: boolean;
  readonly hatColor?: string;
  readonly hatStyle?: HatStyle.Type;
  readonly eyeStyle?: EyeStyle.Type;
  readonly glassesStyle?: GlassesStyle.Type;
  readonly noseStyle?: NoseStyle.Type;
  readonly mouthStyle?: MouthStyle.Type;
  readonly shirtStyle?: ShirtStyle.Type;
  readonly shirtColor?: string;
  readonly bgColor?: string;
  readonly isGradient?: boolean;
}

export interface GravitarFullConfig extends GravitarConfig {
  readonly eyeBrowStyle?: EyeBrowStyle.Type;
}

export interface GravitarProps extends GravitarConfig {
  readonly id?: string;
  readonly className?: string;
  readonly style?: Style;
  readonly shape?: Shape.Type;
}

export type GenConfigFn = (config?: GravitarFullConfig | string) => Required<GravitarFullConfig>;
