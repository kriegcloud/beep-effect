import { BS } from "@beep/schema";

export namespace Sex {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("male", "female");
  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace EarSize {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("small", "big");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}

export namespace HairStyle {
  export const { Enum, Options, Schema, getRandom, derive } = BS.stringLiteralKit(
    "normal",
    "womanLong",
    "womanShort",
    "thick",
    "mohawk"
  );

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace HairStyleMan {
  export const { Enum, Options, Schema, getRandom } = HairStyle.derive("normal", "thick", "mohawk");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace HairStyleWoman {
  export const { Enum, Options, Schema, getRandom } = HairStyle.derive("normal", "womanLong", "womanShort");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace HatStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("beanie", "turban", "none");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace EyeStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("circle", "oval", "smile");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace GlassesStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("round", "square", "none");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace NoseStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("short", "long", "round");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace MouthStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("laugh", "smile", "peace");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace ShirtStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("hoody", "short", "polo");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
export namespace EyeBrowStyle {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("up", "upWoman");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}

export namespace Shape {
  export const { Enum, Options, Schema, getRandom } = BS.stringLiteralKit("circle", "rounded", "square");

  export type Type = typeof Schema.Type;
  export type OptionsType = typeof Options;
}
