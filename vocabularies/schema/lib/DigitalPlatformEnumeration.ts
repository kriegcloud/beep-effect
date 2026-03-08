import { schema } from './namespace.js';

const values = {
  AndroidPlatform: schema.AndroidPlatform,
  DesktopWebPlatform: schema.DesktopWebPlatform,
  GenericWebPlatform: schema.GenericWebPlatform,
  IOSPlatform: schema.IOSPlatform,
  MobileWebPlatform: schema.MobileWebPlatform,
};

export type DigitalPlatformEnumeration = typeof values[keyof typeof values];

export default values;
