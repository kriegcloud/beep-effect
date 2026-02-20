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
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Diagram from "./Diagram";
import About from "./About";
import styles from "./Explorer.module.scss";
import { DomainCategory } from "../features/osdk/types";
import {
  selectSelectedDomain,
  selectFetchDomainsError,
} from "../features/osdk/selectors";
import { fetchDomainsStart, clearErrors } from "../features/osdk/slice";
import { ErrorResult } from "../error/ErrorResult";

interface ExplorerProps {
  onDomainClick: (domain: DomainCategory) => void;
}

const Explorer: React.FC<ExplorerProps> = ({ onDomainClick }) => {
  const dispatch = useDispatch();
  const selectedDomain = useSelector(selectSelectedDomain);
  const fetchDomainsError = useSelector(selectFetchDomainsError);
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);

  useEffect(() => {
    dispatch(fetchDomainsStart());
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsVerticalLayout(window.innerWidth < 1200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDomainClick = (domain: DomainCategory) => {
    onDomainClick(domain);
  };

  return (
    <div
      className={`${styles.explorerContainer} ${
        isVerticalLayout ? styles.vertical : ""
      }`}
    >
      <div className={styles.diagramWrapper}>
        <h2 className={styles.sectionTitle}>
          Select a domain to start exploring!
        </h2>
        <hr className={styles.divider} />
        <div className={styles.diagramContainer}>
          {fetchDomainsError ? (
            <ErrorResult type={"domains"} />
          ) : (
            <Diagram
              onDomainClick={handleDomainClick}
              selectedDomain={selectedDomain}
            />
          )}
        </div>
      </div>
      <div className={styles.aboutWrapper}>
        <h2 className={styles.sectionTitle}>About the Defense Ontology</h2>
        <hr className={styles.divider} />
        <div className={styles.aboutContainer}>
          <About />
        </div>
      </div>
    </div>
  );
};

export default Explorer;
