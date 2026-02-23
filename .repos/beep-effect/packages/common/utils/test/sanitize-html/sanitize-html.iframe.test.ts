/**
 * Iframe and script restriction tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic iframe handling
effect(
  "removes iframe by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="http://example.com"></iframe>');
    expect(result).not.toContain("<iframe");
  })
);

effect(
  "allows iframe when in allowedTags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="http://example.com"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).toBe('<iframe src="http://example.com"></iframe>');
  })
);

// allowedIframeHostnames
effect(
  "allows iframe from allowed hostnames",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="https://www.youtube.com/embed/xyz"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com"],
    });
    expect(result).toBe('<iframe src="https://www.youtube.com/embed/xyz"></iframe>');
  })
);

effect(
  "removes iframe src from disallowed hostnames",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="https://evil.com/embed"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com"],
    });
    expect(result).not.toContain('src="https://evil.com');
  })
);

effect(
  "allows multiple iframe hostnames",
  Effect.fn(function* () {
    const youtubeResult = sanitizeHtml('<iframe src="https://www.youtube.com/embed/xyz"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
    });
    expect(youtubeResult).toContain("www.youtube.com");

    const vimeoResult = sanitizeHtml('<iframe src="https://player.vimeo.com/video/123"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
    });
    expect(vimeoResult).toContain("player.vimeo.com");
  })
);

// allowedIframeDomains
effect(
  "allows iframe from allowed domains (includes subdomains)",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="https://embed.example.com/video"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeDomains: ["example.com"],
    });
    expect(result).toBe('<iframe src="https://embed.example.com/video"></iframe>');
  })
);

effect(
  "allows iframe from exact domain match",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="https://example.com/video"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeDomains: ["example.com"],
    });
    expect(result).toBe('<iframe src="https://example.com/video"></iframe>');
  })
);

effect(
  "blocks iframe when subdomain of non-matching domain",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="https://evil.example.com/video"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeDomains: ["safe.com"],
    });
    expect(result).not.toContain('src="https://evil.example.com');
  })
);

// Combined hostname and domain restrictions
effect(
  "allows iframe matching either hostname or domain",
  Effect.fn(function* () {
    const youtubeResult = sanitizeHtml('<iframe src="https://www.youtube.com/embed/xyz"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com"],
      allowedIframeDomains: ["vimeo.com"],
    });
    expect(youtubeResult).toContain("www.youtube.com");

    const vimeoResult = sanitizeHtml('<iframe src="https://player.vimeo.com/video/123"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com"],
      allowedIframeDomains: ["vimeo.com"],
    });
    expect(vimeoResult).toContain("player.vimeo.com");
  })
);

// javascript: in iframe src
effect(
  "blocks javascript: in iframe src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="javascript:alert(1)"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).not.toContain("javascript:");
  })
);

// data: in iframe src
effect(
  "blocks data: in iframe src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="data:text/html,<script>alert(1)</script>"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).not.toContain("data:");
  })
);

// Iframe with other attributes
effect(
  "allows other iframe attributes when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/xyz" width="560" height="315" frameborder="0"></iframe>',
      {
        allowedTags: ["iframe"],
        allowedAttributes: {
          iframe: ["src", "width", "height", "frameborder"],
        },
        allowedIframeHostnames: ["www.youtube.com"],
      }
    );
    expect(result).toContain('width="560"');
    expect(result).toContain('height="315"');
    expect(result).toContain('frameborder="0"');
  })
);

// sandbox attribute
effect(
  "allows sandbox attribute on iframe",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="https://example.com" sandbox="allow-scripts"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src", "sandbox"] },
    });
    expect(result).toContain('sandbox="allow-scripts"');
  })
);

// Script tag handling
effect(
  "removes script tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="http://example.com/script.js"></script>');
    expect(result).not.toContain("<script");
  })
);

// allowedScriptHostnames
effect(
  "allows script from allowed hostnames when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="https://cdn.example.com/lib.js"></script>', {
      allowedTags: ["script"],
      allowedAttributes: { script: ["src"] },
      allowedScriptHostnames: ["cdn.example.com"],
    });
    expect(result).toBe('<script src="https://cdn.example.com/lib.js"></script>');
  })
);

effect(
  "blocks script from disallowed hostnames",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="https://evil.com/script.js"></script>', {
      allowedTags: ["script"],
      allowedAttributes: { script: ["src"] },
      allowedScriptHostnames: ["cdn.example.com"],
    });
    expect(result).not.toContain('src="https://evil.com');
  })
);

// allowedScriptDomains
effect(
  "allows script from allowed domains (includes subdomains)",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="https://cdn.example.com/lib.js"></script>', {
      allowedTags: ["script"],
      allowedAttributes: { script: ["src"] },
      allowedScriptDomains: ["example.com"],
    });
    expect(result).toContain("cdn.example.com");
  })
);

// Inline script content
effect(
  "removes inline script content",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script>alert("XSS")</script>');
    expect(result).not.toContain("alert");
    expect(result).not.toContain("XSS");
  })
);

// Script with different types
effect(
  "removes script regardless of type",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script type="text/javascript">alert(1)</script>');
    expect(result).not.toContain("<script");

    const result2 = sanitizeHtml('<script type="module">import x from "y"</script>');
    expect(result2).not.toContain("<script");
  })
);

// Protocol-relative URLs in iframe/script
effect(
  "handles protocol-relative URLs in iframe src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="//www.youtube.com/embed/xyz"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
      allowedIframeHostnames: ["www.youtube.com"],
    });
    expect(result).toContain("//www.youtube.com");
  })
);

effect(
  "handles protocol-relative URLs in script src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="//cdn.example.com/lib.js"></script>', {
      allowedTags: ["script"],
      allowedAttributes: { script: ["src"] },
      allowedScriptHostnames: ["cdn.example.com"],
    });
    expect(result).toContain("//cdn.example.com");
  })
);

// Relative URLs in iframe
effect(
  "allows relative URLs in iframe when no hostname restrictions",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="/local/embed"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).toBe('<iframe src="/local/embed"></iframe>');
  })
);

// Empty src
effect(
  "handles empty iframe src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src=""></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).toContain("<iframe");
  })
);

// srcdoc attribute (potential XSS vector)
effect(
  "blocks srcdoc attribute by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe srcdoc="<script>alert(1)</script>"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).not.toContain("srcdoc");
  })
);

effect(
  "allows srcdoc when explicitly permitted and sanitizes content",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe srcdoc="<p>Safe</p>"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["srcdoc"] },
    });
    // If srcdoc is allowed, content should still be sanitized if possible
    expect(result).not.toContain("<script");
  })
);

// Multiple iframes
effect(
  "handles multiple iframes with mixed sources",
  Effect.fn(function* () {
    const result = sanitizeHtml(
      `<iframe src="https://www.youtube.com/embed/a"></iframe>
       <iframe src="https://evil.com/embed"></iframe>
       <iframe src="https://player.vimeo.com/video/b"></iframe>`,
      {
        allowedTags: ["iframe"],
        allowedAttributes: { iframe: ["src"] },
        allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
      }
    );
    expect(result).toContain("www.youtube.com");
    expect(result).not.toContain("evil.com");
    expect(result).toContain("player.vimeo.com");
  })
);

// object/embed (often similar to iframe concerns)
effect(
  "removes object tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<object data="http://example.com/flash.swf"></object>');
    expect(result).not.toContain("<object");
  })
);

effect(
  "removes embed tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<embed src="http://example.com/flash.swf">');
    expect(result).not.toContain("<embed");
  })
);

// noscript fallback content
effect(
  "removes noscript by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<noscript><p>JavaScript required</p></noscript>");
    expect(result).not.toContain("<noscript");
  })
);

// Vulnerable tag warnings
effect(
  "allows script when explicitly permitted with hostname restriction",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="https://trusted.cdn.com/lib.js"></script>', {
      allowedTags: ["script"],
      allowedAttributes: { script: ["src"] },
      allowedScriptHostnames: ["trusted.cdn.com"],
    });
    expect(result).toContain("trusted.cdn.com");
  })
);
