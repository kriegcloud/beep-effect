import { useAtom } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { tickAtom } from "@/lib/atoms/tick-atom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ResponseCard } from "./ui/response-card";

export const RpcCard = () => {
  const [result, search] = useAtom(tickAtom);
  const event = AsyncResult.getOrElse(result, () => null);

  const handleSearch = () => {
    search({ abort: false });
  };
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="h-auto">
        <CardHeader className="border-b border-border">
          <CardTitle>RPC API</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Button className="w-full" onClick={handleSearch} size="lg">
            Call RPC API
          </Button>
        </CardContent>
      </Card>

      {event ? (
        <ResponseCard
          state={event.event._tag === "end" ? "completed" : "loading"}
          title="RPC API Response"
          className="flex-1"
        >
          <pre>
            <code>
              Event: {event.event._tag}
              {"\n"}
              Message: {event.text}
            </code>
          </pre>
        </ResponseCard>
      ) : (
        <ResponseCard title="RPC API Response" className="flex-1">
          Click the button above to test the RPC API
        </ResponseCard>
      )}
    </div>
  );
};
