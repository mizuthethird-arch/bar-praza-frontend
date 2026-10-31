# syntax=docker/dockerfile:1

# Node 22.23.4 pinned by digest: react-router needs >=22.22.0, Vite needs ^20.19 || >=22.12.
ARG NODE_IMAGE=node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da

# Dependencies, installed from the lockfile only, so every stage gets the same tree.
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Development workspace: the source is mounted from the host (see compose.yaml).
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# CI gate: the build fails if any check fails. Same commands you run locally.
FROM deps AS check
COPY . .
RUN npm run check
