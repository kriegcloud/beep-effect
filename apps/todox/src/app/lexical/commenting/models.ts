import { $TodoxId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import { noOp } from "@beep/utils";
import {
  type Provider as _Provider,
  type ProviderAwareness as _ProviderAwareness,
  TOGGLE_CONNECT_COMMAND,
} from "@lexical/yjs";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { LexicalEditor } from "lexical";
import { COMMAND_PRIORITY_LOW } from "lexical";
import React from "react";
import { Doc as _Doc, type Transaction, Array as YArray, YArrayEvent, type YEvent, Map as YMap } from "yjs";

const createUID = () => F.pipe(Math.random().toString(36), Str.replace(/[^a-z]+/g, ""), Str.substring(0, 5));

const $I = $TodoxId.create("lexical/commenting/models");

export class Doc extends S.instanceOf(_Doc).annotations(
  $I.annotations("Doc", {
    description: "Doc",
  })
) {
  static readonly is = S.is(Doc);
}

export declare namespace Doc {
  export type Type = typeof Doc.Type;
}
export const hasProperties: {
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    ...properties: Properties
  ): (self: unknown) => self is { [K in Properties[number]]: unknown };
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    properties: Properties
  ): self is { [K in Properties[number]]: unknown };
} = F.dual(
  2,
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    property: Properties
  ): self is { [K in Properties[number]]: unknown } => P.isObject(self) && A.every(property, P.hasProperty)
);

export class ProviderAwareness extends S.declare((u: unknown): u is _ProviderAwareness => {
  if (!(P.isRecord(u) || P.isObject(u))) return false;

  if (!hasProperties("getLocalState", "getStates", "off", "on", "setLocalState", "setLocalStateField")(u)) return false;

  return F.pipe(
    u,
    P.struct({
      getLocalState: P.isFunction,
      getStates: P.isFunction,
      off: P.isFunction,
      on: P.isFunction,
    })
  );
}) {
  static readonly is = S.is(ProviderAwareness);
}

export declare namespace ProviderAwareness {
  export type Type = typeof ProviderAwareness.Type;
}

export class Provider extends S.declare((u: unknown): u is _Provider => {
  if (!P.isObject(u)) return false;

  if (!hasProperties("awareness", "connect", "disconnect", "on", "off")(u)) return false;

  return F.pipe(
    u,
    P.struct({
      awareness: ProviderAwareness.is,
      disconnect: F.isFunction,
      connect: F.isFunction,
      off: F.isFunction,
      on: F.isFunction,
    })
  );
}).annotations(
  $I.annotations("Provider", {
    description: "Provider",
  })
) {
  static readonly is = S.is(Provider);
}

export declare namespace Provider {
  export type Type = typeof Provider.Type;
}

export class ProviderWithDoc extends S.declare(
  (u: unknown): u is Provider.Type & { readonly doc: Doc.Type } =>
    S.is(Provider)(u) && P.hasProperty("doc")(u) && Doc.is(u.doc)
) {
  static readonly is = S.is(ProviderWithDoc);
}

export declare namespace ProviderWithDoc {
  export type Type = typeof ProviderWithDoc.Type;
}

export class Comment extends S.Class<Comment>($I`Comment`)(
  {
    author: S.String,
    content: S.String,
    deleted: S.Boolean,
    id: S.String,
    timeStamp: BS.DateTimeUtcFromAllAcceptable,
    type: S.tag("comment"),
  },
  $I.annotations("Comment", {
    description: "Comment",
  })
) {
  static readonly create = (payload: {
    readonly content: string;
    readonly author: string;
    readonly id?: undefined | string;
    readonly timeStamp?: undefined | DateTime.Utc;
    readonly deleted?: undefined | boolean;
  }): Comment => {
    return new Comment({
      author: payload.author,
      content: payload.content,
      deleted: Boolean(payload.deleted),
      id: payload.id ?? createUID(),
      timeStamp: payload.timeStamp ?? DateTime.unsafeNow().pipe(DateTime.toUtc),
      type: "comment",
    });
  };

  static readonly markDeleted = (comment: Comment) =>
    new Comment({
      author: comment.author,
      content: `[Deleted Comment]`,
      deleted: true,
      id: comment.id,
      timeStamp: comment.timeStamp,
      type: "comment",
    });
}

export class Thread extends S.Class<Thread>($I`Thread`)(
  {
    comments: S.Array(Comment).pipe(S.mutable),
    id: S.String,
    quote: S.String,
    type: S.tag("thread"),
  },
  $I.annotations("Thread", {
    description: "Thread",
  })
) {
  static readonly create = (payload: { readonly quote: string; comments: Array<Comment>; id?: string | undefined }) =>
    new Thread({
      comments: payload.comments,
      quote: payload.quote,
      id: P.isUndefined(payload.id) ? createUID() : payload.id,
    });

  static readonly clone = (thread: Thread) =>
    new Thread({
      comments: Array.from(thread.comments),
      id: thread.id,
      quote: thread.quote,
    });
}

export class CommentOrThread extends S.Union(Thread, Comment).annotations(
  $I.annotations("CommentOrThread", {
    description: "CommentOrThread",
  })
) {}

export declare namespace CommentOrThread {
  export type Type = typeof CommentOrThread.Type;
}

export class Comments extends S.Array(CommentOrThread)
  .pipe(S.mutable)
  .annotations(
    $I.annotations("Comments", {
      description: "Comments",
    })
  ) {}

export declare namespace Comments {
  export type Type = typeof Comments.Type;
}

function triggerOnChange(commentStore: CommentStore): void {
  const listeners = commentStore._changeListeners;
  for (const listener of listeners) {
    listener();
  }
}

export class CommentStore extends Data.Class {
  _editor: LexicalEditor;
  _comments: Comments.Type;
  _changeListeners: MutableHashSet.MutableHashSet<() => void>;
  _collabProvider: O.Option<ProviderWithDoc.Type>;

  constructor(editor: LexicalEditor) {
    super();
    this._comments = [];
    this._editor = editor;
    this._collabProvider = O.none<ProviderWithDoc.Type>();
    this._changeListeners = MutableHashSet.empty<() => void>();
  }

  readonly isCollaborative = (): boolean => O.isSome(this._collabProvider);

  readonly getComments = (): Comments.Type => {
    return this._comments;
  };

  readonly addComment = (payload: {
    readonly commentOrThread: CommentOrThread.Type;
    thread?: undefined | Thread;
    offset?: undefined | number;
  }): void => {
    const nextComments = this._comments;

    const sharedCommentsArrayOpt: O.Option<YArray<UnsafeTypes.UnsafeAny>> = this._getCollabComments();
    Match.value([payload.commentOrThread, payload.thread]).pipe(
      Match.when([S.is(Comment), P.isNotNullable], ([commentOrThread, thread]) => {
        for (let i = 0; i < nextComments.length; i++) {
          const comment = nextComments[i]!;

          if (comment.type === "thread" && comment.id === thread.id) {
            const newThread = Thread.clone(comment);
            nextComments.splice(i, 1, newThread);
            const insertOffset = payload.offset !== undefined ? payload.offset : newThread.comments.length;
            if (this.isCollaborative() && O.isSome(sharedCommentsArrayOpt)) {
              const parentSharedArray = sharedCommentsArrayOpt.value.get(i).get("comments");
              this._withRemoteTransaction(() => {
                const sharedMap = this._createCollabSharedMap(commentOrThread);
                parentSharedArray.insert(insertOffset, [sharedMap]);
              });
            }
            newThread.comments.splice(insertOffset, 0, commentOrThread);
            break;
          }
        }
      }),
      Match.when([S.is(Thread), P.or(S.is(Thread), P.isUndefined)], ([thread]) => {
        const insertOffset = O.fromNullable(payload.offset).pipe(
          O.match({
            onNone: () => A.length(nextComments),
            onSome: F.identity,
          })
        );

        if (this.isCollaborative() && O.isSome(sharedCommentsArrayOpt)) {
          this._withRemoteTransaction(() => {
            const sharedMap = this._createCollabSharedMap(thread);
            sharedCommentsArrayOpt.value.insert(insertOffset, [sharedMap]);
          });
        }
        nextComments.splice(insertOffset, 0, thread);
      }),
      Match.orElse(noOp)
    );

    this._comments = nextComments;
    triggerOnChange(this);
  };

  deleteCommentOrThread(
    commentOrThread: CommentOrThread.Type,
    thread?: undefined | Thread
  ): O.Option<{ markedComment: Comment; index: number }> {
    const nextComments = Array.from(this._comments);
    // The YJS types explicitly use `any` as well.
    const sharedCommentsArrayOpt: O.Option<YArray<UnsafeTypes.UnsafeAny>> = this._getCollabComments();
    let commentIndex: number | null = null;
    const threadOpt = O.fromNullable(thread);

    threadOpt.pipe(
      O.match({
        onNone: () => {
          commentIndex = nextComments.indexOf(commentOrThread);
          if (this.isCollaborative() && O.isSome(sharedCommentsArrayOpt)) {
            this._withRemoteTransaction(() => {
              if (P.isNumber(commentIndex)) {
                sharedCommentsArrayOpt.value.delete(commentIndex);
              }
            });
          }
          if (P.isNumber(commentIndex)) {
            nextComments.splice(commentIndex, 1);
          }
        },
        onSome: (thread) => {
          for (let i = 0; i < nextComments.length; i++) {
            const nextComment = nextComments[i]!;
            if (nextComment.type === "thread" && nextComment.id === thread.id) {
              const newThread = Thread.clone(nextComment);
              nextComments.splice(i, 1, newThread);
              const threadComments = newThread.comments;
              commentIndex = threadComments.indexOf(commentOrThread as Comment);
              if (this.isCollaborative() && O.isSome(sharedCommentsArrayOpt)) {
                const parentSharedArray = sharedCommentsArrayOpt.value.get(i).get("comments");
                this._withRemoteTransaction(() => {
                  parentSharedArray.delete(commentIndex);
                });
              }
              threadComments.splice(commentIndex, 1);
              break;
            }
          }
        },
      })
    );

    this._comments = nextComments;
    triggerOnChange(this);
    if (commentOrThread.type === "comment" && P.isNumber(commentIndex)) {
      return O.some({
        index: commentIndex,
        markedComment: Comment.markDeleted(commentOrThread),
      });
    }

    return O.none();
  }

  registerOnChange(onChange: () => void): () => void {
    const changeListeners = this._changeListeners;
    MutableHashSet.add(onChange)(changeListeners);
    return () => {
      MutableHashSet.remove(onChange)(changeListeners);
    };
  }

  _getCollabComments(): O.Option<YArray<UnsafeTypes.UnsafeAny>> {
    const provider = this._collabProvider;
    return F.pipe(
      provider,
      O.flatMap(O.liftPredicate(ProviderWithDoc.is)),
      O.map((provider) => provider.doc.get("comments", YArray) as YArray<UnsafeTypes.UnsafeAny>)
    );
  }

  _createCollabSharedMap(commentOrThread: CommentOrThread.Type): YMap<UnsafeTypes.UnsafeAny> {
    const sharedMap = new YMap();
    const type = commentOrThread.type;
    const id = commentOrThread.id;
    sharedMap.set("type", type);
    sharedMap.set("id", id);
    Match.value(commentOrThread).pipe(
      Match.discriminatorsExhaustive("type")({
        comment: (comment) => {
          sharedMap.set("author", comment.author);
          sharedMap.set("content", comment.content);
          sharedMap.set("deleted", comment.deleted);
          sharedMap.set("timeStamp", comment.timeStamp);
        },
        thread: (thread) => {
          sharedMap.set("quote", thread.quote);
          const commentsArray = new YArray();
          thread.comments.forEach((comment, i) => {
            const sharedChildComment = this._createCollabSharedMap(comment);
            commentsArray.insert(i, [sharedChildComment]);
          });
          sharedMap.set("comments", commentsArray);
        },
      })
    );

    return sharedMap;
  }

  _withRemoteTransaction(fn: () => void): void {
    const provider = this._collabProvider;
    if (O.isSome(provider)) {
      const doc = provider.value.doc;
      doc.transact(fn, this);
    }
  }

  _withLocalTransaction(fn: () => void): void {
    const collabProvider = this._collabProvider;
    try {
      this._collabProvider = O.none<ProviderWithDoc.Type>();
      fn();
    } finally {
      this._collabProvider = collabProvider;
    }
  }

  registerCollaboration(provider: ProviderWithDoc.Type): () => void {
    this._collabProvider = O.some(provider);
    const sharedCommentsArray = this._getCollabComments();

    const connect = () => {
      provider.connect();
    };

    const disconnect = () => {
      try {
        provider.disconnect();
      } catch (_e) {
        console.error("Comments disconnect failed!", _e);
        // Do nothing
      }
    };

    const unsubscribe = this._editor.registerCommand(
      TOGGLE_CONNECT_COMMAND,
      (payload) => {
        if (connect !== undefined && disconnect !== undefined) {
          if (payload) {
            console.log("Comments connected!");
            connect();
          } else {
            console.log("Comments disconnected!");
            disconnect();
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const onSharedCommentChanges = (
      // The YJS types explicitly use `any` as well.

      events: Array<YEvent<UnsafeTypes.UnsafeAny>>,
      transaction: Transaction
    ) => {
      if (transaction.origin !== this) {
        for (let i = 0; i < events.length; i++) {
          const event = events[i]!;

          if (event instanceof YArrayEvent) {
            const target = event.target;
            const deltas = event.delta;
            let offset = 0;

            for (let s = 0; s < deltas.length; s++) {
              const delta = deltas[s]!;
              const insert = delta.insert;
              const retain = delta.retain;
              const del = delta.delete;
              const parent = target.parent;
              const parentThread =
                O.isSome(sharedCommentsArray) && target === sharedCommentsArray.value
                  ? undefined
                  : parent instanceof YMap &&
                    (this._comments.find((t) => t.id === parent.get("id")) as Thread | undefined);

              if (Array.isArray(insert)) {
                insert
                  .slice()
                  .reverse()
                  .forEach((map: YMap<UnsafeTypes.UnsafeAny>) => {
                    const id = map.get("id");
                    const type = map.get("type");

                    const commentOrThread =
                      type === "thread"
                        ? Thread.create({
                            quote: map.get("quote"),
                            comments: map
                              .get("comments")
                              .toArray()
                              .map((innerComment: Map<string, string | number | boolean>) =>
                                Comment.create({
                                  content: innerComment.get("content") as string,
                                  author: innerComment.get("author") as string,
                                  id: innerComment.get("id") as string,
                                  timeStamp: S.decodeUnknownSync(BS.DateTimeUtcFromAllAcceptable)(
                                    innerComment.get("timeStamp")
                                  ),
                                  deleted: innerComment.get("deleted") as boolean,
                                })
                              ),
                            id,
                          })
                        : Comment.create({
                            content: map.get("content"),
                            author: map.get("author"),
                            id,
                            timeStamp: S.decodeUnknownSync(BS.DateTimeUtcFromAllAcceptable)(map.get("timeStamp")),
                            deleted: map.get("deleted"),
                          });
                    this._withLocalTransaction(() => {
                      this.addComment({
                        commentOrThread,
                        thread: P.isBoolean(parentThread) ? undefined : parentThread,
                        offset,
                      });
                    });
                  });
              } else if (P.isNumber(retain)) {
                offset += retain;
              } else if (P.isNumber(del)) {
                for (let d = 0; d < del; d++) {
                  const commentOrThread =
                    P.isUndefined(parentThread) || parentThread === false
                      ? this._comments[offset]!
                      : parentThread.comments[offset]!;
                  this._withLocalTransaction(() => {
                    this.deleteCommentOrThread(commentOrThread, P.isBoolean(parentThread) ? undefined : parentThread);
                  });
                  offset++;
                }
              }
            }
          }
        }
      }
    };

    if (O.isNone(sharedCommentsArray)) {
      return () => null;
    }

    sharedCommentsArray.value.observeDeep(onSharedCommentChanges);

    connect();

    return () => {
      sharedCommentsArray.value.unobserveDeep(onSharedCommentChanges);
      unsubscribe();
      this._collabProvider = O.none();
    };
  }
}

export function useCommentStore(commentStore: CommentStore): Comments.Type {
  const [comments, setComments] = React.useState<Comments.Type>(commentStore.getComments());

  React.useEffect(() => {
    return commentStore.registerOnChange(() => {
      setComments(commentStore.getComments());
    });
  }, [commentStore]);

  return comments;
}
