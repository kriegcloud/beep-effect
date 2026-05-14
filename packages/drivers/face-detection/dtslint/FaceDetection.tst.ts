import {
  FaceDetectionError,
  FaceDetectionImageRequest,
  FaceDetectionModelConfig,
  type FaceDetectionResult,
  FaceDetectionService,
  type FaceDetectionServiceShape,
  type LoadedFaceDetector,
  makeFaceDetectionService,
} from "@beep/face-detection";
import type { Effect, Layer } from "effect";
import { describe, expect, it } from "tstyche";

declare const detector: LoadedFaceDetector;

describe("@beep/face-detection", () => {
  it("exports typed errors, model requests, and the service layer", () => {
    const config = new FaceDetectionModelConfig({ modelPath: "./face_detection_yunet.onnx" });
    const request = new FaceDetectionImageRequest({ imagePath: "./photo.jpg" });

    expect(config).type.toBe<FaceDetectionModelConfig>();
    expect(request).type.toBe<FaceDetectionImageRequest>();
    expect(new FaceDetectionError({ message: "boom", operation: "detect" })).type.toBe<FaceDetectionError>();
    expect(FaceDetectionService.makeLayer()).type.toBe<Layer.Layer<FaceDetectionService>>();
    expect(makeFaceDetectionService()).type.toBe<FaceDetectionServiceShape>();
  });

  it("exposes a loaded detector contract", () => {
    expect(detector.detect(new FaceDetectionImageRequest({ imagePath: "./photo.jpg" }))).type.toBe<
      Effect.Effect<FaceDetectionResult, FaceDetectionError>
    >();
  });
});
