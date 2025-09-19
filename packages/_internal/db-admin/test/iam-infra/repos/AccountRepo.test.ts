import { describe, it, expect } from "@effect/vitest";
import {PgContainer} from "@beep/db-admin/test/pg-container";


describe("@beep/iam-infra AccountRepo tests", () => {
  it.layer(PgContainer.Live, { timeout: "30 "})
})
