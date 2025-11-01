"use client";

import { CardContent } from "@beep/ui/components/card";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import { cn } from "@beep/ui-core/utils";
// import { useForm } from "react-hook-form"
// import * as z from "zod"
import * as S from "effect/Schema";
// import { zodResolver } from "@hookform/resolvers/zod"
import { type ReactNode, useContext, useMemo } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import { getLocalizedError } from "../../../lib/utils";
import type { FieldType } from "../../../types/additional-fields";
// import {Checkbox} from "@beep/ui/components/checkbox";

// import {Input} from "@beep/ui/components/input";
import { Skeleton } from "@beep/ui/components/skeleton";
// import {Textarea} from "@beep/ui/components/textarea";
import { SettingsCard, type SettingsCardClassNames } from "../shared/settings-card";

export interface UpdateFieldCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  description?: ReactNode;
  instructions?: ReactNode;
  localization?: Partial<AuthLocalization>;
  name: string;
  placeholder?: string;
  required?: boolean;
  label?: ReactNode;
  type?: FieldType;
  multiline?: boolean;
  value?: unknown;
  validate?: (value: string) => boolean | Promise<boolean>;
}

export function UpdateFieldCard({
  className,
  classNames,
  description,
  instructions,
  localization: localizationProp,
  name,
  placeholder,
  required,
  label,
  type,
  multiline,
  value,
  validate,
}: UpdateFieldCardProps) {
  const {
    hooks: { useSession },
    mutators: { updateUser },
    localization: contextLocalization,
    optimistic,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { isPending } = useSession();

  // let fieldSchema = z.unknown() as z.ZodType<unknown>
  //
  // // Create the appropriate schema based on type
  // if (type === "number") {
  //     fieldSchema = required
  //         ? z.preprocess(
  //               (val) => (!val ? undefined : Number(val)),
  //               z.number({
  //                   message: `${label} ${localization.IS_INVALID}`
  //               })
  //           )
  //         : z.coerce
  //               .number({
  //                   message: `${label} ${localization.IS_INVALID}`
  //               })
  //               .optional()
  // } else if (type === "boolean") {
  //     fieldSchema = required
  //         ? z.coerce
  //               .boolean({
  //                   message: `${label} ${localization.IS_INVALID}`
  //               })
  //               .refine((val) => val === true, {
  //                   message: `${label} ${localization.IS_REQUIRED}`
  //               })
  //         : z.coerce.boolean({
  //               message: `${label} ${localization.IS_INVALID}`
  //           })
  // } else {
  //     fieldSchema = required
  //         ? z.string().min(1, `${label} ${localization.IS_REQUIRED}`)
  //         : z.string().optional()
  // }
  //
  // const form = useForm({
  //     resolver: zodResolver(z.object({ [name]: fieldSchema })),
  //     values: { [name]: value || "" }
  // })

  const form = useAppForm({
    ...makeFormOptions({
      schema: S.Record({
        key: S.String,
        value: S.Any,
      }),
      defaultValues: {
        [name]: value || "",
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve));
      const newValue = value[name];

      if (value === newValue) {
        toast({
          variant: "error",
          message: `${label} ${localization.IS_THE_SAME}`,
        });
        return;
      }

      if (validate && typeof newValue === "string" && !(await validate(newValue))) {
        // form.setFieldMeta(name, {
        //   message: `${label} ${localization.IS_INVALID}`
        // });

        return;
      }

      try {
        await updateUser({ [name]: newValue });

        toast({
          variant: "success",
          message: `${label} ${localization.UPDATED_SUCCESSFULLY}`,
        });
      } catch (error) {
        toast({
          variant: "error",
          message: getLocalizedError({ error, localization }),
        });
      }
    },
  });

  // const {isSubmitting} = form.state;

  return (
    <Form onSubmit={form.handleSubmit}>
      <SettingsCard
        className={className}
        classNames={classNames}
        description={description}
        instructions={instructions}
        isPending={isPending}
        title={label}
        actionLabel={localization.SAVE}
        optimistic={optimistic}
      >
        <CardContent className={classNames?.content}>
          {type === "boolean" ? (
            <>beep</>
            // <FormField
            //     control={form.control}
            //     name={name}
            //     render={({ field }) => (
            //         <FormItem className="flex">
            //             <FormControl>
            //                 <Checkbox
            //                     checked={field.value as boolean}
            //                     onCheckedChange={field.onChange}
            //                     disabled={isSubmitting}
            //                     className={classNames?.checkbox}
            //                 />
            //             </FormControl>
            //
            //             <FormLabel
            //                 className={classNames?.label}
            //             >
            //                 {label}
            //             </FormLabel>
            //
            //             <FormMessage
            //                 className={classNames?.error}
            //             />
            //         </FormItem>
            //     )}
            // />
          ) : isPending ? (
            <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
          ) : (
            <>beep</>
            // <FormField
            //     control={form.control}
            //     name={name}
            //     render={({ field }) => (
            //         <FormItem>
            //             <FormControl>
            //                 {type === "number" ? (
            //                     <Input
            //                         className={
            //                             classNames?.input
            //                         }
            //                         type="number"
            //                         placeholder={
            //                             placeholder ||
            //                             (typeof label ===
            //                             "string"
            //                                 ? label
            //                                 : "")
            //                         }
            //                         disabled={isSubmitting}
            //                         {...field}
            //                         value={
            //                             field.value as string
            //                         }
            //                     />
            //                 ) : multiline ? (
            //                     <Textarea
            //                         className={
            //                             classNames?.input
            //                         }
            //                         placeholder={
            //                             placeholder ||
            //                             (typeof label ===
            //                             "string"
            //                                 ? label
            //                                 : "")
            //                         }
            //                         disabled={isSubmitting}
            //                         {...field}
            //                         value={
            //                             field.value as string
            //                         }
            //                     />
            //                 ) : (
            //                     <Input
            //                         className={
            //                             classNames?.input
            //                         }
            //                         type="text"
            //                         placeholder={
            //                             placeholder ||
            //                             (typeof label ===
            //                             "string"
            //                                 ? label
            //                                 : "")
            //                         }
            //                         disabled={isSubmitting}
            //                         {...field}
            //                         value={
            //                             field.value as string
            //                         }
            //                     />
            //                 )}
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
  );
}
