<p align="right">
<a href="https://autorelease.general.dmz.palantir.tech/palantir/foundry-platform-typescript"><img src="https://img.shields.io/badge/Perform%20an-Autorelease-success.svg" alt="Autorelease"></a>
</p>

# foundry-platform-typescript

The Foundry and Gotham Platform Typescript SDKs provide helpful TypeScript bindings for the APIs listed in the [Foundry API documentation](https://www.palantir.com/docs/foundry/api/) and select Gotham APIs. Packages are available on NPM for each API namespace as [`@osdk/foundry.{namespace}`](https://www.npmjs.com/search?q=%40osdk%2Ffoundry) or [`@osdk/gotham.{namespace}`](...). The SDK can be used either with an [Ontology SDK](https://www.palantir.com/docs/foundry/ontology-sdk/overview/) client (for easy use alongside a generated Ontology SDK) or with a standalone platform SDK client.

## Using the Platform SDKs

### Installation

You can install the package for a specific namespace.

```bash
npm install @osdk/foundry.{namespace}
```

Alternatively, you can install all API namespaces from a single package.

```bash
npm install @osdk/foundry
```

### Creating the Client

All of the Platform SDK endpoints will require a client to be passed in. The client can be created via a method exported from the `@osdk/client` npm package.

To create your client, you will need to create an application in the Developer Console app on your Foundry stack. You will need the client ID as well as the base url of your foundry stack and a redirect URL that you can configure in Developer Console.

Note that creating a client this way means that your client is not tied to a specific ontology, and can be used across different ontologies on your stack.

```typescript
import { createPlatformClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";

const stack =
  "<TODO: hostname of your Foundry instance, e.g. https://foundry.example.com>";

// Your OAuth2 client ID from Developer Console.
const clientId =
  "<TODO: OAuth2 client ID from the Developer Console overview page>";

// The URL of your app you want to redirect to
const redirectUrl = "http://localhost:8080";

const auth = createPublicOauthClient(clientId, stack, redirectUrl);
const client = createPlatformClient(stack, auth);
```

Alternatively, if you want to create a client to be used alongside the TypeScript [Ontology SDK](https://www.palantir.com/docs/foundry/ontology-sdk/overview/), you will need an ontology RID as well.

```typescript
import { createClient } from "@osdk/client";

const ontologyRid =
  "<TODO: The RID of your ontology. You can find this in the Ontology Manager application>";

const client = createClient(stack, ontologyRid, auth);
```

### Using the Platform SDKs

Below is an example of how to use your installed SDK and client to hit a Foundry endpoint.

```typescript
import { Users } from "@osdk/foundry.admin"

const client = //Client created above

const currentUser = await Users.getCurrent(client, { preview: true });

console.log(currentUser)
```

## Hello world example

The following is a complete, annotated example of a "hello, world" web app using the Platform SDK to greet users by name.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello world!</title>
    <!-- Load dependencies from a CDN. In production, most developers use a dependency and build
         system like npm instead. -->
    <script type="importmap">
      {
        "imports": {
          "vue": "https://cdn.jsdelivr.net/npm/vue@3.5.11/dist/vue.esm-browser.min.js",
          "@osdk/client": "https://cdn.jsdelivr.net/npm/@osdk/client@2.0.4/+esm",
          "@osdk/oauth": "https://cdn.jsdelivr.net/npm/@osdk/oauth@1.0.0/+esm",
          "@osdk/foundry.admin": "https://cdn.jsdelivr.net/npm/@osdk/foundry.admin@2.1.0/+esm"
        }
      }
    </script>
  </head>
  <body>
    <h1>Hello world!</h1>
    <!-- The contents of our vue app. -->
    <div id="app">
      <!-- Suspense handles the fact that Greeting is an async component, since it needs to wait on
           the network to load our name and greet us. -->
      <Suspense>
        <!-- Greeting is the main component of our app, defined below. -->
        <Greeting />
      </Suspense>
    </div>
    <script type="module">
      import { createApp } from "vue"
      // Create a standalone platform SDK client. Users can also use an OSDK client created with
      // `createClient` if they have an Ontology SDK.
      import { createPlatformClient } from "@osdk/client"
      // Create a public OAuth2 client. OSDK clients and Platform SDK clients use the same auth
      // client types.
      import { createPublicOauthClient } from "@osdk/oauth"
      // The admin endpoints, which include our getCurrentUser endpoint.
      import { Users } from "@osdk/foundry.admin"

      // The hostname of your Foundry instance, like `https://foundry.example.com`.
      const stack = "<TODO: hostname of your Foundry instance, e.g. https://foundry.example.com>";
      // Your OAuth2 client ID from Developer Console.
      const clientId = "<TODO: OAuth2 client ID from the Developer Console overview page>";
      // The URL of your app (this HTML page).
      const redirectUrl = "http://localhost:8080";

      const auth = createPublicOauthClient(clientId, stack, redirectUrl);
      const client = createPlatformClient(stack, auth);

      createApp({})
      .component('Greeting', {
        // Use the Platform SDK to call the getCurrentUser endpoint with the client we created.
        // Await the result before rendering the greeting template below.
        async setup() {
          return {
            user: await Users.getCurrent(client, { preview: true }),
          }
        },
        template: `<p>Hello, <b>{{ user.givenName }}</b>!</p>`
      })
      .mount('#app');
    </script>
  </body>
</html>
```

To run this example, do the following:

1. Copy the above HTML into an editor and save it as (for example) `~/Desktop/test-website/index.html`.
2. In Foundry, open the Developer Console and create a new third-party application for your web app. Set `http://localhost:8080` as a redirect URL (do not include a path like `/auth/callback`).
3. Copy your client ID and Foundry hostname into the spaces labeled `TODO` in the code.
4. In terminal, run `cd ~/Desktop/test-website`.
5. Start a web server to serve the file by running `python3 -m http.server 8080` (or your preferred web server).
6. Navigate to `http://localhost:8080` in your browser and authenticate your app with Foundry.
7. Enjoy being greeted by name!

## Dev workflow

Note: some of these workflows are internal to Palantir. It is not expected that external developers will be able to perform all of the below workflows.

1. Fork the repo
2. Create a branch
3. Palantir-internal developers only: copy `.envrc.sample` into `.envrc` and populate the variables
4. Run `source .envrc` (if necessary)
5. `pnpm install`
6. Add your code
7. Add a changeset
   1. Assuming you've run `pnpm install`, run `changeset` (or `pnpm exec changeset`).
   2. The tool will split things into changed vs unchanged packages (which you may need if you decide to add changeset logs in a future PR for past features)
   3. Select the packages you want the changeset applied to using the arrow keys (up/down) and space-bar to "select" the package.
   4. Press enter to continue.
   5. Select which packages need major/minor/patch bumps. Typically you should not select anything here and always use patch bumps. We will then bump the major and minor version separately as needed.
   6. Enter a change (or press enter on empty to open your editor.)
   7. Make sure you include a changeset for each changed package.
8. If you're curious what the final build output might look like you can run `pnpm build` from root. 
9. Run all lint rules and tests with `pnpm check` from root.

### Updating Platform SDKs

1. Follow the dev workflow above
2. Run `scripts/getOpenApiIr.sh`
3. Run `scripts/generatePlatformSdk.sh`
4. Remember to add a changeset (following the instructions above)
5. Commit and open a PR

### Updating OSDK docs specification

1. Follow the dev workflow above
2. Edit `packages/docs-spec-sdk/src/spec.ts`
3. Remember to add a changeset (following the instructions above)
4. Commit and open a PR

### Adding a new namespace
If you are generating a new SDK for the first time, you must add it to the namespace mapping in `getNamespacePlatform.ts`:
```js
export function getNamespacePlatform(ns?: string): string {
  const namespaceMapping: { [key: string]: string } = {
    "Core": "both",
    "TargetWorkbench": "gotham",
    "Gaia": "gotham",
    "Admin": "foundry",
    "AipAgents": "foundry",
    ...
  };
  return ns ? (namespaceMapping[ns] ?? "foundry") : "foundry";
}
```
For your namespace to be generated in the correct platform (Gotham or Foundry), it must exist in the mapping. Unknown namespaces will throw an error until you provide a correct mapping.
With the exception of the "Core" namespace, all namespaces must map to either the "gotham" or "foundry" platform.

### Publishing a release

1. Create a new branch on this repo, not your forked repo.
2. Follow the dev workflow above
3. Run `scripts/createReleasePr.sh`
4. Merge the PR (Github Actions will publish it)
5. The new npm package version should be visible in 20-30 minutes.
  - Foundry: https://www.npmjs.com/package/@osdk/foundry
  - Gotham: https://www.npmjs.com/package/@osdk/gotham
