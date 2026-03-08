import { schema } from './namespace.js';

const values = {
  SizeSystemImperial: schema.SizeSystemImperial,
  SizeSystemMetric: schema.SizeSystemMetric,
};

export type SizeSystemEnumeration = typeof values[keyof typeof values];

export default values;
