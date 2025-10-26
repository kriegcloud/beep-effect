import * as A from "effect/Array";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const REFERENCE_ACTIVITY_TIMESTAMP = Date.UTC(2024, 0, 1, 12, 0, 0);
export const _lastActivity = A.makeBy(20, (index) =>
  new Date(REFERENCE_ACTIVITY_TIMESTAMP - index * (MS_PER_DAY + MS_PER_HOUR)).toISOString()
);
