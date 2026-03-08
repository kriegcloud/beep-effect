import { schema } from './namespace.js';

const values = {
  MixedEventAttendanceMode: schema.MixedEventAttendanceMode,
  OfflineEventAttendanceMode: schema.OfflineEventAttendanceMode,
  OnlineEventAttendanceMode: schema.OnlineEventAttendanceMode,
};

export type EventAttendanceModeEnumeration = typeof values[keyof typeof values];

export default values;
