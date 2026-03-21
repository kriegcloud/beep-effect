import { useAtom, useAtomSet } from "@effect/atom-react";
import type {
  ClientId,
  ClientInfo,
  ClientStatus,
  WebSocketEvent,
} from "@repo/domain/WebSocket";
import { AsyncResult } from "effect/unstable/reactivity";
import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  presenceSubscriptionAtom,
  WebSocketClient,
} from "../lib/web-socket-client";
import { Button } from "./ui/button";

/**
 * Build the current client list by replaying all events from the stream.
 * This gives us real-time updates without needing a separate query.
 */
const buildClientListFromEvents = (
  events: readonly WebSocketEvent[],
): {
  clients: Map<typeof ClientId.Type, ClientInfo>;
  myClientId: typeof ClientId.Type | null;
} => {
  const clients = new Map<typeof ClientId.Type, ClientInfo>();
  let myClientId: typeof ClientId.Type | null = null;

  for (const event of events) {
    switch (event._tag) {
      case "connected":
        myClientId = event.clientId;
        clients.set(event.clientId, {
          clientId: event.clientId,
          status: "online",
          connectedAt: event.connectedAt,
        });
        break;

      case "user_joined":
        clients.set(event.client.clientId, event.client);
        break;

      case "status_changed": {
        const existing = clients.get(event.clientId);
        if (existing) {
          clients.set(event.clientId, {
            ...existing,
            status: event.status,
          });
        }
        break;
      }

      case "user_left":
        clients.delete(event.clientId);
        break;
    }
  }

  return { clients, myClientId };
};

export function PresencePanel({ className }: { className?: string }) {
  const [eventsResult, startSubscription] = useAtom(presenceSubscriptionAtom);

  const setStatus = useAtomSet(WebSocketClient.mutation("setStatus"));

  useEffect(() => {
    startSubscription();
  }, [startSubscription]);

  const events = AsyncResult.getOrElse(
    eventsResult,
    () => [] as readonly WebSocketEvent[],
  );

  const { clients: clientMap, myClientId } = useMemo(
    () => buildClientListFromEvents(events),
    [events],
  );

  const clients = useMemo(() => Array.from(clientMap.values()), [clientMap]);

  // Handle status change
  const handleSetStatus = (status: ClientStatus) => {
    if (!myClientId) {
      console.error("Cannot set status: not connected yet");
      return;
    }
    setStatus({
      payload: { clientId: myClientId, status },
    });
  };

  // Helper functions
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "online":
        return "bg-primary";
      case "away":
        return "bg-secondary";
      case "busy":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const isConnected = AsyncResult.isSuccess(eventsResult);
  const isConnecting = AsyncResult.isInitial(eventsResult);
  const hasError = AsyncResult.isFailure(eventsResult);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>WebSocket Presence (RPC)</CardTitle>
            <CardDescription>Realtime status updates over RPC.</CardDescription>
          </div>
          <Badge
            variant={isConnected ? "outline" : "secondary"}
            className={cn(
              isConnected
                ? "border-primary/30 bg-primary/10 text-primary"
                : isConnecting
                  ? "border-secondary/50 bg-secondary text-secondary-foreground"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            {isConnected && myClientId
              ? `connected`
              : isConnecting
                ? "connecting"
                : "disconnected"}
          </Badge>
        </div>
      </CardHeader>

      {/* Error Display */}
      <CardContent className="flex flex-col gap-4">
        {hasError &&
          AsyncResult.match(eventsResult, {
            onInitial: () => null,
            onSuccess: () => null,
            onFailure: (error) => (
              <div className="rounded-none border border-destructive/40 bg-destructive/10 p-3 text-destructive text-xs">
                Error: {String(error)}
              </div>
            ),
          })}

        <div className="flex gap-2">
          <Button
            variant="default"
            size="lg"
            onClick={() => handleSetStatus("online")}
            className="flex-1"
            disabled={!isConnected || !myClientId}
          >
            Online
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleSetStatus("away")}
            className="flex-1"
            disabled={!isConnected || !myClientId}
          >
            Away
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSetStatus("busy")}
            className="flex-1"
            disabled={!isConnected || !myClientId}
          >
            Busy
          </Button>
        </div>

        <div className="rounded-none border border-border bg-muted/50 p-3">
          <h4 className="mb-2 font-medium text-foreground text-xs uppercase tracking-[0.2em]">
            Connected Clients ({clients.length})
          </h4>
          {clients.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No clients connected
            </p>
          ) : (
            <ul className="space-y-1">
              {clients.map((client: ClientInfo) => (
                <li
                  key={client.clientId}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      getStatusColor(client.status),
                    )}
                  />
                  <span className="font-mono text-muted-foreground">
                    {client.clientId.slice(0, 8)}...
                  </span>
                  <span className="text-muted-foreground">
                    ({client.status})
                  </span>
                  {client.clientId === myClientId && (
                    <span className="text-primary text-[0.6rem] uppercase tracking-[0.2em]">
                      you
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
