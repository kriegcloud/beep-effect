/*
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
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
import styles from "./MainContent.module.scss";
import ReactMarkdown from "react-markdown";
import SchemaForm from "./SchemaForm/SchemaForm";
import ParametersSection from "./SchemaForm/ParametersSection";
import SubmitButton from "./SchemaForm/SubmitButton";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveMethod,
  selectActiveTab,
  selectEndpoints,
  selectInputValues,
  selectResponse,
} from "./features/form/selectors"
import ExportSection from "./SchemaForm/ExportSection"
import { useEffect } from "react";
import { registerHeader, unregisterHeader } from "./features/form/slice";
import { getOperationName } from "./features/form/operationMappings";
import { FormValidationProvider } from './SchemaForm/FormValidationContext';

const MainContent = ({}) => {
  const activeTab = useSelector(selectActiveTab);
  const activeMethod = useSelector(selectActiveMethod);
  const endpoints = useSelector(selectEndpoints);
  const inputValues = useSelector(selectInputValues);
  const response = useSelector(selectResponse);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeTab !== null) {
      // Register this header when component mounts
      dispatch(registerHeader('endpoint-details'));
    }
    // Unregister when component unmounts
    return () => {dispatch(unregisterHeader('endpoint-details'))};
  }, [dispatch, activeTab]);

  const parseDescription = (description: string) => {
    if (description.includes(":::")) {
      const sections = description.split(":::");
      return {
        warning: (
          <div className={styles.callout}>
            <strong>Warning:</strong> This endpoint is in preview and may be
            modified or removed at any time. To use this endpoint, add
            preview=true to the request query parameters
          </div>
        ),
        description: sections.slice(2).toString(),
      };
    }
    return { warning: null, description: description };
  };

  
  // Post-processing function to parse the request body to remove any union type indicators and null/empty values
  // This is done to ensure that the request body is valid JSON and does not contain any extraneous values
  const parseRequestBody = () => {
    
    const schemaName = Object.keys(inputValues)[0];
    let requestBody = inputValues[schemaName];

    // Loop through object if the schema contains a potential union
    if (requestBody !== undefined){

      const checkNullObj = (currObj : any) => {
        if (currObj === null || (Object.keys(currObj).length === 0 && (typeof currObj == "string" || typeof currObj == "object"))){
          return null;
        }
        // Set array to only non null indices, null if none are
        if (Array.isArray(currObj)){
          currObj = currObj.filter(arrayElement => searchObjs(arrayElement) != null);
          if (currObj.length == 0){
            return null;
          }
        }
        return currObj;
      }
      
      // Function to search through the object recursively
      const searchObjs = (currObj: any) => {        
        currObj = checkNullObj(currObj);
        if (currObj === null || typeof currObj === 'string' || typeof currObj === 'number')
          return currObj;
        var currKeys = Object.keys(currObj);
        for (let i = 0; i < currKeys.length; i++){
          // Current nested key and value/object
          var currObjKey = currKeys[i];
          var nestedObj = currObj[currObjKey];
          
          // Check if value is string and has [union] indicator
          if (typeof nestedObj === 'string'){  
            // If union is found, create new object contructed with the nested values of the union type and the discriminator property.
            // Currently assumes that only one object is allowed alongside the union discriminator (OneOf)     
            if(nestedObj.slice(-7) == "[UNION]"){
              var unionObjectIndex = (i == 1) ? 0: 1;
              // This call is done to remove potential nulls from the union object
              currObj[currKeys[unionObjectIndex]] = searchObjs(currObj[currKeys[unionObjectIndex]]);
              currObj = {...currObj[currKeys[unionObjectIndex]], [currObjKey]: nestedObj.slice(0,-7)};
              return currObj;
            }
          }

          // Set values to ensure underlying object is changed
          let parsedNestedObj = searchObjs(nestedObj);
          // If null, deleted underlying object
          if (parsedNestedObj === null){
            delete currObj[currObjKey];
          }
          // Otherwise just set the value since the value could have been changed (specifically union types)
          else {
            currObj[currObjKey] = parsedNestedObj;
          }
        }
        
        // If we deleted something from this object, check to see if we need to delete the current object too
        currObj = checkNullObj(currObj);
        return currObj;
      }

      // Initial object search call
      requestBody = searchObjs(JSON.parse(JSON.stringify(requestBody)));
    }

    return JSON.stringify(requestBody || {}, null, 2);
  };

  const renderContent = () => {
    if (activeTab === null || activeMethod === null) return <div>Select a tab to view content</div>;

    const details = endpoints[activeTab][activeMethod];
    const { warning, description } = parseDescription(details.description);
    const schemaRef =
      details.requestBody?.content["application/json"].schema["$ref"];
    const example = details.requestBody?.content["application/json"].example;
    return (
      <FormValidationProvider>
      <div>
        <section id="endpoint-name">
          <span className={styles.mainContentHeader}>{getOperationName(details.operationId)}</span>
        </section>
        <section id="endpoint-details">
          <h3 className={styles.endpointDetails}>Endpoint details</h3>
          <p>
            <strong>Operation ID:</strong> {details.operationId}
          </p>
          <p>Method: {activeMethod.toLocaleUpperCase()}</p>
          <p>Path: {activeTab}</p>
          {warning}
          <ReactMarkdown>{description}</ReactMarkdown>
        </section>
        <section className={styles.queryParameters} id="query-parameters">
          <ParametersSection
            parameters={details.parameters}
          />
        </section>
        {schemaRef ? (
          <section id="request-body">
            <h3>Request Body</h3>
            <SchemaForm
              schemaRef={schemaRef} example={example}
            />
          </section>
        ) : (
          <div/>
        )}
        <section className={styles.submitButton}>
        <SubmitButton
          method={activeMethod.toLocaleUpperCase()}
          parseRequestBody={parseRequestBody}
        />
        </section>
        <hr />
        <section className={styles.responseBody} id="response-body">
          <h2>Response</h2>
          <pre>{response ? JSON.stringify(response) : ""}</pre>
        </section>
        <ExportSection
          method={activeMethod.toLocaleUpperCase()}
          requestBody={parseRequestBody()}
        />
      </div>
      </FormValidationProvider>
    );
  };

  return <main className={styles.mainContent}>{renderContent()}</main>;
};

export default MainContent;
