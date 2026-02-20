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
import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useDispatch } from "react-redux";
import {
  setRequestFormErrors,
  setParamFormErrors,
} from "../features/form/slice"


interface FormValidationContextType {
  validateParamForm: () => {[key: string]: string};
  validateRequestForm: () => {[key: string]: string};
  registerParamValidationFunction:  (fn: () => {[key: string]: string}) => void;
  registerRequestValidationFunction: (fn: () => {[key: string]: string}) => void;
}

const FormValidationContext = createContext<FormValidationContextType | undefined>(undefined);

export const FormValidationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const dispatch = useDispatch();
  const validateRequestFunctionRef = useRef<() => {[key: string]: string}>(() => ({}));
  const validateParamFunctionRef = useRef<() => {[key: string]: string}>(() => ({}));

  const registerParamValidationFunction = useCallback((fn: () => {[key: string]: string}) => {
    if (typeof fn === 'function') {
      validateParamFunctionRef.current = fn;
    }
  }, []);

  const registerRequestValidationFunction = useCallback((fn: () => {[key: string]: string}) => {
    if (typeof fn === 'function') {
      validateRequestFunctionRef.current = fn;
    }
  }, []);

  const validateParamForm = useCallback(() => {
    const paramErrors = validateParamFunctionRef.current();
    dispatch(setParamFormErrors(paramErrors));
    return paramErrors;
  }, []);

  const validateRequestForm = useCallback(() => {
    const requestBodyErrors = validateRequestFunctionRef.current();
    dispatch(setRequestFormErrors(requestBodyErrors));
    return requestBodyErrors;
  }, []);

  const contextValue = useRef<FormValidationContextType>({
    validateParamForm,
    validateRequestForm,
    registerParamValidationFunction,
    registerRequestValidationFunction,
  });

  return (
    <FormValidationContext.Provider value={contextValue.current}>
      {children}
    </FormValidationContext.Provider>
  );
};

export const useFormValidation = () => {
  const context = useContext(FormValidationContext);
  if (context === undefined) {
    throw new Error('useFormValidation must be used within a FormValidationProvider');
  }
  return context;
};
