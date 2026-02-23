import type { UnsafeTypes } from "@beep/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormProps, useForm } from "react-hook-form";
import type { z } from "zod";

type UseZodFormOptions<TSchema extends z.ZodType<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>> =
  {
    readonly schema: TSchema;
    readonly defaultValuesStorage?: undefined | UseFormProps<z.infer<TSchema>>["defaultValues"];
  } & Omit<UseFormProps<z.infer<TSchema>>, "resolver">;

export function useZodForm<
  TSchema extends z.ZodType<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
>({ defaultValuesStorage, ...props }: UseZodFormOptions<TSchema>) {
  return useForm<z.infer<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema) as UnsafeTypes.UnsafeAny,
  });
}
