FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# caching dependencies like this allegedly speeds up
# future builds
FROM base AS install
RUN mkdir -p /tmp/dev
COPY package.json bun.lockb /tmp/dev/
RUN cd /tmp/dev && bun install --frozen-lockfile

# build with --production arg to exclude dev dependencies
RUN mkdir -p /tmp/prod
COPY package.json bun.lockb /tmp/prod/
RUN cd /tmp/prod && bun install --frozen-lockfile --production

# copy node modules and project files into our image
FROM base AS prerelease
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .

# set production env (not actually utilized so just in case),
# build the app
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies, source code into image
FROM base AS release
COPY --from=install /tmp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app .

# expose tcp port and run
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "build/index.js"]
