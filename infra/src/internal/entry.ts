import { loadV2TWorkstationStackArgs, V2TWorkstation } from "../V2T.js";

const workstation = new V2TWorkstation("v2t-workstation", loadV2TWorkstationStackArgs());

export const installedPackageName = workstation.installedPackageName;
export const graphitiProxyUrl = workstation.graphitiProxyUrl;
export const qwenBaseUrl = workstation.qwenBaseUrl;
export const localBackendUrl = workstation.localBackendUrl;
export const graphitiStateDir = workstation.graphitiStateDir;
export const qwenStateDir = workstation.qwenStateDir;
export const qwenServiceName = workstation.qwenServiceName;
export const graphitiProxyServiceName = workstation.graphitiProxyServiceName;
