import type { IMail, IMailLabel } from "@beep/mock/_mail";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { keyBy } from "es-toolkit";
import { useMemo } from "react";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";

// ----------------------------------------------------------------------

export const endpoints = {
  mail: {
    list: "/api/mail/list",
    details: "/api/mail/details",
    labels: "/api/mail/labels",
  },
} as const;

// ----------------------------------------------------------------------

const BASE_URL = "http://localhost:3000";

/**
 * Effect-based HTTP client layer using Fetch API for browser environment.
 * Uses FetchHttpClient which is the standard browser-compatible HTTP client.
 */
const HttpClientLive = FetchHttpClient.layer;

/**
 * Managed runtime for executing HTTP effects.
 * This is scoped to this module and provides the HttpClient service.
 */
const runtime = ManagedRuntime.make(HttpClientLive);

/**
 * Makes an HTTP GET request and returns the JSON response.
 * Uses Effect's HttpClient for type-safe HTTP operations.
 */
const makeGetRequest = <T>(
  url: string,
  params?: undefined | Record<string, string>
): Effect.Effect<T, Error, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    let request = HttpClientRequest.get(`${BASE_URL}${url}`);

    if (params) {
      request = HttpClientRequest.setUrlParams(request, params);
    }

    const response = yield* client.execute(request);
    // The json property is an Effect on the response object (from HttpIncomingMessage)
    const json = yield* response.json;

    return json as T;
  }).pipe(
    Effect.catchAll((error) => Effect.fail(new Error(error instanceof Error ? error.message : "HTTP request failed"))),
    Effect.withSpan("HttpClient.get", { attributes: { url, params: JSON.stringify(params) } })
  );

/**
 * SWR-compatible fetcher that wraps the Effect-based HTTP client.
 * Converts Effect to Promise for SWR compatibility.
 *
 * @param args - Either a URL string or a tuple of [url, config] where config contains params
 */
export const fetcher = async <T = unknown>(
  args: string | [string, { readonly params?: undefined | Record<string, string> }]
): Promise<T> => {
  const [url, config] = Array.isArray(args) ? args : [args, {}];
  const params = config.params;

  const effect = makeGetRequest<T>(url, params).pipe(Effect.provide(HttpClientLive));

  return runtime.runPromise(effect);
};

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type LabelsData = {
  labels: IMailLabel[];
};

export function useGetLabels() {
  const url = endpoints.mail.labels;

  const { data, isLoading, error, isValidating } = useSWR<LabelsData>(url, fetcher, {
    ...swrOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      labels: data?.labels || [],
      labelsLoading: isLoading,
      labelsError: error,
      labelsValidating: isValidating,
      labelsEmpty: !isLoading && !isValidating && !data?.labels.length,
    }),
    [data?.labels, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type MailsData = {
  mails: IMail[];
};

export function useGetMails(labelId: string) {
  const url = labelId ? [endpoints.mail.list, { params: { labelId } }] : "";

  const { data, isLoading, error, isValidating } = useSWR<MailsData>(url, fetcher, {
    ...swrOptions,
  });

  const memoizedValue = useMemo(() => {
    const byId = data?.mails.length ? keyBy(data?.mails, (option) => option.id) : {};
    const allIds = Object.keys(byId);

    return {
      mails: { byId, allIds },
      mailsLoading: isLoading,
      mailsError: error,
      mailsValidating: isValidating,
      mailsEmpty: !isLoading && !isValidating && !allIds.length,
    };
  }, [data?.mails, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

type MailData = {
  mail: IMail;
};

export function useGetMail(mailId: string) {
  const url = mailId ? [endpoints.mail.details, { params: { mailId } }] : "";

  const { data, isLoading, error, isValidating } = useSWR<MailData>(url, fetcher, {
    ...swrOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      mail: data?.mail,
      mailLoading: isLoading,
      mailError: error,
      mailValidating: isValidating,
      mailEmpty: !isLoading && !isValidating && !data?.mail,
    }),
    [data?.mail, error, isLoading, isValidating]
  );

  return memoizedValue;
}
