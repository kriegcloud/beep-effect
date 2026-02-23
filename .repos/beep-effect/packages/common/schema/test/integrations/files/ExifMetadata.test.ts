import { describe, expect, it } from "bun:test";
import { ExifMetadata, type ExifMetadataValue } from "@beep/schema/integrations/files";
import * as S from "effect/Schema";

describe("@beep/schema EXIF schemas", () => {
  it("creates ExifMetadata from raw ExifTool output", () => {
    const raw: ExifMetadataValue = {
      FileName: "test.jpg",
      FileType: "JPEG",
      MIMEType: "image/jpeg",
      ImageWidth: 1024,
      ImageHeight: 768,
      Make: "Canon",
      Model: "EOS 5D",
    };

    const metadata = ExifMetadata.fromRaw(raw);

    expect(metadata.fileName).toBe("test.jpg");
    expect(metadata.fileType).toBe("JPEG");
    expect(metadata.imageWidth).toBe(1024);
    expect(metadata.imageHeight).toBe(768);
    expect(metadata.make).toBe("Canon");
    expect(metadata.model).toBe("EOS 5D");
    expect(metadata.raw).toBeDefined();
  });

  it("decodes ExifMetadata schema", () => {
    const input = {
      fileName: "test.jpg",
      fileType: "JPEG",
      imageWidth: 1024,
      imageHeight: 768,
      raw: { FileName: "test.jpg" },
    };

    const decoded = S.decodeSync(ExifMetadata)(input);

    expect(decoded.fileName).toBe("test.jpg");
    expect(decoded.imageWidth).toBe(1024);
  });

  it("handles missing optional fields", () => {
    const raw: ExifMetadataValue = {
      FileName: "test.jpg",
    };

    const metadata = ExifMetadata.fromRaw(raw);

    expect(metadata.fileName).toBe("test.jpg");
    expect(metadata.imageWidth).toBeUndefined();
    expect(metadata.gpsLatitude).toBeUndefined();
  });

  it("preserves GPS coordinates when present", () => {
    const raw: ExifMetadataValue = {
      FileName: "gps-test.jpg",
      GPSLatitude: 37.7749,
      GPSLongitude: -122.4194,
      GPSAltitude: 10,
    };

    const metadata = ExifMetadata.fromRaw(raw);

    expect(metadata.gpsLatitude).toBe(37.7749);
    expect(metadata.gpsLongitude).toBe(-122.4194);
    expect(metadata.gpsAltitude).toBe(10);
  });

  it("preserves camera information when present", () => {
    const raw: ExifMetadataValue = {
      FileName: "camera-test.jpg",
      Make: "Nikon",
      Model: "D850",
      Software: "Adobe Lightroom",
      DateTimeOriginal: "2025:01:15 10:30:00",
    };

    const metadata = ExifMetadata.fromRaw(raw);

    expect(metadata.make).toBe("Nikon");
    expect(metadata.model).toBe("D850");
    expect(metadata.software).toBe("Adobe Lightroom");
    expect(metadata.dateTimeOriginal).toBe("2025:01:15 10:30:00");
  });
});
