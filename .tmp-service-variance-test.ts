import { ServiceMap } from "effect";
const a = ServiceMap.empty();
const b: ServiceMap.ServiceMap<unknown> = a;
const c: ServiceMap.ServiceMap<never> = b;
