import { FoundryService } from "../services/getFoundryServices";

export type Environment = PipelinesEnvironment | FunctionsEnvironment;

export interface PipelinesEnvironment {
  type: "pipelines";
  buildToken: string;
}

export interface FunctionsEnvironment {
  type: "functions";
  /**
   * If the compute module is in Application mode, this will provide the client ID and client secret
   * for the third-party application that is being used to authenticate with Foundry.
   * 
   * These are provided by the environment variables CLIENT_ID and CLIENT_SECRET.
   */
  thirdPartyApplication?: {
    clientId: string;
    clientSecret: string;
  }
}
