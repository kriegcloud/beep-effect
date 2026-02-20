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
import React, { useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ParametersSection.module.scss';
import { useDispatch, useSelector } from "react-redux";
import {
  selectSchemas,
  selectInputParams,
  selectParamFormErrors,
} from "../features/form/selectors"
import {
  updateParam,
  registerHeader, 
  unregisterHeader,
  removeParamFormError,
} from "../features/form/slice"
import { useFormValidation } from './FormValidationContext';

interface ParametersSectionProps {
    parameters: { [key: string]: any }
}

export const ParametersSection: React.FC<ParametersSectionProps> = ({ parameters }) => {
    const schemas = useSelector(selectSchemas);
    const inputParams = useSelector(selectInputParams);
    const paramErrors = useSelector(selectParamFormErrors);
    const dispatch = useDispatch();

    const { registerParamValidationFunction } = useFormValidation();

    useEffect(() => {
        // Register this header when component mounts
        dispatch(registerHeader('query-parameters'));
        
        // Unregister when component unmounts
        return () => {dispatch(unregisterHeader('query-parameters'))};
    }, [dispatch]);

    // Set default preview parameter to true
    useEffect(() => {
        if (parameters) {
            parameters.forEach((param: any) => {
                if (param.name === "preview" && !inputParams[param.name]) {
                    dispatch(updateParam({"paramName": param.name, "value": "true", "paramType": param.in}));
                }
            });
        }
    }, [parameters, inputParams, dispatch]);

    const getParamType = (param: any) => {
        let type = "";
        if ("$ref" in param.schema) {
            const refName = param.schema["$ref"].split("/").pop()
            type = schemas[refName]["type"]
        } else {
            type = param.schema["type"]
        }
        return type === "integer" ? "number" : "string";
    }

    const getParamDesc = (param: any) => {
        if ('$ref' in param.schema) {
            const refName = param.schema["$ref"].split("/").pop()
            return schemas[refName]["description"]
        } else {
            return param.description
        }
    }

    const getParamExample = (param: any) => {
        return "Example: " + String(param.example);
        
    }

    const validateForm = useCallback((): { [key: string]: string } => {
        const errors: { [key: string]: string } = {};
        
        if (!parameters || parameters.length === 0) {
            return errors;
        }
        parameters.forEach((param: any) => {
            if (param.required) {
                const paramValue = inputParams[param.name]?.value;

                console.log("checking param " + param + " with value " + paramValue);
                
                // Check if the parameter is missing or empty
                if (paramValue === undefined || paramValue === '') {
                    errors[param.name] = `Parameter is required`;
                    return;
                }
                
                // Type validation
                const paramType = getParamType(param);
                
                if (paramType === 'number') {
                    const numValue = Number(paramValue);
                    if (isNaN(numValue)) {
                        errors[param.name] = `${param.name} must be a valid number`;
                        return;
                    }
                    if (param.schema.minimum !== undefined && numValue < param.schema.minimum) {
                        errors[param.name] = `${param.name} must be at least ${param.schema.minimum}`;
                    }
                    
                    if (param.schema.maximum !== undefined && numValue > param.schema.maximum) {
                        errors[param.name] = `${param.name} must be at most ${param.schema.maximum}`;
                    }
                }
                
                if (paramType === 'string' && param.schema.pattern) {
                    const pattern = new RegExp(param.schema.pattern);
                    if (!pattern.test(paramValue)) {
                        errors[param.name] = `${param.name} has an invalid format`;
                    }
                }
                
                if (param.schema.enum && !param.schema.enum.includes(paramValue)) {
                    errors[param.name] = `${param.name} must be one of: ${param.schema.enum.join(', ')}`;
                }
            }
        });
        
        return errors;
    }, [parameters, inputParams, getParamType]);
    

    useEffect(() => {
        // Register the validation function when component mounts and unregister on unmount
        registerParamValidationFunction(() => validateForm());
        return () => {registerParamValidationFunction(() => {return {}})};
    }, [registerParamValidationFunction, validateForm]);  

    return (
        <div className={styles.parametersSection}>
        <h3>Parameters</h3>
        <ul className={styles.parametersList}>
            {parameters && parameters.map((param: any) => (
            <li key={param.name} className={styles.parameterItem}>
                <div>
                <strong>{param.name}</strong> ({param.in}) {!param.required && (
                  <span className={styles.optionalLabel}>
                    (optional)
                  </span>
                )}:
                </div>
                <ReactMarkdown>{getParamDesc(param)}</ReactMarkdown> 
                <ReactMarkdown>{getParamExample(param)}</ReactMarkdown>
                <input 
                    className={`${styles.inputField} ${paramErrors[param.name] !== undefined ? styles.inputError : ''}`} 
                    type={getParamType(param)}
                    placeholder={param.name} 
                    value={inputParams[param.name]?.value || (param.name==="preview"
                        ? "true"
                        : "")
                    }
                    onChange={(e) => {
                        if (paramErrors[param.name]) {
                            dispatch(removeParamFormError(param.name))
                        }
                        dispatch(updateParam({"paramName": param.name, "value": e.target.value, "paramType": param.in}))
                    }}
                />
            </li>
            ))}
        </ul>
        </div>
    );
};

export default ParametersSection;
