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

import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
} from "@blueprintjs/core";
import { DocumentModel } from "@demo/canvas.sdk";
import { FileSystemType } from "@palantir/pack.state.core";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { app, DOCUMENT_TYPE_NAME, FILE_SYSTEM_TYPE, PARENT_FOLDER_RID } from "../../app.js";

const isCompassFileSystem = FILE_SYSTEM_TYPE === FileSystemType.COMPASS;

// TODO: Set your organization's classification (e.g. ["MU"])
const DEFAULT_CLASSIFICATION: readonly string[] = [];

const DEFAULT_DOCUMENT_SECURITY = Object.freeze({
  discretionary: {},
  mandatory: {
    classification: DEFAULT_CLASSIFICATION,
  },
});

interface CreateFileDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function CreateFileDialog({ isOpen, setIsOpen }: CreateFileDialogProps) {
  const [creatingCanvas, setCreatingCanvas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const closeCreateDialog = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, [setIsOpen]);

  const createNew = useCallback(async () => {
    setError(null);

    if (DEFAULT_CLASSIFICATION.length === 0) {
      setError("DEFAULT_CLASSIFICATION is not configured.");
      return;
    }

    if (isCompassFileSystem && !PARENT_FOLDER_RID) {
      setError(
        "Parent folder RID is required for Compass filesystem. Set VITE_PACK_PARENT_FOLDER_RID in your .env file.",
      );
      return;
    }

    setCreatingCanvas(true);

    try {
      const response = await app.state.createDocument({
        name,
        documentTypeName: DOCUMENT_TYPE_NAME,
        security: DEFAULT_DOCUMENT_SECURITY,
        parentFolderRid: isCompassFileSystem ? PARENT_FOLDER_RID! : undefined,
      }, DocumentModel);
      navigate(`/canvas/${response.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create canvas");
    } finally {
      setCreatingCanvas(false);
    }
  }, [name, navigate]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={closeCreateDialog}
      title={`Create new file (${FILE_SYSTEM_TYPE})`}
    >
      <DialogBody>
        {error && (
          <Callout intent="danger" style={{ marginBottom: "15px" }}>
            {error}
          </Callout>
        )}
        <FormGroup label="Canvas name" labelFor="canvas-name">
          <InputGroup
            id="canvas-name"
            value={name}
            onValueChange={setName}
            autoFocus={true}
            placeholder="Enter name..."
          />
        </FormGroup>
        {isCompassFileSystem && (
          <Callout intent="warning" style={{ marginBottom: "15px" }}>
            Compass manages discretionary security (owners, editors, viewers) through folder
            permissions. Leave discretionary security empty when creating Compass-backed documents.
          </Callout>
        )}
      </DialogBody>
      <DialogFooter
        actions={
          <React.Fragment>
            <Button
              text="Cancel"
              onClick={closeCreateDialog}
              disabled={creatingCanvas}
            />
            <Button
              text="Create"
              intent="primary"
              onClick={createNew}
              disabled={creatingCanvas}
              loading={creatingCanvas}
            />
          </React.Fragment>
        }
      />
    </Dialog>
  );
}
