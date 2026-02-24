import {
  equal,
  escapeComponent,
  IRI,
  IRIFromString,
  IRIStringFromString,
  normalize,
  parse,
  resolve,
  serialize,
  URI,
  URIFromString,
  URIStringFromString,
  unescapeComponent,
} from "@beep/semantic-web/uri/uri";
import { assertInclude, deepStrictEqual, describe, effect, expect, it, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import type * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import "@beep/semantic-web/uri/schemes";
import type { MailtoComponents } from "@beep/semantic-web/uri/schemes/mailto";
import type { URNComponents, URNOptions } from "@beep/semantic-web/uri/schemes/urn";
import type { UUIDComponents } from "@beep/semantic-web/uri/schemes/urn-uuid";
import type { WSComponents } from "@beep/semantic-web/uri/schemes/ws";
import type { URIComponents, URIOptions } from "@beep/semantic-web/uri/uri";

const expectParseErrorIncludes = <A>(eff: Effect.Effect<A, ParseResult.ParseError>, expectedSubstring: string) =>
  eff.pipe(
    Effect.either,
    Effect.map((either) => {
      expect(either._tag).toBe("Left");
      if (either._tag === "Left") {
        assertInclude(String(either.left), expectedSubstring);
      }
    })
  );

const serializeParsed = (uri: string, parseOptions?: URIOptions, serializeOptions?: URIOptions) =>
  parse(uri, parseOptions).pipe(Effect.flatMap((components) => serialize(components, serializeOptions)));

describe("URI", () => {
  describe("Parsing", () => {
    effect(
      "parses basic component boundaries",
      Effect.fn(function* () {
        const scheme = yield* parse("uri:");
        strictEqual(scheme.scheme, "uri");
        strictEqual(scheme.userinfo, undefined);
        strictEqual(scheme.host, undefined);
        strictEqual(scheme.port, undefined);
        strictEqual(scheme.path, "");
        strictEqual(scheme.query, undefined);
        strictEqual(scheme.fragment, undefined);

        const userinfo = yield* parse("//@");
        strictEqual(userinfo.scheme, undefined);
        strictEqual(userinfo.userinfo, "");
        strictEqual(userinfo.host, "");
        strictEqual(userinfo.port, undefined);
        strictEqual(userinfo.path, "");
        strictEqual(userinfo.query, undefined);
        strictEqual(userinfo.fragment, undefined);

        const host = yield* parse("//");
        strictEqual(host.scheme, undefined);
        strictEqual(host.userinfo, undefined);
        strictEqual(host.host, "");
        strictEqual(host.port, undefined);
        strictEqual(host.path, "");
        strictEqual(host.query, undefined);
        strictEqual(host.fragment, undefined);

        const port = yield* parse("//:");
        strictEqual(port.scheme, undefined);
        strictEqual(port.userinfo, undefined);
        strictEqual(port.host, "");
        strictEqual(port.port, undefined);
        strictEqual(port.path, "");
        strictEqual(port.query, undefined);
        strictEqual(port.fragment, undefined);

        const path = yield* parse("");
        strictEqual(path.scheme, undefined);
        strictEqual(path.userinfo, undefined);
        strictEqual(path.host, undefined);
        strictEqual(path.port, undefined);
        strictEqual(path.path, "");
        strictEqual(path.query, undefined);
        strictEqual(path.fragment, undefined);

        const query = yield* parse("?");
        strictEqual(query.scheme, undefined);
        strictEqual(query.userinfo, undefined);
        strictEqual(query.host, undefined);
        strictEqual(query.port, undefined);
        strictEqual(query.path, "");
        strictEqual(query.query, "");
        strictEqual(query.fragment, undefined);

        const fragment = yield* parse("#");
        strictEqual(fragment.scheme, undefined);
        strictEqual(fragment.userinfo, undefined);
        strictEqual(fragment.host, undefined);
        strictEqual(fragment.port, undefined);
        strictEqual(fragment.path, "");
        strictEqual(fragment.query, undefined);
        strictEqual(fragment.fragment, "");
      })
    );

    effect("rejects out-of-range ports during parsing", () =>
      expectParseErrorIncludes(parse("http://example.com:65536/"), "Port must be an integer between 0 and 65535.")
    );

    effect(
      "parses fragment with control characters by percent-encoding",
      Effect.fn(function* () {
        strictEqual((yield* parse("#\t")).fragment, "%09");
        strictEqual((yield* parse("#\n")).fragment, "%0A");
        strictEqual((yield* parse("#\v")).fragment, "%0B");
        strictEqual((yield* parse("#\f")).fragment, "%0C");
        strictEqual((yield* parse("#\r")).fragment, "%0D");
      })
    );

    effect(
      "parses all components",
      Effect.fn(function* () {
        const components = yield* parse("uri://user:pass@example.com:123/one/two.three?q1=a1&q2=a2#body");
        strictEqual(components.scheme, "uri");
        strictEqual(components.userinfo, "user:pass");
        strictEqual(components.host, "example.com");
        strictEqual(components.port, 123);
        strictEqual(components.path, "/one/two.three");
        strictEqual(components.query, "q1=a1&q2=a2");
        strictEqual(components.fragment, "body");
      })
    );

    effect(
      "parses IPv4 and IPv6 hosts",
      Effect.fn(function* () {
        strictEqual((yield* parse("//10.10.10.10")).host, "10.10.10.10");
        strictEqual((yield* parse("//[2001:db8::7]")).host, "2001:db8::7");
        strictEqual((yield* parse("//[::ffff:129.144.52.38]")).host, "::ffff:129.144.52.38");
        strictEqual((yield* parse("uri://10.10.10.10.example.com/en/process")).host, "10.10.10.10.example.com");
        strictEqual(
          (yield* parse("//[2606:2800:220:1:248:1893:25c8:1946]/test")).host,
          "2606:2800:220:1:248:1893:25c8:1946"
        );
      })
    );

    effect(
      "parses IPv6 with port and zone identifier",
      Effect.fn(function* () {
        const withPort = yield* parse("//[2001:db8::1]:80");
        strictEqual(withPort.host, "2001:db8::1");
        strictEqual(withPort.port, 80);

        strictEqual((yield* parse("//[fe80::a%25en1]")).host, "fe80::a%en1");
        strictEqual((yield* parse("//[2001:db8::7%en0]")).host, "2001:db8::7%en0");
      })
    );
  });

  describe("Serialization", () => {
    effect(
      "serializes undefined components",
      Effect.fn(function* () {
        const actual = yield* serialize({ path: "" });
        strictEqual(actual, "");
      })
    );

    effect(
      "serializes empty components",
      Effect.fn(function* () {
        const actual = yield* serialize({
          scheme: undefined,
          userinfo: "",
          host: "",
          port: 0,
          path: "",
          query: "",
          fragment: "",
        });
        strictEqual(actual, "//@:0?#");
      })
    );

    effect("rejects invalid ports during serialization", () =>
      expectParseErrorIncludes(
        serialize({ scheme: "http", host: "example.com", port: Number.POSITIVE_INFINITY, path: "/" }),
        "Port must be an integer between 0 and 65535."
      )
    );

    effect("rejects float ports during serialization", () =>
      expectParseErrorIncludes(
        serialize({ scheme: "http", host: "example.com", port: 80.5, path: "/" }),
        "Port must be an integer between 0 and 65535."
      )
    );

    effect(
      "serializes all components",
      Effect.fn(function* () {
        const actual = yield* serialize({
          scheme: "uri",
          userinfo: "foo:bar",
          host: "example.com",
          port: 1,
          path: "path",
          query: "query",
          fragment: "fragment",
        });
        strictEqual(actual, "uri://foo:bar@example.com:1/path?query#fragment");
      })
    );

    effect(
      "serializes path escaping (//, :, ?)",
      Effect.fn(function* () {
        strictEqual(yield* serialize({ path: "//path" }), "/%2Fpath");
        strictEqual(yield* serialize({ path: "foo:bar" }), "foo%3Abar");
        strictEqual(yield* serialize({ path: "?query" }), "%3Fquery");
      })
    );

    effect(
      "serializes mixed IPv4address & reg-name",
      Effect.fn(function* () {
        strictEqual(yield* serialize({ host: "10.10.10.10.example.com", path: "" }), "//10.10.10.10.example.com");
      })
    );

    effect(
      "serializes IPv6address and zone identifier",
      Effect.fn(function* () {
        strictEqual(yield* serialize({ host: "2001:db8::7", path: "" }), "//[2001:db8::7]");
        strictEqual(yield* serialize({ host: "::ffff:129.144.52.38", path: "" }), "//[::ffff:129.144.52.38]");
        strictEqual(
          yield* serialize({ host: "2606:2800:220:1:248:1893:25c8:1946", path: "" }),
          "//[2606:2800:220:1:248:1893:25c8:1946]"
        );
        strictEqual(yield* serialize({ host: "fe80::a%en1", path: "" }), "//[fe80::a%25en1]");
        strictEqual(yield* serialize({ host: "fe80::a%25en1", path: "" }), "//[fe80::a%25en1]");
      })
    );
  });

  describe("Resolving", () => {
    const base = "uri://a/b/c/d;p?q";

    effect(
      "resolves normal examples (RFC 3986 Section 5.4.1)",
      Effect.fn(function* () {
        strictEqual(yield* resolve(base, "g:h"), "g:h");
        strictEqual(yield* resolve(base, "g"), "uri://a/b/c/g");
        strictEqual(yield* resolve(base, "./g"), "uri://a/b/c/g");
        strictEqual(yield* resolve(base, "g/"), "uri://a/b/c/g/");
        strictEqual(yield* resolve(base, "/g"), "uri://a/g");
        strictEqual(yield* resolve(base, "//g"), "uri://g");
        strictEqual(yield* resolve(base, "?y"), "uri://a/b/c/d;p?y");
        strictEqual(yield* resolve(base, "g?y"), "uri://a/b/c/g?y");
        strictEqual(yield* resolve(base, "#s"), "uri://a/b/c/d;p?q#s");
        strictEqual(yield* resolve(base, "g#s"), "uri://a/b/c/g#s");
        strictEqual(yield* resolve(base, "g?y#s"), "uri://a/b/c/g?y#s");
        strictEqual(yield* resolve(base, ";x"), "uri://a/b/c/;x");
        strictEqual(yield* resolve(base, "g;x"), "uri://a/b/c/g;x");
        strictEqual(yield* resolve(base, "g;x?y#s"), "uri://a/b/c/g;x?y#s");
        strictEqual(yield* resolve(base, ""), "uri://a/b/c/d;p?q");
        strictEqual(yield* resolve(base, "."), "uri://a/b/c/");
        strictEqual(yield* resolve(base, "./"), "uri://a/b/c/");
        strictEqual(yield* resolve(base, ".."), "uri://a/b/");
        strictEqual(yield* resolve(base, "../"), "uri://a/b/");
        strictEqual(yield* resolve(base, "../g"), "uri://a/b/g");
        strictEqual(yield* resolve(base, "../.."), "uri://a/");
        strictEqual(yield* resolve(base, "../../"), "uri://a/");
        strictEqual(yield* resolve(base, "../../g"), "uri://a/g");
      })
    );

    effect(
      "resolves abnormal examples (RFC 3986 Section 5.4.2)",
      Effect.fn(function* () {
        strictEqual(yield* resolve(base, "../../../g"), "uri://a/g");
        strictEqual(yield* resolve(base, "../../../../g"), "uri://a/g");
        strictEqual(yield* resolve(base, "/./g"), "uri://a/g");
        strictEqual(yield* resolve(base, "/../g"), "uri://a/g");
        strictEqual(yield* resolve(base, "g."), "uri://a/b/c/g.");
        strictEqual(yield* resolve(base, ".g"), "uri://a/b/c/.g");
        strictEqual(yield* resolve(base, "g.."), "uri://a/b/c/g..");
        strictEqual(yield* resolve(base, "..g"), "uri://a/b/c/..g");
        strictEqual(yield* resolve(base, "./../g"), "uri://a/b/g");
        strictEqual(yield* resolve(base, "./g/."), "uri://a/b/c/g/");
        strictEqual(yield* resolve(base, "g/./h"), "uri://a/b/c/g/h");
        strictEqual(yield* resolve(base, "g/../h"), "uri://a/b/c/h");
        strictEqual(yield* resolve(base, "g;x=1/./y"), "uri://a/b/c/g;x=1/y");
        strictEqual(yield* resolve(base, "g;x=1/../y"), "uri://a/b/c/y");
        strictEqual(yield* resolve(base, "g?y/./x"), "uri://a/b/c/g?y/./x");
        strictEqual(yield* resolve(base, "g?y/../x"), "uri://a/b/c/g?y/../x");
        strictEqual(yield* resolve(base, "g#s/./x"), "uri://a/b/c/g#s/./x");
        strictEqual(yield* resolve(base, "g#s/../x"), "uri://a/b/c/g#s/../x");
        strictEqual(yield* resolve(base, "uri:g"), "uri:g");
        strictEqual(yield* resolve(base, "uri:g", { tolerant: true }), "uri://a/b/c/g");
      })
    );

    effect(
      "resolves PAEz examples",
      Effect.fn(function* () {
        strictEqual(yield* resolve("//www.g.com/", "/adf\ngf"), "//www.g.com/adf%0Agf");
        strictEqual(yield* resolve("//www.g.com/error\n/bleh/bleh", ".."), "//www.g.com/error%0A/");
      })
    );
  });

  describe("Normalizing", () => {
    effect(
      "normalizes percent-encoded characters",
      Effect.fn(function* () {
        strictEqual(
          yield* normalize("uri://www.example.org/red%09ros\xE9#red"),
          "uri://www.example.org/red%09ros%C3%A9#red"
        );
      })
    );

    effect(
      "normalizes IPv4 addresses",
      Effect.fn(function* () {
        strictEqual(yield* normalize("//192.068.001.000"), "//192.68.1.0");
      })
    );

    effect(
      "normalizes IPv6 addresses",
      Effect.fn(function* () {
        strictEqual(yield* normalize("http://[1080::8:800:200C:417A]/"), "http://[1080::8:800:200c:417a]/");
        strictEqual(yield* normalize("//[2001:0db8::0001]/"), "//[2001:db8::1]/");
        strictEqual(yield* normalize("//[2001:db8::1:0000:1]/"), "//[2001:db8::1:0:1]/");
        strictEqual(yield* normalize("//[2001:db8:0:0:0:0:2:1]/"), "//[2001:db8::2:1]/");
        strictEqual(yield* normalize("//[2001:db8:0:1:1:1:1:1]/"), "//[2001:db8:0:1:1:1:1:1]/");
        strictEqual(yield* normalize("//[2001:0:0:1:0:0:0:1]/"), "//[2001:0:0:1::1]/");
        strictEqual(yield* normalize("//[2001:db8:0:0:1:0:0:1]/"), "//[2001:db8::1:0:0:1]/");
        strictEqual(yield* normalize("//[2001:DB8::1]/"), "//[2001:db8::1]/");
        strictEqual(yield* normalize("//[0:0:0:0:0:ffff:192.0.2.1]/"), "//[::ffff:192.0.2.1]/");
        strictEqual(yield* normalize("//[1:2:3:4:5:6:192.0.2.1]/"), "//[1:2:3:4:5:6:192.0.2.1]/");
        strictEqual(yield* normalize("//[1:2:3:4:5:6:192.068.001.000]/"), "//[1:2:3:4:5:6:192.68.1.0]/");
      })
    );
  });

  describe("Equals", () => {
    effect(
      "recognizes equivalent URIs",
      Effect.fn(function* () {
        strictEqual(yield* equal("example://a/b/c/%7Bfoo%7D", "eXAMPLE://a/./b/../b/%63/%7bfoo%7d"), true);
      })
    );

    effect(
      "recognizes equivalent URIs with percent-encoded characters",
      Effect.fn(function* () {
        strictEqual(yield* equal("http://example.org/~user", "http://example.org/%7euser"), true);
      })
    );
  });

  describe("Escape Component", () => {
    it("escapes characters 0-129 correctly", () => {
      for (let d = 0; d <= 129; ++d) {
        const chr = String.fromCharCode(d);
        if (!chr.match(/[$&+,;=]/)) {
          strictEqual(escapeComponent(chr), encodeURIComponent(chr));
        } else {
          strictEqual(escapeComponent(chr), chr);
        }
      }
    });

    it("escapes multi-byte characters", () => {
      strictEqual(escapeComponent("\u00c0"), encodeURIComponent("\u00c0"));
      strictEqual(escapeComponent("\u07ff"), encodeURIComponent("\u07ff"));
      strictEqual(escapeComponent("\u0800"), encodeURIComponent("\u0800"));
      strictEqual(escapeComponent("\u30a2"), encodeURIComponent("\u30a2"));
    });
  });

  describe("Unescape Component", () => {
    it("unescapes characters 0-129 correctly", () => {
      for (let d = 0; d <= 129; ++d) {
        const chr = String.fromCharCode(d);
        strictEqual(unescapeComponent(encodeURIComponent(chr)), chr);
      }
    });

    it("unescapes multi-byte characters", () => {
      strictEqual(unescapeComponent(encodeURIComponent("\u00c0")), "\u00c0");
      strictEqual(unescapeComponent(encodeURIComponent("\u07ff")), "\u07ff");
      strictEqual(unescapeComponent(encodeURIComponent("\u0800")), "\u0800");
      strictEqual(unescapeComponent(encodeURIComponent("\u30a2")), "\u30a2");
    });
  });
});

describe("IRI", () => {
  const IRI_OPTION: URIOptions = { iri: true, unicodeSupport: true };

  describe("Parsing", () => {
    effect(
      "parses IRI with unicode characters",
      Effect.fn(function* () {
        const components = yield* parse(
          "uri://us\xA0er:pa\uD7FFss@example.com:123/o\uF900ne/t\uFDCFwo.t\uFDF0hree?q1=a1\uF8FF\uE000&q2=a2#bo\uFFEFdy",
          IRI_OPTION
        );
        strictEqual(components.scheme, "uri");
        strictEqual(components.userinfo, "us\xA0er:pa\uD7FFss");
        strictEqual(components.host, "example.com");
        strictEqual(components.port, 123);
        strictEqual(components.path, "/o\uF900ne/t\uFDCFwo.t\uFDF0hree");
        strictEqual(components.query, "q1=a1\uF8FF\uE000&q2=a2");
        strictEqual(components.fragment, "bo\uFFEFdy");
      })
    );
  });

  describe("Serialization", () => {
    effect(
      "serializes IRI with unicode characters",
      Effect.fn(function* () {
        const actual = yield* serialize(
          {
            scheme: "uri",
            userinfo: "us\xA0er:pa\uD7FFss",
            host: "example.com",
            port: 123,
            path: "/o\uF900ne/t\uFDCFwo.t\uFDF0hree",
            query: "q1=a1\uF8FF\uE000&q2=a2",
            fragment: "bo\uFFEFdy\uE001",
          },
          IRI_OPTION
        );

        strictEqual(
          actual,
          "uri://us\xA0er:pa\uD7FFss@example.com:123/o\uF900ne/t\uFDCFwo.t\uFDF0hree?q1=a1\uF8FF\uE000&q2=a2#bo\uFFEFdy%EE%80%81"
        );
      })
    );
  });

  describe("Normalizing", () => {
    effect(
      "normalizes IRI with unicode characters (preserving unicode)",
      Effect.fn(function* () {
        strictEqual(
          yield* normalize("uri://www.example.org/red%09ros\xE9#red", IRI_OPTION),
          "uri://www.example.org/red%09ros\xE9#red"
        );
      })
    );
  });

  describe("Equals", () => {
    effect(
      "recognizes equivalent IRIs",
      Effect.fn(function* () {
        strictEqual(
          yield* equal("example://a/b/c/%7Bfoo%7D/ros\xE9", "eXAMPLE://a/./b/../b/%63/%7bfoo%7d/ros%C3%A9", IRI_OPTION),
          true
        );
      })
    );
  });

  describe("Convert IRI to URI", () => {
    effect(
      "converts IRI to URI with percent-encoded unicode",
      Effect.fn(function* () {
        strictEqual(
          yield* serializeParsed("uri://www.example.org/red%09ros\xE9#red", IRI_OPTION),
          "uri://www.example.org/red%09ros%C3%A9#red"
        );
      })
    );

    effect(
      "converts IRI to URI with domain host via punycode",
      Effect.fn(function* () {
        const components = yield* parse("uri://r\xE9sum\xE9.example.org", {
          iri: true,
          domainHost: true,
        });
        strictEqual(yield* serialize(components, { domainHost: true }), "uri://xn--rsum-bpad.example.org");
      })
    );
  });

  describe("Convert URI to IRI", () => {
    effect(
      "converts URI to IRI with decoded unicode",
      Effect.fn(function* () {
        const components = yield* parse("uri://www.example.org/D%C3%BCrst");
        strictEqual(yield* serialize(components, IRI_OPTION), "uri://www.example.org/D\xFCrst");
      })
    );

    effect(
      "leaves invalid percent-encoded sequences as-is",
      Effect.fn(function* () {
        strictEqual(
          yield* serializeParsed("uri://www.example.org/D%FCrst", undefined, IRI_OPTION),
          "uri://www.example.org/D%FCrst"
        );
      })
    );

    effect(
      "keeps right-to-left override percent-encoded",
      Effect.fn(function* () {
        strictEqual(
          yield* serializeParsed("uri://xn--99zt52a.example.org/%e2%80%ae", undefined, IRI_OPTION),
          "uri://xn--99zt52a.example.org/%E2%80%AE"
        );
      })
    );

    effect(
      "converts punycode domain to unicode via domainHost",
      Effect.fn(function* () {
        const components = yield* parse("uri://xn--rsum-bpad.example.org", { domainHost: true });
        strictEqual(yield* serialize(components, { iri: true, domainHost: true }), "uri://r\xE9sum\xE9.example.org");
      })
    );
  });
});

describe("HTTP", () => {
  describe("Equals", () => {
    effect(
      "treats default port 80 as equal to no port",
      Effect.fn(function* () {
        strictEqual(yield* equal("http://abc.com:80/~smith/home.html", "http://abc.com/~smith/home.html"), true);
      })
    );

    effect(
      "treats percent-encoded tilde as equal to literal tilde",
      Effect.fn(function* () {
        strictEqual(yield* equal("http://ABC.com/%7Esmith/home.html", "http://abc.com/~smith/home.html"), true);
      })
    );

    effect(
      "is case-insensitive and handles lowercase percent-encoding",
      Effect.fn(function* () {
        strictEqual(yield* equal("http://ABC.com:/%7esmith/home.html", "http://abc.com/~smith/home.html"), true);
      })
    );

    effect(
      "is scheme-case-insensitive and adds trailing slash",
      Effect.fn(function* () {
        strictEqual(yield* equal("HTTP://ABC.COM", "http://abc.com/"), true);
      })
    );

    effect(
      "treats empty port as equal to default port 80",
      Effect.fn(function* () {
        strictEqual(yield* equal("http://example.com:/", "http://example.com:80/"), true);
      })
    );
  });
});

describe("HTTPS", () => {
  describe("Equals", () => {
    effect(
      "treats default port 443 as equal to no port",
      Effect.fn(function* () {
        strictEqual(yield* equal("https://example.com", "https://example.com:443/"), true);
      })
    );

    effect(
      "treats empty port as equal to default port 443",
      Effect.fn(function* () {
        strictEqual(yield* equal("https://example.com:/", "https://example.com:443/"), true);
      })
    );
  });
});

describe("URN", () => {
  describe("Parsing", () => {
    effect(
      "parses URN components",
      Effect.fn(function* () {
        const components = (yield* parse("urn:foo:a123,456")) as URNComponents;
        strictEqual(components.scheme, "urn");
        strictEqual(components.userinfo, undefined);
        strictEqual(components.host, undefined);
        strictEqual(components.port, undefined);
        strictEqual(components.path, "");
        strictEqual(components.query, undefined);
        strictEqual(components.fragment, undefined);
        strictEqual(components.nid, "foo");
        strictEqual(components.nss, "a123,456");
      })
    );
  });

  describe("Serialization", () => {
    effect(
      "serializes URN components",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({ scheme: "urn", nid: "foo", nss: "a123,456" } as URNComponents),
          "urn:foo:a123,456"
        );
      })
    );
  });

  describe("Equals", () => {
    effect(
      "recognizes identical URNs",
      Effect.fn(function* () {
        strictEqual(yield* equal("urn:foo:a123,456", "urn:foo:a123,456"), true);
      })
    );

    effect(
      "is case-insensitive for scheme",
      Effect.fn(function* () {
        strictEqual(yield* equal("urn:foo:a123,456", "URN:foo:a123,456"), true);
      })
    );

    effect(
      "is case-insensitive for NID",
      Effect.fn(function* () {
        strictEqual(yield* equal("urn:foo:a123,456", "urn:FOO:a123,456"), true);
      })
    );

    effect(
      "is case-sensitive for NSS",
      Effect.fn(function* () {
        strictEqual(yield* equal("urn:foo:a123,456", "urn:foo:A123,456"), false);
      })
    );

    effect(
      "is case-insensitive for percent-encoded NSS",
      Effect.fn(function* () {
        strictEqual(yield* equal("urn:foo:a123%2C456", "URN:FOO:a123%2c456"), true);
      })
    );
  });

  describe("Resolving", () => {
    effect(
      "resolves URNs",
      Effect.fn(function* () {
        strictEqual(yield* resolve("", "urn:some:ip:prop"), "urn:some:ip:prop");
        strictEqual(yield* resolve("#", "urn:some:ip:prop"), "urn:some:ip:prop");
        strictEqual(yield* resolve("urn:some:ip:prop", "urn:some:ip:prop"), "urn:some:ip:prop");
        strictEqual(yield* resolve("urn:some:other:prop", "urn:some:ip:prop"), "urn:some:ip:prop");
      })
    );
  });

  describe("UUID Parsing", () => {
    effect(
      "parses valid UUID URN",
      Effect.fn(function* () {
        const components = (yield* parse("urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6")) as UUIDComponents;
        strictEqual(components.scheme, "urn");
        strictEqual(components.userinfo, undefined);
        strictEqual(components.host, undefined);
        strictEqual(components.port, undefined);
        strictEqual(components.path, "");
        strictEqual(components.query, undefined);
        strictEqual(components.fragment, undefined);
        strictEqual(components.nid, "uuid");
        strictEqual(components.nss, undefined);
        strictEqual(components.uuid, "f81d4fae-7dec-11d0-a765-00a0c91e6bf6");
      })
    );

    effect("fails on invalid UUID URN", () =>
      expectParseErrorIncludes(parse("urn:uuid:notauuid-7dec-11d0-a765-00a0c91e6bf6"), "UUID is not valid.")
    );
  });

  describe("UUID Serialization", () => {
    effect(
      "serializes valid UUID URN",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({
            scheme: "urn",
            nid: "uuid",
            uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
          } as UUIDComponents),
          "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
        );
      })
    );

    effect(
      "serializes invalid UUID URN without validation",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({
            scheme: "urn",
            nid: "uuid",
            uuid: "notauuid-7dec-11d0-a765-00a0c91e6bf6",
          } as UUIDComponents),
          "urn:uuid:notauuid-7dec-11d0-a765-00a0c91e6bf6"
        );
      })
    );
  });

  describe("UUID Equals", () => {
    effect(
      "is case-insensitive for UUID URN",
      Effect.fn(function* () {
        strictEqual(
          yield* equal(
            "URN:UUID:F81D4FAE-7DEC-11D0-A765-00A0C91E6BF6",
            "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
          ),
          true
        );
      })
    );
  });

  describe("NID Override", () => {
    effect(
      "parses with NID override option",
      Effect.fn(function* () {
        const components = (yield* parse("urn:foo:f81d4fae-7dec-11d0-a765-00a0c91e6bf6", {
          nid: "uuid",
        } as URNOptions)) as UUIDComponents;
        strictEqual(components.scheme, "urn");
        strictEqual(components.path, "");
        strictEqual(components.nid, "foo");
        strictEqual(components.nss, undefined);
        strictEqual(components.uuid, "f81d4fae-7dec-11d0-a765-00a0c91e6bf6");
      })
    );

    effect(
      "serializes with NID override option",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize(
            {
              scheme: "urn",
              nid: "foo",
              uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
            } as UUIDComponents,
            { nid: "uuid" } as URNOptions
          ),
          "urn:foo:f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
        );
      })
    );
  });
});

describe("Mailto", () => {
  describe("Parse", () => {
    effect(
      "parses simple mailto URI",
      Effect.fn(function* () {
        const components = (yield* parse("mailto:chris@example.com")) as MailtoComponents;
        strictEqual(components.scheme, "mailto");
        strictEqual(components.userinfo, undefined);
        strictEqual(components.host, undefined);
        strictEqual(components.port, undefined);
        strictEqual(components.path, "");
        strictEqual(components.query, undefined);
        strictEqual(components.fragment, undefined);
        deepStrictEqual(components.to, ["chris@example.com"]);
        strictEqual(components.subject, undefined);
        strictEqual(components.body, undefined);
        strictEqual(components.headers, undefined);
      })
    );

    effect(
      "parses mailto with subject/body/headers",
      Effect.fn(function* () {
        strictEqual(
          ((yield* parse("mailto:infobot@example.com?subject=current-issue")) as MailtoComponents).subject,
          "current-issue"
        );

        strictEqual(
          ((yield* parse("mailto:infobot@example.com?body=send%20current-issue")) as MailtoComponents).body,
          "send current-issue"
        );

        strictEqual(
          ((yield* parse("mailto:infobot@example.com?body=send%20current-issue%0D%0Asend%20index")) as MailtoComponents)
            .body,
          "send current-issue\x0D\x0Asend index"
        );

        const inReplyTo = (yield* parse(
          "mailto:list@example.org?In-Reply-To=%3C3469A91.D10AF4C@example.com%3E"
        )) as MailtoComponents;
        deepStrictEqual(inReplyTo.to, ["list@example.org"]);
        deepStrictEqual(inReplyTo.headers, { "In-Reply-To": "<3469A91.D10AF4C@example.com>" });
      })
    );

    effect(
      "parses mailto with various percent-encoded local parts",
      Effect.fn(function* () {
        deepStrictEqual(((yield* parse("mailto:gorby%25kremvax@example.com")) as MailtoComponents).to, [
          "gorby%kremvax@example.com",
        ]);
        deepStrictEqual(((yield* parse("mailto:unlikely%3Faddress@example.com?blat=foop")) as MailtoComponents).to, [
          "unlikely?address@example.com",
        ]);
        deepStrictEqual(((yield* parse("mailto:Mike%26family@example.org")) as MailtoComponents).to, [
          "Mike&family@example.org",
        ]);
        deepStrictEqual(((yield* parse("mailto:%22not%40me%22@example.org")) as MailtoComponents).to, [
          '"not@me"@example.org',
        ]);
        deepStrictEqual(((yield* parse("mailto:%22oh%5C%5Cno%22@example.org")) as MailtoComponents).to, [
          '"oh\\\\no"@example.org',
        ]);
      })
    );

    effect(
      "parses mailto with UTF-8 percent-encoded subject and IDN domain",
      Effect.fn(function* () {
        strictEqual(
          ((yield* parse("mailto:user@example.org?subject=caf%C3%A9")) as MailtoComponents).subject,
          "caf\xE9"
        );

        const idn = (yield* parse(
          "mailto:user@%E7%B4%8D%E8%B1%86.example.org?subject=Test&body=NATTO"
        )) as MailtoComponents;
        deepStrictEqual(idn.to, ["user@xn--99zt52a.example.org"]);
        strictEqual(idn.subject, "Test");
        strictEqual(idn.body, "NATTO");
      })
    );
  });

  describe("Serialize", () => {
    effect(
      "serializes simple mailto",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["chris@example.com"],
            path: "",
          } as MailtoComponents),
          "mailto:chris@example.com"
        );
      })
    );

    effect(
      "serializes mailto with body and headers",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["infobot@example.com"],
            body: "current-issue",
            path: "",
          } as MailtoComponents),
          "mailto:infobot@example.com?body=current-issue"
        );

        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["infobot@example.com"],
            body: "send current-issue",
            path: "",
          } as MailtoComponents),
          "mailto:infobot@example.com?body=send%20current-issue"
        );

        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["infobot@example.com"],
            body: "send current-issue\x0D\x0Asend index",
            path: "",
          } as MailtoComponents),
          "mailto:infobot@example.com?body=send%20current-issue%0D%0Asend%20index"
        );

        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["list@example.org"],
            headers: { "In-Reply-To": "<3469A91.D10AF4C@example.com>" },
            path: "",
          } as MailtoComponents),
          "mailto:list@example.org?In-Reply-To=%3C3469A91.D10AF4C@example.com%3E"
        );
      })
    );

    effect(
      "serializes mailto with encoded local parts and UTF-8 subject",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({ scheme: "mailto", to: ["Mike&family@example.org"], path: "" } as MailtoComponents),
          "mailto:Mike%26family@example.org"
        );

        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["user@example.org"],
            subject: "caf\xE9",
            path: "",
          } as MailtoComponents),
          "mailto:user@example.org?subject=caf%C3%A9"
        );
      })
    );

    effect(
      "serializes mailto with IDN and unicode local part",
      Effect.fn(function* () {
        strictEqual(
          yield* serialize({
            scheme: "mailto",
            to: ["us\xE9r@\u7d0d\u8c46.example.org"],
            subject: "Test",
            body: "NATTO",
            path: "",
          } as MailtoComponents),
          "mailto:us%C3%A9r@xn--99zt52a.example.org?subject=Test&body=NATTO"
        );
      })
    );
  });

  describe("Equals", () => {
    effect(
      "equates to-path with to-query syntax",
      Effect.fn(function* () {
        strictEqual(
          yield* equal("mailto:addr1@an.example,addr2@an.example", "mailto:?to=addr1@an.example,addr2@an.example"),
          true
        );
      })
    );

    effect(
      "equates mixed to-path and to-query syntax",
      Effect.fn(function* () {
        strictEqual(
          yield* equal("mailto:?to=addr1@an.example,addr2@an.example", "mailto:addr1@an.example?to=addr2@an.example"),
          true
        );
      })
    );
  });
});

describe("WS", () => {
  describe("Parse", () => {
    effect(
      "parses ws URI",
      Effect.fn(function* () {
        const components = (yield* parse("ws://example.com/chat")) as WSComponents;
        strictEqual(components.scheme, "ws");
        strictEqual(components.host, "example.com");
        strictEqual(components.resourceName, "/chat");
        strictEqual(components.secure, false);
      })
    );

    effect(
      "parses ws URI with query",
      Effect.fn(function* () {
        const components = (yield* parse("ws://example.com/foo?bar=baz")) as WSComponents;
        strictEqual(components.resourceName, "/foo?bar=baz");
        strictEqual(components.secure, false);
      })
    );

    effect(
      "parses ws URI with query on root path",
      Effect.fn(function* () {
        strictEqual(((yield* parse("ws://example.com/?bar=baz")) as WSComponents).resourceName, "/?bar=baz");
      })
    );
  });

  describe("Serialize", () => {
    effect(
      "serializes ws variants",
      Effect.fn(function* () {
        strictEqual(yield* serialize({ scheme: "ws", path: "" }), "ws:");
        strictEqual(yield* serialize({ scheme: "ws", host: "example.com", path: "" }), "ws://example.com");
        strictEqual(yield* serialize({ scheme: "ws", resourceName: "/", path: "" } as WSComponents), "ws:");
        strictEqual(yield* serialize({ scheme: "ws", resourceName: "/foo", path: "" } as WSComponents), "ws:/foo");
        strictEqual(
          yield* serialize({ scheme: "ws", resourceName: "/foo?bar", path: "" } as WSComponents),
          "ws:/foo?bar"
        );
        strictEqual(yield* serialize({ scheme: "ws", secure: false, path: "" } as WSComponents), "ws:");
        strictEqual(yield* serialize({ scheme: "ws", secure: true, path: "" } as WSComponents), "wss:");
        strictEqual(
          yield* serialize({ scheme: "ws", host: "example.com", resourceName: "/foo", path: "" } as WSComponents),
          "ws://example.com/foo"
        );
        strictEqual(
          yield* serialize({ scheme: "ws", host: "example.com", resourceName: "/foo?bar", path: "" } as WSComponents),
          "ws://example.com/foo?bar"
        );
        strictEqual(
          yield* serialize({ scheme: "ws", host: "example.com", secure: false, path: "" } as WSComponents),
          "ws://example.com"
        );
        strictEqual(
          yield* serialize({ scheme: "ws", host: "example.com", secure: true, path: "" } as WSComponents),
          "wss://example.com"
        );
        strictEqual(
          yield* serialize({
            scheme: "ws",
            host: "example.com",
            resourceName: "/foo?bar",
            secure: false,
          } as WSComponents),
          "ws://example.com/foo?bar"
        );
        strictEqual(
          yield* serialize({
            scheme: "ws",
            host: "example.com",
            resourceName: "/foo?bar",
            secure: true,
          } as WSComponents),
          "wss://example.com/foo?bar"
        );
      })
    );
  });

  describe("Equal", () => {
    effect(
      "equates ws URIs with default port and fragment",
      Effect.fn(function* () {
        strictEqual(yield* equal("WS://ABC.COM:80/chat#one", "ws://abc.com/chat"), true);
      })
    );
  });

  describe("Normalize", () => {
    effect(
      "normalizes ws URI by removing default port and fragment",
      Effect.fn(function* () {
        strictEqual(yield* normalize("ws://example.com:80/foo#hash"), "ws://example.com/foo");
      })
    );
  });
});

describe("WSS", () => {
  describe("Parse", () => {
    effect(
      "parses wss URI",
      Effect.fn(function* () {
        const components = (yield* parse("wss://example.com/chat")) as WSComponents;
        strictEqual(components.scheme, "wss");
        strictEqual(components.host, "example.com");
        strictEqual(components.resourceName, "/chat");
        strictEqual(components.secure, true);
      })
    );

    effect(
      "parses wss URI with query",
      Effect.fn(function* () {
        const components = (yield* parse("wss://example.com/foo?bar=baz")) as WSComponents;
        strictEqual(components.resourceName, "/foo?bar=baz");
        strictEqual(components.secure, true);
      })
    );

    effect(
      "parses wss URI with query on root path",
      Effect.fn(function* () {
        strictEqual(((yield* parse("wss://example.com/?bar=baz")) as WSComponents).resourceName, "/?bar=baz");
      })
    );
  });

  describe("Serialize", () => {
    effect(
      "serializes wss variants",
      Effect.fn(function* () {
        strictEqual(yield* serialize({ scheme: "wss", path: "" }), "wss:");
        strictEqual(yield* serialize({ scheme: "wss", host: "example.com", path: "" }), "wss://example.com");
        strictEqual(yield* serialize({ scheme: "wss", resourceName: "/", path: "" } as WSComponents), "wss:");
        strictEqual(yield* serialize({ scheme: "wss", resourceName: "/foo", path: "" } as WSComponents), "wss:/foo");
        strictEqual(
          yield* serialize({ scheme: "wss", resourceName: "/foo?bar", path: "" } as WSComponents),
          "wss:/foo?bar"
        );
        strictEqual(yield* serialize({ scheme: "wss", secure: false, path: "" } as WSComponents), "ws:");
        strictEqual(yield* serialize({ scheme: "wss", secure: true, path: "" } as WSComponents), "wss:");
        strictEqual(
          yield* serialize({ scheme: "wss", host: "example.com", resourceName: "/foo", path: "" } as WSComponents),
          "wss://example.com/foo"
        );
        strictEqual(
          yield* serialize({ scheme: "wss", host: "example.com", resourceName: "/foo?bar", path: "" } as WSComponents),
          "wss://example.com/foo?bar"
        );
        strictEqual(
          yield* serialize({ scheme: "wss", host: "example.com", secure: false, path: "" } as WSComponents),
          "ws://example.com"
        );
        strictEqual(
          yield* serialize({ scheme: "wss", host: "example.com", secure: true, path: "" } as WSComponents),
          "wss://example.com"
        );
        strictEqual(
          yield* serialize({
            scheme: "wss",
            host: "example.com",
            resourceName: "/foo?bar",
            secure: false,
          } as WSComponents),
          "ws://example.com/foo?bar"
        );
        strictEqual(
          yield* serialize({
            scheme: "wss",
            host: "example.com",
            resourceName: "/foo?bar",
            secure: true,
          } as WSComponents),
          "wss://example.com/foo?bar"
        );
      })
    );
  });

  describe("Equal", () => {
    effect(
      "equates wss URIs with default port and fragment",
      Effect.fn(function* () {
        strictEqual(yield* equal("WSS://ABC.COM:443/chat#one", "wss://abc.com/chat"), true);
      })
    );
  });

  describe("Normalize", () => {
    effect(
      "normalizes wss URI by removing default port and fragment",
      Effect.fn(function* () {
        strictEqual(yield* normalize("wss://example.com:443/foo#hash"), "wss://example.com/foo");
      })
    );
  });
});

describe("URI/IRI Schema", () => {
  effect(
    "URIStringFromString decodes to canonical normalized string",
    Effect.fn(function* () {
      const decode = S.decodeUnknown(URIStringFromString);
      const uri = yield* decode("HTTP://ABC.COM");
      strictEqual(uri, "http://abc.com/");
    })
  );

  effect(
    "URIFromString decodes to URI with canonical value",
    Effect.fn(function* () {
      const decode = S.decodeUnknown(URIFromString);
      const uri = yield* decode("HTTP://ABC.COM");
      expect(uri).toBeInstanceOf(URI);
      strictEqual(uri.value, "http://abc.com/");
    })
  );

  effect(
    "IRIFromString decodes to IRI",
    Effect.fn(function* () {
      const decode = S.decodeUnknown(IRIFromString);
      const iri = yield* decode("uri://www.example.org/D%C3%BCrst");
      expect(iri).toBeInstanceOf(IRI);
      strictEqual(iri.value, "uri://www.example.org/D\xFCrst");
    })
  );

  effect(
    "IRIStringFromString decodes to canonical normalized string",
    Effect.fn(function* () {
      const decode = S.decodeUnknown(IRIStringFromString);
      const iri = yield* decode("uri://www.example.org/D%C3%BCrst");
      strictEqual(iri, "uri://www.example.org/D\xFCrst");
    })
  );

  effect("URIFromString fails with ParseError on invalid input", () =>
    expectParseErrorIncludes(S.decodeUnknown(URIFromString)("http:"), "HTTP URIs must have a host.")
  );

  effect(
    "URI class exposes effectful static methods",
    Effect.fn(function* () {
      const c = yield* URI.parse("uri://example.com");
      const s = yield* URI.serialize(c);
      strictEqual(typeof s, "string");
    })
  );

  effect(
    "URI.escapeComponent/URI.unescapeComponent are consistent with module-level exports",
    Effect.fn(function* () {
      const original = "a b";
      strictEqual(URI.escapeComponent(original), escapeComponent(original));
      strictEqual(URI.unescapeComponent(URI.escapeComponent(original)), unescapeComponent(escapeComponent(original)));
    })
  );
});

describe("URIComponents type remains structurally stable", () => {
  it("can be used as a plain object without error field", () => {
    const components: URIComponents.Type = { scheme: "uri", host: "example.com", path: "/x" };
    deepStrictEqual(Object.keys(components).sort(), ["host", "path", "scheme"]);
  });
});
