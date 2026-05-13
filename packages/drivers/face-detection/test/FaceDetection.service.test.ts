import {
  FaceDetection,
  FaceDetectionBox,
  FaceDetectionImageRequest,
  FaceDetectionLandmarks,
  FaceDetectionPoint,
  FaceDetectionResult,
  FaceDetectionService,
  withDetector,
} from "@beep/face-detection";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

const point = new FaceDetectionPoint({ x: 1, y: 2 });

const fakeFace = new FaceDetection({
  box: new FaceDetectionBox({ height: 24, width: 20, x: 10, y: 12 }),
  confidence: 0.9,
  landmarks: new FaceDetectionLandmarks({
    leftEye: point,
    leftMouth: point,
    nose: point,
    rightEye: point,
    rightMouth: point,
  }),
});

const fakeLayer = Layer.succeed(
  FaceDetectionService,
  FaceDetectionService.of({
    withDetector: Effect.fn("FaceDetectionService.withDetector")((config, use) =>
      use({
        detect: Effect.fn("LoadedFaceDetector.detect")((request) =>
          Effect.succeed(
            new FaceDetectionResult({
              faces: [fakeFace],
              height: 100,
              imagePath: request.imagePath,
              width: 100,
            })
          )
        ),
      }).pipe(Effect.annotateLogs({ modelPath: config.modelPath }))
    ),
  })
);

describe("@beep/face-detection", () => {
  it.effect("runs workflows through the service contract", () =>
    withDetector({ modelPath: "./model.onnx" }, (detector) =>
      detector.detect(new FaceDetectionImageRequest({ imagePath: "./photo.jpg" }))
    ).pipe(
      Effect.map((result) => {
        expect(result.faces).toEqual([fakeFace]);
        expect(result.imagePath).toBe("./photo.jpg");
      }),
      Effect.provide(fakeLayer)
    )
  );
});
