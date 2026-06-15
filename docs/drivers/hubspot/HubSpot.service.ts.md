---
title: HubSpot.service.ts
nav_order: 3
parent: "@beep/hubspot"
---

## HubSpot.service.ts overview

Effect service for HubSpot Forms API submissions.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HubSpotFormContext (class)](#hubspotformcontext-class)
  - [HubSpotFormField (class)](#hubspotformfield-class)
  - [HubSpotSubmitFormRequest (class)](#hubspotsubmitformrequest-class)
  - [HubSpotSubmitFormResponse (class)](#hubspotsubmitformresponse-class)
  - [HubSpotUpsertContactRequest (class)](#hubspotupsertcontactrequest-class)
  - [HubSpotUpsertContactResponse (class)](#hubspotupsertcontactresponse-class)
  - [HubSpotUpsertContactResult (class)](#hubspotupsertcontactresult-class)
- [services](#services)
  - [HubSpot (class)](#hubspot-class)
  - [HubSpotShape (type alias)](#hubspotshape-type-alias)
---

# models

## HubSpotFormContext (class)

HubSpot form submission context.

**Example**

```ts
import { HubSpotFormContext } from "@beep/hubspot"

const context = HubSpotFormContext.make({
  pageName: "Contact",
  pageUri: "https://example.com/contact"
})

console.log(context.pageName) // "Contact"
```

**Signature**

```ts
declare class HubSpotFormContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L85)

Since v0.0.0

## HubSpotFormField (class)

HubSpot form field submission value.

**Example**

```ts
import { HubSpotFormField } from "@beep/hubspot"

const field = HubSpotFormField.make({
  name: "email",
  value: "tom@example.com"
})

console.log(field.name) // "email"
```

**Signature**

```ts
declare class HubSpotFormField
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L57)

Since v0.0.0

## HubSpotSubmitFormRequest (class)

HubSpot form submission request.

**Example**

```ts
import { HubSpotSubmitFormRequest } from "@beep/hubspot"

const request = HubSpotSubmitFormRequest.make({
  fields: [{ name: "email", value: "tom@example.com" }],
  formGuid: "form-guid"
})

console.log(request.fields[0]?.value) // "tom@example.com"
```

**Signature**

```ts
declare class HubSpotSubmitFormRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L114)

Since v0.0.0

## HubSpotSubmitFormResponse (class)

HubSpot form submission response.

**Example**

```ts
import { HubSpotSubmitFormResponse } from "@beep/hubspot"

const response = HubSpotSubmitFormResponse.make({
  inlineMessage: "Thanks"
})

console.log(response.inlineMessage) // "Thanks"
```

**Signature**

```ts
declare class HubSpotSubmitFormResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L143)

Since v0.0.0

## HubSpotUpsertContactRequest (class)

HubSpot contact upsert request using email as the stable identifier.

**Example**

```ts
import { HubSpotUpsertContactRequest } from "@beep/hubspot"

const request = HubSpotUpsertContactRequest.make({
  email: "tom@example.com",
  properties: {
    firstname: "Tom"
  }
})

console.log(request.properties.firstname) // "Tom"
```

**Signature**

```ts
declare class HubSpotUpsertContactRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L173)

Since v0.0.0

## HubSpotUpsertContactResponse (class)

HubSpot contact upsert response.

**Example**

```ts
import { HubSpotUpsertContactResponse } from "@beep/hubspot"

const response = HubSpotUpsertContactResponse.make({
  results: [{ id: "contact-id" }],
  status: "COMPLETE"
})

console.log(response.results[0]?.id) // "contact-id"
```

**Signature**

```ts
declare class HubSpotUpsertContactResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L228)

Since v0.0.0

## HubSpotUpsertContactResult (class)

HubSpot contact upsert result.

**Example**

```ts
import { HubSpotUpsertContactResult } from "@beep/hubspot"

const result = HubSpotUpsertContactResult.make({
  id: "contact-id"
})

console.log(result.id) // "contact-id"
```

**Signature**

```ts
declare class HubSpotUpsertContactResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L201)

Since v0.0.0

# services

## HubSpot (class)

Effect service for HubSpot Forms API submissions.

**Example**

```ts
import { HubSpot, HubSpotConfigInput } from "@beep/hubspot"

const layer = HubSpot.makeLayer(
  HubSpotConfigInput.make({
    accountId: "12345"
  })
)

console.log(layer)
```

**Signature**

```ts
declare class HubSpot
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L480)

Since v0.0.0

## HubSpotShape (type alias)

Public HubSpot service shape.

**Example**

```ts
import {
  HubSpotSubmitFormResponse,
  HubSpotUpsertContactResponse,
  type HubSpotShape
} from "@beep/hubspot"
import { Effect } from "effect"

const service = {
  submitForm: () => Effect.succeed(HubSpotSubmitFormResponse.make({ inlineMessage: "Thanks" })),
  upsertContact: () =>
    Effect.succeed(HubSpotUpsertContactResponse.make({ results: [{ id: "contact-id" }] }))
} satisfies HubSpotShape

console.log(service)
```

**Signature**

```ts
type HubSpotShape = {
  readonly submitForm: (request: HubSpotSubmitFormRequest) => Effect.Effect<HubSpotSubmitFormResponse, HubSpotError>;
  readonly upsertContact: (
    request: HubSpotUpsertContactRequest
  ) => Effect.Effect<HubSpotUpsertContactResponse, HubSpotError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/hubspot/src/HubSpot.service.ts#L264)

Since v0.0.0