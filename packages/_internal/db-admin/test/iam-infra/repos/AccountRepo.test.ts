import { PgContainer, pgContainerPreflight } from "@beep/db-admin/test/pg-container";
import * as Entities from "@beep/iam-domain/entities";
import { IamDb } from "@beep/iam-infra";
import * as IamRepos from "@beep/iam-infra/adapters/repositories";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { describe, expect, it } from "@effect/vitest";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Schema from "../../../src/schema";

const preflight = pgContainerPreflight;
const describePg = preflight.type === "ready" ? describe : describe.skip;

if (preflight.type === "skip") {
  console.warn(`[@beep/iam-infra AccountRepo] skipping docker-backed tests: ${preflight.reason}`);
}

const baseAccount = Entities.Account.Model.insert
  .pick("createdAt", "updatedAt", "source", "createdBy", "updatedBy", "providerId")
  .make({
    providerId: "google",
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
    source: O.some("test"),
    createdBy: O.some("test"),
    updatedBy: O.some("test"),
  });

// Note: Build insert payloads inside each test using the seeded userId and a fresh accountId
describePg("@beep/iam-infra AccountRepo tests", () => {
  it.layer(PgContainer.Live, { timeout: "30 seconds" })("test AccountRepo methods", (it) => {
    const createTestUser = Effect.gen(function* () {
      const userRepo = yield* IamRepos.UserRepo;
      const now = yield* DateTime.now;
      const userInsert = Entities.User.Model.insert.make({
        email: BS.Email.make(`acc-repo-${crypto.randomUUID()}@example.com`),
        name: "beep",
        gender: "male",
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      });
      return yield* userRepo.insert(userInsert);
    });

    it.effect(
      "insert",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;
        const { db } = yield* IamDb.IamDb;
        // insert
        const insertUser = yield* createTestUser;
        const insertAccountId = IamEntityIds.AccountId.create();
        const insertAccount = Entities.Account.Model.insert.make({
          ...baseAccount,
          id: insertAccountId,
          userId: insertUser.id,
          accountId: crypto.randomUUID(),
        });

        const insertResult = yield* repo.insert(insertAccount);

        expect(insertResult.id).toEqual(insertAccountId);
        const accounts = yield* db.select().from(Schema.account);
        const foundInsert = accounts.find((account) => account.id === insertAccountId);

        expect(!!foundInsert?.id).toEqual(true);
      })
    );
    it.effect(
      "findById",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;

        const findByIdId = IamEntityIds.AccountId.create();
        const userFindById = yield* createTestUser;
        const insertedFindById = yield* repo.insert(
          Entities.Account.Model.insert.make({
            ...baseAccount,
            id: findByIdId,
            userId: userFindById.id,
            accountId: crypto.randomUUID(),
          })
        );
        const maybeFoundById = yield* repo.findById(insertedFindById._rowId);
        const foundById = O.getOrThrow(maybeFoundById);
        expect(foundById._rowId).toEqual(insertedFindById._rowId);
      })
    );
    it.effect(
      "insertVoid",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;
        const { db } = yield* IamDb.IamDb;
        const insertVoidUser = yield* createTestUser;
        const insertVoidAccountId = IamEntityIds.AccountId.create();
        const insertVoidAccount = Entities.Account.Model.insert.make({
          ...baseAccount,
          id: insertVoidAccountId,
          userId: insertVoidUser.id,
          accountId: crypto.randomUUID(),
        });
        yield* repo.insertVoid(insertVoidAccount);
        const accounts = yield* db.select().from(Schema.account);
        const foundVoid = accounts.find((account) => account.id === insertVoidAccountId);
        expect(!!foundVoid?.id).toEqual(true);
      })
    );
    it.effect(
      "insertManyVoid",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;
        const { db } = yield* IamDb.IamDb;
        const user = yield* createTestUser;
        const insertManyVoidAccountId1 = IamEntityIds.AccountId.create();
        const insertManyVoidAccountId2 = IamEntityIds.AccountId.create();
        const insertManyVoidAccounts = [
          Entities.Account.Model.insert.make({
            ...baseAccount,
            id: insertManyVoidAccountId1,
            userId: user.id,
            accountId: crypto.randomUUID(),
          }),
          Entities.Account.Model.insert.make({
            ...baseAccount,
            id: insertManyVoidAccountId2,
            userId: user.id,
            accountId: crypto.randomUUID(),
          }),
        ] as const;
        yield* repo.insertManyVoid(insertManyVoidAccounts);

        const accounts = yield* db.query.account.findMany();

        const found1 = accounts.find((account) => account.id === insertManyVoidAccountId1);
        const found2 = accounts.find((account) => account.id === insertManyVoidAccountId2);
        expect(!!found1?.id).toEqual(true);
        expect(!!found2?.id).toEqual(true);
      })
    );
    it.effect(
      "update",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;
        const id = IamEntityIds.AccountId.create();
        const user = yield* createTestUser;
        const inserted = yield* repo.insert(
          Entities.Account.Model.insert.make({
            ...baseAccount,
            id,
            userId: user.id,
            accountId: crypto.randomUUID(),
          })
        );
        const updateValues = Entities.Account.Model.update.make({
          ...inserted,
          providerId: "github",
        });
        const updated = yield* repo.update(updateValues);
        expect(updated.providerId).toEqual("github");
      })
    );
    it.effect(
      "updateVoid",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;
        const id = IamEntityIds.AccountId.create();
        const user = yield* createTestUser;
        const inserted = yield* repo.insert(
          Entities.Account.Model.insert.make({
            ...baseAccount,
            id,
            userId: user.id,
            accountId: crypto.randomUUID(),
          })
        );
        const updateValues = Entities.Account.Model.update.make({
          ...inserted,
          providerId: "github",
        });
        yield* repo.updateVoid(updateValues);

        const updated = yield* repo.findById(inserted._rowId);
        const found = O.getOrThrow(updated);

        expect(found.providerId).toEqual("github");
      })
    );
    it.effect(
      "delete",
      Effect.fnUntraced(function* () {
        const repo = yield* IamRepos.AccountRepo;
        const id = IamEntityIds.AccountId.create();
        const user = yield* createTestUser;
        const inserted = yield* repo.insert(
          Entities.Account.Model.insert.make({
            ...baseAccount,
            id,
            userId: user.id,
            accountId: crypto.randomUUID(),
          })
        );
        yield* repo.delete(inserted._rowId);
        const maybeFound = yield* repo.findById(inserted._rowId);
        expect(O.isNone(maybeFound)).toEqual(true);
      })
    );
  });
});
