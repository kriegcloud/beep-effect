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
import React, { useEffect } from 'react';
import styles from './SubmitButton.module.scss';
import { auth } from '../client';
import { useDispatch, useSelector } from "react-redux";
import {
  selectInputParams,
  selectInputValues,
  selectImageData,
  selectFullPath,
  selectActiveTab,
  selectParamFormErrors,
  selectRequestFormErrors,
} from "../features/form/selectors"
import {
  setResponse,
  setImageData,
  registerHeader, 
  unregisterHeader,
} from "../features/form/slice"
import { useFormValidation } from './FormValidationContext';

interface SubmitButtonProps {
    method: string;
    parseRequestBody: () => string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({method, parseRequestBody}) => {
    const inputValues = useSelector(selectInputValues);
    const inputParams = useSelector(selectInputParams);
    const imageData = useSelector(selectImageData);
    const fullPath = useSelector(selectFullPath);
    const activeTab = useSelector(selectActiveTab);
    const paramErrors = useSelector(selectParamFormErrors);
    const requestErrors = useSelector(selectRequestFormErrors);
    const dispatch = useDispatch();

    const { validateRequestForm, validateParamForm } = useFormValidation();

    useEffect(() => {
        // Register this header when component mounts
        dispatch(registerHeader('response-body'));
        
        // Unregister when component unmounts
        return () => {dispatch(unregisterHeader('response-body'))};
    }, [dispatch]);

    const imageResponseEndpoints = ["/maprendering/resources/tiles", "/maprendering/symbols/generic", "/maps/rendering/symbol"]

    const handleSubmit = async () => {

        const paramErrors = validateParamForm();
        const requestErrors = validateRequestForm();

        if (Object.keys(paramErrors).length > 0 || Object.keys(requestErrors).length > 0) {
            console.log("Form has path parameter validation errors:", paramErrors);
            console.log("Form has request body validation errors:", requestErrors);
            // scroll to the first error
            const firstErrorField = document.querySelector(`.${styles.inputError}`);
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            const requestBody = parseRequestBody();

            console.log("Endpoint Path:", method + " " + fullPath);
            console.log("Input Params:", inputParams);
            console.log("Request Body:", requestBody);

            try {
                const TOKEN = (await auth.refresh())?.access_token;    

                const fetchOptions: RequestInit = {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${TOKEN}`
                    }
                };
                
                // Only add Content-Type and body for methods that support a request body
                if (method !== 'GET' && method !== 'HEAD') {
                    fetchOptions.headers = {
                        ...fetchOptions.headers,
                        'Content-Type': 'application/json'
                    };
                    fetchOptions.body = requestBody;
                }

                const response = await fetch(fullPath, fetchOptions);
                
                let result = "";
                if (!response.ok) {
                    console.error(`HTTP error! Status: ${response.status}`);
                    result = await response.json();
                }
                else if (activeTab!.includes("/kmz")) {
                    const schemaName = Object.keys(inputValues)[0]
                    const filename = ("name" in inputValues[schemaName] ? inputValues[schemaName]["name"] : "palantir-export") + ".kmz";
                    try {
                        await handleDownload(response, filename);
                        result = "Successfully downloaded file";
                    } catch (error) {
                        result = "Error downloading the file: " + error;
                        console.error(result);
                    }
                }
                else if (imageResponseEndpoints.some((endpoint) => activeTab!.includes(endpoint))) {
                    try {
                        await handleLoadImage(response);
                        result = "Successfully loaded image"
                    } catch (error) {
                        result = "Error loading image: " + error;
                        console.error(result);
                    }
                }
                else {
                    result = await response.json();
                }

                console.log("response: " + JSON.stringify(result));
                (dispatch(setResponse(result)));
            } catch (err) {
                console.error('Error fetching:', err);
            }
        }
    };

    const handleDownload = async (response: any, fileName: string) => {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return blob
    }

    const handleLoadImage = async (response: any) => {
        const data = await response.blob();
        dispatch(setImageData(URL.createObjectURL(data)));
        return data;
    }

    const showErrorMessage = Object.keys(paramErrors).length > 0 || Object.keys(requestErrors).length > 0;

    return (
        <div className={styles.submitContainer}>
            {showErrorMessage && (
                <div className={styles.errorSummary}>
                    <p>Please fix the following errors:</p>
                    <ul>
                        {Object.entries(paramErrors).map(([field, message]) => (
                            <li key={field}>{field.split('.').pop()}: {message}</li>
                        ))}
                        {Object.entries(requestErrors).map(([field, message]) => (
                            <li key={field}>{field.split('.').pop()}: {message}</li>
                        ))}
                    </ul>
                </div>
            )}
            <button className={styles.submitButton} onClick={handleSubmit}>Submit</button>
            {imageResponseEndpoints.some((endpoint) => fullPath.includes(endpoint)) && imageData && (
                <div className={styles.imageResponse}>
                    <h2>Image Response</h2>
                    <img src={imageData} alt="Tile" className={styles.responseImage} />
                </div>
            )}
        </div>
    );
};

export default SubmitButton;
