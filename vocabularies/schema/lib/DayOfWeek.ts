import { schema } from './namespace.js';

const values = {
  Friday: schema.Friday,
  Monday: schema.Monday,
  PublicHolidays: schema.PublicHolidays,
  Saturday: schema.Saturday,
  Sunday: schema.Sunday,
  Thursday: schema.Thursday,
  Tuesday: schema.Tuesday,
  Wednesday: schema.Wednesday,
};

export type DayOfWeek = typeof values[keyof typeof values];

export default values;
