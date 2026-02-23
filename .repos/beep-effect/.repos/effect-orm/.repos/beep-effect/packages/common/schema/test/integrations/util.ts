// import {Field, Model, toDrizzle} from "@beep/schema/integrations/sql/dsl";
// // import * as Pg from "pg";
// import * as S from "effect/Schema";
//
// import {drizzle} from "drizzle-orm/node-postgres";
// import {Pool} from "pg";
//
// export class User extends Model<User>("User")({
//   id: Field(S.String, {column: {type: "uuid", primaryKey: true}}),
//   name: Field(S.String, {column: {type: "string"}}),
// }) {
// }
//
// export const userTable = toDrizzle(User);
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
// const db = drizzle({
//   client: pool, schema: {
//     userTable
//   }
// });
//
// const fn = async () => {
//   const result = await db.select().from(userTable);
// }
//
//
//
//
//
