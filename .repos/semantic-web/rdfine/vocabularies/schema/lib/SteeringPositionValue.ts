import { schema } from './namespace.js';

const values = {
  LeftHandDriving: schema.LeftHandDriving,
  RightHandDriving: schema.RightHandDriving,
};

export type SteeringPositionValue = typeof values[keyof typeof values];

export default values;
