import { $ObservabilityId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { Effect, Layer, MutableRef, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import type * as HttpBody from "effect/unstable/http/HttpBody";
import * as OtlpSerialization from "effect/unstable/observability/OtlpSerialization";

const $I = $ObservabilityId.create("experimental/server/OtlpPacketLab");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const textDecoder = new TextDecoder();

/**
 * OTLP packet families captured by the packet lab.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OtlpPacketKind = LiteralKit(["logs", "metrics", "traces"]).pipe(
  $I.annoteSchema("OtlpPacketKind", {
    description: "OTLP packet families captured by the packet lab.",
  })
);

/**
 * Runtime type for {@link OtlpPacketKind}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OtlpPacketKind = typeof OtlpPacketKind.Type;

/**
 * OTLP body encodings captured by the packet lab.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OtlpPacketEncoding = LiteralKit(["json", "protobuf"]).pipe(
  $I.annoteSchema("OtlpPacketEncoding", {
    description: "OTLP body encodings captured by the packet lab.",
  })
);

/**
 * Runtime type for {@link OtlpPacketEncoding}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OtlpPacketEncoding = typeof OtlpPacketEncoding.Type;

/**
 * One captured OTLP packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class OtlpPacket extends S.Class<OtlpPacket>($I`OtlpPacket`)(
  {
    kind: OtlpPacketKind,
    encoding: OtlpPacketEncoding,
    capturedAtMs: NonNegativeInt,
    contentType: S.String,
    size: NonNegativeInt,
    preview: S.String,
  },
  $I.annote("OtlpPacket", {
    description: "One captured OTLP packet.",
  })
) {}

/**
 * Packet lab service for capturing serialized OTLP payloads.
 *
 * @since 0.0.0
 * @category Services
 */
export class OtlpPacketLab extends ServiceMap.Service<
  OtlpPacketLab,
  {
    readonly snapshot: Effect.Effect<ReadonlyArray<OtlpPacket>>;
    readonly clear: Effect.Effect<void>;
    readonly latest: (kind: OtlpPacketKind) => Effect.Effect<O.Option<OtlpPacket>>;
  }
>()("@beep/observability/experimental/server/OtlpPacketLab") {}

const contentTypeFromBody = (body: HttpBody.HttpBody): string | undefined => {
  switch (body._tag) {
    case "Uint8Array":
    case "Raw":
      return body.contentType;
    default:
      return undefined;
  }
};

const previewFromBody = (body: HttpBody.HttpBody): string => {
  switch (body._tag) {
    case "Uint8Array": {
      const contentType = contentTypeFromBody(body) ?? "application/octet-stream";
      return contentType.includes("json") || contentType.startsWith("text/")
        ? textDecoder.decode(body.body).slice(0, 400)
        : `Uint8Array(${body.body.length})`;
    }
    case "Empty":
      return "";
    case "Raw":
      return `Raw(${body.contentLength ?? 0})`;
    case "FormData":
      return "FormData";
    case "Stream":
      return `Stream(${body.contentLength ?? 0})`;
  }
};

const sizeFromBody = (body: HttpBody.HttpBody): number => {
  switch (body._tag) {
    case "Uint8Array":
      return body.body.length;
    case "Raw":
    case "Stream":
      return body.contentLength ?? 0;
    default:
      return 0;
  }
};

const makePacket = (kind: OtlpPacketKind, encoding: OtlpPacketEncoding, body: HttpBody.HttpBody): OtlpPacket =>
  new OtlpPacket({
    kind,
    encoding,
    capturedAtMs: decodeNonNegativeInt(Date.now()),
    contentType: contentTypeFromBody(body) ?? "application/octet-stream",
    size: decodeNonNegativeInt(sizeFromBody(body)),
    preview: previewFromBody(body),
  });

const makePacketLabRuntime = () => {
  const packets = MutableRef.make<ReadonlyArray<OtlpPacket>>(A.empty());

  return {
    service: OtlpPacketLab.of({
      snapshot: Effect.sync(() => MutableRef.get(packets)),
      clear: Effect.sync(() => void MutableRef.set(packets, A.empty())),
      latest: (kind) =>
        Effect.sync(() =>
          pipe(
            MutableRef.get(packets),
            A.filter((packet) => packet.kind === kind),
            A.last
          )
        ),
    }),
    capture: (kind: OtlpPacketKind, encoding: OtlpPacketEncoding, body: HttpBody.HttpBody) =>
      void MutableRef.update(packets, A.append(makePacket(kind, encoding, body))),
  };
};

const makeLayer = (encoding: OtlpPacketEncoding, baseLayer: Layer.Layer<OtlpSerialization.OtlpSerialization>) =>
  Layer.unwrap(
    Effect.sync(() => {
      const runtime = makePacketLabRuntime();

      return Layer.mergeAll(
        Layer.succeed(OtlpPacketLab, runtime.service),
        Layer.effect(
          OtlpSerialization.OtlpSerialization,
          Effect.gen(function* () {
            const base = yield* OtlpSerialization.OtlpSerialization;

            return OtlpSerialization.OtlpSerialization.of({
              traces(data) {
                const body = base.traces(data);
                runtime.capture("traces", encoding, body);
                return body;
              },
              metrics(data) {
                const body = base.metrics(data);
                runtime.capture("metrics", encoding, body);
                return body;
              },
              logs(data) {
                const body = base.logs(data);
                runtime.capture("logs", encoding, body);
                return body;
              },
            });
          })
        ).pipe(Layer.provide(baseLayer))
      );
    })
  );

/**
 * Build a packet lab backed by JSON OTLP serialization.
 *
 * @since 0.0.0
 * @category Layers
 */
export const layerJson = makeLayer("json", OtlpSerialization.layerJson);

/**
 * Build a packet lab backed by protobuf OTLP serialization.
 *
 * @since 0.0.0
 * @category Layers
 */
export const layerProtobuf = makeLayer("protobuf", OtlpSerialization.layerProtobuf);
