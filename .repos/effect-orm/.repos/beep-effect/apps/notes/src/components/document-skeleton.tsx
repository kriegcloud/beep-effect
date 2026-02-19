import { Skeleton } from "@beep/notes/components/ui/skeleton";

import { CoverSkeleton } from "./cover/cover";

export const DocumentSkeleton = () => {
  return (
    <div>
      <CoverSkeleton />
      <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
        <div className="space-y-4 pt-4 pl-8">
          <Skeleton className="h-6 w-2/5" />

          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};
