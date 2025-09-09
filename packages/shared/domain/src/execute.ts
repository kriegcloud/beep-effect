// import * as Effect from "effect/Effect";
// import * as S from "effect/Schema";
// import * as Console from "effect/Console";
// import { IamEntityIds, SharedEntityIds } from "./EntityIds";
// import { UploadPath } from "./File/schemas/UploadPath";
//
// const program = Effect.gen(function* () {
//   // "/dev/tenants/58/individual/organization__c8dcb24d-b4c0-46cc-b437-1983ff73fbe4/user/user__45679f3b-812e-4941-a7f3-cd686a96f362/image/2025/9/file__edbf5c12-d164-44d1-ba31-8b25e4caf647.png"
//   const path = yield* S.decode(UploadPath)({
//     env: "dev",
//     organizationType: "individual",
//     organizationId: SharedEntityIds.OrganizationId.create(),
//     entityKind: "user",
//     entityIdentifier: IamEntityIds.UserId.create(),
//     entityAttribute: "image",
//     fileId: SharedEntityIds.FileId.create(),
//     fileItemExtension: "png",
//   })
//   yield* Console.log(path)
//   const objectFromPath = yield* S.encode(UploadPath)(path);
//   yield* Console.log(objectFromPath.fileItemExtension) // png
//   yield* Console.log(objectFromPath.entityAttribute) // image
//   // two way transform
//   const pathFromObject = yield* S.decode(UploadPath)(objectFromPath)
//   yield* Console.log(pathFromObject)
//
// });
//
// Effect.runPromise(program);
