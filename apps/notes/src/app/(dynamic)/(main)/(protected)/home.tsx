"use client";

import { useAuthUser } from "@beep/notes/components/auth/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { ClockIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/components/auth/useCurrentUser";
import { templateList } from "@/components/editor/utils/useTemplateDocument";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { WithSkeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { routes } from "@/lib/navigation/routes";
import { useTRPC } from "@/trpc/react";

export function Home() {
  const user = useAuthUser();
  const trpc = useTRPC();
  const currentUser = useCurrentUser();

  const { data, isLoading } = useQuery({
    ...trpc.document.documents.queryOptions({
      parentDocumentId: undefined,
    }),
    enabled: !!user,
  });

  let documents = data?.documents;

  if (!user) {
    documents = templateList as any;
  }
  if (isLoading && !documents) {
    documents = Array.from({ length: 9 }, (_, index) => ({
      id: index.toString(),
      coverImage: null,
      createdAt: new Date(),
      icon: null,
      title: "Loading...",
      updatedAt: new Date(),
      value: null,
    }));
  }
  if (!documents?.length) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <Icons.document className="size-12 text-muted-foreground/80" />
          <p className="text-sm text-muted-foreground">No documents yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-24">
      <h1 className="pt-4 pb-12 text-center text-3xl font-semibold">
        {user?.username ? (
          <>
            Hello, <span className="truncate">{user.username}</span>
          </>
        ) : (
          "Todox Template"
        )}
      </h1>

      <h2 className="mb-4 flex items-center gap-1 text-xs font-medium whitespace-nowrap text-muted-foreground max-sm:justify-center">
        <ClockIcon className="size-3 shrink-0" />
        Recently visited
      </h2>

      <div className="flex flex-wrap gap-4 max-sm:justify-center">
        {documents.map((doc) => {
          return (
            <WithSkeleton key={doc.id} className="size-[144px]" isLoading={isLoading}>
              <Link href={routes.document({ documentId: doc.id })}>
                <Card className="h-full overflow-hidden rounded-2xl transition-colors hover:bg-accent/50">
                  <div
                    className="relative h-11 bg-muted"
                    style={
                      doc.coverImage
                        ? {
                            backgroundImage: `url(${doc.coverImage})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                  >
                    <div className="absolute -bottom-3 left-3">
                      {doc.icon ? (
                        <div className="text-xl">{doc.icon}</div>
                      ) : (
                        <FileTextIcon className="size-6 fill-background text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <CardHeader className="px-3">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate text-sm">{doc.title || "Untitled"}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3">
                    <div className="flex items-center gap-1.5">
                      {user && <UserAvatar className="size-4" avatarClassName="size-4" user={currentUser} />}
                      {doc.updatedAt && (
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </WithSkeleton>
          );
        })}
      </div>
    </div>
  );
}
