import { schema } from './namespace.js';

const values = {
  LockerDelivery: schema.LockerDelivery,
  OnSitePickup: schema.OnSitePickup,
  ParcelService: schema.ParcelService,
};

export type DeliveryMethod = typeof values[keyof typeof values];

export default values;
