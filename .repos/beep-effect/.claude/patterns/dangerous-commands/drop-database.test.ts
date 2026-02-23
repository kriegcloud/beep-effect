import { testBashPattern } from "../../test/pattern-test-harness.ts"

testBashPattern({
  name: "drop-database",
  decision: "ask",
  shouldMatch: [
    "DROP DATABASE mydb",
    "DROP TABLE users",
    "DROP SCHEMA public",
    "TRUNCATE TABLE logs",
    "psql -c 'DROP DATABASE test'",
    "mysql -e 'DROP TABLE users'",
    "DROP  DATABASE  test",
    "TRUNCATE  TABLE  logs",
  ],
  shouldNotMatch: [
    "CREATE DATABASE mydb",
    "CREATE TABLE users",
    "ALTER TABLE users",
    "INSERT INTO users",
    "SELECT * FROM users",
    "DELETE FROM users WHERE id = 1",
    "drop database mydb",
    "drop table users",
    "echo 'DROP DATABASE'",
    "grep 'DROP TABLE' log.txt",
  ],
})
