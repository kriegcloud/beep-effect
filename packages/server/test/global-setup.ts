import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;

export async function setup() {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  process.env.TEST_DB_URL = container.getConnectionUri();
}

export async function teardown() {
  await container?.stop();
}
