import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({ name: "text", templates: ["plain {w} punctuation ' \" ! ] : w", "{w} &amp; next"] });
