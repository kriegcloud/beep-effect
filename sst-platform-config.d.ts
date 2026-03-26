type SstStage = string;

interface SstAppInput {
  stage: SstStage;
}

interface SstAwsProviderConfig {
  profile?: string;
  region?: string;
}

interface SstAppConfig {
  home: string;
  name: string;
  protect?: boolean;
  providers?: {
    aws?: SstAwsProviderConfig | boolean | string;
  };
  removal?: string;
}

interface SstConfig {
  app(input: SstAppInput): SstAppConfig | Promise<SstAppConfig>;
  run(): void | Promise<void>;
}

declare global {
  const $config: <T extends SstConfig>(config: T) => T;
}

export {};
