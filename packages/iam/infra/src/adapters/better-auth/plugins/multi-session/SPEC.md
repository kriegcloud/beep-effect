# plugins: Multi Session
URL: /docs/plugins/multi-session
Source: https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/plugins/multi-session.mdx

Learn how to use multi-session plugin in Better Auth.
        
***

title: Multi Session
description: Learn how to use multi-session plugin in Better Auth.
------------------------------------------------------------------

The multi-session plugin allows users to maintain multiple active sessions across different accounts in the same browser. This plugin is useful for applications that require users to switch between multiple accounts without logging out.

## Installation

<Steps>
  <Step>
    ### Add the plugin to your **auth** config

    ```ts title="auth.ts"
    import { betterAuth } from "better-auth"
    import { multiSession } from "better-auth/plugins"

    export const auth = betterAuth({
        plugins: [ // [!code highlight]
            multiSession(), // [!code highlight]
        ] // [!code highlight]
    })
    ```
  </Step>

  <Step>
    ### Add the client Plugin

    Add the client plugin and Specify where the user should be redirected if they need to verify 2nd factor

    ```ts title="auth-client.ts"
    import { createAuthClient } from "better-auth/client"
    import { multiSessionClient } from "better-auth/client/plugins"

    export const authClient = createAuthClient({
        plugins: [
            multiSessionClient()
        ]
    })
    ```
  </Step>
</Steps>

## Usage

Whenever a user logs in, the plugin will add additional cookie to the browser. This cookie will be used to maintain multiple sessions across different accounts.

### List all device sessions

To list all active sessions for the current user, you can call the `listDeviceSessions` method.

### Client Side

```ts
const { data, error } = await authClient.multiSession.listDeviceSessions({});
```

### Server Side

```ts
const data = await auth.api.listDeviceSessions({

    // This endpoint requires session cookies.
    headers: await headers()
});
```

### Type Definition

```ts
type listDeviceSessions = {

}
```

### Set active session

To set the active session, you can call the `setActive` method.

### Client Side

```ts
const { data, error } = await authClient.multiSession.setActive({
    sessionToken: some-session-token,
});
```

### Server Side

```ts
const data = await auth.api.setActiveSession({
    body: {
        sessionToken: some-session-token,
    },
    // This endpoint requires session cookies.
    headers: await headers()
});
```

### Type Definition

```ts
type setActiveSession = {
    /**
     * The session token to set as active. 
     */
    sessionToken: string = "some-session-token"

}
```

### Revoke a session

To revoke a session, you can call the `revoke` method.

### Client Side

```ts
const { data, error } = await authClient.multiSession.revoke({
    sessionToken: some-session-token,
});
```

### Server Side

```ts
const data = await auth.api.revokeDeviceSession({
    body: {
        sessionToken: some-session-token,
    },
    // This endpoint requires session cookies.
    headers: await headers()
});
```

### Type Definition

```ts
type revokeDeviceSession = {
    /**
     * The session token to revoke. 
     */
    sessionToken: string = "some-session-token"

}
```

### Signout and Revoke all sessions

When a user logs out, the plugin will revoke all active sessions for the user. You can do this by calling the existing `signOut` method, which handles revoking all sessions automatically.

### Max Sessions

You can specify the maximum number of sessions a user can have by passing the `maximumSessions` option to the plugin. By default, the plugin allows 5 sessions per device.

```ts title="auth.ts"
import { betterAuth } from "better-auth"

export const auth = betterAuth({
    plugins: [
        multiSession({
            maximumSessions: 3
        })
    ]
})
```

