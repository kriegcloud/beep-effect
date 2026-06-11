# CSF-005: Unrestricted Box URL operations enable SSRF

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 9d8e7ac |
| Reported age | 1d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/drivers/box |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced: the commit changed the Box package from a stub to a full SDK wrapper and added URL-taking operations without host allowlisting or private-network protection.

The generator-first Box driver wraps several Box SDK operations whose contract accepts a full URL, including `zipDownloads.getZipDownloadContent`, `chunkedUploads.*ByUrl`, and the handwritten `uploadFilePartByUrl` adapter. The added schemas only require `S.String` and the operation wrappers pass the value directly to the SDK. If this driver is used behind an HTTP/RPC API or as an LLM/tool surface with attacker-controlled payloads, an attacker can cause the server to make outbound requests to arbitrary hosts such as localhost, private network services, or cloud metadata endpoints. `getZipDownloadContent` is especially risky because it returns a byte stream to the caller, turning the issue into a readable SSRF primitive.

## Codex Patch

No patch provided by Codex.

- Patch status: _pending P5_

## Current-HEAD Triage

- Verdict: _pending P2_
- Disposition: _pending P2_
- Rationale: _pending P2_
- Remediation status: _pending P5_
- Lane: _pending P4_
- Verification command: _pending P2_
- Changed files: _pending P5_
- Verification notes: _pending P5_

## Evidence Paths

- packages/drivers/box/src/_generated/Box.models.gen.ts
- packages/drivers/box/src/_generated/Box.operations.gen.ts
- packages/drivers/box/src/Box.streaming.ts

## Validation Notes From Codex

- Confirm the commit introduced public Box driver operations that accept caller-controlled full URL strings (downloadUrl or url).
- Confirm runtime schemas validate those URL fields only as generic strings, not as Box-owned HTTPS URLs and not with DNS/private-network checks.
- Confirm wrappers pass decoded URL fields directly into Box SDK methods without intermediate validation or normalization.
- Confirm at least one URL-taking download operation returns a byte stream to the caller, making response disclosure possible.
- Attempt dynamic reproduction and debugger/valgrind/crash-oriented checks before relying on code understanding; document dependency/tooling blockers.

## Sanitized Finding Content

```text
Finding
Unrestricted Box URL operations enable SSRF
Report
Chat
Severity
Medium

Commit
9d8e7ac
1:32 AM Jun 7, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced: the commit changed the Box package from a stub to a full SDK wrapper and added URL-taking operations without host allowlisting or private-network protection.

The generator-first Box driver wraps several Box SDK operations whose contract accepts a full URL, including `zipDownloads.getZipDownloadContent`, `chunkedUploads.*ByUrl`, and the handwritten `uploadFilePartByUrl` adapter. The added schemas only require `S.String` and the operation wrappers pass the value directly to the SDK. If this driver is used behind an HTTP/RPC API or as an LLM/tool surface with attacker-controlled payloads, an attacker can cause the server to make outbound requests to arbitrary hosts such as localhost, private network services, or cloud metadata endpoints. `getZipDownloadContent` is especially risky because it returns a byte stream to the caller, turning the issue into a readable SSRF primitive. These methods should either not be exposed to untrusted callers or should validate scheme and host against Box-owned download/upload domains and reject localhost/private IP destinations after DNS resolution.

Validation
Confirm the commit introduced public Box driver operations that accept caller-controlled full URL strings (downloadUrl or url).
Confirm runtime schemas validate those URL fields only as generic strings, not as Box-owned HTTPS URLs and not with DNS/private-network checks.
Confirm wrappers pass decoded URL fields directly into Box SDK methods without intermediate validation or normalization.
Confirm at least one URL-taking download operation returns a byte stream to the caller, making response disclosure possible.
Attempt dynamic reproduction and debugger/valgrind/crash-oriented checks before relying on code understanding; document dependency/tooling blockers.

Evidence
packages/drivers/box/src/_generated/Box.models.gen.ts (by-URL payload schemas use url: S.String)
packages/drivers/box/src/_generated/Box.operations.gen.ts (chunkedUploads.*ByUrl pass decoded.url directly to SDK)
packages/drivers/box/src/Box.streaming.ts (uploadFilePartByUrl and getZipDownloadContent pass url/downloadUrl directly; getZipDownloadContent returns a byte stream)

Attack-path analysis

No severity change. The source evidence validates the core claim: by-URL payloads are S.String and are passed directly to SDK methods, with a readable stream returned for getZipDownloadContent. This supports medium severity because the security impact can be meaningful SSRF/data exposure in an exposed server or LLM/tool deployment. It does not justify high/critical in this repository context because there is no proven unauthenticated/public in-repo endpoint invoking @beep/box, the package is a private workspace package, and exploitation depends on integration choices outside the reviewed artifacts.

Path
Untrusted caller / tool argument --supplies payload--> Host app exposing @beep/box operation --forwards attacker-controlled url string--> @beep/box schema accepts url/downloadUrl as S.String --no scheme/host/private-IP validation--> Wrapper invokes box-node-sdk by-URL method --outbound request to supplied URL--> Local/private/metadata endpoint --streamed response or upload side effect--> Response bytes returned or request body sent

Likelihood
Low - The vulnerable driver code is exported and easy to misuse, and earlier validation demonstrated the wrapper itself does not block localhost URLs. However exploitation requires an additional host application or tool/RPC integration to expose these methods to untrusted callers, which static review did not prove in this checkout.
Impact
Medium - If the affected methods are exposed by a server/tool surface, an attacker can force outbound requests to localhost/private/metadata endpoints. getZipDownloadContent can return response bytes, creating a readable SSRF primitive; uploadFilePartByUrl can send attacker-controlled bytes. Impact is reduced from high because no default in-repo public exposure path was identified.
Controls
Effect Schema decoding validates object shape and primitive string type only.
AbortController cancellation is merged into SDK calls.
Secrets are represented as Redacted values for CLOUD_BOX_TOKEN configuration.
No in-package URL allowlist, private-IP filter, redirect validation, or egress policy was found.
No concrete public ingress or listening port for @beep/box was found in repository artifacts.
```
