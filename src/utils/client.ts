// Replace the package name with your application's package name instead.
import { FoundryClient, PublicClientAuth } from "@ontology-starter/sdk";

/**
 * Initialize the client to interact with the Ontology SDK
 */
export const client = new FoundryClient({
    url: process.env.FOUNDRY_API_URL!,
    auth: new PublicClientAuth({
        clientId: process.env.FOUNDRY_CLIENT_ID!,
        url: process.env.FOUNDRY_API_URL!,
        redirectUrl: process.env.APPLICATION_REDIRECT_URL!,
    }),
});
