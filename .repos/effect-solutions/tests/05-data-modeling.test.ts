import { describe, it } from "@effect/vitest"
import { strictEqual } from "@effect/vitest/utils"
import { Effect, Match, Option, Schema } from "effect"

describe("05-data-modeling", () => {
  describe("Schema Classes", () => {
    it("should create and use Schema.Class with branded types", () => {
      const UserId = Schema.String.pipe(Schema.brand("UserId"))
      // biome-ignore lint/correctness/noUnusedVariables: Used for type annotation
      type UserId = typeof UserId.Type

      class User extends Schema.Class<User>("User")({
        id: UserId,
        name: Schema.String,
        email: Schema.String,
        createdAt: Schema.Date,
      }) {
        // Add custom getters and methods to extend functionality
        get displayName() {
          return `${this.name} (${this.email})`
        }
      }

      // Usage
      const user = User.make({
        id: UserId.make("user-123"),
        name: "Alice",
        email: "alice@example.com",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      })

      strictEqual(user.displayName, "Alice (alice@example.com)")
      strictEqual(user instanceof User, true)
      strictEqual(user.id, "user-123")
      strictEqual(user.name, "Alice")
      strictEqual(user.email, "alice@example.com")
    })
  })

  describe("Schema Unions", () => {
    it("should create simple literal unions", () => {
      const Status = Schema.Literal("pending", "active", "completed")
      type Status = typeof Status.Type

      const decoded = Schema.decodeUnknownSync(Status)("pending")
      strictEqual(decoded, "pending")

      // Type should be "pending" | "active" | "completed"
      const status: Status = "active"
      strictEqual(status, "active")
    })

    it("should create and match TaggedClass unions", () => {
      // Define variants with a tag field
      class Success extends Schema.TaggedClass<Success>()("Success", {
        value: Schema.Number,
      }) {}

      class Failure extends Schema.TaggedClass<Failure>()("Failure", {
        error: Schema.String,
      }) {}

      // Create the union
      const Result = Schema.Union(Success, Failure)
      type Result = typeof Result.Type

      // Pattern 1: Match.value - inline matching
      const handleResultInline = (result: Result) =>
        Match.value(result).pipe(
          Match.tag("Success", ({ value }) => `Got: ${value}`),
          Match.tag("Failure", ({ error }) => `Error: ${error}`),
          Match.exhaustive,
        )

      // Pattern 2: Match.type - extract matcher (compiled once, better perf)
      const matcher = Match.type<Result>().pipe(
        Match.tag("Success", ({ value }) => `Got: ${value}`),
        Match.tag("Failure", ({ error }) => `Error: ${error}`),
        Match.exhaustive,
      )

      const handleResult = (result: Result) => matcher(result)

      // Pattern 3: Match.tags - handle multiple tags together
      const isOk = Match.type<Result>().pipe(
        Match.tag("Success", () => true),
        Match.orElse(() => false),
      )

      const success = Success.make({ value: 42 })
      const failure = Failure.make({ error: "oops" })

      strictEqual(handleResult(success), "Got: 42")
      strictEqual(handleResult(failure), "Error: oops")
      strictEqual(handleResultInline(success), "Got: 42")
      strictEqual(handleResultInline(failure), "Error: oops")
      strictEqual(isOk(success), true)
      strictEqual(isOk(failure), false)
    })
  })

  describe("Branded Types", () => {
    it("should prevent mixing different branded types", () => {
      // IDs - prevent mixing different entity IDs
      const UserId = Schema.String.pipe(Schema.brand("UserId"))
      type UserId = typeof UserId.Type

      const PostId = Schema.String.pipe(Schema.brand("PostId"))
      // biome-ignore lint/correctness/noUnusedVariables: Used for type annotation
      type PostId = typeof PostId.Type

      // Domain primitives - create a rich type system
      const Email = Schema.String.pipe(Schema.brand("Email"))
      type Email = typeof Email.Type

      const Port = Schema.Int.pipe(Schema.between(1, 65535), Schema.brand("Port"))
      // biome-ignore lint/correctness/noUnusedVariables: Used for type annotation
      type Port = typeof Port.Type

      // Usage - impossible to mix types
      const userId = UserId.make("user-123")
      const _postId = PostId.make("post-456")
      const email = Email.make("alice@example.com")
      const port = Port.make(8080)

      function getUser(id: UserId) {
        return id
      }
      function sendEmail(to: Email) {
        return to
      }

      // This works
      strictEqual(getUser(userId), "user-123")
      strictEqual(sendEmail(email), "alice@example.com")
      strictEqual(port, 8080)

      // TypeScript prevents these at compile time:
      // getUser(postId) // Can't pass PostId where UserId expected
      // sendEmail(userId) // Can't pass UserId where Email expected
    })

    it("should support Object.assign for adding methods to branded schemas", () => {
      const GitHubUsername = Object.assign(
        Schema.String.pipe(Schema.pattern(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i), Schema.brand("GitHubUsername")),
        {
          fromUrl(url: string): Option.Option<typeof GitHubUsername.Type> {
            const match = url.match(/github\.com\/([^/]+)/)
            return match ? Option.some(GitHubUsername.make(match[1])) : Option.none()
          },
          toProfileUrl: (u: typeof GitHubUsername.Type) => `https://github.com/${u}`,
        },
      )
      type GitHubUsername = typeof GitHubUsername.Type

      // .make() still works
      const username = GitHubUsername.make("octocat")
      strictEqual(username, "octocat")

      // Custom methods work
      const fromUrl = GitHubUsername.fromUrl("https://github.com/octocat")
      strictEqual(Option.isSome(fromUrl), true)
      strictEqual(Option.getOrThrow(fromUrl), "octocat")

      const profileUrl = GitHubUsername.toProfileUrl(username)
      strictEqual(profileUrl, "https://github.com/octocat")

      // Returns None for invalid URLs
      const invalid = GitHubUsername.fromUrl("https://example.com/user")
      strictEqual(Option.isNone(invalid), true)

      // Schema validation still works
      let threw = false
      try {
        GitHubUsername.make("invalid--username") // double hyphen not allowed
      } catch {
        threw = true
      }
      strictEqual(threw, true)

      // Type safety: function expecting GitHubUsername
      function greet(u: GitHubUsername) {
        return `Hello, ${u}!`
      }
      strictEqual(greet(username), "Hello, octocat!")
    })
  })

  describe("JSON Encoding & Decoding", () => {
    it.effect("should parse and encode JSON strings with parseJson", () => {
      const Row = Schema.Literal("A", "B", "C", "D", "E", "F", "G", "H")
      const Column = Schema.Literal("1", "2", "3", "4", "5", "6", "7", "8")

      class Position extends Schema.Class<Position>("Position")({
        row: Row,
        column: Column,
      }) {}

      class Move extends Schema.Class<Move>("Move")({
        from: Position,
        to: Position,
      }) {}

      // parseJson combines JSON.parse + schema decoding
      // MoveFromJson is a schema that takes a JSON string and returns a Move
      const MoveFromJson = Schema.parseJson(Move)

      return Effect.gen(function* () {
        // Parse and validate JSON string in one step
        // Use MoveFromJson (not Move) to decode from JSON string
        const jsonString = '{"from":{"row":"A","column":"1"},"to":{"row":"B","column":"2"}}'
        const move = yield* Schema.decodeUnknown(MoveFromJson)(jsonString)

        // Encode to JSON string in one step (typed as string)
        // Use MoveFromJson (not Move) to encode to JSON string
        const json = yield* Schema.encode(MoveFromJson)(move)

        strictEqual(move instanceof Move, true)
        strictEqual(move.from.row, "A")
        strictEqual(move.from.column, "1")
        strictEqual(move.to.row, "B")
        strictEqual(move.to.column, "2")
        strictEqual(typeof json, "string")
        strictEqual(json.includes('"row":"A"'), true)
        strictEqual(json.includes('"column":"1"'), true)
        strictEqual(json.includes('"row":"B"'), true)
        strictEqual(json.includes('"column":"2"'), true)
      })
    })
  })
})
