import { client } from "@beep/iam-client/adapters";
import * as Common from "../../_common";
import * as Contract from "./contract.ts";

/**
 * Email sign-in handler using the new wrapIamMethod utility.
 *
 * The wrapIamMethod handles:
 * 1. Encoding the payload using the wrapper's payloadSchema
 * 2. Running the `before` effect (captcha) and injecting its result
 * 3. Executing the Better Auth client method
 * 4. Checking for errors in the response
 * 5. Decoding the success response using the wrapper's successSchema
 * 6. Notifying $sessionSignal when mutatesSession is true
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    before: Common.withCaptchaResponse,
  })((encodedPayload, captchaResponse) =>
    client.signIn.email({
      ...encodedPayload,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaResponse,
        },
      },
    })
  )
);
