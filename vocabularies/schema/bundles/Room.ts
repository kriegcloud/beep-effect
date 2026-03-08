import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { RoomMixin } from '../lib/Room.js';

export const RoomBundle = [
  AccommodationMixin as Mixin,
  RoomMixin as Mixin];
