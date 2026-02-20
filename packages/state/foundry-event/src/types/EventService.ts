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

import type { Branded } from "@palantir/pack.core";

export type SubscriptionId = Branded<"eventService:subscriptionId">;
export type ChannelId = Branded<"eventService:channelId">;
export type TypedPublishChannelId<S = unknown> = ChannelId & {
  readonly _channelPublishType: S;
};

export type TypedReceiveChannelId<R = unknown> = ChannelId & {
  readonly _channelReceiveType: R;
};

export type EventServiceLogLevel = "warn" | "info" | "debug";

export interface EventService {
  /**
   * Subscribes to a channel
   * @param channel EventsChannel to subscribe to.
   * @param receivedEventCallback Callback that is called when an event is published to the channel.
   * @param getSubscriptionRequest Callback that is called when channel is resubscribed to after a disconnect
   * @returns Promise that resolves to the subscriptionId that can be used to unsubscribe.
   */
  subscribe<R extends object>(
    channel: TypedReceiveChannelId<R>,
    receivedEventCallback: (payload: R) => void,
    getSubscriptionRequest?: () => object,
  ): Promise<SubscriptionId>;

  /**
   * Unsubscribe from a channel.
   * @param subscriptionId SubscriptionId from the subscribe call.
   */
  unsubscribe(
    subscriptionId: SubscriptionId,
  ): void;

  /**
   * Publish to a channel.
   * @param channel Channel to publish to.
   * @param content Payload object to push to channel.
   * @returns Promise that resolves if the publish was successful and rejects if the publish fails.
   */
  publish<S extends object>(
    channel: TypedPublishChannelId<S>,
    content: S,
  ): Promise<void>;

  /**
   * Set log level for the service.
   * @param logLevel The log level, or undefined if no logging desired.
   */
  setLogLevel(logLevel?: EventServiceLogLevel): void;
}
