---
title: HubSpot.config.ts
nav_order: 1
parent: "@beep/hubspot"
---

## HubSpot.config.ts overview

Runtime configuration models for the HubSpot driver.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [HUBSPOT_CRM_API_URL](#hubspot_crm_api_url)
  - [HUBSPOT_FORMS_API_URL](#hubspot_forms_api_url)
- [models](#models)
  - [HubSpotConfigInput (class)](#hubspotconfiginput-class)
---

# constants

## HUBSPOT_CRM_API_URL

Default HubSpot CRM API base URL.

**Example**

```ts
import { HUBSPOT_CRM_API_URL } from "@beep/hubspot"

console.log(HUBSPOT_CRM_API_URL) // "https://api.hubapi.com"
```

**Signature**

```ts
declare const HUBSPOT_CRM_API_URL: "https://api.hubapi.com"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.config.ts#L41)

Since v0.0.0

## HUBSPOT_FORMS_API_URL

Default HubSpot Forms API base URL.

**Example**

```ts
import { HUBSPOT_FORMS_API_URL } from "@beep/hubspot"

console.log(HUBSPOT_FORMS_API_URL) // "https://api.hsforms.com"
```

**Signature**

```ts
declare const HUBSPOT_FORMS_API_URL: "https://api.hsforms.com"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.config.ts#L26)

Since v0.0.0

# models

## HubSpotConfigInput (class)

Runtime configuration accepted by `HubSpot.makeLayer`.

**Example**

```ts
import { HubSpotConfigInput } from "@beep/hubspot"

const config = HubSpotConfigInput.make({
  accountId: "12345",
  formsApiUrl: "https://api.hsforms.com"
})

console.log(config.accountId) // "12345"
```

**Signature**

```ts
declare class HubSpotConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.config.ts#L61)

Since v0.0.0