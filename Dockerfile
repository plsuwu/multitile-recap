FROM oven/bun:latest AS base
WORKDIR /usr/src/tiles

FROM base AS install
RUN mkdir -p /tmp/dev

COPY package.json bun.lockb /tmp/dev/
RUN cd /tmp/dev && bun install --frozen-lockfile

RUN mkdir -p /tmp/prod
COPY package.json bun.lockb /tmp/prod/
RUN cd /tmp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .

FROM base AS release
COPY --from=install /tmp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/tiles .

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000/tcp
# `ENTRYPOINT` defined in compose.yaml
