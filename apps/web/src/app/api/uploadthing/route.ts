import { ourFileRouter } from "@beep/ui/lib/uploadthing";
import { createRouteHandler } from "uploadthing/next";

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
