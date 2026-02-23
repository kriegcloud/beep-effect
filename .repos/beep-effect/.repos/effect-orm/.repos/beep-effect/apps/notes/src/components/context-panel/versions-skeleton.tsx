import { Skeleton } from "@beep/notes/components/ui/skeleton";

export const VersionsSkeleton = () => {
  return (
    <>
      <div className="flex w-full items-center space-x-4 p-4">
        {/* <div className="mt-[44px] flex w-full items-center space-x-4 p-4"> */}
        <Skeleton className="size-7 self-start overflow-hidden rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[270px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[230px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </div>
      <div className="flex w-full items-center space-x-4 p-4">
        <Skeleton className="size-7 self-start overflow-hidden rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[270px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[230px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </div>
      <div className="flex w-full items-center space-x-4 p-4">
        <Skeleton className="size-7 self-start overflow-hidden rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[270px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[230px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </div>
      <div className="flex w-full items-center space-x-4 p-4">
        <Skeleton className="size-7 self-start overflow-hidden rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[270px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[230px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </div>
      <div className="flex w-full items-center space-x-4 p-4">
        <Skeleton className="size-7 self-start overflow-hidden rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[270px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[230px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </div>
      <div className="flex w-full items-center space-x-4 p-4">
        <Skeleton className="size-7 self-start overflow-hidden rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-[270px]" />
          <Skeleton className="h-3 w-[200px]" />
          <Skeleton className="h-3 w-[230px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </div>
    </>
  );
};
