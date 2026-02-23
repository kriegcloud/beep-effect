import { createCallerFactory, createRouter } from "@beep/notes/server/api/trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { commentRouter } from "./routers/comment";
import { documentRouter } from "./routers/document";
import { fileRouter } from "./routers/file";
import { layoutRouter } from "./routers/layout";
import { userRouter } from "./routers/user";
import { versionRouter } from "./routers/version";

export const appRouter = createRouter({
  comment: commentRouter,
  document: documentRouter,
  file: fileRouter,
  layout: layoutRouter,
  user: userRouter,
  version: versionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 *
 * @example
 *   type PostByIdInput = RouterInputs['post']['byId']
 *   ^? { id: number }
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 *
 * @example
 *   type AllPostsOutput = RouterOutputs['post']['all']
 *   ^? Post[]
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Create a server-side caller for the tRPC API
 *
 * @example
 *   const trpc = createCaller(createContext);
 *   const res = await trpc.post.all();
 *   ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
