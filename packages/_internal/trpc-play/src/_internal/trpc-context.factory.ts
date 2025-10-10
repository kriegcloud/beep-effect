import type {Db} from "@beep/core-db";
import type {AuthApi} from "@beep/iam-infra";
import {AuthService, IamDb} from "@beep/iam-infra";
import type {Entities} from "@beep/shared-domain";
import type {TRPCRouterRecord} from "@trpc/server";
import {initTRPC, TRPCError} from "@trpc/server";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import superjson from "superjson";

export interface TRPCContextShared<
  TFullSchema extends Record<string, unknown>,
> {
  readonly db: Db.Db<TFullSchema>;
  readonly auth: AuthApi;
  readonly headers: Headers;
}

export type NullableSession = Awaited<
  ReturnType<AuthApi["getSession"]>
>

export interface TRPCContextPublic<
  TFullSchema extends Record<string, unknown>,
> extends TRPCContextShared<TFullSchema> {
  readonly session: NullableSession;
}

export interface TRPCContextProtected<
  TFullSchema extends Record<string, unknown>,
> extends TRPCContextShared<TFullSchema> {
  readonly session: NonNullable<NullableSession>;
}

export interface TRPCContextOrgScoped<
  TFullSchema extends Record<string, unknown>,
> extends TRPCContextProtected<TFullSchema> {
  readonly organization: Entities.Organization.Model;
}

export class TRPCContextFactory<
  const TFullSchema extends Record<string, unknown>,
> extends Data.TaggedClass("TRPCContextFactory")<{
  readonly db: Db.Db<TFullSchema>,
  readonly authApi: AuthApi,
  readonly session: NullableSession
  readonly headers: Headers
}> {


  readonly createCtx = () => ({
    db: this.db,
    authApi: this.authApi,
    session: this.session,
    headers: this.headers
  });
}

export const trpcFactory = <TFullSchema extends Record<string, unknown>>(
  db: Db.Db<TFullSchema>) => Effect.gen(function* () {
  const {auth, getSession, getHeadersEffect} = yield* AuthService;
  const session = yield* getSession();
  const authApi = auth().api;
  const headers = yield* getHeadersEffect();

  const factory = new TRPCContextFactory<TFullSchema>({db, authApi, session, headers});

  const t = initTRPC.context<typeof factory.createCtx>().create({
    transformer: superjson,
    errorFormatter({shape}) {
      return {
        ...shape,
        data: {
          ...shape.data,
        },
      };
    },
  });
  const mergeRouters = t.mergeRouters;


  /**
   * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
   *
   * These are the pieces you use to build your tRPC API. You should import these
   * a lot in the /src/server/api/routers folder
   */

  /**
   * This is how you create new routers and subrouters in your tRPC API
   * @see https://trpc.io/docs/router
   */
  const createTRPCRouter = t.router as typeof t.router;


  /**
   * Middleware for timing procedure execution and adding an artificial delay in development.
   *
   * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
   * network latency that would occur in production but not in local development.
   */
  const timingMiddleware = t.middleware(async ({next, path}) => {
    const start = Date.now();

    if (t._config.isDev) {
      // artificial delay in dev 100-500ms
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

    return result;
  });

  /**
   * Public (unauthed) procedure
   *
   * This is the base piece you use to build new queries and mutations on your
   * tRPC API. It does not guarantee that a user querying is authorized, but you
   * can still access user session data if they are logged in
   */
  const publicProcedure = t.procedure.use(timingMiddleware);

  const protectedProcedure = t.procedure
    .use(timingMiddleware)
    .use(({ctx, next}) => {
      if (!ctx.session?.user) {
        throw new TRPCError({code: "UNAUTHORIZED"});
      }

      const authedSession = {
        ...ctx.session,
        user: ctx.session.user,
      };
      return next({
        ctx: {
          // infers the `session` as non-nullable
          session: authedSession,
        },
      });
    });

  const createCallerFactory = t.createCallerFactory;

  return {
    mergeRouters,
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
    createCallerFactory,
  };
});

const beepTrpc = Effect.flatMap(IamDb.IamDb, trpcFactory);


export const iamRouterEffect = Effect.gen(function* () {
  const {publicProcedure} = yield* beepTrpc;

  return {
    getSession: publicProcedure.query(({ctx}) => {
      return ctx.session;
    })
  } satisfies TRPCRouterRecord;
});


export const appRouterEffect = Effect.gen(function* () {
  const db = yield* IamDb.IamDb;
  const {createTRPCRouter} = yield* trpcFactory(db);
  const iamRouter = yield* iamRouterEffect;


  return createTRPCRouter({
    iam: iamRouter
  });
});

export type AppRouter = Effect.Effect.Success<typeof appRouterEffect>