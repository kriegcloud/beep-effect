import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MeetingRoomMixin } from '../lib/MeetingRoom.js';
import { RoomMixin } from '../lib/Room.js';

export const MeetingRoomBundle = [
  MeetingRoomMixin as Mixin,
  RoomMixin as Mixin];
