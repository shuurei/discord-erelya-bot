FROM node:24-alpine AS builder

WORKDIR /bot

COPY package.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

RUN npm install

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY src ./src

RUN npx tsup && npx tsc-alias

COPY src/ui/assets/fonts ./build/ui/assets/fonts

FROM node:24-alpine

WORKDIR /bot

COPY --from=builder /bot/node_modules ./node_modules
COPY --from=builder /bot/package.json ./
COPY --from=builder /bot/build ./src
COPY --from=builder /bot/src/database/core ./src/database/core

CMD ["node", "src/index.js"]