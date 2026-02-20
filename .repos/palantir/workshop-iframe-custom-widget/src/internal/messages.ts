/**
Copyright 2024 Palantir Technologies, Inc.

Licensed under Palantir's License;
you may not use this file except in compliance with the License.
You may obtain a copy of the License from the root of this repository at LICENSE.md

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
import { IConfigValueMap } from "./configValues";
import { IAsyncValue } from "../types/loadingState";
import { ILocator } from "./locator";
import { IVariableToSet } from "./variableValues";
import { IConfigDefinition } from "../types";

export enum MESSAGE_TYPES_TO_WORKSHOP {
  SENDING_CONFIG = "react-app-sending-config",
  SETTING_VALUE = "react-app-setting-value",
  EXECUTING_EVENT = "react-app-executing-event",
  SET_AUTO_MAX_HEIGHT = "react-app-set-auto-max-height",
}

export enum MESSAGE_TYPES_FROM_WORKSHOP {
  CONFIG_ACCEPTED = "workshop-accepted-config",
  CONFIG_REJECTED = "workshop-rejected-config",
  REQUESTING_CONFIG = "workshop-requesting-config",
  VALUE_CHANGE = "workshop-value-change",
}

/**
 * Messages to send to Workshop.
 */
export type IMessageToWorkshop =
  | ISendConfigToWorkshopMessage
  | ISetWorkshopValue
  | IExecuteWorkshopEvent
  | ISetHeightMessage;

/**
 * Messages that can be recieved from Workshop
 */
export type IMessageFromWorkshop =
  | IWorkshopAcceptedConfigMessage
  | IWorkshopRejectedConfigMessage
  | IWorkshopRequestedConfigMessage
  | IValueChangeFromWorkshopMessage;

/**
 * Sends the config to Workshop
 */
export interface ISendConfigToWorkshopMessage {
  type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG;
  config: IConfigDefinition;
  pathname?: string; 
}

/**
 * Sets an output config field's value in Workshop.
 */
export interface ISetWorkshopValue {
  type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE;
  iframeWidgetId: string;
  valueLocator: ILocator;
  value?: IAsyncValue<IVariableToSet>;
}

/**
 * Executes an event in Workshop.
 */
export interface IExecuteWorkshopEvent {
  type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT;
  iframeWidgetId: string;
  eventLocator: ILocator;
  mouseEvent?: MouseEvent;
}

/**
 * Sets the height of the iframe in Workshop.
 */
export interface ISetHeightMessage {
  type: MESSAGE_TYPES_TO_WORKSHOP.SET_AUTO_MAX_HEIGHT;
  iframeWidgetId: string;
  height: number;
}

/**
 * Workshop has accepted the config.
 */
export interface IWorkshopAcceptedConfigMessage {
  type: MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED;
  iframeWidgetId: string;
  configValues: IConfigValueMap;
}

/**
 * Workshop has rejected the config. The reason for rejection will be reported by Workshop.
 */
export interface IWorkshopRejectedConfigMessage {
  type: MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED;
  iframeWidgetId: string;
  rejectionReason: string;
}

/**
 * Workshop is requesting the config. This will occur when the config panel is open, to ensure that the widget's
 * stored config definition matches the iframed app's config definition, and then merge/remove fields if necessary.
 */
export interface IWorkshopRequestedConfigMessage {
  type: MESSAGE_TYPES_FROM_WORKSHOP.REQUESTING_CONFIG;
  iframeWidgetId: string;
}

/**
 * Workshop is alerting that an input value has changed.
 * Value type checking occurs before the value change actually takes effect and the value is saved.
 */
export interface IValueChangeFromWorkshopMessage {
  type: MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE;
  iframeWidgetId: string;
  configValues: IConfigValueMap;
}
