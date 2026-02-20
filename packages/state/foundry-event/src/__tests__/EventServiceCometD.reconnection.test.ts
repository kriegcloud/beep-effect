/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { PackAppInternal } from "@palantir/pack.core";
import type { Callback, CometD, ListenerHandle, SubscriptionHandle } from "cometd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockProxy } from "vitest-mock-extended";
import { mock } from "vitest-mock-extended";
import type { CometDLoader } from "../cometd/EventServiceCometD.js";
import { EventServiceCometD } from "../cometd/EventServiceCometD.js";
import type { TypedReceiveChannelId } from "../types/EventService.js";

const mockAuthModule = {
  getToken: vi.fn().mockResolvedValue("mock-token"),
  onTokenChange: vi.fn(),
};

const mockLogger = {
  child: vi.fn(),
  debug: vi.fn((...args: unknown[]) => {
    console.log("[DEBUG]", ...args);
  }),
  error: vi.fn((...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  }),
  info: vi.fn((...args: unknown[]) => {
    console.log("[INFO]", ...args);
  }),
  warn: vi.fn((...args: unknown[]) => {
    console.warn("[WARN]", ...args);
  }),
};

mockLogger.child.mockReturnValue(mockLogger);

const mockApp = {
  config: {
    logger: mockLogger,
    remote: {
      packWsPath: "/ws",
      baseUrl: "https://test.example.com",
    },
  },
  getModule: vi.fn().mockReturnValue(mockAuthModule),
} as unknown as PackAppInternal;

describe("EventServiceCometD Reconnection Handling", () => {
  let mockCometD: MockProxy<CometD>;
  let service: EventServiceCometD;
  let handshakeCallback: Callback | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCometD = mock();
    handshakeCallback = undefined;

    mockCometD.addListener.mockImplementation((channel: string, callback: Callback) => {
      if (channel === "/meta/handshake") {
        handshakeCallback = callback;
        setTimeout(() => {
          callback({
            channel: "/meta/handshake",
            clientId: "test-client-id",
            connectionType: "websocket",
            successful: true,
          });
        }, 0);
      }
      return { id: `listener-${Math.random()}` } as ListenerHandle;
    });

    mockCometD.configure.mockImplementation(() => {});
    mockCometD.registerExtension.mockImplementation(() => true);
    mockCometD.handshake.mockImplementation(() => {});
    mockCometD.batch.mockImplementation(callback => {
      callback();
    });

    const mockLoader = () => {
      class MockAckExtension {}
      class MockCometD {
        constructor() {
          return mockCometD;
        }
      }
      return Promise.resolve({
        AckExtension: MockAckExtension,
        CometD: MockCometD,
      });
    };

    service = new EventServiceCometD(mockApp, mockLoader as CometDLoader);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function completeHandshake(clientId = "test-client-id"): Promise<void> {
    if (handshakeCallback == null) {
      throw new Error("Handshake callback not captured");
    }
    handshakeCallback({
      channel: "/meta/handshake",
      clientId,
      connectionType: "websocket",
      successful: true,
    });
    await vi.runAllTimersAsync();
  }

  describe("initial handshake", () => {
    it("should detect initial handshake and log appropriately", async () => {
      // Trigger lazy initialization by subscribing
      const subscribeCapture = createSubscribeCapture(mockCometD);
      const subscriptionPromise = service.subscribe(
        "/test/channel" as TypedReceiveChannelId<object>,
        vi.fn(),
      );

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({ channel: "/test/channel", successful: true });
      await subscriptionPromise;

      expect(mockLogger.info).toHaveBeenCalledWith(
        "CometD handshake successful",
        expect.objectContaining({
          clientId: "test-client-id",
          connectionType: "websocket",
        }),
      );

      expect(mockLogger.info).not.toHaveBeenCalledWith(
        "CometD reconnection successful",
        expect.anything(),
      );
    });

    it("should not attempt resubscription on initial handshake with no subscriptions", async () => {
      // Trigger lazy initialization by subscribing
      const subscribeCapture = createSubscribeCapture(mockCometD);
      const subscriptionPromise = service.subscribe(
        "/test/channel" as TypedReceiveChannelId<object>,
        vi.fn(),
      );

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({ channel: "/test/channel", successful: true });
      await subscriptionPromise;

      expect(mockCometD.resubscribe).not.toHaveBeenCalled();
    });
  });

  describe("reconnection after disconnect", () => {
    it("should trigger handshake callback on reconnection", async () => {
      // Trigger initial handshake first
      const subscribeCapture = createSubscribeCapture(mockCometD);
      const subscriptionPromise = service.subscribe(
        "/test/channel" as TypedReceiveChannelId<object>,
        vi.fn(),
      );

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({ channel: "/test/channel", successful: true });
      await subscriptionPromise;

      mockLogger.info.mockClear();

      await completeHandshake("test-client-id-2");

      expect(mockLogger.info).toHaveBeenCalledWith(
        "CometD handshake successful",
        expect.objectContaining({
          clientId: "test-client-id-2",
          connectionType: "websocket",
        }),
      );
    });

    it("should automatically resubscribe single channel after reconnection", async () => {
      await vi.runAllTimersAsync();

      const subscribeCapture = createSubscribeCapture(mockCometD);

      const channelId = "/test/channel" as TypedReceiveChannelId;
      const onMessage = vi.fn();
      const getSubscriptionRequest = vi.fn(() => ({ param1: "value1" }));

      const subscriptionPromise = service.subscribe(channelId, onMessage, getSubscriptionRequest);

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({
        channel: channelId,
        successful: true,
      });

      await vi.runAllTimersAsync();
      await subscriptionPromise;

      mockCometD.resubscribe.mockClear();

      await completeHandshake("reconnect-client-id");

      expect(mockCometD.resubscribe).toHaveBeenCalledTimes(1);
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(
        subscribeCapture.handle,
        expect.objectContaining({
          ext: { param1: "value1" },
        }),
      );
    });

    it("should resubscribe multiple channels after reconnection", async () => {
      await vi.runAllTimersAsync();

      const capture1 = createSubscribeCapture(mockCometD);
      const capture2 = createSubscribeCapture(mockCometD);
      const capture3 = createSubscribeCapture(mockCometD);

      const channel1 = "/test/channel1" as TypedReceiveChannelId<object>;
      const channel2 = "/test/channel2" as TypedReceiveChannelId<object>;
      const channel3 = "/test/channel3" as TypedReceiveChannelId<object>;

      const sub1Promise = service.subscribe(channel1, vi.fn(), () => ({ id: "sub1" }));
      const sub2Promise = service.subscribe(channel2, vi.fn(), () => ({ id: "sub2" }));
      const sub3Promise = service.subscribe(channel3, vi.fn(), () => ({ id: "sub3" }));

      await vi.runAllTimersAsync();

      capture1.subscribeCallback?.({ channel: channel1, successful: true });
      capture2.subscribeCallback?.({ channel: channel2, successful: true });
      capture3.subscribeCallback?.({ channel: channel3, successful: true });

      await vi.runAllTimersAsync();
      await Promise.all([sub1Promise, sub2Promise, sub3Promise]);

      mockCometD.resubscribe.mockClear();

      await completeHandshake("reconnect-client-id");

      expect(mockCometD.resubscribe).toHaveBeenCalledTimes(3);
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(
        capture1.handle,
        expect.objectContaining({ ext: { id: "sub1" } }),
      );
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(
        capture2.handle,
        expect.objectContaining({ ext: { id: "sub2" } }),
      );
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(
        capture3.handle,
        expect.objectContaining({ ext: { id: "sub3" } }),
      );
    });

    it("should preserve subscription parameters on resubscribe", async () => {
      await vi.runAllTimersAsync();

      const subscribeCapture = createSubscribeCapture(mockCometD);

      const channelId = "/document/test-doc/updates" as TypedReceiveChannelId<object>;
      const onMessage = vi.fn();
      const getSubscriptionRequest = vi.fn(() => ({
        clientId: "client-123",
        lastRevisionId: "revision-456",
      }));

      const subscriptionPromise = service.subscribe(channelId, onMessage, getSubscriptionRequest);

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({
        channel: channelId,
        successful: true,
      });

      await vi.runAllTimersAsync();
      await subscriptionPromise;

      expect(getSubscriptionRequest).toHaveBeenCalledTimes(1);

      mockCometD.resubscribe.mockClear();
      getSubscriptionRequest.mockClear();

      await completeHandshake("reconnect-client-id");

      expect(getSubscriptionRequest).toHaveBeenCalledTimes(1);
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(
        subscribeCapture.handle,
        expect.objectContaining({
          ext: {
            clientId: "client-123",
            lastRevisionId: "revision-456",
          },
        }),
      );
    });

    it("should batch resubscriptions together", async () => {
      await vi.runAllTimersAsync();

      const capture1 = createSubscribeCapture(mockCometD);
      const capture2 = createSubscribeCapture(mockCometD);

      const sub1Promise = service.subscribe("/channel1" as TypedReceiveChannelId<object>, vi.fn());
      const sub2Promise = service.subscribe("/channel2" as TypedReceiveChannelId<object>, vi.fn());

      await vi.runAllTimersAsync();

      capture1.subscribeCallback?.({ channel: "/channel1", successful: true });
      capture2.subscribeCallback?.({ channel: "/channel2", successful: true });

      await vi.runAllTimersAsync();
      await Promise.all([sub1Promise, sub2Promise]);

      mockCometD.batch.mockClear();

      await completeHandshake("reconnect-client-id");

      expect(mockCometD.batch).toHaveBeenCalledTimes(1);
      expect(mockCometD.batch).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle resubscription with no getSubscriptionRequest callback", async () => {
      await vi.runAllTimersAsync();

      const subscribeCapture = createSubscribeCapture(mockCometD);

      const channelId = "/test/simple-channel" as TypedReceiveChannelId<object>;
      const subscriptionPromise = service.subscribe(channelId, vi.fn());

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({
        channel: channelId,
        successful: true,
      });

      await vi.runAllTimersAsync();
      await subscriptionPromise;

      mockCometD.resubscribe.mockClear();

      await completeHandshake("reconnect-client-id");

      expect(mockCometD.resubscribe).toHaveBeenCalledTimes(1);
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(
        subscribeCapture.handle,
        expect.objectContaining({
          ext: undefined,
        }),
      );
    });
  });

  describe("failed reconnection", () => {
    it("should handle failed handshake during reconnection", async () => {
      await vi.runAllTimersAsync();

      const subscribeCapture = createSubscribeCapture(mockCometD);

      const subscriptionPromise = service.subscribe(
        "/test/channel" as TypedReceiveChannelId<object>,
        vi.fn(),
      );

      await vi.runAllTimersAsync();

      subscribeCapture.subscribeCallback?.({ channel: "/test/channel", successful: true });

      await vi.runAllTimersAsync();
      await subscriptionPromise;

      mockCometD.resubscribe.mockClear();
      mockLogger.warn.mockClear();

      if (handshakeCallback == null) {
        throw new Error("Handshake callback not captured");
      }

      handshakeCallback({
        channel: "/meta/handshake",
        clientId: "reconnect-client-id",
        error: "Connection failed",
        successful: false,
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "CometD handshake failed",
        expect.objectContaining({
          clientId: "reconnect-client-id",
          error: "Connection failed",
        }),
      );

      expect(mockCometD.resubscribe).not.toHaveBeenCalled();
    });
  });

  describe("subscription lifecycle during reconnection", () => {
    it("should not resubscribe to channels that were unsubscribed before reconnection", async () => {
      await vi.runAllTimersAsync();

      const capture1 = createSubscribeCapture(mockCometD);
      const capture2 = createSubscribeCapture(mockCometD);

      createUnsubscribeCapture(mockCometD);

      const sub1Promise = service.subscribe("/channel1" as TypedReceiveChannelId<object>, vi.fn());
      const sub2Promise = service.subscribe("/channel2" as TypedReceiveChannelId<object>, vi.fn());

      await vi.runAllTimersAsync();

      capture1.subscribeCallback?.({ channel: "/channel1", successful: true });
      capture2.subscribeCallback?.({ channel: "/channel2", successful: true });

      await vi.runAllTimersAsync();
      const sub1Id = await sub1Promise;
      await sub2Promise;

      service.unsubscribe(sub1Id);

      mockCometD.resubscribe.mockClear();

      await completeHandshake("reconnect-client-id");

      expect(mockCometD.resubscribe).toHaveBeenCalledTimes(1);
      expect(mockCometD.resubscribe).toHaveBeenCalledWith(capture2.handle, expect.anything());
      expect(mockCometD.resubscribe).not.toHaveBeenCalledWith(capture1.handle, expect.anything());
    });
  });
});

interface SubscribeCapture {
  handle: SubscriptionHandle;
  messageCallback: Callback | undefined;
  subscribeCallback: Callback | undefined;
}

function createSubscribeCapture(mockCometD: MockProxy<CometD>): SubscribeCapture {
  const handle = { id: `handle-${Math.random()}` } as SubscriptionHandle;
  const capture: SubscribeCapture = {
    handle,
    messageCallback: undefined,
    subscribeCallback: undefined,
  };

  mockCometD.subscribe.mockImplementationOnce(
    (
      _channel: string,
      messageCallback: Callback,
      subscribeCallbackOrProps: Callback | object,
      maybeSubscribeCallback?: Callback,
    ) => {
      capture.messageCallback = messageCallback;
      const callback = typeof subscribeCallbackOrProps === "function"
        ? subscribeCallbackOrProps
        : maybeSubscribeCallback;
      capture.subscribeCallback = callback as Callback | undefined;
      return handle;
    },
  );

  mockCometD.resubscribe.mockImplementation((oldHandle: SubscriptionHandle, _props?: object) => {
    return oldHandle;
  });

  return capture;
}

interface UnsubscribeCapture {
  unsubscribeCallback: Callback | undefined;
}

function createUnsubscribeCapture(mockCometD: MockProxy<CometD>): UnsubscribeCapture {
  const capture: UnsubscribeCapture = {
    unsubscribeCallback: undefined,
  };

  mockCometD.unsubscribe.mockImplementation(
    (
      _handle: SubscriptionHandle,
      unsubscribeCallbackOrProps: Callback | object,
      maybeUnsubscribeCallback?: Callback,
    ) => {
      const callback = typeof unsubscribeCallbackOrProps === "function"
        ? (unsubscribeCallbackOrProps as Callback)
        : maybeUnsubscribeCallback;
      capture.unsubscribeCallback = callback;
    },
  );

  return capture;
}
