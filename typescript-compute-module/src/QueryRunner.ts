import { HttpStatusCode, isAxiosError } from "axios";
import { Logger } from "./logger";
import { Static, TObject } from "@sinclair/typebox";
import {
  ComputeModuleApi,
  formatAxiosErrorResponse,
  sanitizeAxiosError,
} from "./api/ComputeModuleApi";
import { SupportedTypeboxTypes } from "./api/convertJsonSchematoFoundrySchema";
import { PassThrough } from "stream";

export interface QueryResponseMapping {
  [queryType: string]: {
    input: TObject;
    output: SupportedTypeboxTypes;
  };
}

export type QueryListener<M extends QueryResponseMapping> =
  | {
      type: "response";
      listener: ResponseQueryListener<M>;
    }
  | {
      type: "streaming";
      listener: StreamingQueryListener<M>;
    };

export type StreamingQueryListener<M extends QueryResponseMapping> = <
  T extends keyof M
>(
  message: Static<M[T]["input"]>,
  responseStream: {
    write: (chunk: Buffer | Uint8Array | string) => void;
    end: () => void;
  }
) => void;

export type ResponseQueryListener<M extends QueryResponseMapping> = <
  T extends keyof M
>(
  message: Static<M[T]["input"]>
) => Promise<Static<M[T]["output"]>>;

export class QueryRunner<M extends QueryResponseMapping> {
  private isResponsive = false;

  private responsiveEventListeners: Set<() => void> = new Set();

  constructor(
    private readonly listeners: Partial<{
      [K in keyof M]: QueryListener<Pick<M, K>>;
    }>,
    private defaultListener?: (query: any, queryType: string) => Promise<any>,
    private readonly logger?: Logger
  ) {}

  async run(computeModuleApi: ComputeModuleApi) {
    while (true) {
      try {
        const jobRequest = await computeModuleApi.getJobRequest();

        if (
          !this.isResponsive &&
          jobRequest.status.toString().startsWith("2")
        ) {
          // If this is the first job, set the module as responsive
          this.setResponsive();
        }

        if (jobRequest.status === HttpStatusCode.Ok) {
          const { query, queryType, jobId } =
            jobRequest.data.computeModuleJobV1;
          this.logger?.info(`Job received - ID: ${jobId} Query: ${queryType}`);
          const listener = this.listeners[queryType];

          if (listener?.type === "response") {
            listener
              .listener(query)
              .then((response) => computeModuleApi.postResult(jobId, response))
              .catch((error) => {
                const sanitizedError = isAxiosError(error) ? sanitizeAxiosError(error) : error;
                this.logger?.error(`Error executing job - ID: ${jobId} Reason: ${sanitizedError}`);
                computeModuleApi.postResult(jobId, QueryRunner.getFailedQueryResult(sanitizedError));
              });
          } else if (listener?.type === "streaming") {
            const writable = new PassThrough();
            listener.listener(query, writable);
            computeModuleApi.postStreamingResult(jobId, writable);
          } else if (this.defaultListener != null) {
            this.defaultListener(query, queryType)
              .then((response) =>
                computeModuleApi.postResult(
                  jobId,
                  // Convert number to string as per response spec
                  typeof response === "number" ? response.toString() : response
                )
              )
              .catch((error) => {
                const sanitizedError = isAxiosError(error) ? sanitizeAxiosError(error) : error;
                this.logger?.error(`Error executing default listener - ID: ${jobId} Reason: ${sanitizedError}`);
                computeModuleApi.postResult(jobId, QueryRunner.getFailedQueryResult(sanitizedError));
              });
          } else {
            this.logger?.error(`No listener for query type: ${queryType}`);
          }
        }
      } catch (e) {
        if (!isAxiosError(e)) {
          this.logger?.error(`Error running module: ${e}`);
          continue;
        }
        if (!this.isResponsive && e.code === "ECONNREFUSED") {
          continue;
        }
        // Sanitize the error before logging to prevent sensitive data leakage
        const sanitizedError = sanitizeAxiosError(e);
        this.logger?.error(
          `Error running module - Network Error: ${formatAxiosErrorResponse(sanitizedError)}`
        );
      }
    }
  }

  public on(_eventName: "responsive", listener: () => void) {
    if (this.isResponsive) {
      listener();
    } else {
      this.responsiveEventListeners.add(listener);
    }
  }

  private setResponsive() {
    this.isResponsive = true;
    this.responsiveEventListeners.forEach((listener) => listener());
  }

  public updateDefaultListener(
    defaultListener: (query: any, queryType: string) => Promise<any>
  ) {
    this.defaultListener = defaultListener;
  }

  private static getFailedQueryResult(error: any): Record<string, string> {
    return { "error": error.toString(),
             ...(error instanceof Error &&
              { "error": error.name, "reason": error.message })
    };
  }
}
