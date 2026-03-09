import {
  FetchHttpClient,
  HttpApi,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import { describe, expect, it } from "@effect/vitest"
import { Context, Effect, flow, Layer, Schema } from "effect"

// ============================================================================
// Schemas
// ============================================================================

const UserId = Schema.Number.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

const RepoId = Schema.Number.pipe(Schema.brand("RepoId"))
type RepoId = typeof RepoId.Type

class User extends Schema.Class<User>("User")({
  id: UserId,
  login: Schema.String,
  name: Schema.NullOr(Schema.String),
  public_repos: Schema.Number,
}) {}

class Repo extends Schema.Class<Repo>("Repo")({
  id: RepoId,
  name: Schema.String,
  full_name: Schema.String,
  stargazers_count: Schema.Number,
  language: Schema.NullOr(Schema.String),
}) {}

// ============================================================================
// API Service
// ============================================================================

class GitHubApi extends Context.Tag("GitHubApi")<
  GitHubApi,
  {
    readonly getUser: (username: string) => Effect.Effect<User, unknown>
    readonly getRepo: (owner: string, repo: string) => Effect.Effect<Repo, unknown>
    readonly listRepos: (username: string) => Effect.Effect<ReadonlyArray<Repo>, unknown>
  }
>() {
  static layer = Layer.effect(
    GitHubApi,
    Effect.gen(function* () {
      const baseClient = yield* HttpClient.HttpClient
      const client = baseClient.pipe(HttpClient.mapRequest(HttpClientRequest.prependUrl("https://api.github.com")))

      const getUser = Effect.fn("GitHubApi.getUser")(function* (username: string) {
        const response = yield* client.get(`/users/${username}`)
        return yield* HttpClientResponse.schemaBodyJson(User)(response)
      })

      const getRepo = Effect.fn("GitHubApi.getRepo")(function* (owner: string, repo: string) {
        const response = yield* client.get(`/repos/${owner}/${repo}`)
        return yield* HttpClientResponse.schemaBodyJson(Repo)(response)
      })

      const listRepos = Effect.fn("GitHubApi.listRepos")(function* (username: string) {
        const response = yield* client.get(`/users/${username}/repos`)
        return yield* HttpClientResponse.schemaBodyJson(Schema.Array(Repo))(response)
      })

      return { getUser, getRepo, listRepos }
    }),
  )

  static live = GitHubApi.layer.pipe(Layer.provide(FetchHttpClient.layer))
}

// ============================================================================
// HttpApi Definition
// ============================================================================

const usernameParam = HttpApiSchema.param("username", Schema.String)
const ownerParam = HttpApiSchema.param("owner", Schema.String)
const repoParam = HttpApiSchema.param("repo", Schema.String)

class UsersApi extends HttpApiGroup.make("users")
  .add(HttpApiEndpoint.get("getUser")`/${usernameParam}`.addSuccess(User))
  .add(HttpApiEndpoint.get("listRepos")`/${usernameParam}/repos`.addSuccess(Schema.Array(Repo)))
  .prefix("/users") {}

class ReposApi extends HttpApiGroup.make("repos")
  .add(HttpApiEndpoint.get("getRepo")`/${ownerParam}/${repoParam}`.addSuccess(Repo))
  .prefix("/repos") {}

class GitHubHttpApi extends HttpApi.make("github-api").add(UsersApi).add(ReposApi) {}

// ============================================================================
// Tests
// ============================================================================

describe("HTTP Clients", () => {
  describe("Basic Requests", () => {
    it.effect("fetch and decode a repository", () =>
      Effect.gen(function* () {
        const response = yield* HttpClient.get("https://api.github.com/repos/Effect-TS/effect")
        const repo = yield* HttpClientResponse.schemaBodyJson(Repo)(response)

        expect(repo.full_name).toBe("Effect-TS/effect")
        expect(repo.stargazers_count).toBeGreaterThan(0)
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )

    it.effect("fetch and decode a user", () =>
      Effect.gen(function* () {
        const response = yield* HttpClient.get("https://api.github.com/users/effect-ts")
        const user = yield* HttpClientResponse.schemaBodyJson(User)(response)

        expect(user.login.toLowerCase()).toBe("effect-ts")
        expect(user.public_repos).toBeGreaterThan(0)
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )
  })

  describe("Request Building", () => {
    it.effect("set headers on request", () =>
      Effect.gen(function* () {
        const request = HttpClientRequest.get("https://api.github.com/repos/Effect-TS/effect").pipe(
          HttpClientRequest.setHeader("Accept", "application/vnd.github.v3+json"),
        )

        const response = yield* HttpClient.execute(request)
        const repo = yield* HttpClientResponse.schemaBodyJson(Repo)(response)

        expect(repo.full_name).toBe("Effect-TS/effect")
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )

    it.effect("set query parameters", () =>
      Effect.gen(function* () {
        const request = HttpClientRequest.get("https://api.github.com/users/effect-ts/repos").pipe(
          HttpClientRequest.setUrlParam("per_page", "5"),
          HttpClientRequest.setUrlParam("sort", "updated"),
        )

        const response = yield* HttpClient.execute(request)
        const repos = yield* HttpClientResponse.schemaBodyJson(Schema.Array(Repo))(response)

        expect(repos.length).toBeLessThanOrEqual(5)
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )
  })

  describe("Response Handling", () => {
    it.effect("matchStatus handles different status codes", () =>
      Effect.gen(function* () {
        const response = yield* HttpClient.get("https://api.github.com/repos/Effect-TS/effect")
        const repo = yield* HttpClientResponse.matchStatus(response, {
          "2xx": HttpClientResponse.schemaBodyJson(Repo),
          404: () => Effect.fail("not found" as const),
          orElse: (r) => Effect.fail(`unexpected: ${r.status}` as const),
        })

        expect(repo.full_name).toBe("Effect-TS/effect")
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )

    it.effect("filterStatusOk fails on non-2xx", () =>
      Effect.gen(function* () {
        const response = yield* HttpClient.get("https://api.github.com/repos/nonexistent-org-12345/nonexistent-repo")
        const result = yield* HttpClientResponse.filterStatusOk(response).pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(Repo)),
          Effect.either,
        )

        expect(result._tag).toBe("Left")
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )
  })

  describe("Client Middleware", () => {
    it.effect("mapRequest applies base URL", () =>
      Effect.gen(function* () {
        const baseClient = yield* HttpClient.HttpClient
        const client = baseClient.pipe(HttpClient.mapRequest(HttpClientRequest.prependUrl("https://api.github.com")))

        const response = yield* client.get("/repos/Effect-TS/effect")
        const repo = yield* HttpClientResponse.schemaBodyJson(Repo)(response)

        expect(repo.full_name).toBe("Effect-TS/effect")
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )

    it.effect("combine multiple middleware", () =>
      Effect.gen(function* () {
        const baseClient = yield* HttpClient.HttpClient
        const client = baseClient.pipe(
          HttpClient.mapRequest(
            flow(
              HttpClientRequest.prependUrl("https://api.github.com"),
              HttpClientRequest.setHeader("Accept", "application/vnd.github.v3+json"),
            ),
          ),
        )

        const response = yield* client.get("/repos/Effect-TS/effect")
        const repo = yield* HttpClientResponse.schemaBodyJson(Repo)(response)

        expect(repo.full_name).toBe("Effect-TS/effect")
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )
  })

  describe("API Service Pattern", () => {
    it.effect("getUser returns typed user", () =>
      Effect.gen(function* () {
        const api = yield* GitHubApi
        const user = yield* api.getUser("effect-ts")

        expect(user.login.toLowerCase()).toBe("effect-ts")
        expect(user.public_repos).toBeGreaterThan(0)
      }).pipe(Effect.provide(GitHubApi.live)),
    )

    it.effect("getRepo returns typed repo", () =>
      Effect.gen(function* () {
        const api = yield* GitHubApi
        const repo = yield* api.getRepo("Effect-TS", "effect")

        expect(repo.full_name).toBe("Effect-TS/effect")
        expect(repo.stargazers_count).toBeGreaterThan(0)
      }).pipe(Effect.provide(GitHubApi.live)),
    )

    it.effect("listRepos returns array of repos", () =>
      Effect.gen(function* () {
        const api = yield* GitHubApi
        const repos = yield* api.listRepos("effect-ts")

        expect(repos.length).toBeGreaterThan(0)
        expect(repos[0].name).toBeDefined()
      }).pipe(Effect.provide(GitHubApi.live)),
    )
  })

  describe("HttpApi Client", () => {
    it.effect("getUser uses HttpApi client", () =>
      Effect.gen(function* () {
        const client = yield* HttpApiClient.make(GitHubHttpApi, {
          baseUrl: "https://api.github.com",
        })
        const user = yield* client.users.getUser({
          path: { username: "effect-ts" },
        })

        expect(user.login.toLowerCase()).toBe("effect-ts")
        expect(user.public_repos).toBeGreaterThan(0)
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )

    it.effect("getRepo uses HttpApi client", () =>
      Effect.gen(function* () {
        const client = yield* HttpApiClient.make(GitHubHttpApi, {
          baseUrl: "https://api.github.com",
        })
        const repo = yield* client.repos.getRepo({
          path: { owner: "Effect-TS", repo: "effect" },
        })

        expect(repo.full_name).toBe("Effect-TS/effect")
        expect(repo.stargazers_count).toBeGreaterThan(0)
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )

    it.effect("listRepos uses HttpApi client", () =>
      Effect.gen(function* () {
        const client = yield* HttpApiClient.make(GitHubHttpApi, {
          baseUrl: "https://api.github.com",
        })
        const repos = yield* client.users.listRepos({
          path: { username: "effect-ts" },
        })

        expect(repos.length).toBeGreaterThan(0)
        expect(repos[0].name).toBeDefined()
      }).pipe(Effect.provide(FetchHttpClient.layer)),
    )
  })

  describe("Error Handling", () => {
    it.effect("catches RequestError on network failure", () =>
      Effect.gen(function* () {
        const response = yield* HttpClient.get("https://invalid.domain.that.does.not.exist.example/repos")
        return yield* HttpClientResponse.schemaBodyJson(Repo)(response)
      }).pipe(
        Effect.catchTag("RequestError", (e) => Effect.succeed(`caught: ${e._tag}`)),
        Effect.provide(FetchHttpClient.layer),
        Effect.map((result) => {
          expect(result).toBe("caught: RequestError")
          return result
        }),
      ),
    )

    it.effect("schema decode failure produces ParseError", () =>
      Effect.gen(function* () {
        const BadSchema = Schema.Struct({
          nonExistentField: Schema.String,
        })

        const response = yield* HttpClient.get("https://api.github.com/repos/Effect-TS/effect")
        return yield* HttpClientResponse.schemaBodyJson(BadSchema)(response)
      }).pipe(
        Effect.catchTag("ParseError", () => Effect.succeed("parse failed")),
        Effect.provide(FetchHttpClient.layer),
        Effect.map((result) => {
          expect(result).toBe("parse failed")
          return result
        }),
      ),
    )
  })
})
