import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({
  name: "footnoteReference",
  templates: ["{w}![^note]\n\n[^note]: {w}\n", "[^note](/url)\n\n[^note]: {w}\n"],
});
