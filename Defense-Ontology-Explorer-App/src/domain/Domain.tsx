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
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon, IconName, Spinner } from "@blueprintjs/core";
import styles from "./Domain.module.scss";
import DecoratorPill from "./DecoratorPill";
import {
  selectDomainMap,
  selectErrors,
  selectSelectedInterface,
  selectSelectedObjectType,
  selectSelectedObjectPrimaryKey,
  selectSelectedObject,
  selectInterfaceObjects,
  selectSelectedDomain,
  selectLoadingInterfaces,
  selectLoadingObjectTypes,
  selectLoadingObjects,
  selectLoadingObjectDetails,
} from "../features/osdk/selectors";
import {
  fetchDomainsStart,
  setSelectedInterface,
  setSelectedObjectType,
  setSelectedObjectPrimaryKey,
  fetchFullObjectStart,
  resetLoadingStates,
} from "../features/osdk/slice";
import { OntologyCategory } from "../features/osdk/types";
import { ErrorResult } from "../error/ErrorResult";

const ComingSoon: React.FC = () => (
  <div className={styles.comingSoonWrapper}>
    <span>Coming Soon!</span>
  </div>
);

const Domain: React.FC = () => {
  const dispatch = useDispatch();
  const domain = useSelector(selectSelectedDomain);
  const domainMap = useSelector(selectDomainMap);
  const selectedInterface = useSelector(selectSelectedInterface);
  const selectedObjectType = useSelector(selectSelectedObjectType);
  const selectedObjectPrimaryKey = useSelector(selectSelectedObjectPrimaryKey);
  const selectedObject = useSelector(selectSelectedObject);
  const mediaContent = selectedObject?.mediaContent;
  const interfaceObjects = useSelector(selectInterfaceObjects);
  const loadingInterfaces = useSelector(selectLoadingInterfaces);
  const loadingObjectTypes = useSelector(selectLoadingObjectTypes);
  const loadingObjects = useSelector(selectLoadingObjects);
  const loadingObjectDetails = useSelector(selectLoadingObjectDetails);
  const errors = useSelector(selectErrors);

  const [isVerticalLayout, setIsVerticalLayout] = useState(false);

  const objectTypesRef = useRef<HTMLDivElement>(null);
  const objectsRef = useRef<HTMLDivElement>(null);
  const objectDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchDomainsStart());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsVerticalLayout(
        window.innerWidth < 1024 || window.innerHeight > window.innerWidth
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      dispatch(resetLoadingStates());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isVerticalLayout) {
      if (selectedInterface && objectTypesRef.current) {
        objectTypesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (selectedObjectType && objectsRef.current) {
        objectsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (selectedObjectPrimaryKey && objectDetailsRef.current) {
        objectDetailsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [
    isVerticalLayout,
    selectedInterface,
    selectedObjectType,
    selectedObjectPrimaryKey,
  ]);

  if (!domain) {
    return null;
  }

  const interfaceApiNames = domainMap[domain]?.interfaces || [];

  const stripPrefix = (name: string) => {
    return name.replace("com.palantir.defense.ontology.", "");
  };

  const uniqueObjectTypes = Array.from(
    new Set(interfaceObjects.map((obj) => obj.$objectType))
  );

  const LoadingSpinner: React.FC = () => (
    <div className={styles.spinner}>
      <Spinner size={50} />
    </div>
  );

  return (
    <div
      className={`${styles.domainWrapper} ${
        isVerticalLayout ? styles.verticalLayout : ""
      }`}
    >
      <div className={styles.domainHeader}>
        <Icon
          icon={(domainMap[domain]?.status || "unknown") as IconName}
          className={styles.icon}
          size={20}
        />
        <p className={styles.domainTitle}>
          {domainMap[domain]?.title || domain}
        </p>
      </div>
      <p className={styles.domainDescription}>
        {domainMap[domain]?.description || "No description available"}
      </p>
      <hr className={styles.divider} />
      <div className={styles.domainContent}>
        <div
          className={`${styles.container} ${
            isVerticalLayout ? styles.verticalContainer : ""
          }`}
        >
          {loadingInterfaces ? (
            <LoadingSpinner />
          ) : interfaceApiNames.length === 0 ? (
            <ComingSoon />
          ) : (
            <>
              <div className={`${styles.table} ${styles.animateTable}`}>
                <div className={styles.tableHeader}>
                  <h2>Interfaces</h2>
                  <DecoratorPill category={OntologyCategory.DEFENSE} />
                </div>
                <table className={styles.interfaceTable}>
                  <tbody className={styles.tableBody}>
                    {interfaceApiNames.map((name) => {
                      const strippedName = stripPrefix(name);
                      return (
                        <tr
                          key={name}
                          onClick={() => {
                            dispatch(setSelectedInterface(strippedName));
                            dispatch(setSelectedObjectType(null));
                            dispatch(setSelectedObjectPrimaryKey(null));
                          }}
                          className={
                            selectedInterface === strippedName
                              ? styles.selectedRow
                              : ""
                          }
                        >
                          <td>{strippedName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {selectedInterface && (
                <div
                  ref={objectTypesRef}
                  className={`${styles.table} ${styles.animateTable}`}
                >
                  <div className={styles.tableHeader}>
                    <h2>Object Types</h2>
                    <DecoratorPill category={OntologyCategory.YOUR} />
                  </div>
                  {loadingObjectTypes ? (
                    <LoadingSpinner />
                  ) : errors.fetchInterfaceObjects ? (
                    <ErrorResult type={selectedInterface} />
                  ) : uniqueObjectTypes.length > 0 ? (
                    <table className={styles.interfaceTable}>
                      <tbody className={styles.tableBody}>
                        {uniqueObjectTypes.map((objectType, index) => (
                          <tr
                            key={index}
                            onClick={() => {
                              dispatch(setSelectedObjectType(objectType));
                              dispatch(setSelectedObjectPrimaryKey(null));
                              dispatch(fetchFullObjectStart());
                            }}
                            className={
                              selectedObjectType === objectType
                                ? styles.selectedRow
                                : ""
                            }
                          >
                            <td>{objectType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <ComingSoon />
                  )}
                </div>
              )}

              {selectedObjectType && (
                <div
                  ref={objectsRef}
                  className={`${styles.table} ${styles.animateTable}`}
                >
                  <div className={styles.tableHeader}>
                    <h2>Objects</h2>
                    <DecoratorPill category={OntologyCategory.YOUR} />
                  </div>
                  {loadingObjects ? (
                    <LoadingSpinner />
                  ) : interfaceObjects.filter(
                      (obj) => obj.$objectType === selectedObjectType
                    ).length > 0 ? (
                    <table className={styles.interfaceTable}>
                      <tbody className={styles.tableBody}>
                        {interfaceObjects
                          .filter(
                            (obj) => obj.$objectType === selectedObjectType
                          )
                          .map((obj, index) => (
                            <tr
                              key={index}
                              onClick={() => {
                                dispatch(
                                  setSelectedObjectPrimaryKey(obj.$primaryKey)
                                );
                                dispatch(fetchFullObjectStart());
                              }}
                              className={
                                selectedObjectPrimaryKey === obj.$primaryKey
                                  ? styles.selectedRow
                                  : ""
                              }
                            >
                              <td>{obj.$title || obj.$primaryKey}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <ComingSoon />
                  )}
                </div>
              )}

              {selectedObject && (
                <div
                  ref={objectDetailsRef}
                  className={`${styles.table} ${styles.animateTable}`}
                >
                  <div
                    className={`${styles.tableHeader} ${styles.objectDetailHeader}`}
                  >
                    {mediaContent && (
                      <img
                        src={mediaContent}
                        alt="Media Content"
                        className={styles.mediaImage}
                      />
                    )}
                    <h2>{selectedObject.$title}</h2>
                    <DecoratorPill category={OntologyCategory.YOUR} />
                  </div>
                  <div className={styles.objectDetail}>
                    {loadingObjectDetails ? (
                      <LoadingSpinner />
                    ) : errors.fetchFullObject ? (
                      <ErrorResult
                        type={selectedObjectPrimaryKey || "object"}
                      />
                    ) : selectedObject ? (
                      <pre>{JSON.stringify(selectedObject, null, 2)}</pre>
                    ) : (
                      <p>No object selected</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Domain;
