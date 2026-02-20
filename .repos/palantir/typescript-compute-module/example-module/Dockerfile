# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.18.0

FROM --platform=amd64 node:${NODE_VERSION} as builder

WORKDIR /usr/src/app

# Copy the local TypeScript compute module along with its package.json and package-lock.json
COPY typescript-compute-module/package*.json ./typescript-compute-module/
COPY typescript-compute-module/src ./typescript-compute-module/src

# Install dependencies for compute module
RUN cd typescript-compute-module && npm install

# Now copy the example-module files and install its dependencies
COPY example-module/package*.json ./example-module/
COPY example-module/src ./example-module/src

# Install example-module dependencies
RUN cd example-module && npm install
RUN cd example-module && npm run build

# Start a new stage for the production image
FROM --platform=amd64 node:${NODE_VERSION}

WORKDIR /usr/src/app

# Copy the built compute module and example-module from the builder stage
COPY --from=builder /usr/src/app/typescript-compute-module ./typescript-compute-module
COPY --from=builder /usr/src/app/example-module ./example-module

# Run the application as a non-root user
# Ensure this user exists or use a pre-existing non-root user
USER 5000

# Specify the command to run the application
CMD ["node", "example-module/dist/index.js"]