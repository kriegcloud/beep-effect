"use client";

import { Card, CardContent, CardHeader } from "@beep/ui/components/card";
import { Skeleton } from "@beep/ui/components/skeleton";
import * as A from "effect/Array";

interface EntityCardSkeletonProps {
  readonly showAttributes?: undefined | boolean;
}

export function EntityCardSkeleton({ showAttributes = true }: EntityCardSkeletonProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-[140px]" />
          <Skeleton className="h-5 w-[60px] rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        {showAttributes && (
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-3 w-[120px]" />
            <Skeleton className="h-3 w-[90px]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EntityCardListSkeletonProps {
  readonly count?: undefined | number;
  readonly showAttributes?: undefined | boolean;
}

export function EntityCardListSkeleton({ count = 6, showAttributes = true }: EntityCardListSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-[180px]" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {A.map(A.range(0, count - 1), (i) => (
          <EntityCardSkeleton key={i} showAttributes={showAttributes} />
        ))}
      </div>
    </div>
  );
}

interface RelationTableSkeletonProps {
  readonly rows?: undefined | number;
}

export function RelationTableSkeleton({ rows = 5 }: RelationTableSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[120px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-9 w-[200px]" />
        </div>
      </div>
      <div className="border rounded-md">
        <div className="flex gap-4 p-3 border-b bg-muted/50">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
        {A.map(A.range(0, rows - 1), (i) => (
          <div key={i} className="flex gap-4 p-3 border-b last:border-b-0">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-5 w-[50px] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QueryResultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 p-3 bg-muted rounded-lg">
        {A.map(A.range(0, 4), (i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-[50px]" />
            <Skeleton className="h-5 w-[30px] rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          {A.map(A.range(0, 2), (i) => (
            <Skeleton key={i} className="h-9 w-[100px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {A.map(A.range(0, 5), (i) => (
            <EntityCardSkeleton key={i} showAttributes={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClusterCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-[150px]" />
        <Skeleton className="h-5 w-[80px] rounded-full" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-5 w-[60px] rounded-full" />
      </div>
    </div>
  );
}

interface ClusterListSkeletonProps {
  readonly count?: undefined | number;
}

export function ClusterListSkeleton({ count = 4 }: ClusterListSkeletonProps) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-[180px]" />
      <div className="space-y-2">
        {A.map(A.range(0, count - 1), (i) => (
          <ClusterCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ResolutionStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-1" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {A.map(A.range(0, 3), (i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-4 w-[80px] mx-auto" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-[150px] mx-auto mt-4" />
      </CardContent>
    </Card>
  );
}

export function EntityResolutionPanelSkeleton() {
  return (
    <div className="space-y-6">
      <ResolutionStatsSkeleton />
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <ClusterListSkeleton count={3} />
      </div>
    </div>
  );
}

export function SameAsLinkTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <div className="flex gap-4 p-3 border-b bg-muted/50">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        {A.map(A.range(0, rows - 1), (i) => (
          <div key={i} className="flex gap-4 p-3 border-b last:border-b-0">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-5 w-[50px] rounded-full" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SourceTextPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[100px]" />
      </div>
      <div className="p-4 border rounded-md space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}
