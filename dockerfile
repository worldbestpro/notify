FROM node:16-alpine AS builder
WORKDIR /usr/src
COPY app .
RUN npm install
RUN npm run build_all


FROM node:16-alpine
WORKDIR /usr/app

RUN npm install -g miniflare
RUN apk update && apk add --no-cache curl

COPY --from=builder /usr/src/dist /usr/app/dist
COPY --from=builder /usr/src/frontend/build /usr/app/frontend/build
COPY --from=builder /usr/src/package.json /usr/app/package.json 
COPY --from=builder /usr/src/wrangler.toml /usr/app/wrangler.toml 

HEALTHCHECK CMD curl --fail http://localhost:3000 || exit 1

ENTRYPOINT [ "miniflare", "./dist/worker.js", "--wrangler-config", "wrangler.toml", "--env", "app.env", "--build-command", ""]