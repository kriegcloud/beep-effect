"use client";

// import { OrganizationCellView } from "../../organization/organization-cell-view"
// import { PersonalAccountView } from "../../organization/personal-account-view"
import { Button } from "@beep/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@beep/ui/components/dialog";
// import { zodResolver } from "@hookform/resolvers/zod"
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import { cn } from "@beep/ui-core/utils";
import * as S from "effect/Schema";
// import type { Organization } from "better-auth/plugins/organization"
import { Loader2 } from "lucide-react";
import { type ComponentProps, useContext } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
// import { useForm } from "react-hook-form"
// import { useTranslate } from "@beep/ui/i18n";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";
import type { Refetch } from "../../../types/refetch";
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
import type { SettingsCardClassNames } from "../shared/settings-card";

interface CreateApiKeyDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  onSuccess: (key: string) => void;
  refetch?: Refetch;
  organizationId?: string;
}

export function CreateApiKeyDialog({
  classNames,
  localization,
  onSuccess,
  refetch,
  organizationId,
  onOpenChange,
  ...props
}: CreateApiKeyDialogProps) {
  const {
    authClient,
    apiKey,
    // hooks: { useListOrganizations, useSession },
    localization: contextLocalization,
    organization: contextOrganization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  // const { currentLang } = useTranslate()

  // let organizations: Organization[] | null | undefined
  // if (contextOrganization) {
  //     const { data } = useListOrganizations()
  //     organizations = data
  // }

  // const { data: sessionData } = useSession()
  // const user = sessionData?.user

  const showOrganizationSelect = contextOrganization?.apiKey;

  // const form = useForm({
  //     resolver: zodResolver(formSchema),
  //     values: {
  //         name: "",
  //         expiresInDays: "none",
  //         organizationId: organizationId ?? "personal"
  //     }
  // })
  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        name: S.String,
        expiresInDays: S.String.pipe(S.optional),
        organizationId: S.String.pipe(S.optional),
      }),
      defaultValues: {
        name: "",
        expiresInDays: "",
        organizationId: "",
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      try {
        const expiresIn =
          value.expiresInDays && value.expiresInDays !== "none"
            ? Number.parseInt(value.expiresInDays, 10) * 60 * 60 * 24
            : undefined;

        const selectedOrgId = value.organizationId === "personal" ? undefined : value.organizationId;

        const metadata = {
          ...(typeof apiKey === "object" ? apiKey.metadata : {}),
          ...(contextOrganization && selectedOrgId ? { organizationId: selectedOrgId } : {}),
        };

        const result = await authClient.apiKey.create({
          name: value.name,
          expiresIn,
          prefix: typeof apiKey === "object" ? apiKey.prefix : undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          fetchOptions: { throw: true },
        });

        await refetch?.();
        onSuccess(result.key);
        onOpenChange?.(false);
        form.reset();
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }
    },
  });

  const { isSubmitting } = form.state;

  // const rtf = new Intl.RelativeTimeFormat(currentLang.value ?? "en")

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization.CREATE_API_KEY}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.CREATE_API_KEY_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={form.handleSubmit} className="space-y-6">
          {showOrganizationSelect && (
            <>beep</>
            // <FormField
            //     control={form.control}
            //     name="organizationId"
            //     render={({ field }) => (
            //         <FormItem className="w-full">
            //             <FormLabel
            //                 className={classNames?.label}
            //             >
            //                 {localization.ORGANIZATION}
            //             </FormLabel>
            //
            //             <Select
            //                 onValueChange={field.onChange}
            //                 value={field.value}
            //                 disabled={isSubmitting}
            //             >
            //                 <FormControl>
            //                     <SelectTrigger
            //                         className={cn(
            //                             "w-full p-2",
            //                             classNames?.input
            //                         )}
            //                     >
            //                         <SelectValue
            //                             placeholder={
            //                                 localization.ORGANIZATION
            //                             }
            //                         />
            //                     </SelectTrigger>
            //                 </FormControl>
            //
            //                 <SelectContent className="w-[--radix-select-trigger-width]">
            //                     <SelectItem
            //                         value="personal"
            //                         className="p-2"
            //                     >
            //                         <PersonalAccountView
            //                             user={user}
            //                             localization={
            //                                 localization
            //                             }
            //                             size="sm"
            //                         />
            //                     </SelectItem>
            //
            //                     {organizations?.map((org) => (
            //                         <SelectItem
            //                             key={org.id}
            //                             value={org.id}
            //                             className="p-2"
            //                         >
            //                             <OrganizationCellView
            //                                 organization={org}
            //                                 localization={
            //                                     localization
            //                                 }
            //                                 size="sm"
            //                             />
            //                         </SelectItem>
            //                     ))}
            //                 </SelectContent>
            //             </Select>
            //
            //             <FormMessage />
            //         </FormItem>
            //     )}
            // />
          )}

          <div className="flex gap-4">
            {/*<FormField*/}
            {/*    control={form.control}*/}
            {/*    name="name"*/}
            {/*    render={({ field }) => (*/}
            {/*        <FormItem className="flex-1">*/}
            {/*            <FormLabel*/}
            {/*                className={classNames?.label}*/}
            {/*            >*/}
            {/*                {localization.NAME}*/}
            {/*            </FormLabel>*/}

            {/*            <FormControl>*/}
            {/*                <Input*/}
            {/*                    className={classNames?.input}*/}
            {/*                    placeholder={*/}
            {/*                        localization.API_KEY_NAME_PLACEHOLDER*/}
            {/*                    }*/}
            {/*                    autoFocus*/}
            {/*                    disabled={isSubmitting}*/}
            {/*                    {...field}*/}
            {/*                />*/}
            {/*            </FormControl>*/}

            {/*            <FormMessage />*/}
            {/*        </FormItem>*/}
            {/*    )}*/}
            {/*/>*/}

            {/*<FormField*/}
            {/*    control={form.control}*/}
            {/*    name="expiresInDays"*/}
            {/*    render={({ field }) => (*/}
            {/*        <FormItem>*/}
            {/*            <FormLabel*/}
            {/*                className={classNames?.label}*/}
            {/*            >*/}
            {/*                {localization.EXPIRES}*/}
            {/*            </FormLabel>*/}

            {/*            <Select*/}
            {/*                onValueChange={field.onChange}*/}
            {/*                defaultValue={field.value}*/}
            {/*                disabled={isSubmitting}*/}
            {/*            >*/}
            {/*                <FormControl>*/}
            {/*                    <SelectTrigger*/}
            {/*                        className={*/}
            {/*                            classNames?.input*/}
            {/*                        }*/}
            {/*                    >*/}
            {/*                        <SelectValue*/}
            {/*                            placeholder={*/}
            {/*                                localization.NO_EXPIRATION*/}
            {/*                            }*/}
            {/*                        />*/}
            {/*                    </SelectTrigger>*/}
            {/*                </FormControl>*/}

            {/*                <SelectContent>*/}
            {/*                    <SelectItem value="none">*/}
            {/*                        {localization.NO_EXPIRATION}*/}
            {/*                    </SelectItem>*/}

            {/*                    {[*/}
            {/*                        1, 7, 30, 60, 90, 180, 365*/}
            {/*                    ].map((days) => (*/}
            {/*                        <SelectItem*/}
            {/*                            key={days}*/}
            {/*                            value={days.toString()}*/}
            {/*                        >*/}
            {/*                            {days === 365*/}
            {/*                                ? rtf.format(*/}
            {/*                                      1,*/}
            {/*                                      "year"*/}
            {/*                                  )*/}
            {/*                                : rtf.format(*/}
            {/*                                      days,*/}
            {/*                                      "day"*/}
            {/*                                  )}*/}
            {/*                        </SelectItem>*/}
            {/*                    ))}*/}
            {/*                </SelectContent>*/}
            {/*            </Select>*/}

            {/*            <FormMessage />*/}
            {/*        </FormItem>*/}
            {/*    )}*/}
            {/*/>*/}
          </div>

          <DialogFooter className={classNames?.dialog?.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              className={cn(classNames?.button, classNames?.outlineButton)}
              disabled={isSubmitting}
            >
              {localization.CANCEL}
            </Button>

            <Button
              type="submit"
              variant="default"
              className={cn(classNames?.button, classNames?.primaryButton)}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}

              {localization.CREATE_API_KEY}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
