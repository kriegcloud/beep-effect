import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({ name: "escape", templates: ["\\*{w}\\*", "{w}\\\nnext", "\\q{w}", "{w}\\"] });
