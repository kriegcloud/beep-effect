import { TasksDb } from "@beep/tasks-infra/db";
export const dependencies = [TasksDb.TasksDb.Live] as const;
