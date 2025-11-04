"use client";

import { Button } from "@beep/ui/components/button";
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
import type { Organization } from "better-auth/plugins/organization";
import * as S from "effect/Schema";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useContext, useMemo } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { getLocalizedError } from "../../lib/utils";
import type { SettingsCardClassNames } from "../settings/shared/settings-card";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage
// } from "@beep/ui/components/form"
// import { Input } from "@beep/ui/components/input"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from "@beep/ui/components/select"

export interface InviteMemberDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  organization: Organization;
}

export function InviteMemberDialog({
  classNames,
  localization: localizationProp,
  onOpenChange,
  organization,
  ...props
}: InviteMemberDialogProps) {
  const {
    authClient,
    hooks: {
      useListInvitations,
      //    useListMembers,
      //    useSession
    },
    localization: contextLocalization,
    toast,
    // organization: organizationOptions
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  // const { data } = useListMembers({
  //     query: { organizationId: organization.id }
  // })

  const { refetch } = useListInvitations({
    query: { organizationId: organization.id },
  });

  // const members = data?.members
  //
  // const { data: sessionData } = useSession()
  // const membership = members?.find((m) => m.userId === sessionData?.user.id)

  const builtInRoles = [
    { role: "owner", label: localization.OWNER },
    { role: "admin", label: localization.ADMIN },
    { role: "member", label: localization.MEMBER },
  ] as const;

  // const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])]
  // const availableRoles = roles.filter(
  //     (role) => membership?.role === "owner" || role.role !== "owner"
  // )
  //
  // const formSchema = z.object({
  //     email: z
  //         .string()
  //         .min(1, { message: localization.EMAIL_REQUIRED })
  //         .email({
  //             message: localization.INVALID_EMAIL
  //         }),
  //     role: z.string().min(1, {
  //         message: `${localization.ROLE} ${localization.IS_REQUIRED}`
  //     })
  // })

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        email: S.String,
        role: S.String,
      }),
      defaultValues: {
        email: "",
        role: "",
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      try {
        await authClient.organization.inviteMember({
          email: value.email,
          role: value.role as (typeof builtInRoles)[number]["role"],
          organizationId: organization.id,
          fetchOptions: { throw: true },
        });

        await refetch?.();

        onOpenChange?.(false);
        form.reset();

        toast({
          variant: "success",
          message: localization.SEND_INVITATION_SUCCESS || "Invitation sent successfully",
        });
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }
    },
  });
  //
  // const form = useForm({
  //     resolver: zodResolver(formSchema),
  //     defaultValues: {
  //         email: "",
  //         role: "member"
  //     }
  // })

  const isSubmitting = form.state.isSubmitting;

  // async function onSubmit({ email, role }: z.infer<typeof formSchema>) {
  //
  // }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization.INVITE_MEMBER}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.INVITE_MEMBER_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={form.handleSubmit} className="space-y-6">
          {/*<FormField*/}
          {/*    control={form.control}*/}
          {/*    name="email"*/}
          {/*    render={({ field }) => (*/}
          {/*        <FormItem>*/}
          {/*            <FormLabel className={classNames?.label}>*/}
          {/*                {localization.EMAIL}*/}
          {/*            </FormLabel>*/}

          {/*            <FormControl>*/}
          {/*                <Input*/}
          {/*                    placeholder={*/}
          {/*                        localization.EMAIL_PLACEHOLDER*/}
          {/*                    }*/}
          {/*                    type="email"*/}
          {/*                    {...field}*/}
          {/*                    className={classNames?.input}*/}
          {/*                />*/}
          {/*            </FormControl>*/}

          {/*            <FormMessage />*/}
          {/*        </FormItem>*/}
          {/*    )}*/}
          {/*/>*/}

          {/*<FormField*/}
          {/*    control={form.control}*/}
          {/*    name="role"*/}
          {/*    render={({ field }) => (*/}
          {/*        <FormItem>*/}
          {/*            <FormLabel className={classNames?.label}>*/}
          {/*                {localization.ROLE}*/}
          {/*            </FormLabel>*/}

          {/*            <Select*/}
          {/*                onValueChange={field.onChange}*/}
          {/*                defaultValue={field.value}*/}
          {/*            >*/}
          {/*                <FormControl>*/}
          {/*                    <SelectTrigger>*/}
          {/*                        <SelectValue />*/}
          {/*                    </SelectTrigger>*/}
          {/*                </FormControl>*/}

          {/*                <SelectContent>*/}
          {/*                    {availableRoles.map((role) => (*/}
          {/*                        <SelectItem*/}
          {/*                            key={role.role}*/}
          {/*                            value={role.role}*/}
          {/*                        >*/}
          {/*                            {role.label}*/}
          {/*                        </SelectItem>*/}
          {/*                    ))}*/}
          {/*                </SelectContent>*/}
          {/*            </Select>*/}

          {/*            <FormMessage />*/}
          {/*        </FormItem>*/}
          {/*    )}*/}
          {/*/>*/}

          <DialogFooter className={classNames?.dialog?.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              className={cn(classNames?.button, classNames?.outlineButton)}
            >
              {localization.CANCEL}
            </Button>

            <Button type="submit" className={cn(classNames?.button, classNames?.primaryButton)} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}

              {localization.SEND_INVITATION}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
