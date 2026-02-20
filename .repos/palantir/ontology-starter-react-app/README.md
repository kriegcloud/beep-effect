# ontology-starter-react-app

A simple skeleton application to get you started on React/TypeScript development on top of the Ontology SDK in Foundry.

## Prerequisites

1. Make sure you're on Node >= 18.5.0
    1. You can run `node -v` to check the version of Node you're using

## Getting started

1. Copy or make a fork of this repository (you can delete `.policy.yml`)
1. Run `npm install`
1. Create an application via the Foundry Developer Console with the configuration below. Once the application has been created, come back to these instructions.
    1. Follow the instructions in [Configure CORS](https://www.palantir.com/docs/foundry/administration/configure-cors/index.html) to add `http://localhost:8080` to your CORS policy in Control Panel.
    2. Select **client facing application** (creates a public client) when asked what type of application you're building. Creating a confidential client means you **cannot** login through the browser, and this cannot be changed after creating the app.
    3. Add `http://localhost:8080/auth/callback` as a redirect URL when asked for one
    4. If you know where your application is getting deployed, you can add your production URL as well: `https://example.app.com/auth/callback`
1. Follow the instructions in the Foundry Developer Console to generate and then install your application's Ontology SDK via the application-specific NPM registry
1. Run `mv .env.development.sample .env.development` to start setting up your environment variables, and fill in the fields marked with `<>`

    > Note: You can find your Client ID in the **Permissions & OAuth** page or in the **Getting started guide** inside your application's API documentation.

1. Update the following files with your Ontology SDK and Object types:
    1. Update [`src/utils/client.ts`](./src/utils/client.ts) with the correct package name
    1. Update [`src/pages/home.tsx`](./src/pages/home.tsx) with the correct package name and Ontology Objects you want to use.
1. Run `npm run dev`
1. Go to http://localhost:8080
    1. There will be a browser warning saying the site is untrusted, which is expected since this sample repository runs a HTTPS server on localhost with a self-signed certificate. You can safely click continue to start developing.

## Deploying to production

1. Store `FOUNDRY_CLIENT_ID`, `FOUNDRY_API_URL`, and `APPLICATION_REDIRECT_URL` in your CI/CD environment secret management system (see below for example documentation)
    1. [CircleCi](https://circleci.com/docs/env-vars/#private-keys-and-secrets)
    1. [GitHub Actions](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)
1. Run `mv .env.production.sample .env.production` to start setting up your environment variables, and fill in the fields marked with `<>`

1. Run `npm run build` or `npm run build-windows` if you are running on Windows machine.
1. Upload the resulting `dist/` directory to your hosting solution.

## Troubleshooting

### I'm getting `npm ERR! code E401` / `401 Unauthorized` when running `npm install`

When following the instructions in the Foundry Developer Console make sure to set up your Foundry API token in your local machine environment correctly in order to install your application's Ontology SDK via the application-specific NPM registry.

### I'm seeing `npm ERR! code SELF_SIGNED_CERT_IN_CHAIN` / `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` when running `npm run dev`

During local development API requests are routed through a [webpack-dev-server proxy](https://webpack.js.org/configuration/dev-server/#devserverproxy) via [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) to avoid Cross-Origin Resource Sharing (CORS) issues during development. These errors can happen if your production Foundry instance certificate is signed by a custom certificate authority (CA) that Node.js has not been set up to trust correctly.

If you have access to the trusted custom CA certificates you can add them to Node.js by setting up your environment as follows:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/your/cert.pem
```

### I do not have permission to add `http://localhost:8080` to my CORS policy in control panel

If you do not have permission to do so and can't get Foundry Admin to approve it you can use the following setup:

1. Add `https://localhost:8080/auth/callback` as a redirect URL in the Permission & OAuth tab on the left menu.
1. Run `mv .env.development.no-core.sample .env.development` to start setting up your environment variables, and fill in the fields marked with `<>`
1. Add the following section to your `devServer: ` section in the webpack.config.js file, after `port: 8080,`

```javaScript
    server: useLocalhostInCORS ? "http" : "https",
    proxy: useLocalhostInCORS
        ? []
        : [
                {
                    // This proxies calls from the browser to the configured Foundry instance
                    target: process.env.API_PROXY_TARGET_URL,
                    context: ["/multipass/api/**", "/api/**"],
                    changeOrigin: true,
                    secure: true,
                },
            ],
```

4. Test your application by running `npm run dev` and visiting https://localhost:8080 (note HTTPS and not HTTP)
    > Note you might get a security warning like "Your connection is not private" which is expected as we are using https.
