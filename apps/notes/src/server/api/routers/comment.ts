import { nid } from "@beep/notes/lib/nid";
import { prisma } from "@beep/notes/server/db";
import { TRPCError } from "@trpc/server";
import { NodeApi } from "platejs";
import { z } from "zod";

import { protectedProcedure } from "../middlewares/procedures";
import { ratelimitMiddleware } from "../middlewares/ratelimitMiddleware";
import { createRouter } from "../trpc";

const MAX_COMMENT_LENGTH = 50_000; // 50KB for rich content
const MAX_DOCUMENT_CONTENT_LENGTH = 1000; // Reasonable length for highlighted text

export const commentMutations = {
  createComment: protectedProcedure
    .use(ratelimitMiddleware("comment/create"))
    .input(
      z.object({
        contentRich: z.array(z.any()).optional(),
        discussionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich as any,
            type: "root",
          })
        : "";

      if (content.length > MAX_COMMENT_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Comment is too long",
        });
      }

      return await prisma.comment.create({
        data: {
          id: nid(),
          content: content,
          contentRich: input.contentRich,
          discussionId: input.discussionId,
          userId: ctx.userId,
        },
        select: { id: true },
      });
    }),
  createDiscussion: protectedProcedure
    .use(ratelimitMiddleware("discussion/create"))
    .input(
      z.object({
        documentContent: z
          .string()
          .min(1, "Document content cannot be empty")
          .max(MAX_DOCUMENT_CONTENT_LENGTH, "Selected text is too long"),
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.discussion.create({
        data: {
          id: nid(),
          documentContent: input.documentContent,
          documentId: input.documentId,
          userId: ctx.userId,
        },
        select: { id: true },
      });
    }),
  createDiscussionWithComment: protectedProcedure
    .use(ratelimitMiddleware("discussion/create"))
    .input(
      z.object({
        contentRich: z.array(z.any()).optional(),
        discussionId: z.string().optional(),
        documentContent: z
          .string()
          .min(1, "Document content cannot be empty")
          .max(MAX_DOCUMENT_CONTENT_LENGTH, "Selected text is too long"),
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich as any,
            type: "root",
          })
        : "";

      if (content.length > MAX_COMMENT_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Comment is too long",
        });
      }

      const discussion = await prisma.discussion.create({
        data: {
          id: input.discussionId ?? nid(),
          documentContent: input.documentContent,
          documentId: input.documentId,
          userId: ctx.userId,
        },
        select: { id: true },
      });

      await prisma.comment.create({
        data: {
          id: nid(),
          content,
          contentRich: input.contentRich,
          discussionId: discussion.id,
          userId: ctx.userId,
        },
      });

      return discussion;
    }),
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string(), discussionId: z.string() }))
    .mutation(({ input }) => {
      return prisma.comment.delete({
        where: { id: input.id, discussionId: input.discussionId },
      });
    }),
  removeDiscussion: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    return prisma.discussion.delete({
      where: { id: input.id },
    });
  }),
  resolveDiscussion: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    return prisma.discussion.update({
      data: { isResolved: true },
      where: { id: input.id },
    });
  }),
  updateComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        contentRich: z.array(z.any()).optional(),
        discussionId: z.string(),
        isEdited: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich as any,
            type: "root",
          })
        : undefined;

      if (content && content.length > MAX_COMMENT_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Comment is too long",
        });
      }

      return prisma.comment.update({
        data: {
          content,
          contentRich: input.contentRich,
          isEdited: input.isEdited,
        },
        where: { id: input.id },
      });
    }),
};

export const commentRouter = createRouter({
  ...commentMutations,
  discussions: protectedProcedure.input(z.object({ documentId: z.string() })).query(async ({ input }) => {
    const discussions = await prisma.discussion.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            contentRich: true,
            createdAt: true,
            discussionId: true,
            isEdited: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
              },
            },
          },
        },
        createdAt: true,
        documentContent: true,
        isResolved: true,
        user: true,
        userId: true,
      },
      where: {
        documentId: input.documentId,
      },
    });

    return {
      discussions: discussions,
    };
  }),
});
