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
import styles from "./EndpointList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveMethod,
  selectActiveTab,
  selectEndpoints,
} from  "./features/form/selectors"
import {
  setActiveTab,
} from "./features/form/slice"
import {
  getOperationName
} from "./features/form/operationMappings"
import { ReactNode } from "react";

const sections = {
  Geotime: ["v1/observations", "v1/tracks"],
  Maps: ["v1/maps", "v1/maprendering"],
  Targets: ["v1/twb"],
};

const EndpointList = () => {
  const dispatch = useDispatch();
  const endpoints = useSelector(selectEndpoints);
  const activeTab = useSelector(selectActiveTab);
  const activeMethod = useSelector(selectActiveMethod);


  return (
  <aside className={styles.sidebar}>
    <p className={styles.endpointListHeader}>API ENDPOINTS</p>
    {Object.entries(sections).map(([sectionName, endpointPrefixes], index) => (
      <div key={sectionName}>
        {index > 0 && <hr />}
        <h4>{sectionName}</h4>
        <ul>
          {Object.keys(endpoints)
            .filter((path) =>
              endpointPrefixes.some((endpoint) => path.includes(endpoint))
            )
            
            .map((path) => {
              const listItems: ReactNode[] = [];
              Object.keys(endpoints[path]).forEach(method => {
                const operationId = endpoints[path][method].operationId;
                const isActive = (activeTab === path && activeMethod === method);
                listItems.push(
                  <li
                    key={operationId}
                    onClick={() => dispatch(setActiveTab({path, method}))}
                    className={isActive ? styles.active : ""}
                  >
                    <div className={styles.listItemContent}>
                      <span className={styles.clickableText}>{getOperationName(operationId)}</span>
                      {isActive && <span className={styles.arrow}>&rarr;</span>}
                    </div>
                  </li>
                );
              });
              return listItems;
            })}
        </ul>
      </div>
    ))}
  </aside>
)};

export default EndpointList;
