# Security, PWA, And Lighthouse Research

## Recommendation

Target an MDN Observatory A+ posture and Lighthouse 100s on staging by keeping
third-party scripts out of v1, enforcing strict headers through the repo-owned
Next config, and making the PWA install surface explicit.

## Decisions

- Enforce `Strict-Transport-Security` only on deployed HTTPS hosts.
- Use a conservative CSP for app routes. Keep development-only `react-grab`
  isolated behind `NEXT_PUBLIC_REACT_GRAB=1`.
- Preserve `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, and a narrow `Permissions-Policy`.
- Add 192px and 512px PNG icons and a maskable purpose entry.
- Keep service worker caching conservative. Legal content must remain fresh
  enough for review-gated updates.
- Do not add HubSpot tracking scripts or Resend in v1.

## Verification

- Next build and PWA build both pass.
- Browser console has no hydration/runtime errors.
- Staging Lighthouse targets 100 Performance, Accessibility, Best Practices,
  and SEO.
- MDN Observatory target is A+ after staging deploy.
