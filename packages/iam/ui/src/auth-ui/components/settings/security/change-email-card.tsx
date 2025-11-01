"use client";

import { CardContent } from "@beep/ui/components/card";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import * as S from "effect/Schema";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
// import { Form, FormControl, FormField, FormItem, FormMessage } from "@beep/ui/components/form";
// import {Input} from "@beep/ui/components/input";
// import {Skeleton} from "@beep/ui/components/skeleton";
// import {cn} from "@beep/ui-core/utils";
// import { BS } from "@beep/schema";
import * as S from "effect/Schema";
// import { zodResolver } from "@hookform/resolvers/zod";
import {
  useContext,
  //  useState
} from "react";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";
import type { SettingsCardProps } from "../shared/settings-card";
import { SettingsCard } from "../shared/settings-card";

export function ChangeEmailCard({ className, classNames, localization, ...props }: SettingsCardProps) {
  const {
    authClient,
    // emailVerification,
    hooks: { useSession },
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: sessionData, isPending, refetch } = useSession();
  // const [resendDisabled, setResendDisabled] = useState(false);

  // const formSchema = z.object({
  //   email: z.string().email({ message: localization.INVALID_EMAIL }),
  // });
  //
  // const form = useForm({
  //   resolver: zodResolver(formSchema),
  //   values: {
  //     email: sessionData?.user.email || "",
  //   },
  // });
  //
  // const resendForm = useForm();
  // class FormSchema extends BS.Class<FormSchema>("FormSchema")({
  //   email: BS.Email
  // }) {}
  const form = useAppForm({
    ...makeFormOptions({
      // @ts-expect-error
      schema: S.Record({
        key: S.String,
        value: S.Any,
      }),
      values: {
        email: sessionData?.user.email || "",
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      if (value.email === sessionData?.user.email) {
        await new Promise((resolve) => setTimeout(resolve));
        toast({
          variant: "error",
          message: localization.EMAIL_IS_THE_SAME,
        });
        return;
      }

      try {
        await authClient.changeEmail({
          newEmail: value.email,
          callbackURL: window.location.pathname,
          fetchOptions: { throw: true },
        });

        if (sessionData?.user.emailVerified) {
          toast({
            variant: "success",
            message: localization.EMAIL_VERIFY_CHANGE!,
          });
        } else {
          await refetch?.();
          toast({
            variant: "success",
            message: `${localization.EMAIL} ${localization.UPDATED_SUCCESSFULLY}`,
          });
        }
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }
    },
  });

  // const {isSubmitting} = form.state;
  //
  //
  // const resendVerification = async () => {
  //   if (!sessionData) return;
  //   const email = sessionData.user.email;
  //
  //   setResendDisabled(true);
  //
  //   try {
  //     await authClient.sendVerificationEmail({
  //       email,
  //       fetchOptions: {throw: true},
  //     });
  //
  //     toast({
  //       variant: "success",
  //       message: localization.EMAIL_VERIFICATION!,
  //     });
  //   } catch (error) {
  //     toast({
  //       variant: "error",
  //       message: getLocalizedError({error, localization}),
  //     });
  //     setResendDisabled(false);
  //     throw error;
  //   }
  // };

  return (
    <>
      <Form onSubmit={form.handleSubmit}>
        <SettingsCard
          className={className}
          classNames={classNames}
          description={localization.EMAIL_DESCRIPTION}
          instructions={localization.EMAIL_INSTRUCTIONS}
          isPending={isPending}
          title={localization.EMAIL}
          actionLabel={localization.SAVE}
          {...props}
        >
          <CardContent className={classNames?.content}>
            {/*{isPending ? (*/}
            {/*  <Skeleton className={cn("h-9 w-full", classNames?.skeleton)}/>*/}
            {/*) : (*/}
            {/*  <FormField*/}
            {/*    control={form.control}*/}
            {/*    name="email"*/}
            {/*    render={({field}) => (*/}
            {/*      <FormItem>*/}
            {/*        <FormControl>*/}
            {/*          <Input*/}
            {/*            className={classNames?.input}*/}
            {/*            placeholder={localization.EMAIL_PLACEHOLDER}*/}
            {/*            type="email"*/}
            {/*            disabled={isSubmitting}*/}
            {/*            {...field}*/}
            {/*          />*/}
            {/*        </FormControl>*/}

            {/*        <FormMessage className={classNames?.error}/>*/}
            {/*      </FormItem>*/}
            {/*    )}*/}
            {/*  />*/}
            {/*)}*/}
          </CardContent>
        </SettingsCard>
      </Form>

      {/*{emailVerification && sessionData?.user && !sessionData?.user.emailVerified && (*/}
      {/*  */}
      {/*    <form onSubmit={resendForm.handleSubmit(resendVerification)}>*/}
      {/*      <SettingsCard*/}
      {/*        className={className}*/}
      {/*        classNames={classNames}*/}
      {/*        title={localization.VERIFY_YOUR_EMAIL}*/}
      {/*        description={localization.VERIFY_YOUR_EMAIL_DESCRIPTION}*/}
      {/*        actionLabel={localization.RESEND_VERIFICATION_EMAIL}*/}
      {/*        disabled={resendDisabled}*/}
      {/*        {...props}*/}
      {/*      />*/}
      {/*    */}
      {/*  </Form>*/}
      {/*)}*/}
    </>
  );
}
