import { EnvValue } from "@beep/constants";
import { serverEnv } from "@beep/shared-infra/ServerEnv";

export const isDevEnvironment = serverEnv.app.env === EnvValue.Enum.dev;
export const logLevel = serverEnv.app.logLevel;
export const serviceName = `${serverEnv.app.name}-server-runtime`;
export const otlpTraceExporterUrl = serverEnv.otlp.traceExporterUrl.toString();
export const otlpLogExporterUrl = serverEnv.otlp.logExporterUrl.toString();
export const otlpMetricExporterUrl = serverEnv.otlp.metricExporterUrl.toString();
