import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({ name: "lineBreak", templates: ["{w}  \nnext", "{w}\\\nnext", "{w} \nnext"] });
