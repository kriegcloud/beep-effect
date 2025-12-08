// Stage detection
export const isProduction = $app.stage === "production";
export const isDev = $dev;

// App metadata linkable
export const appData = new sst.Linkable("AppData", {
  properties: {
    name: $app.name,
    stage: $app.stage,
    isProduction,
    isDev,
  },
});

export const outputs = {
  stage: $app.stage,
};