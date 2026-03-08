# Effect Monorepo Template - Server Package

Run the `dev` script in `@template/server` package to start the server

The server will start on `http://localhost:3000` by default.

## Runtime Status Endpoint

The bootstrap server exposes a single status endpoint:

```sh
curl -X GET http://localhost:3000/status
```
