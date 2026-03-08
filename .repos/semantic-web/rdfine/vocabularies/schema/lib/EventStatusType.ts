import { schema } from './namespace.js';

const values = {
  EventCancelled: schema.EventCancelled,
  EventMovedOnline: schema.EventMovedOnline,
  EventPostponed: schema.EventPostponed,
  EventRescheduled: schema.EventRescheduled,
  EventScheduled: schema.EventScheduled,
};

export type EventStatusType = typeof values[keyof typeof values];

export default values;
