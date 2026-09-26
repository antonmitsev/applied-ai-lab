FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/plumbing-assistant/package.json apps/plumbing-assistant/package.json

RUN npm ci

COPY apps/plumbing-assistant apps/plumbing-assistant

RUN npm run --workspace @applied-ai-lab/plumbing-assistant build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV MOCK_PROVIDER=true

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/plumbing-assistant/package.json apps/plumbing-assistant/package.json

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/apps/plumbing-assistant/dist apps/plumbing-assistant/dist

USER node
EXPOSE 3000

CMD ["node", "apps/plumbing-assistant/dist/src/server.js"]
