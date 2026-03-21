FROM mcr.microsoft.com/playwright:v1.57.0-noble

# Install Bun
RUN npm install -g bun

WORKDIR /work

# Default command runs tests
ENTRYPOINT ["sh", "-c", "bun install --frozen-lockfile && exec \"$@\"", "--"]
CMD ["bun", "run", "test:e2e"]
