import { usePasskeyCRUD } from "@beep/iam-sdk";
import { PasskeysList } from "@beep/iam-ui/passkey/passkeys.list";
import { Result } from "@effect-atom/atom-react";

export const PasskeysView = () => {
  const { passkeysResult, deletePasskey } = usePasskeyCRUD();

  return (
    <>
      {Result.match(passkeysResult, {
        onInitial: () => <>Loading...</>,
        onFailure: () => <>Failure...</>,
        onSuccess: (passkeys) => <PasskeysList passkeys={passkeys.value} onDelete={(id) => deletePasskey(id)} />,
      })}
    </>
  );
};
