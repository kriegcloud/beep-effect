import {
  MessageParseError,
  MessageSendError,
  NatsConnectionError,
  NatsTimeout,
} from "@beep/beepgraph-messaging/Errors";
import { describe, expect, it } from "@effect/vitest";

// ---------------------------------------------------------------------------
// Error class unit tests
// ---------------------------------------------------------------------------

describe("Messaging error classes", () => {
  describe("NatsConnectionError", () => {
    it("has the correct _tag", () => {
      const err = new NatsConnectionError({ url: "nats://localhost:4222", cause: "refused" });
      expect(err._tag).toBe("NatsConnectionError");
    });

    it("formats the message with url and cause", () => {
      const err = new NatsConnectionError({ url: "nats://host:4222", cause: "ECONNREFUSED" });
      expect(err.message).toContain("nats://host:4222");
      expect(err.message).toContain("ECONNREFUSED");
    });
  });

  describe("NatsTimeout", () => {
    it("has the correct _tag", () => {
      const err = new NatsTimeout({ topic: "tg.flow.response", requestId: "abc-123", durationMs: 5000 });
      expect(err._tag).toBe("NatsTimeout");
    });

    it("formats the message with topic, duration, and requestId", () => {
      const err = new NatsTimeout({ topic: "tg.flow.response", requestId: "abc-123", durationMs: 5000 });
      expect(err.message).toContain("tg.flow.response");
      expect(err.message).toContain("5000");
      expect(err.message).toContain("abc-123");
    });
  });

  describe("MessageParseError", () => {
    it("has the correct _tag", () => {
      const err = new MessageParseError({ topic: "tg.flow.request", raw: "bad json" });
      expect(err._tag).toBe("MessageParseError");
    });

    it("formats the message with topic", () => {
      const err = new MessageParseError({ topic: "tg.flow.request", raw: "{broken}" });
      expect(err.message).toContain("tg.flow.request");
    });
  });

  describe("MessageSendError", () => {
    it("has the correct _tag", () => {
      const err = new MessageSendError({ topic: "tg.flow.request", cause: "stream full" });
      expect(err._tag).toBe("MessageSendError");
    });

    it("formats the message with topic and cause", () => {
      const err = new MessageSendError({ topic: "tg.flow.request", cause: "stream full" });
      expect(err.message).toContain("tg.flow.request");
      expect(err.message).toContain("stream full");
    });
  });
});
