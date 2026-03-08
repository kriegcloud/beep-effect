import { schema } from './namespace.js';

const values = {
  BodyMeasurementArm: schema.BodyMeasurementArm,
  BodyMeasurementBust: schema.BodyMeasurementBust,
  BodyMeasurementChest: schema.BodyMeasurementChest,
  BodyMeasurementFoot: schema.BodyMeasurementFoot,
  BodyMeasurementHand: schema.BodyMeasurementHand,
  BodyMeasurementHead: schema.BodyMeasurementHead,
  BodyMeasurementHeight: schema.BodyMeasurementHeight,
  BodyMeasurementHips: schema.BodyMeasurementHips,
  BodyMeasurementInsideLeg: schema.BodyMeasurementInsideLeg,
  BodyMeasurementNeck: schema.BodyMeasurementNeck,
  BodyMeasurementUnderbust: schema.BodyMeasurementUnderbust,
  BodyMeasurementWaist: schema.BodyMeasurementWaist,
  BodyMeasurementWeight: schema.BodyMeasurementWeight,
};

export type BodyMeasurementTypeEnumeration = typeof values[keyof typeof values];

export default values;
