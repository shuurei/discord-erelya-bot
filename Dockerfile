FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

RUN npm install

COPY src ./src

RUN npx tsup && npx tsc-alias

COPY src/assets/fonts ./build/assets/fonts

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./src

CMD ["node", "src/index.js"]