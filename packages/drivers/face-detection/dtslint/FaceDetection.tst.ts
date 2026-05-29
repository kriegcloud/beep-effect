import {
  FaceDetectionError,
  FaceDetectionImageRequest,
  FaceDetectionModelConfig,
  FaceDetectionService,
  makeFaceDetectionService,
} from "@beep/face-detection";
import { describe, expect, it } from "tstyche";
import type { FaceDetectionResult, FaceDetectionServiceShape, LoadedFaceDetector } from "@beep/face-detection";
import type { Effect, Layer } from "effect";

declare const detector: LoadedFaceDetector;

describe("@beep/face-detection", () => {
  it("exports typed errors, model requests, and the service layer", () => {
    const config = FaceDetectionModelConfig.make({ modelPath: "./face_detection_yunet.onnx" });
    const request = FaceDetectionImageRequest.make({ imagePath: "./photo.jpg" });

    expect(config).type.toBe<FaceDetectionModelConfig>();
    expect(request).type.toBe<FaceDetectionImageRequest>();
    expect(FaceDetectionError.make({ message: "boom", operation: "detect" })).type.toBe<FaceDetectionError>();
    expect(FaceDetectionService.makeLayer()).type.toBe<Layer.Layer<FaceDetectionService>>();
    expect(makeFaceDetectionService()).type.toBe<FaceDetectionServiceShape>();
  });

  it("exposes a loaded detector contract", () => {
    expect(detector.detect(FaceDetectionImageRequest.make({ imagePath: "./photo.jpg" }))).type.toBe<
      Effect.Effect<FaceDetectionResult, FaceDetectionError>
    >();
  });
});
