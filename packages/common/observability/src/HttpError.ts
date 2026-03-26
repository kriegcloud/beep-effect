import { $ObservabilityId } from "@beep/identity/packages";
import {
  HttpStatus,
  makeStatusCauseError,
  StatusCauseFields,
  type StatusCauseInput,
  TaggedErrorClass,
} from "@beep/schema";
import { ErrorReporter } from "effect";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("HttpError");

const clientStatusAttributes = <Status extends number>(status: Status) =>
  ({
    status,
    status_class: "4xx",
  }) as const;

const serverStatusAttributes = <Status extends number>(status: Status) =>
  ({
    status,
    status_class: "5xx",
  }) as const;

const makeStatusConstructor =
  <Input extends StatusCauseInput, Error>(ctor: new (value: Input) => Error, status: number) =>
  (message: string, cause?: unknown): Error =>
    makeStatusCauseError(ctor)(message, status, cause);

const statusFields = <Status extends S.Top>(status: Status) =>
  ({
    ...StatusCauseFields,
    status,
  }) as const;

/**
 * Shared tagged error for 4xx HTTP responses.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ClientHttpError extends TaggedErrorClass<ClientHttpError>($I`ClientHttpError`)(
  "ClientHttpError",
  {
    message: S.String,
    status: HttpStatus.HttpStatus4XX,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("ClientHttpError", {
    description: "Shared tagged error for 4xx HTTP responses.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * Shared tagged error for 5xx HTTP responses.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ServerHttpError extends TaggedErrorClass<ServerHttpError>($I`ServerHttpError`)(
  "ServerHttpError",
  {
    message: S.String,
    status: HttpStatus.HttpStatus5XX,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("ServerHttpError", {
    description: "Shared tagged error for 5xx HTTP responses.",
  })
) {
  override readonly [ErrorReporter.severity] = "Error";
  override readonly [ErrorReporter.attributes] = serverStatusAttributes(this.status);
}

/**
 * 400 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BadRequestError extends TaggedErrorClass<BadRequestError>($I`BadRequestError`)(
  "BadRequestError",
  statusFields(HttpStatus.BadRequest),
  $I.annote("BadRequestError", {
    description: "400 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 401 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UnauthorizedError extends TaggedErrorClass<UnauthorizedError>($I`UnauthorizedError`)(
  "UnauthorizedError",
  statusFields(HttpStatus.Unauthorized),
  $I.annote("UnauthorizedError", {
    description: "401 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 403 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ForbiddenError extends TaggedErrorClass<ForbiddenError>($I`ForbiddenError`)(
  "ForbiddenError",
  statusFields(HttpStatus.Forbidden),
  $I.annote("ForbiddenError", {
    description: "403 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 404 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NotFoundError extends TaggedErrorClass<NotFoundError>($I`NotFoundError`)(
  "NotFoundError",
  statusFields(HttpStatus.NotFound),
  $I.annote("NotFoundError", {
    description: "404 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Info";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 409 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConflictError extends TaggedErrorClass<ConflictError>($I`ConflictError`)(
  "ConflictError",
  statusFields(HttpStatus.Conflict),
  $I.annote("ConflictError", {
    description: "409 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 422 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UnprocessableEntityError extends TaggedErrorClass<UnprocessableEntityError>($I`UnprocessableEntityError`)(
  "UnprocessableEntityError",
  statusFields(HttpStatus.UnprocessableEntity),
  $I.annote("UnprocessableEntityError", {
    description: "422 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 429 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TooManyRequestsError extends TaggedErrorClass<TooManyRequestsError>($I`TooManyRequestsError`)(
  "TooManyRequestsError",
  statusFields(HttpStatus.TooManyRequests),
  $I.annote("TooManyRequestsError", {
    description: "429 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = clientStatusAttributes(this.status);
}

/**
 * 500 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class InternalServerErrorError extends TaggedErrorClass<InternalServerErrorError>($I`InternalServerErrorError`)(
  "InternalServerErrorError",
  statusFields(HttpStatus.InternalServerError),
  $I.annote("InternalServerErrorError", {
    description: "500 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Error";
  override readonly [ErrorReporter.attributes] = serverStatusAttributes(this.status);
}

/**
 * 502 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BadGatewayError extends TaggedErrorClass<BadGatewayError>($I`BadGatewayError`)(
  "BadGatewayError",
  statusFields(HttpStatus.BadGateway),
  $I.annote("BadGatewayError", {
    description: "502 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Error";
  override readonly [ErrorReporter.attributes] = serverStatusAttributes(this.status);
}

/**
 * 503 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ServiceUnavailableError extends TaggedErrorClass<ServiceUnavailableError>($I`ServiceUnavailableError`)(
  "ServiceUnavailableError",
  statusFields(HttpStatus.ServiceUnavailable),
  $I.annote("ServiceUnavailableError", {
    description: "503 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Error";
  override readonly [ErrorReporter.attributes] = serverStatusAttributes(this.status);
}

/**
 * 504 tagged error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GatewayTimeoutError extends TaggedErrorClass<GatewayTimeoutError>($I`GatewayTimeoutError`)(
  "GatewayTimeoutError",
  statusFields(HttpStatus.GatewayTimeout),
  $I.annote("GatewayTimeoutError", {
    description: "504 tagged error.",
  })
) {
  override readonly [ErrorReporter.severity] = "Error";
  override readonly [ErrorReporter.attributes] = serverStatusAttributes(this.status);
}

/**
 * Helper constructor for {@link BadRequestError}.
 *
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeBadRequestError = makeStatusConstructor(BadRequestError, HttpStatus.BadRequest.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeUnauthorizedError = makeStatusConstructor(UnauthorizedError, HttpStatus.Unauthorized.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeForbiddenError = makeStatusConstructor(ForbiddenError, HttpStatus.Forbidden.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeNotFoundError = makeStatusConstructor(NotFoundError, HttpStatus.NotFound.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeConflictError = makeStatusConstructor(ConflictError, HttpStatus.Conflict.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeUnprocessableEntityError = makeStatusConstructor(
  UnprocessableEntityError,
  HttpStatus.UnprocessableEntity.literal
);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeTooManyRequestsError = makeStatusConstructor(TooManyRequestsError, HttpStatus.TooManyRequests.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeInternalServerError = makeStatusConstructor(
  InternalServerErrorError,
  HttpStatus.InternalServerError.literal
);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeBadGatewayError = makeStatusConstructor(BadGatewayError, HttpStatus.BadGateway.literal);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeServiceUnavailableError = makeStatusConstructor(
  ServiceUnavailableError,
  HttpStatus.ServiceUnavailable.literal
);
/**
 * @since 0.0.0
 * @category ErrorHandling
 */
export const makeGatewayTimeoutError = makeStatusConstructor(GatewayTimeoutError, HttpStatus.GatewayTimeout.literal);
