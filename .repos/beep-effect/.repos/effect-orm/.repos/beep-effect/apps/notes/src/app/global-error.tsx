"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
