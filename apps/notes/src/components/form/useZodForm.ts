import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormProps, useForm } from "react-hook-form";
import type { z } from "zod";

type UseZodFormOptions<TSchema extends z.ZodType<any, any, any>> = {
  schema: TSchema;
  defaultValuesStorage?: UseFormProps<z.infer<TSchema>>["defaultValues"];
} & Omit<UseFormProps<z.infer<TSchema>>, "resolver">;

export function useZodForm<TSchema extends z.ZodType<any, any, any>>({
  defaultValuesStorage,
  ...props
}: UseZodFormOptions<TSchema>) {
  return useForm<z.infer<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema) as any,
  });
}
