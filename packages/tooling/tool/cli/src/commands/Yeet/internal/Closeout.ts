/**
 * GitHub PR closeout inspection for Yeet.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
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

class GhActor extends S.Class<GhActor>($I`GhActor`)(
  {
    login: S.String,
  },
  $I.annote("GhActor", {
    description: "GitHub actor metadata returned by gh.",
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
  },
  $I.annote("GhReviewConnection", {
    description: "Pull request review connection.",
  })
) {}

class GhGraphqlPullRequest extends S.Class<GhGraphqlPullRequest>($I`GhGraphqlPullRequest`)(
  {
    comments: GhPullRequestCommentConnection,
    reviewThreads: GhReviewThreadConnection,
    reviews: GhReviewConnection,
  },
  $I.annote("GhGraphqlPullRequest", {
    description: "Pull request GraphQL payload used by Yeet closeout.",
  })
) {}

class GhGraphqlRepository extends S.Class<GhGraphqlRepository>($I`GhGraphqlRepository`)(
  {
    pullRequest: GhGraphqlPullRequest,
  },
  $I.annote("GhGraphqlRepository", {
    description: "Repository wrapper for pull request GraphQL payload.",
  })
) {}

class GhGraphqlData extends S.Class<GhGraphqlData>($I`GhGraphqlData`)(
  {
    repository: GhGraphqlRepository,
  },
  $I.annote("GhGraphqlData", {
    description: "GraphQL data wrapper.",
  })
) {}

class GhGraphqlDocument extends S.Class<GhGraphqlDocument>($I`GhGraphqlDocument`)(
  {
    data: GhGraphqlData,
  },
  $I.annote("GhGraphqlDocument", {
    description: "GitHub GraphQL response document.",
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
const decodeGhGraphqlDocument = S.decodeUnknownEffect(S.fromJsonString(GhGraphqlDocument));

const closeoutQuery = `
query YeetPrCloseout($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      comments(first: 100) {
        nodes { id body url createdAt author { login } }
      }
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 20) { nodes { id body url createdAt author { login } } }
        }
      }
      reviews(first: 100) {
        nodes {
          id
          body
          state
          submittedAt
          author { login }
          comments(first: 50) { nodes { id body url path line author { login } } }
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

const isBotComment = (tokens: ReadonlyArray<string>, author: GhActor | null, body: string): boolean =>
  textMatchesAnyToken(tokens, authorLogin(author)) || textMatchesAnyToken(tokens, body);

const isGreptileComment = (author: GhActor | null, body: string): boolean =>
  Str.includes("greptile")(Str.toLowerCase(authorLogin(author))) || Str.includes("greptile")(Str.toLowerCase(body));

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
    A.filter((comment) => isGreptileComment(comment.author, comment.body)),
    A.reverse,
    A.head,
    O.map((comment) =>
      GreptileSummary.make({
        ...pipe(
          parseIssueCount(comment.body),
          O.match({ onNone: () => ({}), onSome: (issueCount) => ({ issueCount }) })
        ),
        ...pipe(parseScore(comment.body), O.match({ onNone: () => ({}), onSome: (score) => ({ score }) })),
        url: comment.url,
      })
    ),
    O.getOrElse(() => GreptileSummary.make({}))
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
  ...(options.requireGreptileIssues >= 0 && greptile.issueCount !== options.requireGreptileIssues
    ? [
        closeoutIssue(
          "greptile:issues",
          "greptile-review",
          `Expected Greptile issues ${options.requireGreptileIssues}; found ${greptile.issueCount ?? "unknown"}.`,
          [...(greptile.url === undefined ? [] : [greptile.url])]
        ),
      ]
    : []),
];

const collectPrCloseoutPayload = Effect.fn("YeetCloseout.collectPrCloseoutPayload")(function* (
  context: RepoRunContext
): Effect.fn.Return<
  { readonly document: GhGraphqlDocument; readonly pr: GhPrView },
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
  const document = yield* ghOutput(
    context,
    [
      "api",
      "graphql",
      "-f",
      `query=${closeoutQuery}`,
      "-F",
      `owner=${repo.owner.login}`,
      "-F",
      `name=${repo.name}`,
      "-F",
      `number=${pr.number}`,
    ],
    "gh api graphql"
  ).pipe(
    Effect.flatMap((output) =>
      decodeGhGraphqlDocument(output).pipe(
        Effect.mapError(YeetCommandError.new("Failed to decode PR closeout GraphQL JSON."))
      )
    )
  );

  return { document, pr };
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
  const { document, pr } = yield* collectPrCloseoutPayload(context);
  const pullRequest = document.data.repository.pullRequest;
  const botTokens = normalizedTokens(options.bots);
  const actionableThreads = pipe(
    pullRequest.reviewThreads.nodes,
    A.filter((thread) => !thread.isResolved && !thread.isOutdated)
  );
  const threadIssues = pipe(actionableThreads, A.map(reviewThreadIssue));
  const topLevelBotComments = pipe(
    pullRequest.comments.nodes,
    A.filter((comment) => isBotComment(botTokens, comment.author, comment.body))
  );
  const reviewBotComments = pipe(
    pullRequest.reviews.nodes,
    A.flatMap((review) => [
      ...(isBotComment(botTokens, review.author, review.body)
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
        A.filter((comment) => isBotComment(botTokens, comment.author, comment.body)),
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
    yield* ghOutput(context, ["pr", "comment", `${pr.number}`, "--body", "@greptileai review"], "gh pr comment");
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
