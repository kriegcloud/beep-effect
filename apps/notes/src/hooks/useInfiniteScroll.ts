import { useSession } from "@beep/notes/components/auth/useSession";
import { useOnScreen } from "@beep/notes/hooks/useOnScreen";
import type { UnsafeTypes } from "@beep/types";
import { useEffect, useRef, useState } from "react";

export const useInfiniteScroll = ({
  fetchNextPage,
  hasFirstPage,
  hasNextPage,
  isFetched,
  isFetching,
  isPublic,
}: {
  readonly fetchNextPage: UnsafeTypes.UnsafeAny;
  readonly debug?: undefined | string;
  readonly hasFirstPage?: undefined | boolean;
  readonly hasNextPage?: undefined | boolean;
  readonly isFetched?: undefined | boolean;
  readonly isFetching?: undefined | boolean;
  readonly isPublic?: undefined | boolean;
}) => {
  const session = useSession();
  const bottomRef = useRef<HTMLDivElement>(undefined);
  const reachedBottom = useOnScreen(bottomRef);
  const [reachedNextPage, setReachedNextPage] = useState(false);

  useEffect(() => {
    if (reachedBottom && ((hasFirstPage && !reachedNextPage) || hasNextPage) && !isFetching) {
      setReachedNextPage(true);

      if (isPublic || !!session) {
        void fetchNextPage();
      }
    }
  }, [
    isFetched,
    reachedBottom,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isPublic,
    session,
    hasFirstPage,
    reachedNextPage,
  ]);

  return {
    bottomRef,
    reachedNextPage,
  };
};
