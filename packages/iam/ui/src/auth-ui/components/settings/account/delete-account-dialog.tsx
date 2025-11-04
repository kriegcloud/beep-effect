import { Button } from "@beep/ui/components/button";
import { Card } from "@beep/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beep/ui/components/dialog";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import { cn } from "@beep/ui-core/utils";
import type { Account } from "better-auth";
import * as S from "effect/Schema";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useContext } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";
// import { Input } from "@beep/ui/components/input"
import { UserView } from "../../user-view";
import type { SettingsCardClassNames } from "../shared/settings-card";

export interface DeleteAccountDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  accounts?: Account[] | null;
  localization?: AuthLocalization;
}

export function DeleteAccountDialog({
  classNames,
  accounts,
  localization,
  onOpenChange,
  ...props
}: DeleteAccountDialogProps) {
  const {
    authClient,
    basePath,
    baseURL,
    deleteUser,
    freshAge,
    hooks: { useSession },
    localization: contextLocalization,
    viewPaths,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: sessionData } = useSession();
  const session = sessionData?.session;
  const user = sessionData?.user;

  const isFresh = session ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000 : false;
  const credentialsLinked = accounts?.some((acc) => acc.providerId === "credential");

  // const formSchema = z.object({
  //     password: credentialsLinked
  //         ? z.string().min(1, { message: localization.PASSWORD_REQUIRED! })
  //         : z.string().optional()
  // })
  //
  // const form = useForm({
  //     resolver: zodResolver(formSchema),
  //     defaultValues: {
  //         password: ""
  //     }
  // });

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        password: S.String,
      }),
      defaultValues: {
        password: "",
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      const params = {} as Record<string, string>;

      if (credentialsLinked) {
        params.password = value.password!;
      } else if (!isFresh) {
        navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
        return;
      }

      if (deleteUser?.verification) {
        params.callbackURL = `${baseURL}${basePath}/${viewPaths.SIGN_OUT}`;
      }

      try {
        await authClient.deleteUser({
          ...params,
          fetchOptions: {
            throw: true,
          },
        });

        if (deleteUser?.verification) {
          toast({
            variant: "success",
            message: localization.DELETE_ACCOUNT_VERIFY!,
          });
        } else {
          toast({
            variant: "success",
            message: localization.DELETE_ACCOUNT_SUCCESS!,
          });
          navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
        }
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }

      onOpenChange?.(false);
    },
  });

  const { isSubmitting } = form.state;

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization?.DELETE_ACCOUNT}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {isFresh ? localization?.DELETE_ACCOUNT_INSTRUCTIONS : localization?.SESSION_NOT_FRESH}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row p-4", classNames?.cell)}>
          <UserView user={user} localization={localization} />
        </Card>

        <Form onSubmit={form.handleSubmit} className="grid gap-6">
          {/*{credentialsLinked && (*/}
          {/*    <FormField*/}
          {/*        control={form.control}*/}
          {/*        name="password"*/}
          {/*        render={({ field }) => (*/}
          {/*            <FormItem>*/}
          {/*                <FormLabel*/}
          {/*                    className={classNames?.label}*/}
          {/*                >*/}
          {/*                    {localization?.PASSWORD}*/}
          {/*                </FormLabel>*/}

          {/*                <FormControl>*/}
          {/*                    <Input*/}
          {/*                        autoComplete="current-password"*/}
          {/*                        placeholder={*/}
          {/*                            localization?.PASSWORD_PLACEHOLDER*/}
          {/*                        }*/}
          {/*                        type="password"*/}
          {/*                        className={classNames?.input}*/}
          {/*                        {...field}*/}
          {/*                    />*/}
          {/*                </FormControl>*/}

          {/*                <FormMessage*/}
          {/*                    className={classNames?.error}*/}
          {/*                />*/}
          {/*            </FormItem>*/}
          {/*        )}*/}
          {/*    />*/}
          {/*)}*/}

          <DialogFooter className={classNames?.dialog?.footer}>
            <Button
              type="button"
              variant="secondary"
              className={cn(classNames?.button, classNames?.secondaryButton)}
              onClick={() => onOpenChange?.(false)}
            >
              {localization.CANCEL}
            </Button>

            <Button
              className={cn(classNames?.button, classNames?.destructiveButton)}
              disabled={isSubmitting}
              variant="destructive"
              type="submit"
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isFresh ? localization?.DELETE_ACCOUNT : localization?.SIGN_OUT}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
