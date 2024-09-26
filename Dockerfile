FROM oven/bun:latest AS base
WORKDIR /usr/src/tiles

FROM base AS install

# for whatever reason vite HATES that it is a dev dependency
# so we are installing dependencies without `--production` 
# for now
RUN mkdir -p /tmp/prod
COPY package.json bun.lockb /tmp/prod/
RUN cd /tmp/prod && bun install --frozen-lockfile

FROM base AS prerelease
COPY --from=install /tmp/prod/node_modules node_modules
COPY . .

FROM base AS release
COPY --from=install /tmp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/tiles .

ADD wait-for-it /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000/tcp
# `ENTRYPOINT` defined in compose.yaml
