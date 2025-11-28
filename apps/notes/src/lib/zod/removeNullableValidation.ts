import { z } from "zod";

export const unwrapObject = <Schema extends z.ZodObject<any>>(schema: Schema) => {
  const entries = Object.entries(schema.shape) as [keyof Schema["shape"], z.ZodTypeAny][];

  const newProps = entries.reduce((acc, [key, value]) => {
    acc[key] = value instanceof z.ZodNullable ? value.unwrap() : value;

    return acc;
  }, {} as any);

  return z.object(newProps) as z.ZodObject<{
    [key in keyof Schema["shape"]]: Schema["shape"][key] extends z.ZodNullable<infer T extends z.ZodTypeAny>
      ? z.ZodDefault<T>
      : Schema["shape"][key];
  }>;
};
