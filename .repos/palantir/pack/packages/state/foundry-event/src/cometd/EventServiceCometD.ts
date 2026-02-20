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

import type { Logger } from "@osdk/api";
import { getAuthModule } from "@palantir/pack.auth";
import type { AppConfig, PackAppInternal } from "@palantir/pack.core";
import type { AckExtension, CometD, Message, SubscriptionHandle } from "cometd";
import type {
  EventService,
  EventServiceLogLevel,
  SubscriptionId,
  TypedPublishChannelId,
  TypedReceiveChannelId,
} from "../types/EventService.js";
import { lazyLoadCometD } from "./lazyLoadCometD.js";

const BEARER_TOKEN_FIELD = "bearer-token";
const EXTENSION_ACK = "AckExtension";
const EXTENSION_HANDSHAKE_TOKEN = "handshakeToken";
const META_CHANNEL_HANDSHAKE = "/meta/handshake";

interface Subscription {
  readonly eventChannel: TypedReceiveChannelId;
  /** Updates on  */
  handle: SubscriptionHandle;
  readonly getSubscriptionRequest?: () => object;
}

export interface CometDLoader {
  (): Promise<{
    AckExtension: new() => AckExtension;
    CometD: new() => CometD;
  }>;
}

export class EventServiceCometD implements EventService {
  private readonly logger: Logger;
  private initializePromise: Promise<void> | undefined;
  private readonly subscriptionById: Map<SubscriptionId, Subscription> = new Map();
  private readonly tokenExtension = new TokenExtension();
  private nextSubscriptionHandle = 0;
  private cometd?: CometD;

  constructor(
    private readonly app: PackAppInternal,
    private readonly cometdLoader: CometDLoader = lazyLoadCometD,
  ) {
    this.logger = app.config.logger.child({}, { msgPrefix: "EventServiceCometD" });

    // Any time the token changes, update the extension so reconnection requests use the new token.
    // This will also be called on initial token set when the auth module is initialized.
    getAuthModule(app).onTokenChange(token => {
      this.tokenExtension.setToken(token);
    });
  }

  private async initialize(): Promise<void> {
    if (this.initializePromise != null) {
      return this.initializePromise;
    }

    this.initializePromise = (async () => {
      if (this.cometd == null) {
        const { AckExtension, CometD } = await this.cometdLoader();
        this.cometd = new CometD();
        this.configureCometd();

        this.cometd.registerExtension(EXTENSION_ACK, new AckExtension());
        this.cometd.registerExtension(EXTENSION_HANDSHAKE_TOKEN, this.tokenExtension);

        // TODO: Support binary messages
        // this.cometd.registerExtension(BINARY_EXTENSION_NAME, new BinaryExtension());
      }

      await new Promise<void>(resolve => {
        this.cometd!.addListener(
          META_CHANNEL_HANDSHAKE,
          ({ clientId, connectionType, error, successful }) => {
            if (successful) {
              this.logger.info("CometD handshake successful", { clientId, connectionType });
              resolve();

              this.cometd!.batch(() => {
                this.subscriptionById.forEach((subscription, subscriptionId) => {
                  this.logger.debug("Resubscribing to channel", {
                    channel: subscription.eventChannel,
                    subscriptionId,
                  });
                  const subscribeProps = subscription.getSubscriptionRequest?.();
                  subscription.handle = this.cometd!.resubscribe(subscription.handle, {
                    ext: subscribeProps,
                  });
                });
              });
            } else {
              this.logger.warn("CometD handshake failed", { clientId, error });
            }
          },
        );

        const authModule = getAuthModule(this.app);
        void authModule.getToken().then(token => {
          this.logger.info("Initializing CometD with token");
          this.tokenExtension.setToken(token);
          this.cometd!.handshake();
        });
      });
    })();

    return this.initializePromise;
  }

  public async subscribe<T extends object>(
    channel: TypedReceiveChannelId<T>,
    onMessage: (payload: T) => void,
    getSubscriptionRequest?: () => object,
  ): Promise<SubscriptionId> {
    await this.initialize();

    if (this.cometd == null) {
      throw new Error("CometD not initialized");
    }

    const subscriptionId = (this.nextSubscriptionHandle++).toString(10) as SubscriptionId;

    return new Promise<SubscriptionId>(
      (resolve, reject) => {
        const messageHandler = (receivedData: Message) => {
          if (!this.subscriptionById.has(subscriptionId)) {
            this.logger.info("Dropping message for unsubscribing channel", {
              channel,
              subscriptionId,
            });
            return;
          }

          this.logger.debug("Received message on channel", {
            channel,
            subscriptionId,
            hasData: receivedData.data != null,
          });
          onMessage(receivedData.data as T);
        };

        const subscribeCallback = (message: Message) => {
          if (message.successful) {
            this.logger.debug("Successfully subscribed to channel", {
              channel,
              subscriptionId,
            });
            resolve(subscriptionId);
          } else {
            this.subscriptionById.delete(subscriptionId);
            // TODO: Is failure really expected? It's not on the type...
            const maybeFailureReason = "failure" in message
                && typeof message.failure === "object"
                && message.failure
                && "reason" in message.failure
                && typeof message.failure.reason === "string"
              ? message.failure.reason
              : undefined;

            this.logger.error(
              "Failed to subscribe to channel ",
              { channel, error: message.error, maybeFailureReason },
            );

            const errorMessage = message.error
              ?? (maybeFailureReason != null
                ? `(no error message provided by server, a guess: ${maybeFailureReason})`
                : "(no error message provided by server)");

            reject(new Error(`Failed to subscribe to channel ${channel}: ${errorMessage}`));
          }
        };

        const ext = getSubscriptionRequest?.();

        const subscriptionHandle = ext != null
          ? this.cometd!.subscribe(
            channel,
            messageHandler,
            { ext },
            subscribeCallback,
          )
          : this.cometd!.subscribe(
            channel,
            messageHandler,
            subscribeCallback,
          );

        this.subscriptionById.set(subscriptionId, {
          handle: subscriptionHandle,
          getSubscriptionRequest,
          eventChannel: channel,
        });
      },
    );
  }

  public unsubscribe(
    subscriptionId: SubscriptionId,
  ): void {
    const subscription = this.subscriptionById.get(subscriptionId);
    if (subscription == null) {
      this.logger.warn("Attempted to unsubscribe from unknown subscriptionId", {
        subscriptionId,
      });
      return;
    }

    const { handle, eventChannel } = subscription;

    this.subscriptionById.delete(subscriptionId);

    if (this.cometd == null) {
      this.logger.warn("CometD not initialized, cannot unsubscribe", { subscriptionId });
      return;
    }

    this.cometd.unsubscribe(
      handle,
      message => {
        if (!message.successful) {
          this.logger.warn("Server unsubscribe confirmation failed", {
            eventChannel,
            subscriptionId,
            error: message.error,
          });
        }
      },
    );
  }

  async publish<T extends object>(
    channel: TypedPublishChannelId<T>,
    content: T,
  ): Promise<void> {
    await this.initialize();

    if (this.cometd == null) {
      throw new Error("CometD not initialized");
    }

    return new Promise<void>((resolve, reject) => {
      this.cometd!.publish(channel, content, message => {
        if (message.successful) {
          this.logger.debug("Successfully published message", channel, { content });
          resolve();
        } else {
          const error = new Error(
            `Failed to publish to ${channel}`,
            { cause: message.error },
          );
          this.logger.error("Failed to publish", { channel, error });
          reject(error);
        }
      });
    });
  }

  setLogLevel(logLevel?: EventServiceLogLevel): void {
    this.configureCometd(logLevel);
  }

  private configureCometd(logLevel?: EventServiceLogLevel) {
    if (this.cometd == null) {
      return;
    }

    const url = getCometDWebsocketUrl(this.app.config);
    this.logger.info("Configuring cometD ", { url });
    this.cometd.configure({
      url,
      // NOTE : Allow higher latency on busy networks to avoid retry loops when servers or networks fall behind.
      maxNetworkDelay: 30_000,
      logLevel,
      autoBatch: true,
    });
  }
}

function getCometDWebsocketUrl(appConfig: AppConfig) {
  const httpUrl = new URL(
    `${appConfig.remote.packWsPath}/cometd`,
    appConfig.remote.baseUrl,
  );
  httpUrl.protocol.replace(/https?/, "ws");
  // TODO: likely need a specific port for ingest - all of this should be in in appConfig
  return httpUrl.href;
}

class TokenExtension {
  private currentToken: string | undefined;

  setToken(token: string | undefined) {
    this.currentToken = token;
  }

  outgoing = (message: Message) => {
    // Always use the latest token when doing a handshake (handles reconnects)
    if (message.channel === META_CHANNEL_HANDSHAKE) {
      if (this.currentToken) {
        message.ext ??= {};
        (message.ext as Record<string, unknown>)[BEARER_TOKEN_FIELD] = this.currentToken;
      }
    }
    return message;
  };
}
