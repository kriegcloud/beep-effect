export type ReCaptchaInstance = {
  execute?:
    | undefined
    | ((clientIdOrReCaptchaKey: number | string, options: { action?: undefined | string }) => Promise<string>);
  render?: undefined | ((container: string | HTMLElement, options: Record<string, unknown>) => number);
};

export type ScriptProps = {
  appendTo?: undefined | "head" | "body";
  async?: undefined | boolean;
  defer?: undefined | boolean;
  id?: undefined | string;
  nonce?: undefined | string;
  src: string;
};
