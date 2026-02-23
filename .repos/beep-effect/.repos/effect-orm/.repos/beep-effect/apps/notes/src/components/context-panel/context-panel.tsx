import DiscussionRightPanel from "@beep/notes/components/context-panel/discussion-panel";
import { VersionsSkeleton } from "@beep/notes/components/context-panel/versions-skeleton";
import { RightPanelType, useRightPanelSize, useRightPanelType } from "@beep/notes/hooks/useResizablePanel";
import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const VersionHistoryPanel = dynamic(
  () => import("@beep/notes/components/editor/version-history/version-history-panel"),
  {
    loading: () => <p>Loading...</p>,
  }
);

export const ContextPanel = () => {
  const rightSize = useRightPanelSize();
  const rightType = useRightPanelType();
  const documentId = useDocumentId();

  const isOpen = useMemo(() => !!rightSize && rightSize > 0, [rightSize]);

  return (
    <>
      {rightType === RightPanelType.history && isOpen && <VersionHistoryPanel />}

      {rightType === RightPanelType.comment && isOpen && (documentId ? <DiscussionRightPanel /> : <VersionsSkeleton />)}
    </>
  );
};
