// import * as Schema from "effect/Schema";
// import { BS } from "@beep/schema";
// import { invariant } from "@beep/invariant";
// import * as A from "effect/Array";
// import * as Str from "effect/String";
// import * as Data from "effect/Data";
//
// export const PathLeaf = Symbol.for("@beep/constants/path-leaf");
// export type PathLeaf = typeof PathLeaf;
//
// /**
//  * Schema for validating NextJS pathnames including static assets
//  * Supports: /icons/navbar/ic-lock.svg, /api/users/[id], /_next/static/...
//  *
//  * Pattern explanation:
//  * - ^\/: Must start with forward slash
//  * - (?:[\w\-\.]+\/)*: Zero or more directory segments (word chars, hyphens, dots)
//  * - (?:[\w\-\.]*)?$: Optional filename at the end
//  */
// export const URLPath = Schema.TemplateLiteral("/", Schema.String).pipe(
//   Schema.pattern(/^\/(?:[\w\-.]+\/)*(?:[\w\-.]*)?$/),
//   Schema.annotations({
//     title: "NextJS Path",
//     description: "A valid NextJS pathname including static assets, API routes, and pages",
//     examples: [
//       "/icons/navbar/ic-lock.svg",
//       "/api/users/123",
//       "/dashboard/settings",
//       "/_next/static/chunks/123.js",
//       "/",
//     ],
//     arbitrary: () => (fc) => {
//       // Generate realistic NextJS paths for testing
//       const segments = fc.array(
//         fc.oneof(
//           fc.constantFrom("icons", "api", "dashboard", "users", "_next", "static"),
//           fc.stringMatching(/^[\w\-.]+$/).filter((s) => s.length > 0 && s.length < 20)
//         ),
//         { minLength: 0, maxLength: 4 }
//       );
//
//       const filename = fc.option(
//         fc.oneof(
//           fc.constantFrom("ic-lock.svg", "favicon.ico", "index.js", "page.tsx"),
//           fc.stringMatching(/^[\w-]+\.\w+$/).filter((s) => s.length < 30)
//         ),
//         { nil: undefined }
//       );
//
//       return fc.tuple(segments, filename).map(([segs, file]) => {
//         const path = Str.concat(`${A.join("/")(segs)}${segs.length > 0 && file ? "/" : ""}${file || ""}`)(`/`);
//         return path === "//" ? "/" : path;
//       });
//     },
//   }),
//   Schema.brand("URLPath")
// );
//
// /** A single path segment: disallow embedded "/" at the type-level. */
// type Segment<S extends string = string> = string extends S ? string : S extends `${string}/${string}` ? never : S;
//
// export class PathBuilder extends Data.TaggedClass("PathBuilder") {
//   // readonly create:
//   constructor() {
//     super();
//   }
// }
