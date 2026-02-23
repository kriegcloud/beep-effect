import { isTemplateDocument } from "@beep/notes/components/editor/utils/useTemplateDocument";
import { nid } from "@beep/notes/lib/nid";
import { prisma } from "@beep/notes/server/db";
import { exact } from "@beep/utils/struct";
import { TRPCError } from "@trpc/server";
import * as S from "effect/Schema";
import { NodeApi } from "platejs";
import { protectedProcedure } from "../middlewares/procedures";
import { ratelimitMiddleware } from "../middlewares/ratelimitMiddleware";
import { createRouter } from "../trpc";

const MAX_TITLE_LENGTH = 256;
const MAX_CONTENT_LENGTH = 1_000_000; // 1MB of text
const MAX_ICON_LENGTH = 100;

export const documentMutations = {
  archive: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.update({
        data: {
          isArchived: true,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  create: protectedProcedure
    .use(ratelimitMiddleware("document/create"))
    .input(
      S.decodeUnknownSync(
        S.Struct({
          contentRich: S.optional(S.Any),
          parentDocumentId: S.optional(S.String),
          title: S.optional(S.String.pipe(S.maxLength(MAX_TITLE_LENGTH))),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich,
            type: "root",
          })
        : "";

      if (content.length > MAX_CONTENT_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Content is too long",
        });
      }

      const createData = {
        id: nid(),
        contentRich: input.contentRich,
        parentDocumentId: input.parentDocumentId ?? null,
        userId: ctx.userId,
        title: input.title,
      };
      if (input.title !== undefined) createData.title = input.title;

      return await prisma.document.create({
        data: createData,
        select: { id: true },
      });
    }),

  delete: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  restore: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.update({
        data: {
          isArchived: false,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
          content: S.optional(S.String.pipe(S.maxLength(MAX_CONTENT_LENGTH))),
          contentRich: S.optional(S.Any),
          coverImage: S.optional(S.String.pipe(S.maxLength(500))),
          fullWidth: S.optional(S.Boolean),
          icon: S.optional(S.String.pipe(S.maxLength(MAX_ICON_LENGTH))),
          isPublished: S.optional(S.Boolean),
          lockPage: S.optional(S.Boolean),
          smallText: S.optional(S.Boolean),
          textStyle: S.optional(S.Literal("DEFAULT", "SERIF", "MONO")),
          title: S.optional(S.String.pipe(S.maxLength(MAX_TITLE_LENGTH))),
          toc: S.optional(S.Boolean),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich,
            type: "root",
          })
        : undefined;

      if (content && content.length > MAX_CONTENT_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Content is too long",
        });
      }

      const updateData = exact(input);

      await prisma.document.update({
        data: updateData,
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),
};

export const documentRouter = createRouter({
  ...documentMutations,
  document: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const document = await prisma.document.findUnique({
        select: {
          id: true,
          contentRich: true,
          coverImage: true,
          fullWidth: true,
          icon: true,
          isArchived: true,
          isPublished: true,
          lockPage: true,
          parentDocumentId: true,
          smallText: true,
          templateId: true,
          textStyle: true,
          title: true,
          toc: true,
          updatedAt: true,
        },
        where: isTemplateDocument(input.id)
          ? {
              userId_templateId: {
                templateId: input.id,
                userId: ctx.userId,
              },
            }
          : {
              id: input.id,
            },
      });

      return {
        document,
      };
    }),

  documents: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          cursor: S.optional(S.String),
          limit: S.optional(S.Number.pipe(S.greaterThan(1), S.lessThan(100))),
          parentDocumentId: S.optional(S.String),
          search: S.optional(S.String),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, parentDocumentId, search } = input;

      const findManyOptions: any = {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          coverImage: true,
          createdAt: true,
          icon: true,
          title: true,
          updatedAt: true,
        },
        where: {
          isArchived: false,
          parentDocumentId: parentDocumentId ?? null,
          userId: ctx.userId,
          ...(search
            ? {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              }
            : {}),
        },
      };
      if (cursor) findManyOptions.cursor = { id: cursor };
      if (limit) findManyOptions.take = limit + 1;

      const documents = await prisma.document.findMany(findManyOptions);

      let nextCursor: typeof cursor | undefined;

      if (limit && documents.length > limit) {
        const nextItem = documents.pop();
        nextCursor = nextItem!.id;
      }

      return {
        documents,
        nextCursor,
      };
    }),
  trash: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          q: S.String.pipe(S.optional),
        })
      )
    )
    .query(async ({ ctx, input }) => {
      const documents = await prisma.document.findMany({
        select: {
          id: true,
          icon: true,
          title: true,
        },
        where: {
          isArchived: true,
          title: {
            contains: input.q ?? "",
          },
          userId: ctx.userId,
        },
      });

      return {
        documents,
      };
    }),
});
