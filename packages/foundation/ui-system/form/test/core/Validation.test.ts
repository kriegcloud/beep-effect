import { extractFirstError, routeErrors, routeErrorsWithSource } from "@beep/form/core/Validation";
import * as Effect from "../helpers/EffectCompat.ts";
import * as S from "../helpers/SchemaCompat.ts";
import * as O from "effect/Option";
import * as SchemaIssue from "effect/SchemaIssue";
import { describe, expect, it } from "vitest";

describe("Validation", () => {
  describe("extractFirstError", () => {
    it("returns Some with first error message for invalid input", () => {
      const schema = S.Struct({
        name: S.String.check(S.isMinLength(3, { message: "Name too short" })),
      });
      const result = S.decodeUnknownResult(schema)({ name: "AB" });

      if (result._tag === "Success") {
        throw new Error("Expected Left");
      }

      const error = extractFirstError(result.failure);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect(error.value).toBe("Name too short");
      }
    });

    it("returns first error when multiple errors exist", () => {
      const schema = S.Struct({
        name: S.String.check(S.isMinLength(3, { message: "Name too short" })),
        email: S.String.check(S.isPattern(/@/, { message:  "Invalid email" })),
      });
      const result = S.decodeUnknownResult(schema)({ name: "AB", email: "invalid" });

      if (result._tag === "Success") {
        throw new Error("Expected Left");
      }

      const error = extractFirstError(result.failure);
      expect(error._tag).toBe("Some");
    });

    it("handles nested field errors", () => {
      const schema = S.Struct({
        user: S.Struct({
          email: S.String.pipe(S.pattern(/@/, { message: () => "Invalid email format" })),
        }),
      });
      const result = S.decodeUnknownEither(schema)({ user: { email: "invalid" } });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const error = extractFirstError(result.left);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect(error.value).toBe("Invalid email format");
      }
    });

    it("handles array field errors", () => {
      const schema = S.Struct({
        items: S.Array(
          S.Struct({
            name: S.String.pipe(S.minLength(1, { message: () => "Name required" })),
          })
        ),
      });
      const result = S.decodeUnknownEither(schema)({ items: [{ name: "" }] });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const error = extractFirstError(result.left);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect(error.value).toBe("Name required");
      }
    });
  });

  describe("routeErrors", () => {
    it("routes single error to field path", () => {
      const schema = S.Struct({
        email: S.String.pipe(S.pattern(/@/, { message: () => "Invalid email" })),
      });
      const result = S.decodeUnknownEither(schema)({ email: "invalid" });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.get("email")).toBe("Invalid email");
      expect(errors.size).toBe(1);
    });

    it("routes first error when schema short-circuits", () => {
      const schema = S.Struct({
        name: S.Number,
        email: S.Number,
      });
      const result = S.decodeUnknownEither(schema)({ name: "not-a-number", email: "also-not" });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.size).toBe(1);
      expect(errors.has("name")).toBe(true);
    });

    it("routes nested field errors with dot notation", () => {
      const schema = S.Struct({
        user: S.Struct({
          profile: S.Struct({
            email: S.String.pipe(S.pattern(/@/, { message: () => "Invalid email" })),
          }),
        }),
      });
      const result = S.decodeUnknownEither(schema)({ user: { profile: { email: "invalid" } } });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.get("user.profile.email")).toBe("Invalid email");
    });

    it("routes array field errors with bracket notation", () => {
      const schema = S.Struct({
        items: S.Array(
          S.Struct({
            name: S.String.pipe(S.minLength(1, { message: () => "Name required" })),
          })
        ),
      });
      const result = S.decodeUnknownEither(schema)({ items: [{ name: "" }] });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.get("items[0].name")).toBe("Name required");
    });

    it("routes first array item error when schema short-circuits", () => {
      const schema = S.Struct({
        items: S.Array(
          S.Struct({
            name: S.Number,
          })
        ),
      });
      const result = S.decodeUnknownEither(schema)({
        items: [{ name: "invalid" }, { name: 123 }, { name: "also-invalid" }],
      });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.size).toBe(1);
      expect(errors.has("items[0].name")).toBe(true);
    });

    it("keeps first error when multiple errors exist for same path", () => {
      const schema = S.Struct({
        password: S.String.pipe(
          S.minLength(8, { message: () => "Password too short" }),
          S.pattern(/[A-Z]/, { message: () => "Must contain uppercase" })
        ),
      });
      const result = S.decodeUnknownEither(schema)({ password: "abc" });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.size).toBe(1);
      expect(errors.get("password")).toBe("Password too short");
    });

    it("handles deeply nested array errors", () => {
      const schema = S.Struct({
        users: S.Array(
          S.Struct({
            addresses: S.Array(
              S.Struct({
                city: S.String.pipe(S.minLength(2, { message: () => "City too short" })),
              })
            ),
          })
        ),
      });
      const result = S.decodeUnknownEither(schema)({
        users: [{ addresses: [{ city: "X" }] }],
      });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.get("users[0].addresses[0].city")).toBe("City too short");
    });

    it("handles refinement errors with path", async () => {
      const schema = S.Struct({
        password: S.String,
        confirmPassword: S.String,
      }).pipe(
        S.filter((values) => {
          if (values.password !== values.confirmPassword) {
            return {
              path: ["confirmPassword"],
              message: "Passwords must match",
            };
          }
        })
      );

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ password: "abc", confirmPassword: "xyz" }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.get("confirmPassword")).toBe("Passwords must match");
    });

    it("handles type errors at field level", () => {
      const schema = S.Struct({
        age: S.Number,
      });
      const result = S.decodeUnknownEither(schema)({ age: "not a number" });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrors(result.left);
      expect(errors.has("age")).toBe(true);
    });
  });

  describe("routeErrorsWithSource", () => {
    it("tags field schema errors as 'field'", () => {
      const schema = S.Struct({
        password: S.String.pipe(S.minLength(8, { message: () => "Too short" })),
      });
      const result = S.decodeUnknownEither(schema)({ password: "abc" });

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("password");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("field");
      expect(entry?.message).toBe("Too short");
    });

    it("tags Struct refinement errors as 'refinement'", async () => {
      const schema = S.Struct({
        password: S.String,
        confirm: S.String,
      }).pipe(
        S.filter((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Must match" };
          }
        })
      );

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ password: "abc", confirm: "xyz" }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("confirm");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("refinement");
      expect(entry?.message).toBe("Must match");
    });

    it("tags Union refinement errors as 'refinement'", async () => {
      const OptionA = S.Struct({ type: S.Literal("a"), value: S.String });
      const OptionB = S.Struct({ type: S.Literal("b"), count: S.Number });
      const schema = S.Union(OptionA, OptionB).pipe(
        S.filter((union) => {
          if (union.type === "a" && union.value.length < 3) {
            return { path: ["value"], message: "Value too short" };
          }
        })
      );

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ type: "a", value: "ab" }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("value");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("refinement");
    });

    it("tags Class refinement errors as 'refinement'", async () => {
      class PasswordForm extends S.Class<PasswordForm>("PasswordForm")({
        password: S.String,
        confirm: S.String,
      }) {}

      const schema = PasswordForm.pipe(
        S.filter((values) => {
          if (values.password !== values.confirm) {
            return { path: ["confirm"], message: "Passwords must match" };
          }
        })
      );

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ password: "abc", confirm: "xyz" }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("confirm");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("refinement");
      expect(entry?.message).toBe("Passwords must match");
    });

    it("tags filterEffect (async) refinement errors as 'refinement'", async () => {
      const schema = S.Struct({
        username: S.String.pipe(S.minLength(3)),
      }).pipe(
        S.filterEffect((values) =>
          Effect.sync(() => {
            const reserved = ["admin", "root", "taken"];
            if (reserved.includes(values.username.toLowerCase())) {
              return { path: ["username"], message: "Username is reserved" };
            }
          })
        )
      );

      const result = await Effect.runPromise(S.decodeUnknown(schema)({ username: "admin" }).pipe(Effect.either));

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("username");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("refinement");
      expect(entry?.message).toBe("Username is reserved");
    });

    it("routes root-level refinement errors to empty string key", async () => {
      const schema = S.Struct({
        a: S.String,
        b: S.String,
      }).pipe(
        S.filter((values) => {
          if (values.a === values.b) {
            return "Values must be different";
          }
        })
      );

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ a: "same", b: "same" }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("refinement");
      expect(entry?.message).toBe("Values must be different");
    });

    it("tags nested struct filter errors as 'field' (not top-level refinement)", async () => {
      const AddressSchema = S.Struct({
        street: S.String,
        city: S.String,
      }).pipe(
        S.filter((address) => {
          if (address.street === "" && address.city === "") {
            return "At least one address field is required";
          }
        })
      );

      const schema = S.Struct({
        name: S.String,
        address: AddressSchema,
      });

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ name: "John", address: { street: "", city: "" } }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("address");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("field");
      expect(entry?.message).toBe("At least one address field is required");
    });

    it("tags nested struct filterEffect errors as 'field' (not top-level refinement)", async () => {
      const AddressSchema = S.Struct({
        street: S.String,
        city: S.String,
      }).pipe(
        S.filterEffect((address) =>
          Effect.sync(() => {
            if (address.street === "" && address.city === "") {
              return "Address validation failed";
            }
          })
        )
      );

      const schema = S.Struct({
        name: S.String,
        address: AddressSchema,
      });

      const result = await Effect.runPromise(
        S.decodeUnknown(schema)({ name: "John", address: { street: "", city: "" } }).pipe(Effect.either)
      );

      if (result._tag === "Right") {
        throw new Error("Expected Left");
      }

      const errors = routeErrorsWithSource(result.left);
      const entry = errors.get("address");
      expect(entry).toBeDefined();
      expect(entry?.source).toBe("field");
      expect(entry?.message).toBe("Address validation failed");
    });

    it("prefers refinement errors when field and refinement target the same path", () => {
      const struct = S.Struct({ age: S.Number });

      const fieldIssue = new SchemaIssue.Pointer(
        ["age"],
        new SchemaIssue.InvalidType(S.Number.ast, O.some("x"))
      );
      const refinementInner = new SchemaIssue.Pointer(
        ["age"],
        new SchemaIssue.InvalidValue(O.some({ age: "x" }), { message: "Refinement error" })
      );
      const refinementIssue = new SchemaIssue.Filter(
        { age: "x" },
        S.makeFilter(() => ({ path: ["age"], issue: "Refinement error" })),
        refinementInner
      );
      const composite = new SchemaIssue.Composite(struct.ast, O.some({ age: "x" }), [fieldIssue, refinementIssue]);
      const error = new S.SchemaError(composite);

      const errors = routeErrorsWithSource(error);
      const entry = errors.get("age");

      expect(entry).toBeDefined();
      expect(entry?.source).toBe("refinement");
      expect(entry?.message).toBe("Refinement error");
    });
  });
});
