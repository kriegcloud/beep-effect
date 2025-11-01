"use client";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
// import { zodResolver } from "@hookform/resolvers/zod"
import type { Organization } from "better-auth/plugins/organization";
import { useContext, useMemo } from "react";

// import { useForm } from "react-hook-form"

import { CardContent } from "@beep/ui/components/card";
// import { Form, FormControl, FormField, FormItem, FormMessage } from "@beep/ui/components/form"
// import { Input } from "@beep/ui/components/input"
import { Skeleton } from "@beep/ui/components/skeleton";
// import {  getLocalizedError } from "../../lib/utils";
import { cn } from "@beep/ui-core/utils";
import * as S from "effect/Schema";
import { useCurrentOrganization } from "../../hooks/use-current-organization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { SettingsCard, type SettingsCardProps } from "../settings/shared/settings-card";

export interface OrganizationNameCardProps extends SettingsCardProps {
  slug?: string;
}

export function OrganizationNameCard({
  className,
  classNames,
  localization: localizationProp,
  slug,
  ...props
}: OrganizationNameCardProps) {
  const { localization: contextLocalization } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) {
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={localization.SAVE}
        description={localization.ORGANIZATION_NAME_DESCRIPTION}
        instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
        isPending
        title={localization.ORGANIZATION_NAME}
        {...props}
      >
        <CardContent className={classNames?.content}>
          <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
        </CardContent>
      </SettingsCard>
    );
  }

  return (
    <OrganizationNameForm
      className={className}
      classNames={classNames}
      localization={localization}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationNameForm({
  className,
  classNames,
  localization: localizationProp,
  organization,
  ...props
}: OrganizationNameCardProps & { organization: Organization }) {
  const {
    localization: contextLocalization,
    hooks: { useHasPermission },
    // mutators: { updateOrganization },
    optimistic,
    // toast
  } = useContext(AuthUIContext);

  const localization = { ...contextLocalization, ...localizationProp };

  const { data: hasPermission, isPending: permissionPending } = useHasPermission({
    organizationId: organization.id,
    permissions: {
      organization: ["update"],
    },
  });

  /*    const { refetch: refetchOrganization } = useCurrentOrganization({
        slug: organization.slug
    })*/

  const isPending = permissionPending;

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        name: S.NonEmptyString.annotations({
          message: () => `${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`,
        }),
      }),
      defaultValues: {
        name: organization.name,
      },
      validator: "onSubmit",
    }),
  });

  // const { isSubmitting } = form.state

  // const updateOrganizationName = async ({
  //     name
  // }: z.infer<typeof formSchema>) => {
  //     if (organization.name === name) {
  //         toast({
  //             variant: "error",
  //             message: `${localization.ORGANIZATION_NAME} ${localization.IS_THE_SAME}`
  //         })
  //
  //         return
  //     }
  //
  //     try {
  //         // await updateOrganization({
  //         //     organizationId: organization.id,
  //         //     data: { name }
  //         // })
  //
  //         await refetchOrganization?.()
  //
  //         toast({
  //             variant: "success",
  //             message: `${localization.ORGANIZATION_NAME} ${localization.UPDATED_SUCCESSFULLY}`
  //         })
  //     } catch (error) {
  //         toast({
  //             variant: "error",
  //             message: getLocalizedError({ error, localization })
  //         })
  //     }
  // }

  return (
    <Form {...form}>
      <Form onSubmit={form.handleSubmit}>
        <SettingsCard
          className={className}
          classNames={classNames}
          description={localization.ORGANIZATION_NAME_DESCRIPTION}
          instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
          isPending={isPending}
          title={localization.ORGANIZATION_NAME}
          actionLabel={localization.SAVE}
          optimistic={optimistic}
          disabled={!hasPermission?.success}
          {...props}
        >
          <CardContent className={classNames?.content}>
            {isPending ? (
              <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
            ) : (
              <>beep</>
              // <FormField
              //     control={form.control}
              //     name="name"
              //     render={({ field }) => (
              //         <FormItem>
              //             <FormControl>
              //                 <Input
              //                     className={classNames?.input}
              //                     placeholder={
              //                         localization.ORGANIZATION_NAME_PLACEHOLDER
              //                     }
              //                     disabled={
              //                         isSubmitting ||
              //                         !hasPermission?.success
              //                     }
              //                     {...field}
              //                 />
              //             </FormControl>
              //
              //             <FormMessage
              //                 className={classNames?.error}
              //             />
              //         </FormItem>
              //     )}
              // />
            )}
          </CardContent>
        </SettingsCard>
      </Form>
    </Form>
  );
}
