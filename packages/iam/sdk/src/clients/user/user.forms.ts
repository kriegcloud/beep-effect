import type { User } from "@beep/shared-domain/entities";
import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  useChangeEmail,
  useChangePassword,
  useUpdatePhoneNumber,
  useUpdateUserIdentity,
  useUpdateUsername,
} from "./user.atoms";
import {
  ChangeEmailContract,
  ChangePasswordContract,
  UpdatePhoneNumberContract,
  UpdateUserIdentityContract,
  UpdateUsernameContract,
} from "./user.contracts";

type Props = {
  readonly onSuccess?: (() => void) | undefined;
};

export const useChangePasswordForm = (props: Props) => {
  const { changePassword } = useChangePassword();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: ChangePasswordContract.payloadSchema.pipe(
        S.filter(
          ({ password, passwordConfirm }) => Equal.equals(Redacted.value(password), Redacted.value(passwordConfirm)),
          {
            message: () => "Passwords do not match!",
          }
        )
      ),
      defaultValues: {
        password: "",
        passwordConfirm: "",
        currentPassword: "",
        revokeOtherSessions: false,
      },
      onSubmit: async (value) => {
        await changePassword(value);
        props.onSuccess?.();
      },
    })
  );

  return {
    form,
  };
};

type UpdateUserProps = {
  readonly userInfo: User.Model;
  readonly onSuccess?: (() => void) | undefined;
};

export const useUpdateUserIdentityForm = ({ userInfo, onSuccess }: UpdateUserProps) => {
  const { updateUser } = useUpdateUserIdentity();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: UpdateUserIdentityContract.payloadSchema,
      defaultValues: F.pipe(
        userInfo.name,
        Str.split(" "),
        ([firstName, lastName]) =>
          ({
            firstName: O.fromNullable(firstName).pipe(
              O.match({
                onNone: () => "",
                onSome: (firstName) => firstName,
              })
            ),
            lastName: O.fromNullable(lastName).pipe(
              O.match({
                onNone: () => "",
                onSome: (lastName) => lastName,
              })
            ),
            gender: userInfo.gender,
          }) as const
      ),
      onSubmit: async (value) => {
        await updateUser(value);
        onSuccess?.();
      },
    })
  );

  return {
    form,
  };
};

type UpdateUsernameProps = {
  readonly onSuccess?: (() => void) | undefined;
  readonly userInfo: User.Model;
};

export const useUpdateUsernameForm = ({ userInfo, onSuccess }: UpdateUsernameProps) => {
  const { updateUsername } = useUpdateUsername();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: UpdateUsernameContract.payloadSchema,
      defaultValues: {
        username: userInfo.username.pipe(
          O.match({
            onNone: () => "",
            onSome: (username) => username,
          })
        ),
        displayUsername: userInfo.displayUsername.pipe(
          O.match({
            onNone: () => "",
            onSome: (displayUsername) => displayUsername,
          })
        ),
      },
      onSubmit: async (value) => {
        await updateUsername(value);
        onSuccess?.();
      },
    })
  );

  return {
    form,
  };
};

type UpdatePhoneNumberFormProps = {
  readonly userInfo: User.Model;
  readonly onSuccess?: (() => void) | undefined;
};

export const useUpdatePhoneNumberForm = ({ userInfo, onSuccess }: UpdatePhoneNumberFormProps) => {
  const { updatePhoneNumber } = useUpdatePhoneNumber();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: UpdatePhoneNumberContract.payloadSchema,
      defaultValues: {
        phoneNumber: userInfo.phoneNumber.pipe(
          O.match({
            onNone: () => "",
            onSome: Redacted.value,
          })
        ),
      },
      onSubmit: async (value) => {
        await updatePhoneNumber(value);
        onSuccess?.();
      },
    })
  );

  return {
    form,
  };
};

type UseChangeEmailFormProps = {
  readonly userInfo: User.Model;
  readonly onSuccess?: (() => void) | undefined;
};

export const useChangeEmailForm = ({ userInfo, onSuccess }: UseChangeEmailFormProps) => {
  const { changeEmail } = useChangeEmail();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: ChangeEmailContract.payloadSchema,
      defaultValues: {
        newEmail: Redacted.value(userInfo.email),
      },
      onSubmit: async (value) => {
        await changeEmail(value);
        onSuccess?.();
      },
    })
  );

  return {
    form,
  };
};
