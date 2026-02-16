import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Effect Files Example</h1>
      <p className="text-muted-foreground mb-4">
        A demonstration of file uploads with UploadThing and Effect (WebSocket RPC, real-time
        events).
      </p>
      <Link
        to="/files"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to Files
      </Link>
    </div>
  );
}
