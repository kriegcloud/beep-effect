import { describePropertyFloor } from "./propertyFloor.ts";

describePropertyFloor({
  name: "rawHtml",
  templates: [
    'before <i title="{w}">after</i>',
    "before <!--{w}--> after",
    "before <![CDATA[{w}]]> after",
    "before <?{w}?> after",
    "before <!--{w} after",
  ],
});
