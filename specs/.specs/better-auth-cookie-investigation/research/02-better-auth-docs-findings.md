# Better Auth Documentation Findings: Cookie Handling and Cross-Origin Setup

**Research Date:** 2026-01-06
**Source:** Better Auth Official Documentation via Context7
**Library ID:** `/www.better-auth.com/llmstxt` (Benchmark Score: 85.1)

---

## Table of Contents

1. [Cookie Configuration](#1-cookie-configuration)
2. [CORS Configuration](#2-cors-configuration)
3. [Cross-Origin Cookie Handling](#3-cross-origin-cookie-handling)
4. [Proxy and API Gateway Considerations](#4-proxy-and-api-gateway-considerations)
5. [Using returnHeaders Option](#5-using-returnheaders-option)
6. [Session Cookie Creation Flow](#6-session-cookie-creation-flow)
7. [Troubleshooting Cookies Not Being Set](#7-troubleshooting-cookies-not-being-set)
8. [Client-Side Configuration Requirements](#8-client-side-configuration-requirements)
9. [Summary and Recommendations](#9-summary-and-recommendations)

---

## 1. Cookie Configuration

### Default Cookie Behavior

From the official security documentation:

> Better Auth assigns secure cookies by default when the base URL uses `https`. These secure cookies are encrypted and only sent over secure connections, adding an extra layer of protection. They are also set with the `sameSite` attribute to `lax` by default to prevent cross-site request forgery attacks, and the `httpOnly` attribute is enabled to prevent client-side JavaScript from accessing the cookie.

**Default cookie attributes:**
- `secure`: `true` (when base URL is HTTPS)
- `sameSite`: `lax`
- `httpOnly`: `true`

### Advanced Cookie Configuration

Better Auth provides comprehensive cookie customization through the `advanced` configuration:

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  advanced: {
    // Force secure cookies in all environments
    useSecureCookies: true,

    // CSRF protection (enabled by default)
    disableCSRFCheck: false,

    // Cookie prefix for all cookies
    cookiePrefix: "myapp",

    // Default attributes applied to ALL cookies
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "lax"  // or "none" for cross-domain
    },

    // Per-cookie customization
    cookies: {
      session_token: {
        name: "custom_session_token",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "lax"
        }
      },
      // Other cookies: session_data, dont_remember
    },

    // Cross-subdomain cookie sharing
    crossSubDomainCookies: {
      enabled: true,
      additionalCookies: ["custom_cookie"],
      domain: "example.com"  // Root domain for subdomain sharing
    },

    // IP address tracking
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false
    }
  }
});
```

### Force Secure Cookies

To force cookies to always be secure (HTTPS only) regardless of environment:

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  advanced: {
    useSecureCookies: true
  }
});
```

> By default, cookies are secure only in production mode, but this setting ensures secure transmission in all environments.

---

## 2. CORS Configuration

### Express Integration

```typescript
import express from "express";
import cors from "cors";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

const app = express();

app.use(
  cors({
    origin: "http://your-frontend-domain.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true  // CRITICAL: Required for cookies
  })
);
```

### Fastify Integration

```typescript
import fastifyCors from "@fastify/cors";

fastify.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ],
  credentials: true,  // CRITICAL: Required for cookies
  maxAge: 86400
});

// Mount authentication handler AFTER CORS registration
```

### Key CORS Requirements

From the documentation:

> CORS (Cross-Origin Resource Sharing) configuration is essential for securing your API endpoints when integrating Better Auth. The configuration should include GET, POST, PUT, and DELETE methods, and must explicitly allow necessary headers like Content-Type, Authorization, and X-Requested-With. In production environments, always restrict CORS origins to specific domains and use environment variables for dynamic configuration.

**Critical settings:**
- `credentials: true` - **MANDATORY** for cookie transmission
- Specific `origin` - Must match your frontend domain exactly
- Do not use `origin: "*"` with `credentials: true`

---

## 3. Cross-Origin Cookie Handling

### Same-Site vs Cross-Domain Cookies

From the Hono integration documentation:

> Better Auth cookies are set with `SameSite=Lax` by default, which provides security while allowing same-site requests. For cross-domain cookie scenarios, you can enable `crossSubDomainCookies` to work across subdomains while maintaining `SameSite=Lax`. If cross-domain usage across different domains is necessary, you can set `SameSite=None` and `Secure=true` through `defaultCookieAttributes` in the `createAuth` configuration.

### Cross-Domain Configuration (Different Domains)

When frontend and backend are on **completely different domains**, use `SameSite=None`:

```typescript
export const auth = createAuth({
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true  // New browser standard for foreign cookies
    }
  }
});
```

**Important:** The `partitioned` attribute follows new browser standards for third-party cookies and may be required for cross-domain scenarios in modern browsers.

### Cross-Subdomain Configuration (Same Root Domain)

When frontend and backend share the same root domain (e.g., `app.example.com` and `api.example.com`):

```typescript
export const auth = betterAuth({
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      additionalCookies: ["custom_cookie"],
      domain: "example.com"  // Root domain without subdomain
    }
  }
});
```

This approach:
- Keeps `SameSite=Lax` for better security
- Sets cookie `domain` to root domain for subdomain sharing
- More secure than `SameSite=None`

### Per-Cookie Attribute Override

For fine-grained control over individual cookies:

```typescript
export const auth = createAuth({
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          partitioned: true
        }
      }
    }
  }
});
```

---

## 4. Proxy and API Gateway Considerations

### IP Address Headers

When behind a reverse proxy or API gateway, configure IP address headers:

```typescript
export const auth = betterAuth({
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false
    }
  }
});
```

### Next.js Middleware Considerations

From the migration guide:

> Proxy (Middleware) is not intended for slow data fetching. While Proxy can be helpful for optimistic checks such as permission-based redirects, it should not be used as a full session management or authorization solution.

> In Next.js proxy/middleware, it is recommended to only check for the existence of a session cookie to handle redirection, rather than making API or database calls. This approach avoids blocking requests and improves performance by using lightweight session validation.

**Recommended middleware approach:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/login", "/signup"]
};
```

### Server-Side Session Verification

For full session validation (not just cookie existence):

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
    </div>
  );
};
```

> Preferred approach for resource protection as it avoids proxy/middleware performance concerns.

---

## 5. Using returnHeaders Option

### Getting Headers from API Calls

When calling Better Auth API endpoints on the server, you can retrieve response headers including `Set-Cookie`:

```typescript
const { headers, response } = await auth.api.signUpEmail({
  returnHeaders: true,
  body: {
    email: "john@doe.com",
    password: "password",
    name: "John Doe"
  }
});

// Access headers
const cookies = headers.get("set-cookie");
const customHeader = headers.get("x-custom-header");
```

### Getting Full Response Object

For complete control, use `asResponse`:

```typescript
const response = await auth.api.signInEmail({
  body: {
    email: "john@doe.com",
    password: "password"
  },
  asResponse: true  // Returns full Response object
});

// Access status, headers, body, etc.
const status = response.status;
const setCookieHeader = response.headers.get("set-cookie");
```

### Use Cases for returnHeaders

From the documentation:

> When you invoke an API endpoint on the server, it will return a standard JavaScript object or array directly as it's just a regular function call. However, there are times when you might want to get the `headers` or the `Response` object instead. For example, if you need to get the cookies or the headers, you can pass the `returnHeaders` option to the endpoint.

**Common use cases:**
- Manual cookie forwarding in SSR scenarios
- Custom response handling in API routes
- Debugging cookie issues
- Integration with external frameworks

---

## 6. Session Cookie Creation Flow

### Sign Up Flow

**Client-Side:**

```typescript
const { data, error } = await authClient.signUp.email({
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password1234",
  image: "https://example.com/image.png",  // optional
  callbackURL: "https://example.com/callback"  // optional
});
```

**Server-Side:**

```typescript
const data = await auth.api.signUpEmail({
  body: {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password1234",
    image: "https://example.com/image.png",
    callbackURL: "https://example.com/callback"
  }
});
```

### Sign In Flow

**Client-Side:**

```typescript
const { data, error } = await authClient.signIn.email({
  email: "john.doe@example.com",
  password: "password1234",
  rememberMe: true,  // optional - controls session persistence
  callbackURL: "https://example.com/callback"  // optional
});
```

**Server-Side:**

```typescript
const data = await auth.api.signInEmail({
  body: {
    email: "john.doe@example.com",
    password: "password1234",
    rememberMe: true,
    callbackURL: "https://example.com/callback"
  },
  headers: await headers()  // Required for session cookies
});
```

### Server-Side with Response Handling

For server-side sign-in with explicit cookie handling:

```typescript
import { auth } from "./auth";

const response = await auth.api.signInEmail({
  body: {
    email,
    password
  },
  asResponse: true  // Returns a response object for cookie handling
});
```

---

## 7. Troubleshooting Cookies Not Being Set

### Common Issues and Solutions

#### Issue 1: Secure Cookies on HTTP

**Symptom:** Cookies not set in development (HTTP)
**Solution:** Cookies marked `secure: true` only work over HTTPS

```typescript
// Development workaround (NOT for production)
advanced: {
  useSecureCookies: false  // Only in development
}
```

Or use HTTPS in development with a self-signed certificate.

#### Issue 2: SameSite Restrictions

**Symptom:** Cookies blocked in cross-origin requests
**Solution:** Configure appropriate SameSite attribute

```typescript
advanced: {
  defaultCookieAttributes: {
    sameSite: "none",  // For cross-domain
    secure: true,      // Required with sameSite: "none"
    partitioned: true  // For modern browsers
  }
}
```

#### Issue 3: CORS credentials Not Enabled

**Symptom:** Cookies not included in requests
**Solution:** Enable credentials in CORS and fetch

Server:
```typescript
cors({
  origin: "https://your-frontend.com",
  credentials: true
})
```

Client:
```typescript
fetch(url, {
  credentials: "include"
});
```

#### Issue 4: Missing Domain Attribute

**Symptom:** Cookies not shared between subdomains
**Solution:** Configure cross-subdomain cookies

```typescript
advanced: {
  crossSubDomainCookies: {
    enabled: true,
    domain: "example.com"
  }
}
```

#### Issue 5: httpOnly Preventing JavaScript Access

**Symptom:** Cannot read cookie via JavaScript
**Expected behavior:** This is intentional security

> The `httpOnly` attribute is enabled to prevent client-side JavaScript from accessing the cookie.

Use server-side session checks instead of client-side cookie reading.

---

## 8. Client-Side Configuration Requirements

### Auth Client Setup

The client must be configured to include credentials in requests. Better Auth's client handles this automatically, but custom fetch calls need:

```typescript
fetch(authEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",  // CRITICAL for cookies
  body: JSON.stringify(data)
});
```

### TanStack Query / React Query Integration

When using React Query or similar:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0], {
          credentials: "include"
        });
        return res.json();
      }
    }
  }
});
```

### Session Checking on Client

For checking session existence (lightweight):

```typescript
import { getSessionCookie } from "better-auth/cookies";

// In middleware or server component
const sessionCookie = getSessionCookie(request);
```

---

## 9. Summary and Recommendations

### For Cross-Origin Setups (Different Domains)

1. **Server Configuration:**
   ```typescript
   export const auth = betterAuth({
     advanced: {
       defaultCookieAttributes: {
         sameSite: "none",
         secure: true,
         partitioned: true
       }
     }
   });
   ```

2. **CORS Configuration:**
   ```typescript
   cors({
     origin: "https://your-frontend-domain.com",  // Exact match
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
   });
   ```

3. **Client Configuration:**
   - All fetch requests must include `credentials: "include"`
   - Better Auth client handles this automatically

### For Subdomain Setups (Same Root Domain)

1. **Prefer crossSubDomainCookies over SameSite=None:**
   ```typescript
   export const auth = betterAuth({
     advanced: {
       crossSubDomainCookies: {
         enabled: true,
         domain: "example.com"
       }
     }
   });
   ```

2. This maintains `SameSite=Lax` for better security.

### Known Issues / Warnings

1. **Do not use `origin: "*"` with `credentials: true`** - browsers will block this
2. **Secure cookies require HTTPS** - use proper certificates in development
3. **partitioned attribute** may be required for Chrome's third-party cookie restrictions
4. **Middleware should only check cookie existence** - avoid database calls in middleware
5. **CSRF protection is enabled by default** - only disable if you understand the risks

### Debug Checklist

When cookies are not being set:

- [ ] Check browser DevTools Network tab for `Set-Cookie` header
- [ ] Verify CORS `origin` matches exactly (protocol, domain, port)
- [ ] Confirm `credentials: true` in CORS config
- [ ] Confirm `credentials: "include"` in client fetch
- [ ] Check `secure` attribute matches protocol (HTTPS for secure)
- [ ] Verify `sameSite` attribute is appropriate for your setup
- [ ] Test with browser DevTools Application > Cookies
- [ ] Check for browser third-party cookie blocking settings
