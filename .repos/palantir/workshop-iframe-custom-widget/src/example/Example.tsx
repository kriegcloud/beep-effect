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
import React from "react";
import { COMPREHENSIVE_EXAMPLE_CONFIG } from "./ExampleConfig";
import {
  IAsyncValue,
  visitLoadingState,
} from "../types/loadingState";
import { IWorkshopContext } from "../types/workshopContext";
import { useWorkshopContext } from "../";
import { ObjectSetLocators } from "../types";

/**
 * This is an example of how to use `useWorkshopContext`, and then ensure that the context object returned is loaded before
 * retrieving values or setting values.
 */
export const Example = () => {
  const workshopContext = useWorkshopContext<typeof COMPREHENSIVE_EXAMPLE_CONFIG>(COMPREHENSIVE_EXAMPLE_CONFIG);
  // Use a visitor function to render based on the async status of the workshop context object
  return visitLoadingState(workshopContext, {
    loading: () => <>Loading...</>,
    succeeded: loadedContext => <LoadedComprehensiveExample loadedWorkshopContext={loadedContext} />, 
    reloading: _reloadingContext => <>Reloading...</>,
    failed: _error => <>Error...</>, 
  });
};

/**
 * This is an example of how to set the maximum height of the iframe in Workshop.
 * Note: This only works when the Workshop widget's height is set to "Auto (max)".
 */
export const IframeHeightExample = () => {
  const workshopContext = useWorkshopContext(COMPREHENSIVE_EXAMPLE_CONFIG, { enableSetAutoMaxHeight: true });

  // Use a visitor function to render based on the async status of the workshop context object
  return visitLoadingState(workshopContext, {
    loading: () => <>Loading...</>,
    succeeded: loadedContext => {
      // Set the iframe maximum height to 500 pixels
      loadedContext.setAutoMaxHeight(500);
      // To access the config values, use loadedContext.context
      const context: IWorkshopContext<typeof COMPREHENSIVE_EXAMPLE_CONFIG> = loadedContext.context;
      console.log(context.stringField.fieldValue, context.booleanField.fieldValue);

      return <>Iframe height set to 500 pixels</>;
    }, 
    reloading: _reloadingContext => <>Reloading...</>,
    failed: _error => <>Error...</>, 
  });
};

/**
 * This is an example of how to use values and setter methods inside of the context object.
 */
const LoadedComprehensiveExample: React.FC<{
  loadedWorkshopContext: IWorkshopContext<typeof COMPREHENSIVE_EXAMPLE_CONFIG>;
}> = (props) => {
  const {
    stringField,
    booleanField,
    numberField,
    dateField,
    timestampField,
    stringListField,
    objectSetField,
    temporaryObjectSetRidField,
    event,
    booleanListField,
    numberListField,
    dateListField,
    timestampListField,
    listOfFields,
  } = props.loadedWorkshopContext;

  /**
   * Examples of retrieving field values.
   */
  const stringFieldValue: IAsyncValue<string | undefined> =
    stringField.fieldValue;
  const booleanFieldValue: IAsyncValue<boolean | undefined> =
    booleanField.fieldValue;
  const numberFieldValue: IAsyncValue<number | undefined> =
    numberField.fieldValue;
  // date values are stored as strings in format "yyyy-mm-dd"
  const dateFieldValue: IAsyncValue<string | undefined> = dateField.fieldValue;
  const timestampFieldValue: IAsyncValue<Date | undefined> =
    timestampField.fieldValue;

  // Use https://www.npmjs.com/package/@osdk/client < 2.0 to query Ontology objects
  const objectSetFieldValue: IAsyncValue<ObjectSetLocators | undefined> =
    objectSetField.fieldValue;

  // Use https://www.npmjs.com/package/@osdk/client version >= 2.0 to query Ontology objects
  // See `hydrateObjectSetFromRid` to resolve a temporaryObejctSetRid into an object set
  // and `createAndFetchTempObjectSetRid` to convert an object set to a temporaryObejctSetRid when setting a value in Workshop 
  const temporaryObjectSetRidFieldValue: IAsyncValue<string | undefined> = temporaryObjectSetRidField.fieldValue;

  const stringListFieldValue: IAsyncValue<string[] | undefined>  =
    stringListField.fieldValue;
  const booleanListFieldValue: IAsyncValue<boolean[] | undefined> =
    booleanListField.fieldValue;
  const numberListFieldValue: IAsyncValue<number[] | undefined> =
    numberListField.fieldValue;
  // date arrays are stored as a string array with every entry in the format "yyyy-mm-dd" 
  const dateListFieldValue: IAsyncValue<string[] | undefined> =
    dateListField.fieldValue;
  const timestampListFieldValue: IAsyncValue<Date[] | undefined> =
    timestampListField.fieldValue;

  /**
   * Examples of setting values on the config fields.
   */
  stringField.setLoading();
  stringField.setLoadedValue("Hello world!!!"); // The value takes the config field type, in this case, string
  stringField.setReloadingValue("I am reloading..."); // The value takes the config field type, in this case, string
  stringField.setFailedWithError("Oh no, an error occurred!"); // Takes string for error message

  booleanField.setLoading();
  booleanField.setLoadedValue(false); // The value takes the config field type, in this case, boolean
  booleanField.setReloadingValue(true); // The value takes the config field type, in this case, boolean
  booleanField.setFailedWithError("Oh no, an error occurred!"); // Takes string for error message

  dateField.setLoading();
  dateField.setLoadedValue(new Date("2024-01-01")); // The value takes the config field type, in this case, Date. Note that the value saved is a string in format "yyyy-mm-dd"
  dateField.setReloadingValue(new Date("2024-12-31")); // The value takes the config field type, in this case, Date. Note that the value saved is a string in format "yyyy-mm-dd"
  dateField.setFailedWithError("Oh no, an error occurred!");  // Takes string for error message

  /**
   * Examples of executing an event
   */
  event.executeEvent(undefined); // Takes a React MouseEvent, or undefined if not applicable

  /**
   * Examples of ListOf config. These are accessed by index.
   */
  listOfFields.forEach((listItem, index) => {
    // Events inside of listOf also have an execution method
    listItem.eventInsideListOf.executeEvent(undefined); // Takes a React MouseEvent, or undefined if not applicable

    // Single fields inside listOf each also have a value and setter methods
    // @ts-ignore
    const stringValueInsideListOf: IAsyncValue<string | undefined> =
      listItem.stringFieldInsideListOf.fieldValue;
    listItem.stringFieldInsideListOf.setLoading();
    listItem.stringFieldInsideListOf.setLoadedValue(
      `I am a string inside of a listOf at index ${index}`
    );
    listItem.stringFieldInsideListOf.setReloadingValue(
      `stringFieldInsideListOf is reloading at ${index}`
    );
    listItem.stringFieldInsideListOf.setFailedWithError(
      `stringFieldInsideListOf failed to load at ${index}`
    );

    // Can have nested listOf configs
    listItem.nestedListOfField.forEach((nestedListItem, nestedIndex) => {
      // Single fields inside nested listOf configs also have value and setter methods
      nestedListItem.booleanListInsideNestedListof.setLoading();
      nestedListItem.booleanListInsideNestedListof.setLoadedValue([true, true]);
      nestedListItem.booleanListInsideNestedListof.setLoadedValue([
        false,
        true,
      ]);
      nestedListItem.booleanListInsideNestedListof.setFailedWithError(
        `booleanListInsideNestedListof failed to load at ${nestedIndex}`
      );
    });
  });

  return <>
    {stringFieldValue}
    <br />
    {booleanFieldValue}
    <br />
    {numberFieldValue}
    <br />
    {dateFieldValue}
    <br />
    {timestampFieldValue}
    <br />
    {objectSetFieldValue}
    <br /> 
    {temporaryObjectSetRidFieldValue}
    <br />
    {stringListFieldValue}
    <br />
    {booleanListFieldValue}
    <br />
    {numberListFieldValue}
    <br />
    {dateListFieldValue}
    <br />
    {timestampListFieldValue}
  </>;
};
