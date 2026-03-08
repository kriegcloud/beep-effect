import { schema } from './namespace.js';

const values = {
  WearableMeasurementBack: schema.WearableMeasurementBack,
  WearableMeasurementChestOrBust: schema.WearableMeasurementChestOrBust,
  WearableMeasurementCollar: schema.WearableMeasurementCollar,
  WearableMeasurementCup: schema.WearableMeasurementCup,
  WearableMeasurementHeight: schema.WearableMeasurementHeight,
  WearableMeasurementHips: schema.WearableMeasurementHips,
  WearableMeasurementInseam: schema.WearableMeasurementInseam,
  WearableMeasurementLength: schema.WearableMeasurementLength,
  WearableMeasurementOutsideLeg: schema.WearableMeasurementOutsideLeg,
  WearableMeasurementSleeve: schema.WearableMeasurementSleeve,
  WearableMeasurementWaist: schema.WearableMeasurementWaist,
  WearableMeasurementWidth: schema.WearableMeasurementWidth,
};

export type WearableMeasurementTypeEnumeration = typeof values[keyof typeof values];

export default values;
