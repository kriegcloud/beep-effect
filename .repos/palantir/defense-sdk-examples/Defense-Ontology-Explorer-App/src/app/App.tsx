/*
 * (c) Copyright 2024 Palantir Technologies Inc. All rights reserved.
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
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Icon,
  OverlayToaster,
  Position,
  Button,
  Intent,
} from "@blueprintjs/core";
import { selectSelectedDomain } from "../features/osdk/selectors";
import {
  setSelectedDomain,
  setSelectedInterface,
  setSelectedObjectType,
  setSelectedObjectPrimaryKey,
} from "../features/osdk/slice";
import Explorer from "../explorer/Explorer";
import Domain from "../domain/Domain";
import styles from "./App.module.scss";
import { DomainCategory } from "../features/osdk/types";

const AppToaster = OverlayToaster.create({
  className: "recipe-toaster",
  position: Position.TOP,
});

const App: React.FC = () => {
  const [isExplorerMinimized, setIsExplorerMinimized] = useState(false);
  const dispatch = useDispatch();
  const selectedDomain = useSelector(selectSelectedDomain);

  const handleDomainClick = (domain: DomainCategory) => {
    dispatch(setSelectedDomain(domain));
    setIsExplorerMinimized(true);
  };

  const handleToggleClick = () => {
    if (selectedDomain || isExplorerMinimized) {
      if (isExplorerMinimized) {
        dispatch(setSelectedDomain(null));
        dispatch(setSelectedInterface(null));
        dispatch(setSelectedObjectType(null));
        dispatch(setSelectedObjectPrimaryKey(null));
      }
      setIsExplorerMinimized(!isExplorerMinimized);
    } else {
      AppToaster.show({
        message: "Select a domain from the diagram to explore!",
        intent: Intent.NONE,
        icon: "select",
        timeout: 2000,
      });
    }
  };

  useEffect(() => {
    if (selectedDomain) {
      setIsExplorerMinimized(true);
    }
  }, [selectedDomain]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Explore the Defense Ontology</h1>
        <p className={styles.subTitle}>
          This example OSDK React application demonstrates how you can use
          interfaces as the API to read Defense Ontology data in your Foundry
          environment.
        </p>
      </div>
      <div className={styles.toggleButtonContainer}>
        <Button
          className={styles.toggleButton}
          onClick={handleToggleClick}
          minimal
        >
          <Icon icon={isExplorerMinimized ? "chevron-left" : "chevron-right"} />
        </Button>
      </div>
      <div className={styles.content}>
        <div
          className={`${styles.explorer} ${
            isExplorerMinimized ? styles.minimized : ""
          }`}
        >
          <Explorer onDomainClick={handleDomainClick} />
        </div>
        <div
          className={`${styles.documentation} ${
            isExplorerMinimized ? styles.expanded : styles.minimized
          }`}
        >
          {selectedDomain && <Domain />}
        </div>
      </div>
    </div>
  );
};

export default App;
