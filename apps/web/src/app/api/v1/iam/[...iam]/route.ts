import { dispose, handler } from "@beep/iam-infra/api/api";

// "GET", "POST", "PUT", "DELETE", "PATCH"

const routeHandler = async (request: Request) => handler(request);
export const GET = routeHandler;
export const POST = routeHandler;
export const PUT = routeHandler;
export const DELETE = routeHandler;
export const PATCH = routeHandler;

function cleanup() {
  dispose().then(
    () => {
      process.exit(0);
    },
    () => {
      process.exit(1);
    }
  );
}

process.on("SIGINT", cleanup);
