FROM node:22-alpine AS verify
WORKDIR /app
COPY package.json ./
COPY public ./public
COPY api ./api
COPY lib ./lib
COPY scripts ./scripts
COPY tests ./tests
COPY server.mjs vercel.json ./
RUN npm test && npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
WORKDIR /app
COPY --from=verify --chown=node:node /app/public ./public
COPY --from=verify --chown=node:node /app/api ./api
COPY --from=verify --chown=node:node /app/lib ./lib
COPY --from=verify --chown=node:node /app/server.mjs /app/vercel.json /app/package.json ./
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/session').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.mjs"]
