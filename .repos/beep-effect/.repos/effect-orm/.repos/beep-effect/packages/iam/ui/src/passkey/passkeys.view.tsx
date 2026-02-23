// "use client";
// import { usePasskeyCRUD } from "@beep/iam-client/clients/passkey";
// import { PasskeysFallback } from "@beep/iam-ui/passkey/passkeys.fallback";
// import { PasskeysList } from "@beep/iam-ui/passkey/passkeys.list";
// import { PasskeysSkeleton } from "@beep/iam-ui/passkey/passkeys.skeleton";
// import { Result } from "@effect-atom/atom-react";
//
// export const PasskeysView = () => {
//   const { passkeysResult } = usePasskeyCRUD();
//
//   return (
//     <>
//       {Result.builder(passkeysResult)
//         .onInitial(() => <PasskeysSkeleton />)
//         .onFailure(() => <PasskeysFallback />)
//         .onSuccess((passkeys) => <PasskeysList passkeys={passkeys} />)
//         .render()}
//     </>
//   );
// };
