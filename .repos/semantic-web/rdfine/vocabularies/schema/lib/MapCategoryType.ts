import { schema } from './namespace.js';

const values = {
  ParkingMap: schema.ParkingMap,
  SeatingMap: schema.SeatingMap,
  TransitMap: schema.TransitMap,
  VenueMap: schema.VenueMap,
};

export type MapCategoryType = typeof values[keyof typeof values];

export default values;
