import type * as Chat from "@app/domain/api/chat-rpc";
import * as Context from "effect/Context";
import * as PubSub from "effect/PubSub";
import * as Schema from "effect/Schema";
import type * as Take from "effect/Take";
import * as Tool from "effect/unstable/ai/Tool";
import * as Toolkit from "effect/unstable/ai/Toolkit";
import { JokeApiError } from "./joke-api.js";
import { WeatherApiError } from "./weather-api.js";

export class ChatMailbox extends Context.Service<
  ChatMailbox,
  PubSub.PubSub<Take.Take<Chat.ChatEvent>>
>()("ChatMailbox") {}

const getCurrentDateTime = Tool.make("getCurrentDateTime", {
  description: "Get the current date and time",
  parameters: Schema.Struct({}),
  success: Schema.String,
  dependencies: [ChatMailbox],
});

const getWeather = Tool.make("getWeather", {
  description: "Get current weather for a location",
  failureMode: "return",
  parameters: Schema.Struct({
    latitude: Schema.Union([Schema.Number, Schema.NumberFromString]),
    longitude: Schema.Union([Schema.Number, Schema.NumberFromString]),
  }),
  success: Schema.String,
  failure: WeatherApiError,
  dependencies: [ChatMailbox],
});

const fetchRandomJoke = Tool.make("fetchRandomJoke", {
  description: "Fetch a random dad joke",
  failureMode: "return",
  parameters: Schema.Struct({}),
  success: Schema.String,
  failure: JokeApiError,
  dependencies: [ChatMailbox],
});

export const ChatToolkit = Toolkit.make(
  getCurrentDateTime,
  getWeather,
  fetchRandomJoke,
);
