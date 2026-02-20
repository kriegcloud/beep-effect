/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
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

import { Button, ButtonGroup } from "@blueprintjs/core";
import React, { useCallback } from "react";
import { FILE_SYSTEM_TYPE } from "../../app.js";
import { useCanvasDocuments } from "../../hooks/useCanvasDocuments.js";
import { CreateFileDialog } from "./CreateCanvasDialog.js";
import { DocumentList } from "./DocumentList.js";
import css from "./HomePage.module.css";

export const HomePage = React.memo(function HomePage() {
  const {
    currentPage,
    documents,
    error,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
  } = useCanvasDocuments();
  const [createDialogIsOpen, setCreateDialogIsOpen] = React.useState(false);

  const showCreateDialog = useCallback(() => {
    setCreateDialogIsOpen(true);
  }, []);

  // Only show full-page loading on initial load, not during pagination
  const isInitialLoading = isLoading && documents.length === 0;

  if (isInitialLoading) {
    return (
      <div className={css.pageWrapper}>
        <div className={css.loading}>Loading canvases...</div>
      </div>
    );
  }

  return (
    <div className={css.pageWrapper}>
      <div className={css.pageHeader}>
        <h1>Canvas Demo</h1>
        <Button onClick={showCreateDialog}>Create New Canvas</Button>
      </div>
      <div className={css.contentSection}>
        <div className={css.listHeader}>
          <h2>Canvases ({FILE_SYSTEM_TYPE})</h2>
          <div className={css.pagination}>
            <ButtonGroup>
              <Button
                disabled={!hasPreviousPage}
                icon="chevron-left"
                onClick={goToPreviousPage}
                variant="outlined"
              />
              <Button disabled variant="outlined">
                Page {currentPage}
              </Button>
              <Button
                disabled={!hasNextPage}
                icon="chevron-right"
                onClick={goToNextPage}
                variant="outlined"
              />
            </ButtonGroup>
          </div>
        </div>
        <DocumentList documents={documents} error={error} />
        <CreateFileDialog
          isOpen={createDialogIsOpen}
          setIsOpen={setCreateDialogIsOpen}
        />
      </div>
    </div>
  );
});
