import { compute } from "../../lib-a/src/service";

const inner = (value: string): number => value.length;

export const helper = (value: string): number => {
  if (value.length > 1) {
    return inner(value);
  }

  return 1;
};

export const wrapped = (value: string): number => helper(value);

export const computeLength = (value: string) => compute(value);
