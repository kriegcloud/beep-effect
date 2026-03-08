import { schema } from './namespace.js';

const values = {
  HearingImpairedSupported: schema.HearingImpairedSupported,
  TollFree: schema.TollFree,
};

export type ContactPointOption = typeof values[keyof typeof values];

export default values;
