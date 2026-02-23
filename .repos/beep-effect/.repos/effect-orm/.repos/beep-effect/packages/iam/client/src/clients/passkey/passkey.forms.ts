// import { usePasskeyCRUD } from "@beep/iam-client/clients/passkey/passkey.atoms";
// import {
//   PasskeyAddPayload,
//   type PasskeyDTO,
//   PasskeyUpdateContract,
// } from "@beep/iam-client/clients/passkey/passkey.contracts";
// import { formOptionsWithDefaults, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
// import * as S from "effect/Schema";
//
// type PasskeyFormPropsBase = {
//   readonly onDone: (formReset: () => void) => void;
// };
//
// type UsePasskeyAddFormProps = PasskeyFormPropsBase;
// export const useAddPasskeyForm = ({ onDone }: UsePasskeyAddFormProps) => {
//   const { addPasskey } = usePasskeyCRUD();
//   const form = useAppForm(
//     formOptionsWithSubmitEffect({
//       schema: PasskeyAddPayload.pipe(S.pick("name")),
//       defaultValues: {
//         name: "",
//       },
//       onSubmit: async (value) => {
//         console.log("VALUE: ", value);
//         await addPasskey({
//           ...value,
//         });
//         onDone(form.reset);
//       },
//     })
//   );
//
//   return {
//     form,
//   };
// };
//
// type UsePasskeyUpdateFormProps = PasskeyFormPropsBase & {
//   readonly defaultValues: PasskeyDTO;
// };
//
// export const useUpdatePasskeyForm = ({ defaultValues, onDone }: UsePasskeyUpdateFormProps) => {
//   const { updatePasskey } = usePasskeyCRUD();
//   const form = useAppForm(
//     formOptionsWithDefaults({
//       schema: PasskeyUpdateContract.payloadSchema.toFormSchema({
//         name: defaultValues.name,
//       }),
//       onSubmit: async (value) => {
//         await updatePasskey({
//           passkey: {
//             ...value,
//             id: defaultValues.id,
//           },
//         });
//         onDone(form.reset);
//       },
//     })
//   );
//
//   return {
//     form,
//   };
// };
