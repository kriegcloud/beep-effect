import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({ name: "strikethrough", templates: ["~~{w}~~", "~{w}~", "~~~{w}~~~", "~{w}~~", "a~~{w}~~z"] });
