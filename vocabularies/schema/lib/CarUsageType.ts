import { schema } from './namespace.js';

const values = {
  DrivingSchoolVehicleUsage: schema.DrivingSchoolVehicleUsage,
  RentalVehicleUsage: schema.RentalVehicleUsage,
  TaxiVehicleUsage: schema.TaxiVehicleUsage,
};

export type CarUsageType = typeof values[keyof typeof values];

export default values;
