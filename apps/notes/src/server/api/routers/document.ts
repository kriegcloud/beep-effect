import { isTemplateDocument } from "@beep/notes/components/editor/utils/useTemplateDocument";
import { nid } from "@beep/notes/lib/nid";
import { prisma } from "@beep/notes/server/db";
import { TRPCError } from "@trpc/server";
import { NodeApi } from "platejs";
import { z } from "zod";

import { protectedProcedure } from "../middlewares/procedures";
import { ratelimitMiddleware } from "../middlewares/ratelimitMiddleware";
import { createRouter } from "../trpc";

const MAX_TITLE_LENGTH = 256;
const MAX_CONTENT_LENGTH = 1_000_000; // 1MB of text
const MAX_ICON_LENGTH = 100;

export const documentMutations = {
  archive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
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
      z.object({
        contentRich: z.any().optional(),
        parentDocumentId: z.string().optional(),
        title: z.string().max(MAX_TITLE_LENGTH, "Title is too long").optional(),
      })
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

      return await prisma.document.create({
        data: {
          id: nid(),
          contentRich: input.contentRich,
          parentDocumentId: input.parentDocumentId ?? null,
          title: input.title,
          userId: ctx.userId,
        },
        select: { id: true },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
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
      z.object({
        id: z.string(),
      })
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
      z.object({
        id: z.string(),
        content: z.string().max(MAX_CONTENT_LENGTH, "Content is too long").optional(),
        contentRich: z.any().optional(),
        coverImage: z.string().max(500).optional(),
        fullWidth: z.boolean().optional(),
        icon: z.string().max(MAX_ICON_LENGTH).nullish(),
        isPublished: z.boolean().optional(),
        lockPage: z.boolean().optional(),
        smallText: z.boolean().optional(),
        textStyle: z.enum(["DEFAULT", "SERIF", "MONO"]).optional(),
        title: z.string().max(MAX_TITLE_LENGTH, "Title is too long").optional(),
        toc: z.boolean().optional(),
      })
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

      await prisma.document.update({
        data: {
          content: input.content,
          contentRich: input.contentRich,
          coverImage: input.coverImage,
          fullWidth: input.fullWidth,
          icon: input.icon,
          isPublished: input.isPublished,
          lockPage: input.lockPage,
          smallText: input.smallText,
          textStyle: input.textStyle,
          title: input.title,
          toc: input.toc,
        },
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
      z.object({
        id: z.string(),
      })
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
        where: {
          id: isTemplateDocument(input.id) ? undefined : input.id,
          userId_templateId: isTemplateDocument(input.id)
            ? {
                templateId: input.id,
                userId: ctx.userId,
              }
            : undefined,
        },
      });

      return {
        document,
      };
    }),

  documents: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        parentDocumentId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, parentDocumentId, search } = input;

      const documents = await prisma.document.findMany({
        cursor: cursor ? { id: cursor } : undefined,
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
        take: limit ? limit + 1 : undefined,
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
      });

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
      z.object({
        q: z.string().optional(),
      })
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
