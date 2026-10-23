import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({
  name: "link",
  templates: [
    '[{w}](/path "title")',
    "![*{w}* `code` <i>](img)",
    '[{w}][ref]\n\n[ref]: /path "title"\n',
    "![{w}][ref]\n\n[ref]: /path\n",
  ],
});
