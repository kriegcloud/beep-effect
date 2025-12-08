// import * as Policy from "@beep/shared-domain/Policy";
// import { File} from "@beep/shared-domain/entities";
// import {
//   Effect,
//   Layer,
//   Stream
// } from "effect";
// import * as O from "effect/Option";
// import { UploadThingApi } from "@beep/shared-infra/internal/upload/uploadthing-api";
// import { UploadThingCallbackRoute } from "@beep/shared-infra/internal/upload/uploadthing-callback-route";
//
// export const FilesRPcLive = File.FileRpc.toLayer(
//   Effect.gen(function* () {
//     const uploadThingApi = yield* UploadThingApi;
//
//     return File.FileRpc.of({
//       files_initiateUpload: (payload) => uploadThingApi.initiateUpload(payload).pipe(
//         Effect.map(({key, url, fields}) => ({
//           presignedUrl: url,
//           fields,
//           fileKey: key,
//         }))
//       ),
//       files_getFilesByKeys: Effect.fn(function* (payload) {
//         // const {user: currentUser} = yield* Policy.AuthContext;
//         // const uploadthingKeys = yield* repo.deleteFiles({
//         //   fileIds: payload.fileIds,
//         //   userId: currentUser.userId,
//         // });
//         const uploadthingKeys = payload.fileKeys;
//         if (uploadthingKeys.length > 0) {
//           yield* uploadThingApi.deleteFiles(uploadthingKeys);
//         }
//       })
//     })
//   })
// )
