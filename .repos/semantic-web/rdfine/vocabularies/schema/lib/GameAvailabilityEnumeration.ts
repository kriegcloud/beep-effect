import { schema } from './namespace.js';

const values = {
  DemoGameAvailability: schema.DemoGameAvailability,
  FullGameAvailability: schema.FullGameAvailability,
};

export type GameAvailabilityEnumeration = typeof values[keyof typeof values];

export default values;
