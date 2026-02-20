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

import { Button, Popover } from "@blueprintjs/core";
import type { DocumentRef } from "@palantir/pack.document-schema.model-types";
import { memo } from "react";
import { useActivityHistory } from "../../hooks/useActivityHistory.js";
import styles from "./ActivityPanel.module.css";

export interface ActivityPanelProps {
  readonly docRef: DocumentRef;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ActivityPanel = memo(function ActivityPanel({
  docRef,
}: ActivityPanelProps) {
  const activities = useActivityHistory(docRef);

  const content = (
    <aside className={styles.panel}>
      <h2 className={styles.header}>Activity</h2>
      {activities.length === 0
        ? <p className={styles.empty}>No activity yet</p>
        : (
          <ul className={styles.list}>
            {activities.map(activity => (
              <li className={styles.item} key={activity.eventId}>
                <div className={styles.message}>{activity.message}</div>
                <time
                  className={styles.time}
                  dateTime={new Date(activity.createdInstant).toISOString()}
                >
                  {formatTimeAgo(activity.createdInstant)}
                </time>
              </li>
            ))}
          </ul>
        )}
    </aside>
  );

  return (
    <Popover content={content} placement="bottom-end">
      <Button title="Activity history">
        Activity
      </Button>
    </Popover>
  );
});
