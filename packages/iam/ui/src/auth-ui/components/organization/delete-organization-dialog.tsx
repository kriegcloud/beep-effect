"use client";

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
// import { useForm } from "react-hook-form";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
// import {getLocalizedError} from "../../lib/utils";
import { cn } from "@beep/ui-core/utils";
// import { zodResolver } from "@hookform/resolvers/zod"
import type { Organization } from "better-auth/plugins/organization";
import * as S from "effect/Schema";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useContext, useMemo } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../settings/shared/settings-card";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage
// } from "@beep/ui/components/form"
// import {Input} from "@beep/ui/components/input";
import { OrganizationCellView } from "./organization-cell-view";

export interface DeleteOrganizationDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  organization: Organization;
}

export function DeleteOrganizationDialog({
  classNames,
  localization: localizationProp,
  onOpenChange,
  organization,
  ...props
}: DeleteOrganizationDialogProps) {
  const {
    //  authClient,
    //    account: accountOptions,
    //     hooks: {useListOrganizations},
    localization: contextLocalization,
    // navigate,
    // toast
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );
  //
  // const {refetch: refetchOrganizations} = useListOrganizations();

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        slug: S.NonEmptyString.pipe(
          S.filter((val) => val === organization.slug, {
            message: () => localization.SLUG_DOES_NOT_MATCH!,
          })
        ),
      }),
      defaultValues: {
        slug: "",
      },
      validator: "onSubmit",
    }),
  });

  const { isSubmitting } = form.state;

  // const deleteOrganization = async () => {
  //   try {
  //     await authClient.organization.delete({
  //       organizationId: organization.id,
  //       fetchOptions: {throw: true}
  //     });
  //
  //     await refetchOrganizations?.();
  //
  //     toast({
  //       variant: "success",
  //       message: localization.DELETE_ORGANIZATION_SUCCESS!
  //     });
  //
  //     navigate(
  //       `${accountOptions?.basePath}/${accountOptions?.viewPaths.ORGANIZATIONS}`
  //     );
  //
  //     onOpenChange?.(false);
  //   } catch (error) {
  //     toast({
  //       variant: "error",
  //       message: getLocalizedError({error, localization})
  //     });
  //   }
  // };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization?.DELETE_ORGANIZATION}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization?.DELETE_ORGANIZATION_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn("my-2 flex-row p-4", classNames?.cell)}>
          <OrganizationCellView organization={organization} localization={localization} />
        </Card>

        <Form {...form}>
          <Form onSubmit={form.handleSubmit} className="grid gap-6">
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name="slug"*/}
            {/*  render={({field}) => (*/}
            {/*    <FormItem>*/}
            {/*      <FormLabel className={classNames?.label}>*/}
            {/*        {*/}
            {/*          localization?.DELETE_ORGANIZATION_INSTRUCTIONS*/}
            {/*        }*/}

            {/*        <span className="font-bold">*/}
            {/*                                {organization.slug}*/}
            {/*                            </span>*/}
            {/*      </FormLabel>*/}

            {/*      <FormControl>*/}
            {/*        <Input*/}
            {/*          placeholder={organization.slug}*/}
            {/*          className={classNames?.input}*/}
            {/*          autoComplete="off"*/}
            {/*          {...field}*/}
            {/*        />*/}
            {/*      </FormControl>*/}

            {/*      <FormMessage*/}
            {/*        className={classNames?.error}*/}
            {/*      />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}

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

                {localization?.DELETE_ORGANIZATION}
              </Button>
            </DialogFooter>
          </Form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
