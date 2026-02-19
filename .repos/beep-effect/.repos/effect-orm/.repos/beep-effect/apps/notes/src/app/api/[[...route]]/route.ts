import { honoApp } from "@beep/notes/server/hono";
import type { UnsafeTypes } from "@beep/types";
import { handle } from "hono/vercel";

const handleAny = handle as UnsafeTypes.UnsafeAny;

export const GET = handleAny(honoApp);

export const POST = handleAny(honoApp);

export const PUT = handleAny(honoApp);

export const DELETE = handleAny(honoApp);

export const PATCH = handleAny(honoApp);
