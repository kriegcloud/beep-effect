import { ourFileRouter } from "@beep/notes/components/editor/uploadthing-app";
import { createRouteHandler } from "uploadthing/next";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
