import { useDebouncedCallback } from "@beep/notes/hooks/useDebounceCallback";
import { useWarnIfUnsavedChanges } from "@beep/notes/hooks/useWarnIfUnsavedChanges";
import { mergeDefined } from "@beep/notes/lib/mergeDefined";
import { api, useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { produce } from "immer";
import { useCallback } from "react";
export const useUpdateDocumentMutation = (): ReturnType<typeof api.document.update.useMutation> => {
  const trpc = useTRPC();

  return api.document.update.useMutation({
    onError: (_, __, context: UnsafeTypes.UnsafeAny) => {
      if (context?.previousDocuments) {
        trpc.document.documents.setData({}, context.previousDocuments);
      }
      if (context?.previousDocument) {
        trpc.document.document.setData({ id: context.id }, context.previousDocument);
      }
    },
    onMutate: async (input) => {
      await trpc.document.documents.cancel();
      await trpc.document.document.cancel({ id: input.id });

      const previousDocuments = trpc.document.documents.getData({});
      const previousDocument = trpc.document.document.getData({ id: input.id });

      trpc.document.document.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft?.document) return;

          draft.document = {
            ...mergeDefined(input, draft.document, {
              omitNull: true,
            }),
          };
        })
      );

      trpc.document.documents.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return;

          draft.documents = draft.documents.map((document) => {
            if (document.id === input.id) {
              return mergeDefined(input, document, { omitNull: true });
            }

            return document;
          });
        })
      );

      return { id: input.id, previousDocument, previousDocuments };
    },
  });
};

export const useUpdateDocumentTitle = () => {
  const updateDocument = useUpdateDocumentMutation();
  const trpc = useTRPC();

  const updateDocumentDebounced = useDebouncedCallback(updateDocument.mutate, 500);

  return useCallback(
    (input: { id: string; title: string }) => {
      updateDocumentDebounced({
        id: input.id,
        title: input.title,
      });

      const currentDocument = trpc.document.document.getData({ id: input.id });
      const parentDocumentId = currentDocument?.document?.parentDocumentId;

      void Promise.all([
        trpc.document.document.setData({ id: input.id }, (prevData) =>
          produce(prevData, (draft) => {
            if (draft?.document) {
              draft.document = {
                ...mergeDefined(input, draft.document, {
                  omitNull: true,
                }),
              };
            }
          })
        ),
        trpc.document.documents.setData({}, (prevData) =>
          produce(prevData, (draft) => {
            if (!draft) return draft;

            draft.documents = draft.documents.map((document) => {
              if (document.id === input.id) {
                return mergeDefined(input, document, { omitNull: true });
              }

              return document;
            });
          })
        ),
        parentDocumentId
          ? trpc.document.documents.setData({ parentDocumentId }, (prevData) =>
              produce(prevData, (draft) => {
                if (!draft) return draft;

                draft.documents = draft.documents.map((document) => {
                  if (document.id === input.id) {
                    return mergeDefined(input, document, { omitNull: true });
                  }

                  return document;
                });
              })
            )
          : Promise.resolve(),
      ]);
    },
    [trpc, updateDocumentDebounced]
  );
};

export const useArchiveDocumentMutation = (): ReturnType<typeof api.document.archive.useMutation> => {
  const trpc = useTRPC();

  return api.document.archive.useMutation({
    onError: (_, __, context: UnsafeTypes.UnsafeAny) => {
      if (context?.previousDocuments) {
        trpc.document.documents.setData({}, context.previousDocuments);
      }
      if (context?.previousDocument) {
        trpc.document.document.setData({ id: context.id }, context.previousDocument);
      }
    },
    onMutate: async (input) => {
      await trpc.document.documents.cancel();
      await trpc.document.document.cancel({ id: input.id });

      const previousDocuments = trpc.document.documents.getData({});
      const previousDocument = trpc.document.document.getData({ id: input.id });

      trpc.document.documents.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          draft.documents = draft.documents.filter((document) => document.id !== input.id);
        })
      );

      trpc.document.document.setData({ id: input.id }, (old) =>
        old
          ? produce(old, (draft) => {
              if (!draft.document) return;

              draft.document.isArchived = true;
            })
          : old
      );

      return { id: input.id, previousDocument, previousDocuments };
    },
    onSuccess: () => {
      void trpc.document.documents.invalidate();
    },
  });
};

export const useUpdateDocumentValue = () => {
  const trpc = useTRPC();
  const updateDocument = useUpdateDocumentMutation();
  const updateDocumentDebounced = useDebouncedCallback(updateDocument.mutate, 500);

  useWarnIfUnsavedChanges({ enabled: updateDocumentDebounced.isPending() });

  return useCallback(
    (input: { id: string; value: UnsafeTypes.UnsafeAny }) => {
      updateDocumentDebounced({
        id: input.id,
        contentRich: input.value,
      });

      void trpc.document.document.setData({ id: input.id }, (prevData) =>
        produce(prevData, (draft) => {
          if (draft?.document) {
            draft.document.contentRich = input.value;
          }
        })
      );
    },
    [trpc, updateDocumentDebounced]
  );
};
