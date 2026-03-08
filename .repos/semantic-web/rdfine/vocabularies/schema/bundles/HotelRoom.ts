import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BedDetailsMixin } from '../lib/BedDetails.js';
import { HotelRoomMixin } from '../lib/HotelRoom.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { RoomMixin } from '../lib/Room.js';

export const HotelRoomBundle = [
  BedDetailsMixin as Mixin,
  HotelRoomMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  RoomMixin as Mixin];
