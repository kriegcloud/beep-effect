import https from "https";
import { Schema } from "./schemaTypes";
import axios, { AxiosError, InternalAxiosRequestConfig, isAxiosError } from "axios";
import { Writable } from "stream";

export interface ConnectionInformation {
  getJobUri: string; // GET_JOB_URI
  postResultUri: string; // POST_RESULT_URI
  postSchemaUri: string; // POST_SCHEMA_URI
  trustStore: string | undefined; // File contents at DEFAULT_CA_PATH
  moduleAuthToken: string; // MODULE_AUTH_TOKEN
}

/**
 * API for interacting with the runtime.
 */
export class ComputeModuleApi {
  private axiosInstance: axios.AxiosInstance;

  constructor(private connectionInformation: ConnectionInformation) {
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        ca: this.connectionInformation.trustStore,
      }),
      headers: {
        "Module-Auth-Token": this.connectionInformation.moduleAuthToken,
      },
    });
    // Request interceptor to sanitize errors that occur during request phase (before response)
    this.axiosInstance.interceptors.request.use(
      (config) => config,
      (error) => {
        if (isAxiosError(error)) {
          return Promise.reject(sanitizeAxiosError(error));
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor to sanitize errors that occur after response
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(sanitizeAxiosError(error));
      }
    );
  }

  public getJobRequest = () =>
    this.axiosInstance.get<{
      type: "computeModuleJobV1";
      computeModuleJobV1: {
        jobId: string;
        queryType: string;
        query: any;
      };
    }>(this.connectionInformation.getJobUri);

  public postResult = <ResponseType>(jobId: string, response: ResponseType) =>
    this.axiosInstance.post(
      this.connectionInformation.postResultUri + "/" + jobId,
      JSON.stringify(response),
      {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }
    );

  public postStreamingResult = (jobId: string, response: Writable) => {
    this.axiosInstance.post(
      this.connectionInformation.postResultUri + "/" + jobId,
      response,
      {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }
    );
  }
 

  public postSchema = (schemas: Schema[]) =>
    this.axiosInstance.post(this.connectionInformation.postSchemaUri, schemas, {
      headers: {
        "Content-Type": "application/json",
      }
    });
}

export function formatAxiosErrorResponse(error: AxiosError) {
  return `
    Error running module - Network Error: ${error.response?.status}
    Status: ${error.status}
    Message: ${error.message}
    StatusText: ${error.response?.statusText}
    Data:
    ${JSON.stringify(error.response?.data, null, 2)}
  `;
}

/**
 * List of headers that should be redacted from error logs.
 */
const SENSITIVE_HEADERS = ["module-auth-token", "authorization"];

/**
 * Sanitizes an Axios request config by removing sensitive headers and https agent CA data.
 */
function sanitizeAxiosRequestConfig(
  config: InternalAxiosRequestConfig | undefined
): InternalAxiosRequestConfig | undefined {
  if (!config) {
    return config;
  }

  const sanitizedConfig = { ...config };

  // Redact sensitive headers (case-insensitive)
  if (sanitizedConfig.headers) {
    const sanitizedHeaders = { ...sanitizedConfig.headers };
    for (const header of Object.keys(sanitizedHeaders)) {
      if (SENSITIVE_HEADERS.includes(header.toLowerCase())) {
        (sanitizedHeaders as Record<string, unknown>)[header] = "[REDACTED]";
      }
    }
    sanitizedConfig.headers = sanitizedHeaders as typeof config.headers;
  }

  // Remove httpsAgent to prevent CA cert data from being logged
  if (sanitizedConfig.httpsAgent) {
    sanitizedConfig.httpsAgent = "[REDACTED]" as unknown as https.Agent;
  }

  // Also check for httpAgent just in case
  if (sanitizedConfig.httpAgent) {
    sanitizedConfig.httpAgent = "[REDACTED]" as unknown as typeof config.httpAgent;
  }

  return sanitizedConfig;
}

/**
 * Sanitizes an AxiosError by removing sensitive information such as
 * authentication tokens and certificate data from the error object.
 * This prevents secrets from being leaked in logs.
 */
export function sanitizeAxiosError(error: AxiosError): AxiosError {
  // Create a shallow copy of the error to avoid mutating the original
  const sanitizedError = new AxiosError(
    error.message,
    error.code,
    sanitizeAxiosRequestConfig(error.config),
    error.request,
    error.response
  );

  // Copy over additional properties
  sanitizedError.stack = error.stack;
  sanitizedError.cause = error.cause;

  // Sanitize the response config if present
  if (sanitizedError.response?.config) {
    sanitizedError.response = {
      ...sanitizedError.response,
      config: sanitizeAxiosRequestConfig(sanitizedError.response.config)!,
    };
  }

  return sanitizedError;
}
