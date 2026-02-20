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
import { Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useState, useEffect } from "react";
import styles from "./ExportSection.module.scss";
import { auth } from ".././client";
import { useDispatch, useSelector } from "react-redux";
import {
  registerHeader, 
  unregisterHeader,
} from "../features/form/slice"
import {
  selectFullPath,
} from "../features/form/selectors"

interface ExportSectionProps {
  method: string;
  requestBody: string;
}

const ExportSection: React.FC<ExportSectionProps> = ({method, requestBody}) => {
  const fullPath = useSelector(selectFullPath);
  const dispatch = useDispatch();

  const [curlContent, setCurlContent] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
      // Register this header when component mounts
      dispatch(registerHeader('export'));
      
      // Unregister when component unmounts
      return () => {dispatch(unregisterHeader('export'))};
  }, [dispatch]);
  
  useEffect(() => {
    setCurlContent(generateCurl());
  }, [requestBody, fullPath]);

  useEffect(() => {
    setHasCopied(false);
  }, [curlContent]);

  const generateCurl = () => {
    const TOKEN = auth.getTokenOrUndefined();
    return `curl -X ${method} "${fullPath}" \\
-H "Authorization: Bearer ${TOKEN}" \\
-H "Content-Type: application/json" \\
-d "${requestBody}"`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(curlContent)
      .then(() => {
        setHasCopied(true);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <section className={styles.export} id="export">
      <div className={styles.exportHeader}>
        <h2>Export as cURL</h2>
        <Button 
          icon={<Icon icon={hasCopied ? IconNames.TICK : IconNames.DUPLICATE} style={{marginRight: '10px'}} />}
          size="small"
          onClick={handleCopy}
          aria-label="Copy cURL command"
          title="Copy to clipboard"
        >
          {hasCopied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className={styles.curlContent}>
      <pre>
        <code>
        {curlContent}
        </code>
      </pre>
      </div>
    </section>
  );
};

export default ExportSection;