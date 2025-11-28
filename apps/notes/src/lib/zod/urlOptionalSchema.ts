import * as z from "zod";

const httpRegex = /^(?:http|https):/;

// https://gist.github.com/dperini/729294
const completeUrlRegex = new RegExp(
  "^" +
    // protocol identifier (optional)
    // short syntax // still required
    String.raw`(?:(?:https?|ftp):)?\/\/` +
    // user:pass BasicAuth (optional)
    String.raw`(?:\S+@)?` +
    "(?:" +
    // IP address exclusion
    // private & local networks
    String.raw`(?!(?:10|127)(?:\.\d{1,3}){3})` +
    String.raw`(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})` +
    String.raw`(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})` +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broadcast addresses
    // (first & last IP address of each class)
    String.raw`(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])` +
    String.raw`(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}` +
    String.raw`\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])` +
    "|" +
    // host & domain names, may end with dot
    // can be replaced by a shortest alternative
    // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
    "(?:" +
    "(?:" +
    String.raw`[a-z\d\u00a1-\uffff]` +
    String.raw`[\w\u00a1-\uffff-]{0,62}` +
    ")?" +
    String.raw`[a-z\d\u00a1-\uffff]\.` +
    ")+" +
    // TLD identifier name, may end with dot
    String.raw`[a-z\u00a1-\uffff]{2,}\.?` +
    ")" +
    // port number (optional)
    String.raw`(?::\d{2,5})?` +
    // resource path (optional)
    String.raw`(?:[/?#]\S*)?` +
    "$",
  "i"
);

export const urlSchema = z.string().transform((val, ctx) => {
  let completeUrl = val;

  if (!httpRegex.test(completeUrl)) {
    completeUrl = `https://${completeUrl}`;
  }
  if (!completeUrlRegex.test(completeUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid url: ${completeUrl}`,
    });

    return z.NEVER;
  }

  return completeUrl;
});

export const urlOptionalSchema = urlSchema.optional().or(z.literal(""));

export const urlNullishSchema = urlSchema.nullish().or(z.literal(""));
