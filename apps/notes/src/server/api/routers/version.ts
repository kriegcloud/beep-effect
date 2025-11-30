// import { getNodeString } from '@udecode/plate/server';

import { getTemplateDocument } from "@beep/notes/components/editor/utils/useTemplateDocument";
import { nid } from "@beep/notes/lib/nid";
import { prisma } from "@beep/notes/server/db";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { omit } from "lodash";
import { NodeApi } from "platejs";

import { protectedProcedure } from "../middlewares/procedures";
import { ratelimitMiddleware } from "../middlewares/ratelimitMiddleware";
import { createRouter } from "../trpc";

const versionMutations = {
  createVersion: protectedProcedure
    .use(ratelimitMiddleware("version/create"))
    .input(
      S.decodeUnknownSync(
        S.Struct({
          documentId: S.String,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const document = await prisma.document.findUniqueOrThrow({
        select: {
          contentRich: true,
          templateId: true,
          title: true,
        },
        where: {
          id: input.documentId,
          userId: ctx.userId,
        },
      });

      if (!document.contentRich && document.templateId) {
        const template = getTemplateDocument(document.templateId);

        document.contentRich = template?.value as any;
      }

      return await prisma.documentVersion.create({
        data: {
          id: nid(),
          contentRich: document.contentRich as any,
          documentId: input.documentId,
          title: document.title,
          userId: ctx.userId,
        },
        select: { id: true },
      });
    }),

  deleteVersion: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.documentVersion.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  restoreVersion: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const version = await prisma.documentVersion.findUniqueOrThrow({
        select: {
          contentRich: true,
          documentId: true,
          title: true,
        },
        where: {
          id: input.id,
        },
      });

      const content = version.contentRich ? NodeApi.string({ children: version.contentRich as any, type: "root" }) : "";

      return await prisma.document.update({
        data: {
          content,
          contentRich: version.contentRich as any,
          title: version.title,
        },
        where: {
          id: version.documentId,
          userId: ctx.userId,
        },
      });
    }),
};

export const versionRouter = createRouter({
  ...versionMutations,
  documentVersion: protectedProcedure
    .input(S.decodeUnknownSync(S.Struct({ documentVersionId: S.String })))
    .query(async ({ input }) => {
      const version = await prisma.documentVersion.findUniqueOrThrow({
        select: {
          id: true,
          contentRich: true,
          createdAt: true,
          documentId: true,
          title: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        where: {
          id: input.documentVersionId,
        },
      });

      return {
        ...omit(version, "User"),
        userId: version.user.id,
        username: version.user.username,
      };
    }),

  documentVersions: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          documentId: S.String,
        })
      )
    )
    .query(async ({ input }) => {
      const versions = await prisma.documentVersion.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          contentRich: true,
          createdAt: true,
          title: true,
          user: {
            select: {
              id: true,
              profileImageUrl: true,
              username: true,
            },
          },
        },
        where: {
          documentId: input.documentId,
        },
      });

      return {
        versions: A.map(versions, (version) => ({
          ...omit(version, "User"),
          profileImageUrl: version.user.profileImageUrl,
          userId: version.user.id,
          username: version.user.username,
        })),
      };
    }),
});
