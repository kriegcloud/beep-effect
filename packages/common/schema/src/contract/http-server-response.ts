export type HttpServerResponse = {
  readonly status: number;
  readonly headers?: Record<string, string | string[] | undefined>;
  readonly body: string | Uint8Array;
};

export const json = (status: number, body: string): HttpServerResponse => ({
  status,
  headers: {
    "Content-Type": "application/json",
  },
  body,
});

export const empty = (status = 204): HttpServerResponse => ({
  status,
  body: "",
});

export const internalError = (): HttpServerResponse => ({
  status: 500,
  body: "Internal Server Error",
});

export const notImplemented = (): HttpServerResponse => ({
  status: 501,
  body: "Not Implemented",
});
