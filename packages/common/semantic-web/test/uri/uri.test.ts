import { describe, expect, it } from "bun:test";
import {
  parse,
  serialize,
  resolve,
  normalize,
  equal,
  escapeComponent,
  unescapeComponent,
} from "@beep/semantic-web/uri/uri";
import "@beep/semantic-web/uri/schemes";
import type { URNComponents, URNOptions } from "@beep/semantic-web/uri/schemes/urn";
import type { UUIDComponents } from "@beep/semantic-web/uri/schemes/urn-uuid";
import type { MailtoComponents } from "@beep/semantic-web/uri/schemes/mailto";
import type { WSComponents } from "@beep/semantic-web/uri/schemes/ws";
import type { URIOptions } from "@beep/semantic-web/uri/uri";

describe("URI", () => {
  describe("Parsing", () => {
    it("should parse scheme", () => {
      const components = parse("uri:");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("uri");
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe("");
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
    });

    it("should parse userinfo", () => {
      const components = parse("//@");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe(undefined);
      expect(components.userinfo).toBe("");
      expect(components.host).toBe("");
      expect(components.port).toBe(undefined);
      expect(components.path).toBe("");
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
    });

    it("should parse host", () => {
      const components = parse("//");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe(undefined);
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe("");
      expect(components.port).toBe(undefined);
      expect(components.path).toBe("");
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
    });

    it("should parse port", () => {
      const components = parse("//:");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe(undefined);
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe("");
      expect(components.port).toBe("");
      expect(components.path).toBe("");
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
    });

    it("should parse path", () => {
      const components = parse("");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe(undefined);
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe("");
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
    });

    it("should parse query", () => {
      const components = parse("?");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe(undefined);
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe("");
      expect(components.query).toBe("");
      expect(components.fragment).toBe(undefined);
    });

    it("should parse fragment", () => {
      const components = parse("#");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe(undefined);
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe("");
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe("");
    });

    it("should parse fragment with character tabulation", () => {
      const components = parse("#\t");
      expect(components.fragment).toBe("%09");
    });

    it("should parse fragment with line feed", () => {
      const components = parse("#\n");
      expect(components.fragment).toBe("%0A");
    });

    it("should parse fragment with line tabulation", () => {
      const components = parse("#\v");
      expect(components.fragment).toBe("%0B");
    });

    it("should parse fragment with form feed", () => {
      const components = parse("#\f");
      expect(components.fragment).toBe("%0C");
    });

    it("should parse fragment with carriage return", () => {
      const components = parse("#\r");
      expect(components.fragment).toBe("%0D");
    });

    it("should parse all components", () => {
      const components = parse("uri://user:pass@example.com:123/one/two.three?q1=a1&q2=a2#body");
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("uri");
      expect(components.userinfo).toBe("user:pass");
      expect(components.host).toBe("example.com");
      expect(components.port).toBe(123);
      expect(components.path).toBe("/one/two.three");
      expect(components.query).toBe("q1=a1&q2=a2");
      expect(components.fragment).toBe("body");
    });

    it("should parse IPv4address", () => {
      const components = parse("//10.10.10.10");
      expect(components.host).toBe("10.10.10.10");
    });

    it("should parse IPv6address", () => {
      const components = parse("//[2001:db8::7]");
      expect(components.host).toBe("2001:db8::7");
    });

    it("should parse mixed IPv4address & IPv6address", () => {
      const components = parse("//[::ffff:129.144.52.38]");
      expect(components.host).toBe("::ffff:129.144.52.38");
    });

    it("should parse mixed IPv4address & reg-name", () => {
      const components = parse("uri://10.10.10.10.example.com/en/process");
      expect(components.host).toBe("10.10.10.10.example.com");
    });

    it("should parse full IPv6address", () => {
      const components = parse("//[2606:2800:220:1:248:1893:25c8:1946]/test");
      expect(components.host).toBe("2606:2800:220:1:248:1893:25c8:1946");
    });

    it("should parse IPv6address with port", () => {
      const components = parse("//[2001:db8::1]:80");
      expect(components.host).toBe("2001:db8::1");
      expect(components.port).toBe(80);
    });

    it("should parse IPv6address with zone identifier (RFC 6874)", () => {
      const components = parse("//[fe80::a%25en1]");
      expect(components.host).toBe("fe80::a%en1");
    });

    it("should parse IPv6address with unescaped interface specifier", () => {
      const components = parse("//[2001:db8::7%en0]");
      expect(components.host).toBe("2001:db8::7%en0");
    });
  });

  describe("Serialization", () => {
    it("should serialize undefined components", () => {
      expect(
        serialize({
          scheme: undefined,
          userinfo: undefined,
          host: undefined,
          port: undefined,
          path: undefined,
          query: undefined,
          fragment: undefined,
        }),
      ).toBe("");
    });

    it("should serialize empty components", () => {
      expect(
        serialize({
          scheme: "",
          userinfo: "",
          host: "",
          port: 0,
          path: "",
          query: "",
          fragment: "",
        }),
      ).toBe("//@:0?#");
    });

    it("should serialize all components", () => {
      expect(
        serialize({
          scheme: "uri",
          userinfo: "foo:bar",
          host: "example.com",
          port: 1,
          path: "path",
          query: "query",
          fragment: "fragment",
        }),
      ).toBe("uri://foo:bar@example.com:1/path?query#fragment");
    });

    it("should serialize string port", () => {
      expect(serialize({ scheme: "uri", host: "example.com", port: "9000" })).toBe(
        "uri://example.com:9000",
      );
    });

    it("should serialize double slash path", () => {
      expect(serialize({ path: "//path" })).toBe("/%2Fpath");
    });

    it("should serialize colon path", () => {
      expect(serialize({ path: "foo:bar" })).toBe("foo%3Abar");
    });

    it("should serialize query path", () => {
      expect(serialize({ path: "?query" })).toBe("%3Fquery");
    });

    it("should serialize mixed IPv4address & reg-name", () => {
      expect(serialize({ host: "10.10.10.10.example.com" })).toBe(
        "//10.10.10.10.example.com",
      );
    });

    it("should serialize IPv6address", () => {
      expect(serialize({ host: "2001:db8::7" })).toBe("//[2001:db8::7]");
      expect(serialize({ host: "::ffff:129.144.52.38" })).toBe(
        "//[::ffff:129.144.52.38]",
      );
      expect(serialize({ host: "2606:2800:220:1:248:1893:25c8:1946" })).toBe(
        "//[2606:2800:220:1:248:1893:25c8:1946]",
      );
    });

    it("should serialize IPv6address with zone identifier", () => {
      expect(serialize({ host: "fe80::a%en1" })).toBe("//[fe80::a%25en1]");
      expect(serialize({ host: "fe80::a%25en1" })).toBe("//[fe80::a%25en1]");
    });
  });

  describe("Resolving", () => {
    const base = "uri://a/b/c/d;p?q";

    it("should resolve normal examples (RFC 3986 Section 5.4.1)", () => {
      expect(resolve(base, "g:h")).toBe("g:h");
      expect(resolve(base, "g")).toBe("uri://a/b/c/g");
      expect(resolve(base, "./g")).toBe("uri://a/b/c/g");
      expect(resolve(base, "g/")).toBe("uri://a/b/c/g/");
      expect(resolve(base, "/g")).toBe("uri://a/g");
      expect(resolve(base, "//g")).toBe("uri://g");
      expect(resolve(base, "?y")).toBe("uri://a/b/c/d;p?y");
      expect(resolve(base, "g?y")).toBe("uri://a/b/c/g?y");
      expect(resolve(base, "#s")).toBe("uri://a/b/c/d;p?q#s");
      expect(resolve(base, "g#s")).toBe("uri://a/b/c/g#s");
      expect(resolve(base, "g?y#s")).toBe("uri://a/b/c/g?y#s");
      expect(resolve(base, ";x")).toBe("uri://a/b/c/;x");
      expect(resolve(base, "g;x")).toBe("uri://a/b/c/g;x");
      expect(resolve(base, "g;x?y#s")).toBe("uri://a/b/c/g;x?y#s");
      expect(resolve(base, "")).toBe("uri://a/b/c/d;p?q");
      expect(resolve(base, ".")).toBe("uri://a/b/c/");
      expect(resolve(base, "./")).toBe("uri://a/b/c/");
      expect(resolve(base, "..")).toBe("uri://a/b/");
      expect(resolve(base, "../")).toBe("uri://a/b/");
      expect(resolve(base, "../g")).toBe("uri://a/b/g");
      expect(resolve(base, "../..")).toBe("uri://a/");
      expect(resolve(base, "../../")).toBe("uri://a/");
      expect(resolve(base, "../../g")).toBe("uri://a/g");
    });

    it("should resolve abnormal examples (RFC 3986 Section 5.4.2)", () => {
      expect(resolve(base, "../../../g")).toBe("uri://a/g");
      expect(resolve(base, "../../../../g")).toBe("uri://a/g");
      expect(resolve(base, "/./g")).toBe("uri://a/g");
      expect(resolve(base, "/../g")).toBe("uri://a/g");
      expect(resolve(base, "g.")).toBe("uri://a/b/c/g.");
      expect(resolve(base, ".g")).toBe("uri://a/b/c/.g");
      expect(resolve(base, "g..")).toBe("uri://a/b/c/g..");
      expect(resolve(base, "..g")).toBe("uri://a/b/c/..g");
      expect(resolve(base, "./../g")).toBe("uri://a/b/g");
      expect(resolve(base, "./g/.")).toBe("uri://a/b/c/g/");
      expect(resolve(base, "g/./h")).toBe("uri://a/b/c/g/h");
      expect(resolve(base, "g/../h")).toBe("uri://a/b/c/h");
      expect(resolve(base, "g;x=1/./y")).toBe("uri://a/b/c/g;x=1/y");
      expect(resolve(base, "g;x=1/../y")).toBe("uri://a/b/c/y");
      expect(resolve(base, "g?y/./x")).toBe("uri://a/b/c/g?y/./x");
      expect(resolve(base, "g?y/../x")).toBe("uri://a/b/c/g?y/../x");
      expect(resolve(base, "g#s/./x")).toBe("uri://a/b/c/g#s/./x");
      expect(resolve(base, "g#s/../x")).toBe("uri://a/b/c/g#s/../x");
      expect(resolve(base, "uri:g")).toBe("uri:g");
      expect(resolve(base, "uri:g", { tolerant: true })).toBe("uri://a/b/c/g");
    });

    it("should resolve PAEz examples", () => {
      expect(resolve("//www.g.com/", "/adf\ngf")).toBe("//www.g.com/adf%0Agf");
      expect(resolve("//www.g.com/error\n/bleh/bleh", "..")).toBe(
        "//www.g.com/error%0A/",
      );
    });
  });

  describe("Normalizing", () => {
    it("should normalize percent-encoded characters", () => {
      expect(normalize("uri://www.example.org/red%09ros\xE9#red")).toBe(
        "uri://www.example.org/red%09ros%C3%A9#red",
      );
    });

    it("should normalize IPv4 addresses", () => {
      expect(normalize("//192.068.001.000")).toBe("//192.68.1.0");
    });

    it("should normalize IPv6 addresses", () => {
      expect(normalize("http://[1080::8:800:200C:417A]/")).toBe(
        "http://[1080::8:800:200c:417a]/",
      );
      expect(normalize("//[2001:0db8::0001]/")).toBe("//[2001:db8::1]/");
      expect(normalize("//[2001:db8::1:0000:1]/")).toBe("//[2001:db8::1:0:1]/");
      expect(normalize("//[2001:db8:0:0:0:0:2:1]/")).toBe("//[2001:db8::2:1]/");
      expect(normalize("//[2001:db8:0:1:1:1:1:1]/")).toBe(
        "//[2001:db8:0:1:1:1:1:1]/",
      );
      expect(normalize("//[2001:0:0:1:0:0:0:1]/")).toBe("//[2001:0:0:1::1]/");
      expect(normalize("//[2001:db8:0:0:1:0:0:1]/")).toBe("//[2001:db8::1:0:0:1]/");
      expect(normalize("//[2001:DB8::1]/")).toBe("//[2001:db8::1]/");
      expect(normalize("//[0:0:0:0:0:ffff:192.0.2.1]/")).toBe(
        "//[::ffff:192.0.2.1]/",
      );
      expect(normalize("//[1:2:3:4:5:6:192.0.2.1]/")).toBe(
        "//[1:2:3:4:5:6:192.0.2.1]/",
      );
      expect(normalize("//[1:2:3:4:5:6:192.068.001.000]/")).toBe(
        "//[1:2:3:4:5:6:192.68.1.0]/",
      );
    });
  });

  describe("Equals", () => {
    it("should recognize equivalent URIs", () => {
      expect(
        equal(
          "example://a/b/c/%7Bfoo%7D",
          "eXAMPLE://a/./b/../b/%63/%7bfoo%7d",
        ),
      ).toBe(true);
    });

    it("should recognize equivalent URIs with percent-encoded characters", () => {
      expect(
        equal("http://example.org/~user", "http://example.org/%7euser"),
      ).toBe(true);
    });
  });

  describe("Escape Component", () => {
    it("should escape characters 0-129 correctly", () => {
      for (let d = 0; d <= 129; ++d) {
        const chr = String.fromCharCode(d);
        if (!chr.match(/[\$\&\+\,\;\=]/)) {
          expect(escapeComponent(chr)).toBe(encodeURIComponent(chr));
        } else {
          expect(escapeComponent(chr)).toBe(chr);
        }
      }
    });

    it("should escape multi-byte characters", () => {
      expect(escapeComponent("\u00c0")).toBe(encodeURIComponent("\u00c0"));
      expect(escapeComponent("\u07ff")).toBe(encodeURIComponent("\u07ff"));
      expect(escapeComponent("\u0800")).toBe(encodeURIComponent("\u0800"));
      expect(escapeComponent("\u30a2")).toBe(encodeURIComponent("\u30a2"));
    });
  });

  describe("Unescape Component", () => {
    it("should unescape characters 0-129 correctly", () => {
      for (let d = 0; d <= 129; ++d) {
        const chr = String.fromCharCode(d);
        expect(unescapeComponent(encodeURIComponent(chr))).toBe(chr);
      }
    });

    it("should unescape multi-byte characters", () => {
      expect(unescapeComponent(encodeURIComponent("\u00c0"))).toBe("\u00c0");
      expect(unescapeComponent(encodeURIComponent("\u07ff"))).toBe("\u07ff");
      expect(unescapeComponent(encodeURIComponent("\u0800"))).toBe("\u0800");
      expect(unescapeComponent(encodeURIComponent("\u30a2"))).toBe("\u30a2");
    });
  });
});

describe("IRI", () => {
  const IRI_OPTION: URIOptions = { iri: true, unicodeSupport: true };

  describe("Parsing", () => {
    it("should parse IRI with unicode characters", () => {
      const components = parse(
        "uri://us\xA0er:pa\uD7FFss@example.com:123/o\uF900ne/t\uFDCFwo.t\uFDF0hree?q1=a1\uF8FF\uE000&q2=a2#bo\uFFEFdy",
        IRI_OPTION,
      );
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("uri");
      expect(components.userinfo).toBe("us\xA0er:pa\uD7FFss");
      expect(components.host).toBe("example.com");
      expect(components.port).toBe(123);
      expect(components.path).toBe("/o\uF900ne/t\uFDCFwo.t\uFDF0hree");
      expect(components.query).toBe("q1=a1\uF8FF\uE000&q2=a2");
      expect(components.fragment).toBe("bo\uFFEFdy");
    });
  });

  describe("Serialization", () => {
    it("should serialize IRI with unicode characters", () => {
      expect(
        serialize(
          {
            scheme: "uri",
            userinfo: "us\xA0er:pa\uD7FFss",
            host: "example.com",
            port: 123,
            path: "/o\uF900ne/t\uFDCFwo.t\uFDF0hree",
            query: "q1=a1\uF8FF\uE000&q2=a2",
            fragment: "bo\uFFEFdy\uE001",
          },
          IRI_OPTION,
        ),
      ).toBe(
        "uri://us\xA0er:pa\uD7FFss@example.com:123/o\uF900ne/t\uFDCFwo.t\uFDF0hree?q1=a1\uF8FF\uE000&q2=a2#bo\uFFEFdy%EE%80%81",
      );
    });
  });

  describe("Normalizing", () => {
    it("should normalize IRI with unicode characters", () => {
      expect(
        normalize(
          "uri://www.example.org/red%09ros\xE9#red",
          IRI_OPTION,
        ),
      ).toBe("uri://www.example.org/red%09ros\xE9#red");
    });
  });

  describe("Equals", () => {
    it("should recognize equivalent IRIs", () => {
      expect(
        equal(
          "example://a/b/c/%7Bfoo%7D/ros\xE9",
          "eXAMPLE://a/./b/../b/%63/%7bfoo%7d/ros%C3%A9",
          IRI_OPTION,
        ),
      ).toBe(true);
    });
  });

  describe("Convert IRI to URI", () => {
    it("should convert IRI to URI with percent-encoded unicode", () => {
      expect(
        serialize(
          parse("uri://www.example.org/red%09ros\xE9#red", IRI_OPTION),
        ),
      ).toBe("uri://www.example.org/red%09ros%C3%A9#red");
    });

    it("should convert IRI to URI with domain host via punycode", () => {
      expect(
        serialize(
          parse("uri://r\xE9sum\xE9.example.org", {
            iri: true,
            domainHost: true,
          }),
          { domainHost: true },
        ),
      ).toBe("uri://xn--rsum-bpad.example.org");
    });
  });

  describe("Convert URI to IRI", () => {
    it("should convert URI to IRI with decoded unicode", () => {
      expect(
        serialize(
          parse("uri://www.example.org/D%C3%BCrst"),
          IRI_OPTION,
        ),
      ).toBe("uri://www.example.org/D\xFCrst");
    });

    it("should leave invalid percent-encoded sequences as-is", () => {
      expect(
        serialize(
          parse("uri://www.example.org/D%FCrst"),
          IRI_OPTION,
        ),
      ).toBe("uri://www.example.org/D%FCrst");
    });

    it("should keep right-to-left override percent-encoded", () => {
      expect(
        serialize(
          parse("uri://xn--99zt52a.example.org/%e2%80%ae"),
          IRI_OPTION,
        ),
      ).toBe("uri://xn--99zt52a.example.org/%E2%80%AE");
    });

    it("should convert punycode domain to unicode via domainHost", () => {
      expect(
        serialize(
          parse("uri://xn--rsum-bpad.example.org", { domainHost: true }),
          { iri: true, domainHost: true },
        ),
      ).toBe("uri://r\xE9sum\xE9.example.org");
    });
  });
});

describe("HTTP", () => {
  describe("Equals", () => {
    it("should treat default port 80 as equal to no port", () => {
      expect(
        equal(
          "http://abc.com:80/~smith/home.html",
          "http://abc.com/~smith/home.html",
        ),
      ).toBe(true);
    });

    it("should treat percent-encoded tilde as equal to literal tilde", () => {
      expect(
        equal(
          "http://ABC.com/%7Esmith/home.html",
          "http://abc.com/~smith/home.html",
        ),
      ).toBe(true);
    });

    it("should be case-insensitive and handle lowercase percent-encoding", () => {
      expect(
        equal(
          "http://ABC.com:/%7esmith/home.html",
          "http://abc.com/~smith/home.html",
        ),
      ).toBe(true);
    });

    it("should be scheme-case-insensitive and add trailing slash", () => {
      expect(equal("HTTP://ABC.COM", "http://abc.com/")).toBe(true);
    });

    it("should treat empty port as equal to default port 80", () => {
      expect(equal("http://example.com:/", "http://example.com:80/")).toBe(true);
    });
  });
});

describe("HTTPS", () => {
  describe("Equals", () => {
    it("should treat default port 443 as equal to no port", () => {
      expect(equal("https://example.com", "https://example.com:443/")).toBe(
        true,
      );
    });

    it("should treat empty port as equal to default port 443", () => {
      expect(equal("https://example.com:/", "https://example.com:443/")).toBe(
        true,
      );
    });
  });
});

describe("URN", () => {
  describe("Parsing", () => {
    it("should parse URN components", () => {
      const components = parse("urn:foo:a123,456") as URNComponents;
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("urn");
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe(undefined);
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
      expect(components.nid).toBe("foo");
      expect(components.nss).toBe("a123,456");
    });
  });

  describe("Serialization", () => {
    it("should serialize URN components", () => {
      expect(
        serialize({ scheme: "urn", nid: "foo", nss: "a123,456" } as URNComponents),
      ).toBe("urn:foo:a123,456");
    });
  });

  describe("Equals", () => {
    it("should recognize identical URNs", () => {
      expect(equal("urn:foo:a123,456", "urn:foo:a123,456")).toBe(true);
    });

    it("should be case-insensitive for scheme", () => {
      expect(equal("urn:foo:a123,456", "URN:foo:a123,456")).toBe(true);
    });

    it("should be case-insensitive for NID", () => {
      expect(equal("urn:foo:a123,456", "urn:FOO:a123,456")).toBe(true);
    });

    it("should be case-sensitive for NSS", () => {
      expect(equal("urn:foo:a123,456", "urn:foo:A123,456")).toBe(false);
    });

    it("should be case-insensitive for percent-encoded NSS", () => {
      expect(equal("urn:foo:a123%2C456", "URN:FOO:a123%2c456")).toBe(true);
    });
  });

  describe("Resolving", () => {
    it("should resolve URN from empty base", () => {
      expect(resolve("", "urn:some:ip:prop")).toBe("urn:some:ip:prop");
    });

    it("should resolve URN from fragment base", () => {
      expect(resolve("#", "urn:some:ip:prop")).toBe("urn:some:ip:prop");
    });

    it("should resolve URN from same URN base", () => {
      expect(resolve("urn:some:ip:prop", "urn:some:ip:prop")).toBe(
        "urn:some:ip:prop",
      );
    });

    it("should resolve URN from different URN base", () => {
      expect(resolve("urn:some:other:prop", "urn:some:ip:prop")).toBe(
        "urn:some:ip:prop",
      );
    });
  });

  describe("UUID Parsing", () => {
    it("should parse valid UUID URN", () => {
      const components = parse(
        "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
      ) as UUIDComponents;
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("urn");
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe(undefined);
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
      expect(components.nid).toBe("uuid");
      expect(components.nss).toBe(undefined);
      expect(components.uuid).toBe("f81d4fae-7dec-11d0-a765-00a0c91e6bf6");
    });

    it("should report error for invalid UUID URN", () => {
      const components = parse(
        "urn:uuid:notauuid-7dec-11d0-a765-00a0c91e6bf6",
      ) as UUIDComponents;
      expect(components.error).not.toBe(undefined);
    });
  });

  describe("UUID Serialization", () => {
    it("should serialize valid UUID URN", () => {
      expect(
        serialize({
          scheme: "urn",
          nid: "uuid",
          uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
        } as UUIDComponents),
      ).toBe("urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6");
    });

    it("should serialize invalid UUID URN without validation", () => {
      expect(
        serialize({
          scheme: "urn",
          nid: "uuid",
          uuid: "notauuid-7dec-11d0-a765-00a0c91e6bf6",
        } as UUIDComponents),
      ).toBe("urn:uuid:notauuid-7dec-11d0-a765-00a0c91e6bf6");
    });
  });

  describe("UUID Equals", () => {
    it("should be case-insensitive for UUID URN", () => {
      expect(
        equal(
          "URN:UUID:F81D4FAE-7DEC-11D0-A765-00A0C91E6BF6",
          "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
        ),
      ).toBe(true);
    });
  });

  describe("NID Override", () => {
    it("should parse with NID override option", () => {
      const components = parse(
        "urn:foo:f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
        { nid: "uuid" } as URNOptions,
      ) as UUIDComponents;
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("urn");
      expect(components.path).toBe(undefined);
      expect(components.nid).toBe("foo");
      expect(components.nss).toBe(undefined);
      expect(components.uuid).toBe("f81d4fae-7dec-11d0-a765-00a0c91e6bf6");
    });

    it("should serialize with NID override option", () => {
      expect(
        serialize(
          {
            scheme: "urn",
            nid: "foo",
            uuid: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
          } as UUIDComponents,
          { nid: "uuid" } as URNOptions,
        ),
      ).toBe("urn:foo:f81d4fae-7dec-11d0-a765-00a0c91e6bf6");
    });
  });
});

describe("Mailto", () => {
  describe("Parse", () => {
    it("should parse simple mailto URI", () => {
      const components = parse("mailto:chris@example.com") as MailtoComponents;
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("mailto");
      expect(components.userinfo).toBe(undefined);
      expect(components.host).toBe(undefined);
      expect(components.port).toBe(undefined);
      expect(components.path).toBe(undefined);
      expect(components.query).toBe(undefined);
      expect(components.fragment).toBe(undefined);
      expect(components.to).toEqual(["chris@example.com"]);
      expect(components.subject).toBe(undefined);
      expect(components.body).toBe(undefined);
      expect(components.headers).toBe(undefined);
    });

    it("should parse mailto with subject", () => {
      const components = parse(
        "mailto:infobot@example.com?subject=current-issue",
      ) as MailtoComponents;
      expect(components.to).toEqual(["infobot@example.com"]);
      expect(components.subject).toBe("current-issue");
    });

    it("should parse mailto with body", () => {
      const components = parse(
        "mailto:infobot@example.com?body=send%20current-issue",
      ) as MailtoComponents;
      expect(components.to).toEqual(["infobot@example.com"]);
      expect(components.body).toBe("send current-issue");
    });

    it("should parse mailto with multiline body", () => {
      const components = parse(
        "mailto:infobot@example.com?body=send%20current-issue%0D%0Asend%20index",
      ) as MailtoComponents;
      expect(components.to).toEqual(["infobot@example.com"]);
      expect(components.body).toBe("send current-issue\x0D\x0Asend index");
    });

    it("should parse mailto with In-Reply-To header", () => {
      const components = parse(
        "mailto:list@example.org?In-Reply-To=%3C3469A91.D10AF4C@example.com%3E",
      ) as MailtoComponents;
      expect(components.to).toEqual(["list@example.org"]);
      expect(components.headers).toEqual({
        "In-Reply-To": "<3469A91.D10AF4C@example.com>",
      });
    });

    it("should parse mailto with subscribe body", () => {
      const components = parse(
        "mailto:majordomo@example.com?body=subscribe%20bamboo-l",
      ) as MailtoComponents;
      expect(components.to).toEqual(["majordomo@example.com"]);
      expect(components.body).toBe("subscribe bamboo-l");
    });

    it("should parse mailto with cc and body", () => {
      const components = parse(
        "mailto:joe@example.com?cc=bob@example.com&body=hello",
      ) as MailtoComponents;
      expect(components.to).toEqual(["joe@example.com"]);
      expect(components.body).toBe("hello");
      expect(components.headers).toEqual({ cc: "bob@example.com" });
    });

    it("should parse mailto with percent-encoded percent sign", () => {
      const components = parse(
        "mailto:gorby%25kremvax@example.com",
      ) as MailtoComponents;
      expect(components.to).toEqual(["gorby%kremvax@example.com"]);
    });

    it("should parse mailto with percent-encoded question mark", () => {
      const components = parse(
        "mailto:unlikely%3Faddress@example.com?blat=foop",
      ) as MailtoComponents;
      expect(components.to).toEqual(["unlikely?address@example.com"]);
      expect(components.headers).toEqual({ blat: "foop" });
    });

    it("should parse mailto with percent-encoded ampersand", () => {
      const components = parse(
        "mailto:Mike%26family@example.org",
      ) as MailtoComponents;
      expect(components.to).toEqual(["Mike&family@example.org"]);
    });

    it("should parse mailto with percent-encoded at-sign in quotes", () => {
      const components = parse(
        "mailto:%22not%40me%22@example.org",
      ) as MailtoComponents;
      expect(components.to).toEqual(['"not@me"@example.org']);
    });

    it("should parse mailto with percent-encoded backslashes in quotes", () => {
      const components = parse(
        "mailto:%22oh%5C%5Cno%22@example.org",
      ) as MailtoComponents;
      expect(components.to).toEqual(['"oh\\\\no"@example.org']);
    });

    it("should parse mailto with complex percent-encoded local part", () => {
      const components = parse(
        "mailto:%22%5C%5C%5C%22it's%5C%20ugly%5C%5C%5C%22%22@example.org",
      ) as MailtoComponents;
      expect(components.to).toEqual([
        '"\\\\\\"it\'s\\ ugly\\\\\\""@example.org',
      ]);
    });

    it("should parse mailto with UTF-8 percent-encoded subject", () => {
      const components = parse(
        "mailto:user@example.org?subject=caf%C3%A9",
      ) as MailtoComponents;
      expect(components.to).toEqual(["user@example.org"]);
      expect(components.subject).toBe("caf\xE9");
    });

    it("should parse mailto with Q-encoded subject", () => {
      const components = parse(
        "mailto:user@example.org?subject=%3D%3Futf-8%3FQ%3Fcaf%3DC3%3DA9%3F%3D",
      ) as MailtoComponents;
      expect(components.subject).toBe("=?utf-8?Q?caf=C3=A9?=");
    });

    it("should parse mailto with iso-8859-1 Q-encoded subject", () => {
      const components = parse(
        "mailto:user@example.org?subject=%3D%3Fiso-8859-1%3FQ%3Fcaf%3DE9%3F%3D",
      ) as MailtoComponents;
      expect(components.subject).toBe("=?iso-8859-1?Q?caf=E9?=");
    });

    it("should parse mailto with UTF-8 subject and body", () => {
      const components = parse(
        "mailto:user@example.org?subject=caf%C3%A9&body=caf%C3%A9",
      ) as MailtoComponents;
      expect(components.subject).toBe("caf\xE9");
      expect(components.body).toBe("caf\xE9");
    });

    it("should parse mailto with IDN domain", () => {
      const components = parse(
        "mailto:user@%E7%B4%8D%E8%B1%86.example.org?subject=Test&body=NATTO",
      ) as MailtoComponents;
      expect(components.to).toEqual(["user@xn--99zt52a.example.org"]);
      expect(components.subject).toBe("Test");
      expect(components.body).toBe("NATTO");
    });
  });

  describe("Serialize", () => {
    it("should serialize simple mailto", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["chris@example.com"],
        } as MailtoComponents),
      ).toBe("mailto:chris@example.com");
    });

    it("should serialize mailto with body", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["infobot@example.com"],
          body: "current-issue",
        } as MailtoComponents),
      ).toBe("mailto:infobot@example.com?body=current-issue");
    });

    it("should serialize mailto with body containing space", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["infobot@example.com"],
          body: "send current-issue",
        } as MailtoComponents),
      ).toBe("mailto:infobot@example.com?body=send%20current-issue");
    });

    it("should serialize mailto with multiline body", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["infobot@example.com"],
          body: "send current-issue\x0D\x0Asend index",
        } as MailtoComponents),
      ).toBe(
        "mailto:infobot@example.com?body=send%20current-issue%0D%0Asend%20index",
      );
    });

    it("should serialize mailto with In-Reply-To header", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["list@example.org"],
          headers: { "In-Reply-To": "<3469A91.D10AF4C@example.com>" },
        } as MailtoComponents),
      ).toBe(
        "mailto:list@example.org?In-Reply-To=%3C3469A91.D10AF4C@example.com%3E",
      );
    });

    it("should serialize mailto with subscribe body", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["majordomo@example.com"],
          body: "subscribe bamboo-l",
        } as MailtoComponents),
      ).toBe("mailto:majordomo@example.com?body=subscribe%20bamboo-l");
    });

    it("should serialize mailto with cc and body headers", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["joe@example.com"],
          headers: { cc: "bob@example.com", body: "hello" },
        } as MailtoComponents),
      ).toBe("mailto:joe@example.com?cc=bob@example.com&body=hello");
    });

    it("should serialize mailto with percent-encoded percent sign", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["gorby%25kremvax@example.com"],
        } as MailtoComponents),
      ).toBe("mailto:gorby%25kremvax@example.com");
    });

    it("should serialize mailto with percent-encoded question mark", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["unlikely%3Faddress@example.com"],
          headers: { blat: "foop" },
        } as MailtoComponents),
      ).toBe("mailto:unlikely%3Faddress@example.com?blat=foop");
    });

    it("should serialize mailto with ampersand in local part", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["Mike&family@example.org"],
        } as MailtoComponents),
      ).toBe("mailto:Mike%26family@example.org");
    });

    it("should serialize mailto with at-sign in quoted local part", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ['"not@me"@example.org'],
        } as MailtoComponents),
      ).toBe("mailto:%22not%40me%22@example.org");
    });

    it("should serialize mailto with backslashes in quoted local part", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ['"oh\\\\no"@example.org'],
        } as MailtoComponents),
      ).toBe("mailto:%22oh%5C%5Cno%22@example.org");
    });

    it("should serialize mailto with complex quoted local part", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ['"\\\\\\"it\'s\\ ugly\\\\\\""@example.org'],
        } as MailtoComponents),
      ).toBe(
        "mailto:%22%5C%5C%5C%22it's%5C%20ugly%5C%5C%5C%22%22@example.org",
      );
    });

    it("should serialize mailto with UTF-8 subject", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["user@example.org"],
          subject: "caf\xE9",
        } as MailtoComponents),
      ).toBe("mailto:user@example.org?subject=caf%C3%A9");
    });

    it("should serialize mailto with Q-encoded subject", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["user@example.org"],
          subject: "=?utf-8?Q?caf=C3=A9?=",
        } as MailtoComponents),
      ).toBe(
        "mailto:user@example.org?subject=%3D%3Futf-8%3FQ%3Fcaf%3DC3%3DA9%3F%3D",
      );
    });

    it("should serialize mailto with iso-8859-1 Q-encoded subject", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["user@example.org"],
          subject: "=?iso-8859-1?Q?caf=E9?=",
        } as MailtoComponents),
      ).toBe(
        "mailto:user@example.org?subject=%3D%3Fiso-8859-1%3FQ%3Fcaf%3DE9%3F%3D",
      );
    });

    it("should serialize mailto with UTF-8 subject and body", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["user@example.org"],
          subject: "caf\xE9",
          body: "caf\xE9",
        } as MailtoComponents),
      ).toBe("mailto:user@example.org?subject=caf%C3%A9&body=caf%C3%A9");
    });

    it("should serialize mailto with IDN and unicode local part", () => {
      expect(
        serialize({
          scheme: "mailto",
          to: ["us\xE9r@\u7d0d\u8c46.example.org"],
          subject: "Test",
          body: "NATTO",
        } as MailtoComponents),
      ).toBe(
        "mailto:us%C3%A9r@xn--99zt52a.example.org?subject=Test&body=NATTO",
      );
    });
  });

  describe("Equals", () => {
    it("should equate to-path with to-query syntax", () => {
      expect(
        equal(
          "mailto:addr1@an.example,addr2@an.example",
          "mailto:?to=addr1@an.example,addr2@an.example",
        ),
      ).toBe(true);
    });

    it("should equate mixed to-path and to-query syntax", () => {
      expect(
        equal(
          "mailto:?to=addr1@an.example,addr2@an.example",
          "mailto:addr1@an.example?to=addr2@an.example",
        ),
      ).toBe(true);
    });
  });
});

describe("WS", () => {
  describe("Parse", () => {
    it("should parse ws URI", () => {
      const components = parse("ws://example.com/chat") as WSComponents;
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("ws");
      expect(components.host).toBe("example.com");
      expect(components.resourceName).toBe("/chat");
      expect(components.secure).toBe(false);
    });

    it("should parse ws URI with query", () => {
      const components = parse(
        "ws://example.com/foo?bar=baz",
      ) as WSComponents;
      expect(components.resourceName).toBe("/foo?bar=baz");
      expect(components.secure).toBe(false);
    });

    it("should parse ws URI with query on root path", () => {
      const components = parse(
        "ws://example.com/?bar=baz",
      ) as WSComponents;
      expect(components.resourceName).toBe("/?bar=baz");
    });
  });

  describe("Serialize", () => {
    it("should serialize ws with no host", () => {
      expect(serialize({ scheme: "ws" })).toBe("ws:");
    });

    it("should serialize ws with host", () => {
      expect(serialize({ scheme: "ws", host: "example.com" })).toBe(
        "ws://example.com",
      );
    });

    it("should serialize ws with root resourceName", () => {
      expect(
        serialize({ scheme: "ws", resourceName: "/" } as WSComponents),
      ).toBe("ws:");
    });

    it("should serialize ws with resourceName path", () => {
      expect(
        serialize({ scheme: "ws", resourceName: "/foo" } as WSComponents),
      ).toBe("ws:/foo");
    });

    it("should serialize ws with resourceName path and query", () => {
      expect(
        serialize({
          scheme: "ws",
          resourceName: "/foo?bar",
        } as WSComponents),
      ).toBe("ws:/foo?bar");
    });

    it("should serialize ws with secure false", () => {
      expect(
        serialize({ scheme: "ws", secure: false } as WSComponents),
      ).toBe("ws:");
    });

    it("should serialize ws with secure true", () => {
      expect(
        serialize({ scheme: "ws", secure: true } as WSComponents),
      ).toBe("wss:");
    });

    it("should serialize ws with host and resourceName", () => {
      expect(
        serialize({
          scheme: "ws",
          host: "example.com",
          resourceName: "/foo",
        } as WSComponents),
      ).toBe("ws://example.com/foo");
    });

    it("should serialize ws with host, resourceName and query", () => {
      expect(
        serialize({
          scheme: "ws",
          host: "example.com",
          resourceName: "/foo?bar",
        } as WSComponents),
      ).toBe("ws://example.com/foo?bar");
    });

    it("should serialize ws with host and secure false", () => {
      expect(
        serialize({
          scheme: "ws",
          host: "example.com",
          secure: false,
        } as WSComponents),
      ).toBe("ws://example.com");
    });

    it("should serialize ws with host and secure true", () => {
      expect(
        serialize({
          scheme: "ws",
          host: "example.com",
          secure: true,
        } as WSComponents),
      ).toBe("wss://example.com");
    });

    it("should serialize ws with host, resourceName and secure false", () => {
      expect(
        serialize({
          scheme: "ws",
          host: "example.com",
          resourceName: "/foo?bar",
          secure: false,
        } as WSComponents),
      ).toBe("ws://example.com/foo?bar");
    });

    it("should serialize ws with host, resourceName and secure true", () => {
      expect(
        serialize({
          scheme: "ws",
          host: "example.com",
          resourceName: "/foo?bar",
          secure: true,
        } as WSComponents),
      ).toBe("wss://example.com/foo?bar");
    });
  });

  describe("Equal", () => {
    it("should equate ws URIs with default port and fragment", () => {
      expect(equal("WS://ABC.COM:80/chat#one", "ws://abc.com/chat")).toBe(
        true,
      );
    });
  });

  describe("Normalize", () => {
    it("should normalize ws URI by removing default port and fragment", () => {
      expect(normalize("ws://example.com:80/foo#hash")).toBe(
        "ws://example.com/foo",
      );
    });
  });
});

describe("WSS", () => {
  describe("Parse", () => {
    it("should parse wss URI", () => {
      const components = parse("wss://example.com/chat") as WSComponents;
      expect(components.error).toBe(undefined);
      expect(components.scheme).toBe("wss");
      expect(components.host).toBe("example.com");
      expect(components.resourceName).toBe("/chat");
      expect(components.secure).toBe(true);
    });

    it("should parse wss URI with query", () => {
      const components = parse(
        "wss://example.com/foo?bar=baz",
      ) as WSComponents;
      expect(components.resourceName).toBe("/foo?bar=baz");
      expect(components.secure).toBe(true);
    });

    it("should parse wss URI with query on root path", () => {
      const components = parse(
        "wss://example.com/?bar=baz",
      ) as WSComponents;
      expect(components.resourceName).toBe("/?bar=baz");
    });
  });

  describe("Serialize", () => {
    it("should serialize wss with no host", () => {
      expect(serialize({ scheme: "wss" })).toBe("wss:");
    });

    it("should serialize wss with host", () => {
      expect(serialize({ scheme: "wss", host: "example.com" })).toBe(
        "wss://example.com",
      );
    });

    it("should serialize wss with root resourceName", () => {
      expect(
        serialize({ scheme: "wss", resourceName: "/" } as WSComponents),
      ).toBe("wss:");
    });

    it("should serialize wss with resourceName path", () => {
      expect(
        serialize({ scheme: "wss", resourceName: "/foo" } as WSComponents),
      ).toBe("wss:/foo");
    });

    it("should serialize wss with resourceName path and query", () => {
      expect(
        serialize({
          scheme: "wss",
          resourceName: "/foo?bar",
        } as WSComponents),
      ).toBe("wss:/foo?bar");
    });

    it("should serialize wss with secure false", () => {
      expect(
        serialize({ scheme: "wss", secure: false } as WSComponents),
      ).toBe("ws:");
    });

    it("should serialize wss with secure true", () => {
      expect(
        serialize({ scheme: "wss", secure: true } as WSComponents),
      ).toBe("wss:");
    });

    it("should serialize wss with host and resourceName", () => {
      expect(
        serialize({
          scheme: "wss",
          host: "example.com",
          resourceName: "/foo",
        } as WSComponents),
      ).toBe("wss://example.com/foo");
    });

    it("should serialize wss with host, resourceName and query", () => {
      expect(
        serialize({
          scheme: "wss",
          host: "example.com",
          resourceName: "/foo?bar",
        } as WSComponents),
      ).toBe("wss://example.com/foo?bar");
    });

    it("should serialize wss with host and secure false", () => {
      expect(
        serialize({
          scheme: "wss",
          host: "example.com",
          secure: false,
        } as WSComponents),
      ).toBe("ws://example.com");
    });

    it("should serialize wss with host and secure true", () => {
      expect(
        serialize({
          scheme: "wss",
          host: "example.com",
          secure: true,
        } as WSComponents),
      ).toBe("wss://example.com");
    });

    it("should serialize wss with host, resourceName and secure false", () => {
      expect(
        serialize({
          scheme: "wss",
          host: "example.com",
          resourceName: "/foo?bar",
          secure: false,
        } as WSComponents),
      ).toBe("ws://example.com/foo?bar");
    });

    it("should serialize wss with host, resourceName and secure true", () => {
      expect(
        serialize({
          scheme: "wss",
          host: "example.com",
          resourceName: "/foo?bar",
          secure: true,
        } as WSComponents),
      ).toBe("wss://example.com/foo?bar");
    });
  });

  describe("Equal", () => {
    it("should equate wss URIs with default port and fragment", () => {
      expect(
        equal("WSS://ABC.COM:443/chat#one", "wss://abc.com/chat"),
      ).toBe(true);
    });
  });

  describe("Normalize", () => {
    it("should normalize wss URI by removing default port and fragment", () => {
      expect(normalize("wss://example.com:443/foo#hash")).toBe(
        "wss://example.com/foo",
      );
    });
  });
});
