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
import styles from './SchemaForm.module.scss';
import { useDispatch, useSelector } from "react-redux";
import {
  selectSchemas,
  selectInputValues,
  selectSelectedUnionTypes,
  selectRequestFormErrors,
} from "../features/form/selectors"
import {
  updateInputValues,
  updateSelectedUnionTypes,
  registerHeader, 
  unregisterHeader,
  removeRequestFormError,
  setRequestFormErrors,
} from "../features/form/slice"
import { useFormValidation } from './FormValidationContext';

interface SchemaFormProps {
    schemaRef: string;
    example: { [key: string]: any };
}

const SchemaForm: React.FC<SchemaFormProps> = ({ schemaRef, example }) => {
    const schemas = useSelector(selectSchemas);
    const inputValues = useSelector(selectInputValues);
    const selectedUnionTypes = useSelector(selectSelectedUnionTypes);
    const requestFormErrors = useSelector(selectRequestFormErrors);
    const dispatch = useDispatch();

    const { registerRequestValidationFunction } = useFormValidation();

    useEffect(() => {
        // Register this header when component mounts
        dispatch(registerHeader('request-body'));
        
        // Unregister when component unmounts
        return () => {dispatch(unregisterHeader('request-body'))};
    }, [dispatch]);

    const handleRemoveItem = (fieldPath: string, inputArrayValue: any, index: number) => {
        // update the value at inputValues[fieldPath] with the updated array 
        dispatch(updateInputValues({"fieldPath": fieldPath, "value": inputArrayValue.filter((_: any, i: number) => i !== index), "arrayIndex": undefined}));
    };

    const handleAddItem = (fieldPath: string, item = "") => { // for arrays
        let inputArrayValueAtPath = getValueAtPath(inputValues, fieldPath);
        if(!inputArrayValueAtPath) {
            // instantiate the fieldName key to empty array
            dispatch(updateInputValues({"fieldPath": fieldPath, "value": [item], "arrayIndex": undefined}));
        }
        else if (inputArrayValueAtPath.length === 0) {
            // adds an empty value as the array's first element
            dispatch(updateInputValues({"fieldPath": fieldPath, "value": item, "arrayIndex": 0}));
        }
        else {
            dispatch(updateInputValues({"fieldPath": fieldPath, "value": item, "arrayIndex": inputArrayValueAtPath.length}));
        }
    };

    const getValueAtPath = (obj: any, path: string) => {
        const keys = path.split('.');
        let current = obj;
    
        for (let key of keys) {
            if (key === "[UnionType]") {
                continue;
            }
            if (current[key] === undefined) {
                return undefined; // Return undefined if any key in the path doesn't exist
            }
            current = current[key]; // Move deeper into the object
        }
    
        return current; // Return the value at the end of the path
    };
    
    const validateForm = useCallback((): { [key: string]: string } => {
        const errors: {[key: string] : any} = {};
        
        // Helper function to check fields recursively
        const validateField = (fieldPath: string, schema: any) => {
            const value = getValueAtPath(inputValues, fieldPath);
            
            // Check if the field is empty
            if (schema.type === "array") {
                if (!value || value.length === 0) {
                    errors[fieldPath] = "This request field is required";
                }
            } else if (schema.type === "object") {
                // For objects, we validate each required property
                const requiredFields = schema.required || [];
                Object.entries(schema.properties).forEach(([key, subSchema]: [string, any]) => {
                    const isOptional = !requiredFields.includes(key);
                    if (!isOptional) { // Skip validation for optional fields
                        const subPath = `${fieldPath}.${key}`;
                        const ref = subSchema["$ref"];
                        if (ref) {
                            validateField(subPath, schemas[ref.split("/").pop()]);
                        } else {
                            validateField(subPath, subSchema);
                        }
                    }
                });
            } else {
                // For primitive types
                if (value === undefined || value === "") {
                    errors[fieldPath] = "This field is required";
                }
            }
        };
        
        // Start validation from the root schema
        const initialSchema = schemaRef.split("/").pop() || "";
        validateField(initialSchema.split(".").pop() || "", schemas[initialSchema]);

        dispatch(setRequestFormErrors(errors));
        
        return errors;
    }, [inputValues]);

    useEffect(() => {
        // Register the validation function when component mounts and unregister on unmount
        registerRequestValidationFunction(validateForm);
        return () => {registerRequestValidationFunction(() => {return {}})};
    }, [registerRequestValidationFunction, validateForm]);    

    const renderBaseType = (fieldPath: string, schema: { [key: string]: any }, example: any, isOptional: boolean) => {
        if (schema.type === "array" && schema.items) {

            let inputArrayValueAtPath = getValueAtPath(inputValues, fieldPath);
            if(!isOptional && (!inputArrayValueAtPath || inputArrayValueAtPath.length === 0)) {
                // Non-optional array must have at least one item and array currently is empty, so add an item
                handleAddItem(fieldPath);
                inputArrayValueAtPath = [""];
            }

            const fieldName = fieldPath.split(".").pop();
            return (
                
              <div className={styles.arrayContainer}>
                <strong>
                    {fieldName} (Array) 
                    {isOptional && 
                        <span className={styles.optionalLabel}>
                            (optional)
                        </span>
                    }
                </strong>
                <div>
                    {inputArrayValueAtPath && inputArrayValueAtPath.map((_: any, index: number) => {
                        const ref = schema.items["$ref"];
                        return (
                            <div key={index} className={styles.arrayItem}>
                                <div className={styles.arrayIndex}>
                                    {(isOptional || inputArrayValueAtPath.length > 1) && (
                                    <span
                                        onClick={() => handleRemoveItem(fieldPath, inputArrayValueAtPath, index)}
                                        className={styles.removeButton}
                                    >
                                        X
                                    </span>
                                    )}
                                    [{index}]
                                </div>
                                {ref ? (
                                <div>
                                    {renderSchema(fieldPath + "." + index, ref.split("/").pop(), example, isOptional)}
                                </div>
                                ) : (
                                <div>{renderBaseType(fieldPath + "." + index, schema.items, example, isOptional)}</div>
                                )}
                            </div>
                            )
                        }
                    )}
                    <button onClick={() => handleAddItem(fieldPath, "")} className={styles.addButton}>+</button>
                </div>
              </div>
            );
        }
        else {
            const fieldNameArray = fieldPath.split(".");
            const hasError = requestFormErrors[fieldPath] !== undefined;
            let renderTitleAndDesc = true;
            if (!isNaN(Number(fieldNameArray[fieldNameArray.length-1]))) {
                const index = Number(fieldNameArray.pop());
                if (index > 0) {
                    renderTitleAndDesc = false;
                }
            }
            const fieldName = fieldNameArray.pop();

            let formattedEnumValues = null;
            let inputLabel = `${fieldName}`;
            if (schema.enum) {
                formattedEnumValues = `Enum values: ${schema.enum.map((item: string) => `\`${item}\``).join(', ')}`;
                inputLabel += ` (Enum)`
            }
            // Add "example" only if an example exists
            let exampleText = String(example) === "" ? "" : "Example: " + String(example);
            
            // Stringify if object
            if (typeof example === 'object'){
                exampleText = JSON.stringify(example);
            }
            
            return (
                <div className={styles.inputContainer}>
                { renderTitleAndDesc && (
                    <div>
                    <label className={styles.inputLabel}>
                        {inputLabel}
                        {isOptional && (
                            <span className={styles.optionalLabel}>
                                (optional)
                            </span>
                        )}
                    </label> 
                    <ReactMarkdown>{schema.description}</ReactMarkdown>
                    <ReactMarkdown>{formattedEnumValues}</ReactMarkdown>      
                    <ReactMarkdown>{exampleText}</ReactMarkdown>    
                    </div>          
                )}

                {schema.enum ? (
                    <select
                        className={`${styles.selectField} ${hasError ? styles.inputError : ''}`}
                        value={getValueAtPath(inputValues, fieldPath) ?? "null"}
                        onChange={(e) => {
                            // clear error when user makes selection
                            if (requestFormErrors[fieldPath]) {
                                dispatch(removeRequestFormError(fieldPath));
                            }
                            
                            // Convert string value to actual enum value or null
                            const value = e.target.value === "null" ? null : e.target.value;
                            dispatch(updateInputValues({"fieldPath": fieldPath, "value": value, "arrayIndex": undefined}));
                        }}
                    >
                        <option value="null">Select a value</option>
                        {schema.enum.map((enumValue: string, index: number) => (
                            <option key={index} value={enumValue}>
                                {enumValue}
                            </option>
                        ))}
                    </select>
                ) : schema.type === "boolean" ? (
                    <select
                        className={`${styles.selectField} ${hasError ? styles.inputError : ''}`}
                        value={getValueAtPath(inputValues, fieldPath) === true ? "true" : 
                            getValueAtPath(inputValues, fieldPath) === false ? "false" : "null"}
                        onChange={(e) => {
                            // clear error when user makes selection
                            if (requestFormErrors[fieldPath]) {
                                dispatch(removeRequestFormError(fieldPath));
                            }
                            
                            // Convert string value to actual boolean or null
                            let value;
                            if (e.target.value === "true") value = true;
                            else if (e.target.value === "false") value = false;
                            else value = null;
                            
                            dispatch(updateInputValues({"fieldPath": fieldPath, "value": value, "arrayIndex": undefined}))
                        }}
                    >
                        <option value="null">Select a value</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                ) : (
                    <input 
                        className={`${styles.inputField} ${hasError ? styles.inputError : ''}`}
                        type={(schema.type === "integer") ? "number" : schema.type} 
                        placeholder={fieldName} 
                        value={getValueAtPath(inputValues, fieldPath) ?? ""}
                        onChange={(e) => {
                            // clear error when user types
                            if (requestFormErrors[fieldPath]) {
                                dispatch(removeRequestFormError(fieldPath));
                            }
                            var value;
                            // Convert to appropriate type or null if empty
                            if (e.target.value.length > 0) {
                                const temp = e.target.value;
                                value = (schema.type === "integer") ? parseInt(temp) : (schema.type === "number" ? parseFloat(temp) : temp) 
                            }
                            else {
                                value = null;
                            }
                            dispatch(updateInputValues({"fieldPath": fieldPath, "value": value, "arrayIndex": undefined}))
                        }}
                    />
                )}
                </div>
            )
        }
    }

    const renderSchema = (fieldPath: string, schemaName: string, example: { [key: string]: any }, isOptional = false) => {
        const schema = schemas[schemaName];
        const requiredFields = schema.required || [];
        const fieldNameArray = fieldPath.split(".");
        if (!isNaN(Number(fieldNameArray[fieldNameArray.length-1]))) {
            fieldNameArray.pop();
        }
        const fieldName = fieldNameArray.pop();
        // Get first entry in example if contains multiple
        if (typeof(example) === 'object' && '0' in example){
            example = example[0];
        }

        if (!schema) {
          return <div>Schema not found: {schemaName}</div>; 
        }

        if (schema.oneOf) {
            // Get selected type and sub schema for Union objects
            const selectedType = selectedUnionTypes[fieldPath] || Object.keys(schema.discriminator.mapping)[0];
            const subSchemaName = schema.discriminator.mapping[selectedType].split("/").pop();
            return (
            <div className={styles.inputContainer}>
                <label className={styles.inputLabel}>
                    {fieldName} (Union) 
                    {isOptional && <span className={styles.optionalLabel}>(optional)</span>}
                </label>
                <ReactMarkdown>{schema.description}</ReactMarkdown>
                <select
                    className={styles.selectField}
                    value={selectedType}
                    onChange={(e) => {
                        const unionTypeName = schema.discriminator.mapping[e.target.value].split("/").pop().split(".").pop();
                        dispatch(updateSelectedUnionTypes({"fieldPath": fieldPath, "selectedType": e.target.value})); 
                        dispatch(updateInputValues({"fieldPath": fieldPath + ".[UnionType]." + unionTypeName, "value": {}, "arrayIndex": undefined}))
                    }}
                >
                {Object.entries(schema.discriminator.mapping).map(([fieldName, _], index) => {
                    return (
                    <option key={index} value={fieldName}>
                        {fieldName}
                    </option>
                    );
                })}
                </select>
                {renderSchema(fieldPath + ".[UnionType]." + selectedType.split(".").pop(), subSchemaName, example, isOptional)}
            </div>
            );
        }
    
        if (schema.type === "object" && schema.properties) {
            if(!isOptional && getValueAtPath(inputValues, fieldPath) === undefined) {
                dispatch(updateInputValues({"fieldPath": fieldPath, "value": {}, "arrayIndex": undefined}));
            }
            return (
                <div className={styles.objectContainer}>
                    <strong>
                        {fieldName} 
                        {isOptional && <span className={styles.optionalLabel}>(optional)</span>}
                    </strong>
                    <ReactMarkdown>{schema.description}</ReactMarkdown>
                    {Object.entries(schema.properties).map(([key, value]) => {
                        const subSchema = value as { [key: string]: any };
                        const subExample = example[key] ?? "";
                        const ref = subSchema["$ref"];
                        const isOptional = !requiredFields.includes(key);

                        if (ref) {
                            const refName = ref.split("/").pop();
                            return (
                                <div key={key}>
                                    {renderSchema(fieldPath + "." + key, refName, subExample, isOptional)}
                                </div>
                            );
                        }
                        if(key != "type") {
                            return (
                            <div key={key}>
                                {renderBaseType(fieldPath + "." + key, subSchema, subExample, isOptional)}
                            </div>
                            );
                        }
                    })}
                </div>
            );
        } else {
            return renderBaseType(fieldPath, schema, example, isOptional);
        }
    };
  
    const initialSchema = schemaRef.split("/").pop() || ""; 
    const initialFieldName = initialSchema.split(".").pop() || "";
    // If no example, default to empty string. If example has multiple entries, get first one
    example = example ?? "";
    if (typeof(example) === 'object' && '0' in example){
            example = example[0];
    }
    return (
        <div>
            {renderSchema(initialFieldName, initialSchema, example)}
        </div>);
};

export default SchemaForm;
