/**
 * GitHub PR closeout inspection for Yeet.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
// cspell:ignore greptileai

import { $RepoCliId } from "@beep/identity/packages";
import { O as OptionUtils } from "@beep/utils";
import { Effect } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { runRepoCommandCapture } from "../../../internal/repo-run/index.js";
import { YeetCommandError } from "../Yeet.errors.js";
import { QualityIssue, QualityIssueRouting } from "./QualityIssueIndex.js";
import type { ChildProcessSpawner } from "effect/unstable/process";
import type { RepoRunContext } from "../../../internal/repo-run/index.js";

const $I = $RepoCliId.create("commands/Yeet/internal/Closeout");
const GREPTILE_RETRIGGER_COMMENT = "@greptileai review" as const;

/**
 * Greptile retrigger comment body used by closeout mode.
 *
 * @category testing
 * @since 0.0.0
 */
export const greptileRetriggerCommentForTesting = GREPTILE_RETRIGGER_COMMENT;

class GhActor extends S.Class<GhActor>($I`GhActor`)(
  {
    login: S.String,
  },
  $I.annote("GhActor", {
    description: "GitHub actor metadata returned by gh.",
  })
) {}

class GhPageInfo extends S.Class<GhPageInfo>($I`GhPageInfo`)(
  {
    endCursor: S.NullOr(S.String),
    hasNextPage: S.Boolean,
  },
  $I.annote("GhPageInfo", {
    description: "GitHub GraphQL connection pagination metadata.",
  })
) {}

class GhPrView extends S.Class<GhPrView>($I`GhPrView`)(
  {
    headRefName: S.String,
    headRefOid: S.optionalKey(S.String),
    isDraft: S.Boolean,
    number: S.Finite,
    state: S.String,
    url: S.String,
  },
  $I.annote("GhPrView", {
    description: "Current pull request metadata for Yeet closeout.",
  })
) {}

class GhRepoOwner extends S.Class<GhRepoOwner>($I`GhRepoOwner`)(
  {
    login: S.String,
  },
  $I.annote("GhRepoOwner", {
    description: "GitHub repository owner.",
  })
) {}

class GhRepoView extends S.Class<GhRepoView>($I`GhRepoView`)(
  {
    name: S.String,
    owner: GhRepoOwner,
  },
  $I.annote("GhRepoView", {
    description: "GitHub repository metadata for GraphQL queries.",
  })
) {}

class GhComment extends S.Class<GhComment>($I`GhComment`)(
  {
    author: S.NullOr(GhActor),
    body: S.String,
    createdAt: S.optionalKey(S.String),
    id: S.String,
    url: S.String,
  },
  $I.annote("GhComment", {
    description: "Pull request comment returned by GitHub GraphQL.",
  })
) {}

class GhInlineReviewComment extends S.Class<GhInlineReviewComment>($I`GhInlineReviewComment`)(
  {
    author: S.NullOr(GhActor),
    body: S.String,
    id: S.String,
    line: S.NullOr(S.Finite),
    path: S.NullOr(S.String),
    url: S.String,
  },
  $I.annote("GhInlineReviewComment", {
    description: "Inline review comment returned by GitHub GraphQL.",
  })
) {}

class GhInlineReviewCommentConnection extends S.Class<GhInlineReviewCommentConnection>(
  $I`GhInlineReviewCommentConnection`
)(
  {
    nodes: S.Array(GhInlineReviewComment),
    pageInfo: GhPageInfo,
  },
  $I.annote("GhInlineReviewCommentConnection", {
    description: "Inline review comment connection.",
  })
) {}

class GhReviewThreadCommentConnection extends S.Class<GhReviewThreadCommentConnection>(
  $I`GhReviewThreadCommentConnection`
)(
  {
    nodes: S.Array(GhComment),
    pageInfo: GhPageInfo,
  },
  $I.annote("GhReviewThreadCommentConnection", {
    description: "Review thread comment connection.",
  })
) {}

class GhReviewThread extends S.Class<GhReviewThread>($I`GhReviewThread`)(
  {
    comments: GhReviewThreadCommentConnection,
    id: S.String,
    isOutdated: S.Boolean,
    isResolved: S.Boolean,
    line: S.NullOr(S.Finite),
    path: S.NullOr(S.String),
  },
  $I.annote("GhReviewThread", {
    description: "Pull request review thread returned by GitHub GraphQL.",
  })
) {}

class GhReviewThreadConnection extends S.Class<GhReviewThreadConnection>($I`GhReviewThreadConnection`)(
  {
    nodes: S.Array(GhReviewThread),
    pageInfo: GhPageInfo,
  },
  $I.annote("GhReviewThreadConnection", {
    description: "Review thread connection.",
  })
) {}

class GhPullRequestCommentConnection extends S.Class<GhPullRequestCommentConnection>(
  $I`GhPullRequestCommentConnection`
)(
  {
    nodes: S.Array(GhComment),
    pageInfo: GhPageInfo,
  },
  $I.annote("GhPullRequestCommentConnection", {
    description: "Pull request top-level comment connection.",
  })
) {}

class GhReview extends S.Class<GhReview>($I`GhReview`)(
  {
    author: S.NullOr(GhActor),
    body: S.String,
    comments: GhInlineReviewCommentConnection,
    id: S.String,
    state: S.String,
    submittedAt: S.optionalKey(S.String),
  },
  $I.annote("GhReview", {
    description: "Pull request review returned by GitHub GraphQL.",
  })
) {}

class GhReviewConnection extends S.Class<GhReviewConnection>($I`GhReviewConnection`)(
  {
    nodes: S.Array(GhReview),
    pageInfo: GhPageInfo,
  },
  $I.annote("GhReviewConnection", {
    description: "Pull request review connection.",
  })
) {}

class GhCommentsPullRequest extends S.Class<GhCommentsPullRequest>($I`GhCommentsPullRequest`)(
  {
    comments: GhPullRequestCommentConnection,
  },
  $I.annote("GhCommentsPullRequest", {
    description: "Pull request top-level comment page payload.",
  })
) {}

class GhReviewThreadsPullRequest extends S.Class<GhReviewThreadsPullRequest>($I`GhReviewThreadsPullRequest`)(
  {
    reviewThreads: GhReviewThreadConnection,
  },
  $I.annote("GhReviewThreadsPullRequest", {
    description: "Pull request review thread page payload.",
  })
) {}

class GhReviewsPullRequest extends S.Class<GhReviewsPullRequest>($I`GhReviewsPullRequest`)(
  {
    reviews: GhReviewConnection,
  },
  $I.annote("GhReviewsPullRequest", {
    description: "Pull request review page payload.",
  })
) {}

class GhCloseoutPullRequest extends S.Class<GhCloseoutPullRequest>($I`GhCloseoutPullRequest`)(
  {
    comments: GhPullRequestCommentConnection,
    reviewThreads: GhReviewThreadConnection,
    reviews: GhReviewConnection,
  },
  $I.annote("GhGraphqlPullRequest", {
    description: "Pull request GraphQL payload used by Yeet closeout.",
  })
) {}

class GhCommentsRepository extends S.Class<GhCommentsRepository>($I`GhCommentsRepository`)(
  {
    pullRequest: GhCommentsPullRequest,
  },
  $I.annote("GhCommentsRepository", {
    description: "Repository wrapper for pull request comment page payload.",
  })
) {}

class GhReviewThreadsRepository extends S.Class<GhReviewThreadsRepository>($I`GhReviewThreadsRepository`)(
  {
    pullRequest: GhReviewThreadsPullRequest,
  },
  $I.annote("GhReviewThreadsRepository", {
    description: "Repository wrapper for pull request review thread page payload.",
  })
) {}

class GhReviewsRepository extends S.Class<GhReviewsRepository>($I`GhReviewsRepository`)(
  {
    pullRequest: GhReviewsPullRequest,
  },
  $I.annote("GhReviewsRepository", {
    description: "Repository wrapper for pull request review page payload.",
  })
) {}

class GhCommentsData extends S.Class<GhCommentsData>($I`GhCommentsData`)(
  {
    repository: GhCommentsRepository,
  },
  $I.annote("GhCommentsData", {
    description: "GraphQL data wrapper for pull request comment pages.",
  })
) {}

class GhReviewThreadsData extends S.Class<GhReviewThreadsData>($I`GhReviewThreadsData`)(
  {
    repository: GhReviewThreadsRepository,
  },
  $I.annote("GhReviewThreadsData", {
    description: "GraphQL data wrapper for pull request review thread pages.",
  })
) {}

class GhReviewsData extends S.Class<GhReviewsData>($I`GhReviewsData`)(
  {
    repository: GhReviewsRepository,
  },
  $I.annote("GhReviewsData", {
    description: "GraphQL data wrapper for pull request review pages.",
  })
) {}

class GhCommentsDocument extends S.Class<GhCommentsDocument>($I`GhCommentsDocument`)(
  {
    data: GhCommentsData,
  },
  $I.annote("GhCommentsDocument", {
    description: "GitHub GraphQL response document for pull request comment pages.",
  })
) {}

class GhReviewThreadsDocument extends S.Class<GhReviewThreadsDocument>($I`GhReviewThreadsDocument`)(
  {
    data: GhReviewThreadsData,
  },
  $I.annote("GhReviewThreadsDocument", {
    description: "GitHub GraphQL response document for pull request review thread pages.",
  })
) {}

class GhReviewsDocument extends S.Class<GhReviewsDocument>($I`GhReviewsDocument`)(
  {
    data: GhReviewsData,
  },
  $I.annote("GhReviewsDocument", {
    description: "GitHub GraphQL response document for pull request review pages.",
  })
) {}

/**
 * Runtime closeout gates accepted by Yeet.
 *
 * @category models
 * @since 0.0.0
 */
export class PrCloseoutOptions extends S.Class<PrCloseoutOptions>($I`PrCloseoutOptions`)(
  {
    bots: S.String,
    requireGreptileIssues: S.Finite,
    requireGreptileScore: S.String,
    requireReviewComments: S.Finite,
    retriggerGreptile: S.Boolean,
  },
  $I.annote("PrCloseoutOptions", {
    description: "Runtime closeout gates accepted by Yeet.",
  })
) {}

/**
 * Summary of Greptile signal extracted from PR comments.
 *
 * @category models
 * @since 0.0.0
 */
export class GreptileSummary extends S.Class<GreptileSummary>($I`GreptileSummary`)(
  {
    issueCount: S.optionalKey(S.Finite),
    score: S.optionalKey(S.String),
    url: S.optionalKey(S.String),
  },
  $I.annote("GreptileSummary", {
    description: "Greptile score and issue count parsed from PR comments.",
  })
) {}

/**
 * Yeet PR closeout report.
 *
 * @category models
 * @since 0.0.0
 */
export class PrCloseoutReport extends S.Class<PrCloseoutReport>($I`PrCloseoutReport`)(
  {
    actionableReviewThreadCount: S.Finite,
    botCommentCount: S.Finite,
    greptile: GreptileSummary,
    issueCount: S.Finite,
    issues: S.Array(QualityIssue),
    prNumber: S.Finite,
    prUrl: S.String,
    retriggeredGreptile: S.Boolean,
    schemaVersion: S.Literal("yeet-pr-closeout/v1"),
  },
  $I.annote("PrCloseoutReport", {
    description: "Structured PR closeout result emitted by Yeet.",
  })
) {}

const decodeGhPrView = S.decodeUnknownEffect(S.fromJsonString(GhPrView));
const decodeGhRepoView = S.decodeUnknownEffect(S.fromJsonString(GhRepoView));
const decodeGhCommentsDocument = S.decodeUnknownEffect(S.fromJsonString(GhCommentsDocument));
const decodeGhReviewThreadsDocument = S.decodeUnknownEffect(S.fromJsonString(GhReviewThreadsDocument));
const decodeGhReviewsDocument = S.decodeUnknownEffect(S.fromJsonString(GhReviewsDocument));

const commentsPageQuery = `
query YeetPrCloseoutComments($owner: String!, $name: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      comments(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id body url createdAt author { login } }
      }
    }
  }
}
`;

const reviewThreadsPageQuery = `
query YeetPrCloseoutReviewThreads($owner: String!, $name: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { id body url createdAt author { login } }
          }
        }
      }
    }
  }
}
`;

const reviewsPageQuery = `
query YeetPrCloseoutReviews($owner: String!, $name: String!, $number: Int!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviews(first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          body
          state
          submittedAt
          author { login }
          comments(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { id body url path line author { login } }
          }
        }
      }
    }
  }
}
`;

const ghOutput = Effect.fn("YeetCloseout.ghOutput")(function* (
  context: RepoRunContext,
  args: ReadonlyArray<string>,
  label: string
): Effect.fn.Return<string, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* runRepoCommandCapture("gh", args, context.repoRoot).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to run ${label}.`))
  );
  if (result.exitCode !== 0) {
    return yield* YeetCommandError.make({
      message: `${label} failed with exit code ${result.exitCode}.\n${result.output}`,
      command: `gh ${A.join(args, " ")}`,
      exitCode: result.exitCode,
    });
  }
  if (result.truncated) {
    return yield* YeetCommandError.make({
      message: `${label} output exceeded the repo-run capture limit.`,
      command: `gh ${A.join(args, " ")}`,
      exitCode: 1,
    });
  }
  return result.output;
});

const normalizedTokens = (value: string): ReadonlyArray<string> =>
  pipe(
    value,
    Str.split(","),
    A.map((token) => Str.toLowerCase(Str.trim(token))),
    A.filter(Str.isNonEmpty)
  );

const authorLogin = (author: GhActor | null): string => author?.login ?? "unknown";

const textMatchesAnyToken = (tokens: ReadonlyArray<string>, value: string): boolean => {
  const lower = Str.toLowerCase(value);
  return A.some(tokens, (token) => Str.includes(token)(lower));
};

const isBotComment = (tokens: ReadonlyArray<string>, author: GhActor | null): boolean =>
  textMatchesAnyToken(tokens, authorLogin(author));

const isGreptileComment = (author: GhActor | null): boolean =>
  Str.includes("greptile")(Str.toLowerCase(authorLogin(author)));

const scorePattern = /(?<score>\d+(?:\.\d+)?)\s*\/\s*5/u;
const leadingIssueCountPattern = /(?<count>\d+)\s+(?:open\s+)?issues?/iu;
const labeledIssueCountPattern = /(?:open\s+)?issues?\D{0,16}(?<count>\d+)/iu;

const parseScore = (body: string): O.Option<string> =>
  pipe(
    O.fromUndefinedOr(scorePattern.exec(body)?.groups?.score),
    O.map((score) => `${score}/5`)
  );

const parseIssueCount = (body: string): O.Option<number> => {
  if (/no\s+(?:open\s+)?issues?/iu.test(body)) {
    return O.some(0);
  }

  const count =
    leadingIssueCountPattern.exec(body)?.groups?.count ?? labeledIssueCountPattern.exec(body)?.groups?.count;
  return pipe(
    O.fromUndefinedOr(count),
    O.flatMap((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? O.none<number>() : O.some(parsed);
    })
  );
};

const latestGreptileSummary = (comments: ReadonlyArray<GhComment>): GreptileSummary =>
  pipe(
    comments,
    A.filter((comment) => isGreptileComment(comment.author)),
    A.map((comment) =>
      GreptileSummary.make({
        ...OptionUtils.getSomesStruct({ issueCount: parseIssueCount(comment.body) }),
        ...OptionUtils.getSomesStruct({ score: parseScore(comment.body) }),
        url: comment.url,
      })
    ),
    A.filter((summary) => summary.score !== undefined || summary.issueCount !== undefined),
    A.reverse,
    A.head,
    O.getOrElse(() => GreptileSummary.make({}))
  );

type GreptileSummaryCommentInput = {
  readonly authorLogin: string;
  readonly body: string;
  readonly url: string;
};

/**
 * Parse the latest Greptile summary from simplified comment inputs.
 *
 * @param comments - Simplified comment inputs ordered from oldest to newest.
 * @returns Parsed Greptile summary from the latest bot-authored summary comment.
 * @category testing
 * @since 0.0.0
 */
export const latestGreptileSummaryForTesting = (
  comments: ReadonlyArray<GreptileSummaryCommentInput>
): GreptileSummary =>
  latestGreptileSummary(
    pipe(
      comments,
      A.map((comment) =>
        GhComment.make({
          author: GhActor.make({ login: comment.authorLogin }),
          body: comment.body,
          id: comment.url,
          url: comment.url,
        })
      )
    )
  );

const issueRouting = (reason: string): ReadonlyArray<QualityIssueRouting> => [
  QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason }),
];

const closeoutIssue = (
  id: string,
  category: QualityIssue["category"],
  message: string,
  evidence: ReadonlyArray<string>
): QualityIssue =>
  QualityIssue.make({
    blocking: true,
    category,
    confidence: "structured",
    evidence: [...evidence],
    id,
    message,
    packageName: "@beep/root",
    parser: "yeet/pr-closeout/v1",
    routing: [...issueRouting(message)],
    severity: "error",
    tool: "github",
  });

const reviewThreadIssue = (thread: GhReviewThread): QualityIssue => {
  const latestComment = pipe(thread.comments.nodes, A.reverse, A.head);
  const location = `${thread.path ?? "unknown-path"}:${thread.line ?? 0}`;
  const evidence = pipe(
    latestComment,
    O.map((comment) => [comment.url, `${authorLogin(comment.author)}: ${Str.slice(0, 240)(Str.trim(comment.body))}`]),
    O.getOrElse(() => [location])
  );
  return closeoutIssue(
    `pr-review:${thread.id}`,
    "pr-review",
    `Unresolved actionable PR review thread at ${location}.`,
    evidence
  );
};

const greptileIssueLimitExceeded = (issueCount: number | undefined, limit: number): boolean =>
  limit >= 0 && (issueCount === undefined || issueCount > limit);

/**
 * Determine whether the Greptile issue-count gate should block closeout.
 *
 * @param issueCount - Parsed Greptile issue count, if present.
 * @param limit - Maximum accepted issue count. Negative values disable the gate.
 * @returns Whether the issue-count gate should fail.
 * @category testing
 * @since 0.0.0
 */
export const greptileIssueLimitExceededForTesting = greptileIssueLimitExceeded;

const gateIssues = (
  options: PrCloseoutOptions,
  actionableReviewThreadCount: number,
  greptile: GreptileSummary
): ReadonlyArray<QualityIssue> => [
  ...(options.requireReviewComments >= 0 && actionableReviewThreadCount > options.requireReviewComments
    ? [
        closeoutIssue(
          "pr-review:required-count",
          "pr-review",
          `Expected at most ${options.requireReviewComments} unresolved actionable PR review threads; found ${actionableReviewThreadCount}.`,
          []
        ),
      ]
    : []),
  ...(Str.isNonEmpty(Str.trim(options.requireGreptileScore)) && greptile.score !== options.requireGreptileScore
    ? [
        closeoutIssue(
          "greptile:score",
          "greptile-review",
          `Expected Greptile score ${options.requireGreptileScore}; found ${greptile.score ?? "unknown"}.`,
          [...(greptile.url === undefined ? [] : [greptile.url])]
        ),
      ]
    : []),
  ...(greptileIssueLimitExceeded(greptile.issueCount, options.requireGreptileIssues)
    ? [
        closeoutIssue(
          "greptile:issues",
          "greptile-review",
          `Expected at most ${options.requireGreptileIssues} Greptile issues; found ${greptile.issueCount ?? "unknown"}.`,
          [...(greptile.url === undefined ? [] : [greptile.url])]
        ),
      ]
    : []),
];

const closedPageInfo = GhPageInfo.make({ endCursor: null, hasNextPage: false });

const cursorArgs = (cursor: O.Option<string>): ReadonlyArray<string> =>
  O.isSome(cursor) ? ["-F", `cursor=${cursor.value}`] : [];

const nextCursor = (label: string, pageInfo: GhPageInfo): Effect.Effect<O.Option<string>, YeetCommandError> => {
  if (!pageInfo.hasNextPage) {
    return Effect.succeed(O.none());
  }

  return pipe(
    O.fromNullishOr(pageInfo.endCursor),
    O.match({
      onNone: () =>
        Effect.fail(
          YeetCommandError.make({
            message: `${label} reported another GraphQL page without an end cursor.`,
            command: "gh api graphql",
            exitCode: 1,
          })
        ),
      onSome: (cursor) => Effect.succeed(O.some(cursor)),
    })
  );
};

const ghGraphqlPage = Effect.fn("YeetCloseout.ghGraphqlPage")(function* (
  context: RepoRunContext,
  repo: GhRepoView,
  pr: GhPrView,
  query: string,
  cursor: O.Option<string>,
  label: string
): Effect.fn.Return<string, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* ghOutput(
    context,
    [
      "api",
      "graphql",
      "-f",
      `query=${query}`,
      "-F",
      `owner=${repo.owner.login}`,
      "-F",
      `name=${repo.name}`,
      "-F",
      `number=${pr.number}`,
      ...cursorArgs(cursor),
    ],
    label
  );
});

const collectCommentPages = Effect.fn("YeetCloseout.collectCommentPages")(function* (
  context: RepoRunContext,
  repo: GhRepoView,
  pr: GhPrView
): Effect.fn.Return<ReadonlyArray<GhComment>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  let cursor = O.none<string>();
  let comments: ReadonlyArray<GhComment> = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const page = yield* ghGraphqlPage(context, repo, pr, commentsPageQuery, cursor, "gh api graphql comments").pipe(
      Effect.flatMap((output) =>
        decodeGhCommentsDocument(output).pipe(
          Effect.mapError(YeetCommandError.new("Failed to decode PR closeout comments GraphQL JSON."))
        )
      ),
      Effect.map((document) => document.data.repository.pullRequest.comments)
    );
    comments = [...comments, ...page.nodes];
    cursor = yield* nextCursor("pull request comments", page.pageInfo);
    hasNextPage = O.isSome(cursor);
  }

  return comments;
});

const collectReviewThreadPages = Effect.fn("YeetCloseout.collectReviewThreadPages")(function* (
  context: RepoRunContext,
  repo: GhRepoView,
  pr: GhPrView
): Effect.fn.Return<ReadonlyArray<GhReviewThread>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  let cursor = O.none<string>();
  let threads: ReadonlyArray<GhReviewThread> = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const page = yield* ghGraphqlPage(
      context,
      repo,
      pr,
      reviewThreadsPageQuery,
      cursor,
      "gh api graphql review threads"
    ).pipe(
      Effect.flatMap((output) =>
        decodeGhReviewThreadsDocument(output).pipe(
          Effect.mapError(YeetCommandError.new("Failed to decode PR closeout review threads GraphQL JSON."))
        )
      ),
      Effect.map((document) => document.data.repository.pullRequest.reviewThreads)
    );
    const truncatedThread = pipe(
      page.nodes,
      A.findFirst((thread) => thread.comments.pageInfo.hasNextPage)
    );
    if (O.isSome(truncatedThread)) {
      return yield* YeetCommandError.make({
        message: `Review thread ${truncatedThread.value.id} has more than 100 comments; Yeet closeout refuses to silently truncate nested thread comments.`,
        command: "gh api graphql",
        exitCode: 1,
      });
    }

    threads = [...threads, ...page.nodes];
    cursor = yield* nextCursor("pull request review threads", page.pageInfo);
    hasNextPage = O.isSome(cursor);
  }

  return threads;
});

const collectReviewPages = Effect.fn("YeetCloseout.collectReviewPages")(function* (
  context: RepoRunContext,
  repo: GhRepoView,
  pr: GhPrView
): Effect.fn.Return<ReadonlyArray<GhReview>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  let cursor = O.none<string>();
  let reviews: ReadonlyArray<GhReview> = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const page = yield* ghGraphqlPage(context, repo, pr, reviewsPageQuery, cursor, "gh api graphql reviews").pipe(
      Effect.flatMap((output) =>
        decodeGhReviewsDocument(output).pipe(
          Effect.mapError(YeetCommandError.new("Failed to decode PR closeout reviews GraphQL JSON."))
        )
      ),
      Effect.map((document) => document.data.repository.pullRequest.reviews)
    );
    const truncatedReview = pipe(
      page.nodes,
      A.findFirst((review) => review.comments.pageInfo.hasNextPage)
    );
    if (O.isSome(truncatedReview)) {
      return yield* YeetCommandError.make({
        message: `Review ${truncatedReview.value.id} has more than 100 inline comments; Yeet closeout refuses to silently truncate nested review comments.`,
        command: "gh api graphql",
        exitCode: 1,
      });
    }

    reviews = [...reviews, ...page.nodes];
    cursor = yield* nextCursor("pull request reviews", page.pageInfo);
    hasNextPage = O.isSome(cursor);
  }

  return reviews;
});

const collectPrCloseoutPayload = Effect.fn("YeetCloseout.collectPrCloseoutPayload")(function* (
  context: RepoRunContext
): Effect.fn.Return<
  { readonly pullRequest: GhCloseoutPullRequest; readonly pr: GhPrView },
  YeetCommandError,
  ChildProcessSpawner.ChildProcessSpawner
> {
  const pr = yield* ghOutput(
    context,
    ["pr", "view", "--json", "number,headRefName,state,url,headRefOid,isDraft"],
    "gh pr view"
  ).pipe(
    Effect.flatMap((output) =>
      decodeGhPrView(output).pipe(Effect.mapError(YeetCommandError.new("Failed to decode gh pr view JSON.")))
    )
  );
  const repo = yield* ghOutput(context, ["repo", "view", "--json", "owner,name"], "gh repo view").pipe(
    Effect.flatMap((output) =>
      decodeGhRepoView(output).pipe(Effect.mapError(YeetCommandError.new("Failed to decode gh repo view JSON.")))
    )
  );
  const comments = yield* collectCommentPages(context, repo, pr);
  const reviewThreads = yield* collectReviewThreadPages(context, repo, pr);
  const reviews = yield* collectReviewPages(context, repo, pr);
  const pullRequest = GhCloseoutPullRequest.make({
    comments: GhPullRequestCommentConnection.make({ nodes: comments, pageInfo: closedPageInfo }),
    reviewThreads: GhReviewThreadConnection.make({ nodes: reviewThreads, pageInfo: closedPageInfo }),
    reviews: GhReviewConnection.make({ nodes: reviews, pageInfo: closedPageInfo }),
  });

  return { pullRequest, pr };
});

/**
 * Inspect current PR review and bot closeout state.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const runPrCloseout = Effect.fn("YeetCloseout.runPrCloseout")(function* (
  context: RepoRunContext,
  options: PrCloseoutOptions
): Effect.fn.Return<PrCloseoutReport, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const { pullRequest, pr } = yield* collectPrCloseoutPayload(context);
  const botTokens = normalizedTokens(options.bots);
  const actionableThreads = pipe(
    pullRequest.reviewThreads.nodes,
    A.filter((thread) => !thread.isResolved && !thread.isOutdated)
  );
  const threadIssues = pipe(actionableThreads, A.map(reviewThreadIssue));
  const topLevelBotComments = pipe(
    pullRequest.comments.nodes,
    A.filter((comment) => isBotComment(botTokens, comment.author))
  );
  const reviewBotComments = pipe(
    pullRequest.reviews.nodes,
    A.flatMap((review) => [
      ...(isBotComment(botTokens, review.author)
        ? [
            GhComment.make({
              author: review.author,
              body: review.body,
              id: review.id,
              url: pr.url,
            }),
          ]
        : []),
      ...pipe(
        review.comments.nodes,
        A.filter((comment) => isBotComment(botTokens, comment.author)),
        A.map((comment) =>
          GhComment.make({
            author: comment.author,
            body: comment.body,
            id: comment.id,
            url: comment.url,
          })
        )
      ),
    ])
  );
  const botComments = [...topLevelBotComments, ...reviewBotComments];
  const greptile = latestGreptileSummary(botComments);
  const issues = [...threadIssues, ...gateIssues(options, actionableThreads.length, greptile)];

  if (options.retriggerGreptile) {
    yield* ghOutput(context, ["pr", "comment", `${pr.number}`, "--body", GREPTILE_RETRIGGER_COMMENT], "gh pr comment");
  }

  return PrCloseoutReport.make({
    actionableReviewThreadCount: actionableThreads.length,
    botCommentCount: botComments.length,
    greptile,
    issueCount: issues.length,
    issues,
    prNumber: pr.number,
    prUrl: pr.url,
    retriggeredGreptile: options.retriggerGreptile,
    schemaVersion: "yeet-pr-closeout/v1",
  });
});
