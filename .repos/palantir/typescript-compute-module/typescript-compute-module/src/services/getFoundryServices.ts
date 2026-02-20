import yaml from "js-yaml";
import fs from "fs";

export enum FoundryService {
  /**
   * Used to push streaming records to Foundry, read more at https://www.palantir.com/docs/foundry/data-connection/push-based-ingestion/
   * This will likely be formatted as: `https://my-instance.palantirfoundry.com/stream-proxy/api`
   */
  STREAM_PROXY = "stream_proxy",
  /**
   * Used for access to the Foundry API as documented at https://www.palantir.com/docs/foundry/api/general/overview/introduction/
   * This will likely be formatted as: `https://my-instance.palantirfoundry.com/api`
   */
  API_GATEWAY = "api_gateway",
  /**
   * Used to interact with Foundry's media sets, see https://www.palantir.com/docs/foundry/data-integration/media-sets/
   * This will likely be formatted as: `https://my-instance.palantirfoundry.com/mio/api`
   */
  MIO = "foundry_mio",
}

let cachedServices: Record<FoundryService, string | undefined> | null = null;
/**
 * Used to discover the location of Foundry services for interaction with the Foundry API
 */
export const getFoundryServices = () => {
  if (cachedServices == null) {
    const serviceDiscoveryFileContents = fs.readFileSync(
      process.env["FOUNDRY_SERVICE_DISCOVERY_V2"] as string,
      "utf-8"
    );
    const serviceDiscoveryYaml = yaml.load(serviceDiscoveryFileContents) as {
      [id: string]: [string];
    };
    cachedServices = Object.fromEntries(
      Object.entries(serviceDiscoveryYaml).map(([key, value]) => [
        key,
        value[0],
      ])
    ) as Record<FoundryService, string | undefined>;
  }
  return cachedServices;
};
