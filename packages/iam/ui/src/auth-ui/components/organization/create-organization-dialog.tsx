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
// import { fileToBase64, resizeAndCropImage } from "../../lib/image-utils"
// import { getLocalizedError } from "../../lib/utils"
import { cn } from "@beep/ui-core/utils";
// import { useForm } from "@tanstack/react-form";
// import * as z from "zod"
import * as S from "effect/Schema";
import {
  Loader2,
  // Trash2Icon,
  // UploadCloudIcon
} from "lucide-react";
import type {
  ComponentProps,
  // useRef,
  // useState
} from "react";
import {
  useContext,
  useMemo,
  // useRef,
  // useState
} from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../settings/shared/settings-card";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger
// } from "@beep/ui/components/dropdown-menu"

// import { Input } from "@beep/ui/components/input"
// import { OrganizationLogo } from "./organization-logo"

export interface CreateOrganizationDialogProps extends ComponentProps<typeof Dialog> {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
}

export function CreateOrganizationDialog({
  className,
  classNames,
  localization: localizationProp,
  onOpenChange,
  ...props
}: CreateOrganizationDialogProps) {
  const {
    // authClient,
    localization: contextLocalization,
    organization: organizationOptions,
    // navigate,
    // toast
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  // const [logo, setLogo] = useState<string | null>(null)
  // const [logoPending, setLogoPending] = useState(false)

  // const fileInputRef = useRef<HTMLInputElement>(null)
  // const openFileDialog = () => fileInputRef.current?.click()

  // const formSchema = z.object({
  //     logo: z.string().optional(),
  //     name: z.string().min(1, {
  //         message: `${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`
  //     }),
  //     slug: z
  //         .string()
  //         .min(1, {
  //             message: `${localization.ORGANIZATION_SLUG} ${localization.IS_REQUIRED}`
  //         })
  //         .regex(/^[a-z0-9-]+$/, {
  //             message: `${localization.ORGANIZATION_SLUG} ${localization.IS_INVALID}`
  //         })
  // })

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Struct({
        logo: S.String.pipe(S.optional),
        name: S.NonEmptyString,
        slug: S.NonEmptyString.pipe(S.pattern(/^[a-z0-9-]+$/)),
      }),
      defaultValues: {
        logo: "",
        name: "",
        slug: "",
      },
      validator: "onSubmit",
    }),
  });

  const isSubmitting = form.state.isSubmitting;

  // const handleLogoChange = async (file: File) => {
  //     if (!organizationOptions?.logo) return
  //
  //     setLogoPending(true)
  //
  //     try {
  //         const resizedFile = await resizeAndCropImage(
  //             file,
  //             crypto.randomUUID(),
  //             organizationOptions.logo.size,
  //             organizationOptions.logo.extension
  //         )
  //
  //         let image: string | undefined | null
  //
  //         if (organizationOptions?.logo.upload) {
  //             image = await organizationOptions.logo.upload(resizedFile)
  //         } else {
  //             image = await fileToBase64(resizedFile)
  //         }
  //
  //         setLogo(image || null)
  //         form.setFieldValue("logo", image || "")
  //     } catch (error) {
  //         toast({
  //             variant: "error",
  //             message: getLocalizedError({ error, localization })
  //         })
  //     }
  //
  //     setLogoPending(false)
  // }

  // const deleteLogo = async () => {
  //     setLogoPending(true)
  //
  //     const currentUrl = logo || undefined
  //     if (currentUrl && organizationOptions?.logo?.delete) {
  //         await organizationOptions.logo.delete(currentUrl)
  //     }
  //
  //     setLogo(null)
  //     form.setFieldValue("logo", "")
  //     setLogoPending(false)
  // }

  // async function onSubmit({ name, slug, logo }: z.infer<typeof formSchema>) {
  //     try {
  //         const organization = await authClient.organization.create({
  //             name,
  //             slug,
  //             logo,
  //             fetchOptions: { throw: true }
  //         })
  //
  //         if (organizationOptions?.pathMode === "slug") {
  //             navigate(`${organizationOptions.basePath}/${organization.slug}`)
  //             return
  //         }
  //
  //         await authClient.organization.setActive({
  //             organizationId: organization.id
  //         })
  //
  //         onOpenChange?.(false)
  //         form.reset()
  //         setLogo(null)
  //
  //         toast({
  //             variant: "success",
  //             message: localization.CREATE_ORGANIZATION_SUCCESS
  //         })
  //     } catch (error) {
  //         toast({
  //             variant: "error",
  //             message: getLocalizedError({ error, localization })
  //         })
  //     }
  // }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
            {localization.CREATE_ORGANIZATION}
          </DialogTitle>

          <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
            {localization.ORGANIZATIONS_INSTRUCTIONS}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <Form onSubmit={form.handleSubmit} className="space-y-6">
            {organizationOptions?.logo && (
              <form.AppField name={"logo"} children={(field) => <field.UploadAvatar />} />
              // <FormField
              //     control={form.control}
              //     name="logo"
              //     render={() => (
              //         <FormItem>
              //             <input
              //                 ref={fileInputRef}
              //                 accept="image/*"
              //                 disabled={logoPending}
              //                 hidden
              //                 type="file"
              //                 onChange={(e) => {
              //                     const file =
              //                         e.target.files?.item(0)
              //                     if (file) handleLogoChange(file)
              //                     e.target.value = ""
              //                 }}
              //             />
              //
              //             <FormLabel>
              //                 {localization.LOGO}
              //             </FormLabel>
              //
              //             <div className="flex items-center gap-4">
              //                 <DropdownMenu>
              //                     <DropdownMenuTrigger asChild>
              //                         <Button
              //                             className="size-fit rounded-full"
              //                             size="icon"
              //                             type="button"
              //                             variant="ghost"
              //                         >
              //                             <OrganizationLogo
              //                                 className="size-16"
              //                                 isPending={
              //                                     logoPending
              //                                 }
              //                                 localization={
              //                                     localization
              //                                 }
              //                                 organization={{
              //                                     name: form.watch(
              //                                         "name"
              //                                     ),
              //                                     logo
              //                                 }}
              //                             />
              //                         </Button>
              //                     </DropdownMenuTrigger>
              //
              //                     <DropdownMenuContent
              //                         align="start"
              //                         onCloseAutoFocus={(e) =>
              //                             e.preventDefault()
              //                         }
              //                     >
              //                         <DropdownMenuItem
              //                             onClick={openFileDialog}
              //                             disabled={logoPending}
              //                         >
              //                             <UploadCloudIcon />
              //
              //                             {
              //                                 localization.UPLOAD_LOGO
              //                             }
              //                         </DropdownMenuItem>
              //
              //                         {logo && (
              //                             <DropdownMenuItem
              //                                 onClick={deleteLogo}
              //                                 disabled={
              //                                     logoPending
              //                                 }
              //                                 variant="destructive"
              //                             >
              //                                 <Trash2Icon />
              //
              //                                 {
              //                                     localization.DELETE_LOGO
              //                                 }
              //                             </DropdownMenuItem>
              //                         )}
              //                     </DropdownMenuContent>
              //                 </DropdownMenu>
              //
              //                 <Button
              //                     disabled={logoPending}
              //                     variant="outline"
              //                     onClick={openFileDialog}
              //                     type="button"
              //                 >
              //                     {logoPending && (
              //                         <Loader2 className="animate-spin" />
              //                     )}
              //
              //                     {localization.UPLOAD}
              //                 </Button>
              //             </div>
              //
              //             <FormMessage />
              //         </FormItem>
              //     )}
              // />
            )}

            <form.AppField name={"name"} children={(field) => <field.Text />} />
            {/*<FormField*/}
            {/*    control={form.control}*/}
            {/*    name="name"*/}
            {/*    render={({ field }) => (*/}
            {/*        <FormItem>*/}
            {/*            <FormLabel>*/}
            {/*                {localization.ORGANIZATION_NAME}*/}
            {/*            </FormLabel>*/}

            {/*            <FormControl>*/}
            {/*                <Input*/}
            {/*                    placeholder={*/}
            {/*                        localization.ORGANIZATION_NAME_PLACEHOLDER*/}
            {/*                    }*/}
            {/*                    {...field}*/}
            {/*                />*/}
            {/*            </FormControl>*/}

            {/*            <FormMessage />*/}
            {/*        </FormItem>*/}
            {/*    )}*/}
            {/*/>*/}

            <form.AppField name={"slug"} children={(field) => <field.Text />} />
            {/*<FormField*/}
            {/*    control={form.control}*/}
            {/*    name="slug"*/}
            {/*    render={({ field }) => (*/}
            {/*        <FormItem>*/}
            {/*            <FormLabel>*/}
            {/*                {localization.ORGANIZATION_SLUG}*/}
            {/*            </FormLabel>*/}

            {/*            <FormControl>*/}
            {/*                <Input*/}
            {/*                    placeholder={*/}
            {/*                        localization.ORGANIZATION_SLUG_PLACEHOLDER*/}
            {/*                    }*/}
            {/*                    {...field}*/}
            {/*                />*/}
            {/*            </FormControl>*/}

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

              <Button
                type="submit"
                className={cn(classNames?.button, classNames?.primaryButton)}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {localization.CREATE_ORGANIZATION}
              </Button>
            </DialogFooter>
          </Form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
