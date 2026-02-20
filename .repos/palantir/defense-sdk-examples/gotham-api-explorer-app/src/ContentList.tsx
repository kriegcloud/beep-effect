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
import { useSelector } from 'react-redux';
import { selectAvailableHeaders } from './features/form/selectors';
import styles from "./ContentList.module.scss";

const ContentList = () => {
  const availableHeaders = useSelector(selectAvailableHeaders);
  
  const allHeaders = [
    { id: "endpoint-details", label: "Endpoint Details" },
    { id: "query-parameters", label: "Parameters" },
    { id: "request-body", label: "Request Body" },
    { id: "response-body", label: "Response" },
    { id: "export", label: "Export" },
  ];
  
  // Filter headers that are registered as available
  const visibleSections = allHeaders.filter(header => 
    availableHeaders.includes(header.id)
  );

  return (
    <aside className={styles.contents}>
      <p className={styles.contentsHeader}>CONTENTS</p>
      <ul>
        {visibleSections.map((header) => (
          <li key={header.id}>
            <a href={`#${header.id}`}>{header.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ContentList;
