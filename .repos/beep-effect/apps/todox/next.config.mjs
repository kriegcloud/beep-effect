import { beepNextConfig } from "@beep/build-utils";

const config = await beepNextConfig("@beep/todox", {
  headers: { contentSecurityPolicy: false },
});

export default config;
